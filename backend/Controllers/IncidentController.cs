using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/incidents")]
public class IncidentController : ControllerBase
{
    private readonly IncidentService _incidentService;
    private readonly AuthService _authService;
    private readonly AuditLogService _auditLogService;

    public IncidentController(IncidentService incidentService, AuthService authService, AuditLogService auditLogService)
    {
        _incidentService = incidentService;
        _authService = authService;
        _auditLogService = auditLogService;
    }

    private bool TryGetCallerUserId(out int userId)
    {
        // lit l'identifiant utilisateur depuis le header
        userId = 0;
        if (!Request.Headers.TryGetValue("X-User-Id", out var value))
        {
            return false;
        }

        return int.TryParse(value, out userId);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // charge les incidents selon le role
        if (!TryGetCallerUserId(out var callerUserId))
        {
            return Unauthorized(new { message = "missing X-User-Id header" });
        }

        var role = await _authService.GetUserRoleAsync(callerUserId);
        if (role is null)
        {
            return Unauthorized(new { message = "invalid user" });
        }

        var incidents = await _incidentService.GetAllAsync(callerUserId, role);
        return Ok(incidents);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        if (!TryGetCallerUserId(out var callerUserId))
        {
            return Unauthorized(new { message = "missing X-User-Id header" });
        }

        var role = await _authService.GetUserRoleAsync(callerUserId);
        if (role is null)
        {
            return Unauthorized(new { message = "invalid user" });
        }

        var incident = await _incidentService.GetByIdAsync(id, callerUserId, role);
        if (incident is null)
        {
            return NotFound(new { message = "incident not found" });
        }

        return Ok(incident);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateIncidentRequest request)
    {
        // cree un incident et ecrit un log
        if (!TryGetCallerUserId(out var callerUserId))
        {
            return Unauthorized(new { message = "missing X-User-Id header" });
        }

        var role = await _authService.GetUserRoleAsync(callerUserId);
        if (role is null)
        {
            return Unauthorized(new { message = "invalid user" });
        }

        if (string.IsNullOrWhiteSpace(request.Title) ||
            string.IsNullOrWhiteSpace(request.Description) ||
            string.IsNullOrWhiteSpace(request.IncidentType) ||
            string.IsNullOrWhiteSpace(request.Severity))
        {
            return BadRequest(new { message = "title, description, incident type, and severity are required" });
        }

        request.ReportedByUserId = callerUserId;

        var result = await _incidentService.CreateAsync(request);
        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        await _auditLogService.LogAsync(
            callerUserId,
            "incident_created",
            "incident",
            result.Incident!.Id,
            $"Created incident '{result.Incident.Title}'");

        return CreatedAtAction(nameof(GetById), new { id = result.Incident!.Id }, result.Incident);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateIncidentStatusRequest request)
    {
        // met a jour le statut
        if (!TryGetCallerUserId(out var callerUserId))
        {
            return Unauthorized(new { message = "missing X-User-Id header" });
        }

        var role = await _authService.GetUserRoleAsync(callerUserId);
        if (role is null)
        {
            return Unauthorized(new { message = "invalid user" });
        }

        if (string.IsNullOrWhiteSpace(request.Status))
        {
            return BadRequest(new { message = "status is required" });
        }

        var result = await _incidentService.UpdateStatusAsync(id, request, callerUserId, role);
        if (!result.Success)
        {
            if (result.Message == "resolved_locked")
            {
                return StatusCode(403, new { message = "resolved incidents cannot be edited by analysts" });
            }

            return result.Message == "forbidden"
                ? StatusCode(403, new { message = "you cannot update this incident" })
                : NotFound(new { message = result.Message });
        }

        await _auditLogService.LogAsync(
            callerUserId,
            "incident_status_updated",
            "incident",
            result.Incident!.Id,
            $"Updated status to '{result.Incident.Status}'");

        return Ok(new { message = result.Message, incident = result.Incident });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateIncidentRequest request)
    {
        // met a jour les details d'un incident
        if (!TryGetCallerUserId(out var callerUserId))
        {
            return Unauthorized(new { message = "missing X-User-Id header" });
        }

        var role = await _authService.GetUserRoleAsync(callerUserId);
        if (role is null)
        {
            return Unauthorized(new { message = "invalid user" });
        }

        var result = await _incidentService.UpdateAsync(id, request, callerUserId, role);
        if (!result.Success)
        {
            if (result.Message == "resolved_locked")
            {
                return StatusCode(403, new { message = "resolved incidents cannot be edited by analysts" });
            }

            if (result.Message == "forbidden")
            {
                return StatusCode(403, new { message = "you cannot update this incident" });
            }

            if (result.Message == "incident not found")
            {
                return NotFound(new { message = result.Message });
            }

            return BadRequest(new { message = result.Message });
        }

        await _auditLogService.LogAsync(
            callerUserId,
            "incident_updated",
            "incident",
            result.Incident!.Id,
            $"Updated incident details for '{result.Incident.Title}'");

        return Ok(new { message = result.Message, incident = result.Incident });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        // supprime un incident (admin uniquement)
        if (!TryGetCallerUserId(out var callerUserId))
        {
            return Unauthorized(new { message = "missing X-User-Id header" });
        }

        var role = await _authService.GetUserRoleAsync(callerUserId);
        if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(403, new { message = "only admins can delete incidents" });
        }

        var deleted = await _incidentService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = "incident not found" });
        }

        await _auditLogService.LogAsync(
            callerUserId,
            "incident_deleted",
            "incident",
            id,
            $"Deleted incident with id {id}");

        return Ok(new { message = "incident deleted successfully" });
    }
}