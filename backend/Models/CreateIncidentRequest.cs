namespace backend.Models;

public class CreateIncidentRequest
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string IncidentType { get; set; } = string.Empty;

    public string Severity { get; set; } = string.Empty;

    public string Status { get; set; } = "open";

    public int ReportedByUserId { get; set; }
}