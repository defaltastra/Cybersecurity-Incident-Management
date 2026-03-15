using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class IncidentService
{
    private static readonly HashSet<string> AllowedIncidentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "phishing",
        "malware",
        "intrusion",
        "data breach"
    };

    private static readonly HashSet<string> AllowedSeverities = new(StringComparer.OrdinalIgnoreCase)
    {
        "low",
        "medium",
        "high",
        "critical"
    };

    private static readonly HashSet<string> AllowedStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "open",
        "investigating",
        "resolved"
    };

    private readonly AppDbContext _dbContext;

    public IncidentService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<IncidentResponse>> GetAllAsync(int callerUserId, string callerRole)
    {
        var query = _dbContext.Incidents
            .Include(incident => incident.ReportedByUser)
            .AsQueryable();

        if (!string.Equals(callerRole, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(incident => incident.ReportedByUserId == callerUserId);
        }

        return await query
            .OrderByDescending(incident => incident.CreatedAt)
            .Select(MapIncident())
            .ToListAsync();
    }

    public async Task<IncidentResponse?> GetByIdAsync(int id, int callerUserId, string callerRole)
    {
        var query = _dbContext.Incidents
            .Include(incident => incident.ReportedByUser)
            .Where(incident => incident.Id == id);

        if (!string.Equals(callerRole, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(incident => incident.ReportedByUserId == callerUserId);
        }

        return await query.Select(MapIncident()).FirstOrDefaultAsync();
    }

    public async Task<(bool Success, string Message, IncidentResponse? Incident)> CreateAsync(CreateIncidentRequest request)
    {
        var incidentType = NormalizeAllowedValue(request.IncidentType, AllowedIncidentTypes);
        var severity = NormalizeAllowedValue(request.Severity, AllowedSeverities);
        var status = NormalizeAllowedValue(request.Status, AllowedStatuses, "open");

        if (incidentType is null)
        {
            return (false, "incident type must be phishing, malware, intrusion, or data breach", null);
        }

        if (severity is null)
        {
            return (false, "severity must be low, medium, high, or critical", null);
        }

        if (status is null)
        {
            return (false, "status must be open, investigating, or resolved", null);
        }

        var user = await _dbContext.Users.FindAsync(request.ReportedByUserId);
        if (user is null)
        {
            return (false, "reported by user was not found", null);
        }

        var incident = new Incident
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            IncidentType = incidentType,
            Severity = severity,
            Status = status,
            ReportedByUserId = request.ReportedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Incidents.Add(incident);
        await _dbContext.SaveChangesAsync();

        incident.ReportedByUser = user;

        return (true, "incident created successfully", MapIncidentToResponse(incident));
    }

    public async Task<(bool Success, string Message, IncidentResponse? Incident)> UpdateAsync(
        int id,
        UpdateIncidentRequest request,
        int callerUserId,
        string callerRole)
    {
        var incidentType = NormalizeAllowedValue(request.IncidentType, AllowedIncidentTypes);
        var severity = NormalizeAllowedValue(request.Severity, AllowedSeverities);

        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Description))
        {
            return (false, "title and description are required", null);
        }

        if (incidentType is null)
        {
            return (false, "incident type must be phishing, malware, intrusion, or data breach", null);
        }

        if (severity is null)
        {
            return (false, "severity must be low, medium, high, or critical", null);
        }

        var incident = await _dbContext.Incidents
            .Include(existingIncident => existingIncident.ReportedByUser)
            .FirstOrDefaultAsync(existingIncident => existingIncident.Id == id);

        if (incident is null)
        {
            return (false, "incident not found", null);
        }

        var isAdmin = string.Equals(callerRole, "Admin", StringComparison.OrdinalIgnoreCase);
        if (!isAdmin && incident.ReportedByUserId != callerUserId)
        {
            return (false, "forbidden", null);
        }

        if (!isAdmin && string.Equals(incident.Status, "resolved", StringComparison.OrdinalIgnoreCase))
        {
            return (false, "resolved_locked", null);
        }

        incident.Title = request.Title.Trim();
        incident.Description = request.Description.Trim();
        incident.IncidentType = incidentType;
        incident.Severity = severity;

        await _dbContext.SaveChangesAsync();
        return (true, "incident updated successfully", MapIncidentToResponse(incident));
    }

    public async Task<(bool Success, string Message, IncidentResponse? Incident)> UpdateStatusAsync(
        int id,
        UpdateIncidentStatusRequest request,
        int callerUserId,
        string callerRole)
    {
        var status = NormalizeAllowedValue(request.Status, AllowedStatuses);
        if (status is null)
        {
            return (false, "status must be open, investigating, or resolved", null);
        }

        var incident = await _dbContext.Incidents
            .Include(existingIncident => existingIncident.ReportedByUser)
            .FirstOrDefaultAsync(existingIncident => existingIncident.Id == id);

        if (incident is null)
        {
            return (false, "incident not found", null);
        }

        var isAdmin = string.Equals(callerRole, "Admin", StringComparison.OrdinalIgnoreCase);
        if (!isAdmin && incident.ReportedByUserId != callerUserId)
        {
            return (false, "forbidden", null);
        }

        if (!isAdmin && string.Equals(incident.Status, "resolved", StringComparison.OrdinalIgnoreCase))
        {
            return (false, "resolved_locked", null);
        }

        incident.Status = status;
        await _dbContext.SaveChangesAsync();

        return (true, "incident updated successfully", MapIncidentToResponse(incident));
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var incident = await _dbContext.Incidents.FindAsync(id);
        if (incident is null)
        {
            return false;
        }

        _dbContext.Incidents.Remove(incident);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    private static System.Linq.Expressions.Expression<Func<Incident, IncidentResponse>> MapIncident()
    {
        return incident => new IncidentResponse
        {
            Id = incident.Id,
            Title = incident.Title,
            Description = incident.Description,
            IncidentType = incident.IncidentType,
            Severity = incident.Severity,
            Status = incident.Status,
            ReportedByUserId = incident.ReportedByUserId,
            ReportedByName = incident.ReportedByUser != null ? incident.ReportedByUser.Name : string.Empty,
            CreatedAt = incident.CreatedAt
        };
    }

    private static IncidentResponse MapIncidentToResponse(Incident incident)
    {
        return new IncidentResponse
        {
            Id = incident.Id,
            Title = incident.Title,
            Description = incident.Description,
            IncidentType = incident.IncidentType,
            Severity = incident.Severity,
            Status = incident.Status,
            ReportedByUserId = incident.ReportedByUserId,
            ReportedByName = incident.ReportedByUser?.Name ?? string.Empty,
            CreatedAt = incident.CreatedAt
        };
    }

    private static string? NormalizeAllowedValue(string? value, HashSet<string> allowedValues, string? defaultValue = null)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return defaultValue;
        }

        var normalizedValue = value.Trim().ToLower();
        return allowedValues.Contains(normalizedValue) ? normalizedValue : null;
    }
}