using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AuthService
{
    private readonly AppDbContext _dbContext;

    public AuthService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<(bool Success, string Message, UserResponse? User)> RegisterAsync(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLower();

        var emailExists = await _dbContext.Users.AnyAsync(user => user.Email == email);
        if (emailExists)
        {
            return (false, "email already exists", null);
        }

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Analyst",
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        return (true, "registration successful", MapUser(user));
    }

    public async Task<(bool Success, string Message, UserResponse? User)> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLower();

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(existingUser => existingUser.Email == email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
        {
            return (false, "invalid email or password", null);
        }

        return (true, "login successful", MapUser(user));
    }

    public async Task<(bool Success, string Message, UserResponse? User)> UpdateProfileAsync(int id, UpdateProfileRequest request)
    {
        var user = await _dbContext.Users.FindAsync(id);
        if (user is null)
        {
            return (false, "user not found", null);
        }

        var newEmail = request.Email.Trim().ToLower();

        // Check if the new email is taken by a different user
        var emailTaken = await _dbContext.Users
            .AnyAsync(u => u.Email == newEmail && u.Id != id);
        if (emailTaken)
        {
            return (false, "email already in use", null);
        }

        user.Name = request.Name.Trim();
        user.Email = newEmail;

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        }

        await _dbContext.SaveChangesAsync();
        return (true, "profile updated", MapUser(user));
    }

    public async Task<string?> GetUserRoleAsync(int userId)
    {
        var user = await _dbContext.Users.FindAsync(userId);
        return user?.Role;
    }

    public async Task<List<UserResponse>> GetAllUsersAsync()
    {
        return await _dbContext.Users
            .Where(user => user.Role == "Analyst")
            .OrderBy(user => user.CreatedAt)
            .Select(user => new UserResponse
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<(bool Success, string Message)> DeleteUserAsync(int id)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(existingUser =>
            existingUser.Id == id && existingUser.Role == "Analyst");
        if (user is null)
        {
            return (false, "user not found");
        }

        // Incidents reference users with Restrict delete behavior, so remove the user's incidents first.
        var incidents = _dbContext.Incidents.Where(incident => incident.ReportedByUserId == id);
        _dbContext.Incidents.RemoveRange(incidents);

        _dbContext.Users.Remove(user);
        await _dbContext.SaveChangesAsync();
        return (true, "user deleted successfully");
    }

    private static UserResponse MapUser(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };
    }

}