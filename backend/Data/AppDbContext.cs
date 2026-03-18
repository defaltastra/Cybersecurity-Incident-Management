using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Incident> Incidents => Set<Incident>();

    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(user => user.Email)
            .IsUnique();

        modelBuilder.Entity<Incident>()
            .HasOne(incident => incident.ReportedByUser)
            .WithMany(user => user.ReportedIncidents)
            .HasForeignKey(incident => incident.ReportedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}