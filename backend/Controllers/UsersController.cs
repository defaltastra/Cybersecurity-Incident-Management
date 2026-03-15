using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly AuthService _authService;

    public UsersController(AuthService authService)
    {
        _authService = authService;
    }

    private async Task<(bool IsValid, int UserId, string? Role)> GetCallerAsync()
    {
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

        return Ok(new { message = result.Message });
    }
}
