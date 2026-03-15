namespace backend.Models;

public class IncidentResponse
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string IncidentType { get; set; } = string.Empty;

    public string Severity { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public int ReportedByUserId { get; set; }

    public string ReportedByName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}