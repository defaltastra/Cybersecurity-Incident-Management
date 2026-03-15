using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "name, email, and password are required" });
        }

        var result = await _authService.RegisterAsync(request);
        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new { message = result.Message, user = result.User });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "email and password are required" });
        }

        var result = await _authService.LoginAsync(request);
        if (!result.Success)
        {
            return Unauthorized(new { message = result.Message });
        }

        return Ok(new { message = result.Message, user = result.User });
    }

    [HttpPut("profile/{id:int}")]
    public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "name and email are required" });
        }

        var result = await _authService.UpdateProfileAsync(id, request);
        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(new { message = result.Message, user = result.User });
    }
}