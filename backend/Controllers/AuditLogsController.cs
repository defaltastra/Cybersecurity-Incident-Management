using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/audit-logs")]
public class AuditLogsController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly AuditLogService _auditLogService;

    public AuditLogsController(AuthService authService, AuditLogService auditLogService)
    {
        _authService = authService;
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<IActionResult> GetRecent()
    {
        // reserve aux admins
        if (!Request.Headers.TryGetValue("X-User-Id", out var value) || !int.TryParse(value, out var callerUserId))
        {
            return Unauthorized(new { message = "missing or invalid X-User-Id header" });
        }

        var role = await _authService.GetUserRoleAsync(callerUserId);
        if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(403, new { message = "only admins can view audit logs" });
        }

        // renvoie les logs recents
        var logs = await _auditLogService.GetRecentAsync();
        return Ok(logs);
    }
}
