using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly AuditLogService _auditLogService;

    public UsersController(AuthService authService, AuditLogService auditLogService)
    {
        _authService = authService;
        _auditLogService = auditLogService;
    }

    private async Task<(bool IsValid, int UserId, string? Role)> GetCallerAsync()
    {
        // valide l'appelant via le header et le role
        if (!Request.Headers.TryGetValue("X-User-Id", out var value))
        {
            return (false, 0, null);
        }

        if (!int.TryParse(value, out var userId))
        {
            return (false, 0, null);
        }

        var role = await _authService.GetUserRoleAsync(userId);
        if (role is null)
        {
            return (false, 0, null);
        }

        return (true, userId, role);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // liste les analystes (admin uniquement)
        var caller = await GetCallerAsync();
        if (!caller.IsValid)
        {
            return Unauthorized(new { message = "invalid caller" });
        }

        if (!string.Equals(caller.Role, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(403, new { message = "only admins can view users" });
        }

        var users = await _authService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        // supprime un analyste et ecrit un log
        var caller = await GetCallerAsync();
        if (!caller.IsValid)
        {
            return Unauthorized(new { message = "invalid caller" });
        }

        if (!string.Equals(caller.Role, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(403, new { message = "only admins can delete users" });
        }

        if (caller.UserId == id)
        {
            return BadRequest(new { message = "you cannot delete your own account" });
        }

        var result = await _authService.DeleteUserAsync(id);
        if (!result.Success)
        {
            return NotFound(new { message = result.Message });
        }

        await _auditLogService.LogAsync(
            caller.UserId,
            "analyst_deleted",
            "user",
            id,
            $"Deleted analyst account with id {id}");

        return Ok(new { message = result.Message });
    }
}
