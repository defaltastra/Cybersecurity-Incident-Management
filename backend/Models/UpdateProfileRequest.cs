namespace backend.Models;

public class UpdateProfileRequest
{
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    // optionnel: laisser vide pour garder le mot de passe actuel
    public string? NewPassword { get; set; }
}
