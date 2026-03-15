namespace backend.Models;

public class UpdateIncidentRequest
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string IncidentType { get; set; } = string.Empty;

    public string Severity { get; set; } = string.Empty;
}
