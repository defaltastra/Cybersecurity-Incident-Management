using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AuditLogService
{
    private readonly AppDbContext _dbContext;

    public AuditLogService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task LogAsync(int? actorUserId, string action, string entityType, int? entityId, string details)
    {
        var actorEmail = string.Empty;

        if (actorUserId.HasValue)
        {
            actorEmail = await _dbContext.Users
                .Where(user => user.Id == actorUserId.Value)
                .Select(user => user.Email)
                .FirstOrDefaultAsync() ?? string.Empty;
        }

        _dbContext.AuditLogs.Add(new AuditLog
        {
            ActorUserId = actorUserId,
            ActorEmail = actorEmail,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            CreatedAt = DateTime.UtcNow
        });

        await _dbContext.SaveChangesAsync();
    }

    public async Task<List<AuditLog>> GetRecentAsync(int limit = 200)
    {
        return await _dbContext.AuditLogs
            .OrderByDescending(log => log.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }
}
