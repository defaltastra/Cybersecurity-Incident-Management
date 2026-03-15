namespace backend.Models;

public class UpdateProfileRequest
{
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    // Optional — leave empty to keep existing password
    public string? NewPassword { get; set; }
}
