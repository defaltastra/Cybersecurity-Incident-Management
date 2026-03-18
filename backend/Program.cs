using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<IncidentService>();
builder.Services.AddScoped<AuditLogService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// creation auto de la base pour la demo
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
    dbContext.Database.ExecuteSqlRaw(@"
        CREATE TABLE IF NOT EXISTS AuditLogs (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            ActorUserId INTEGER NULL,
            ActorEmail TEXT NOT NULL DEFAULT '',
            Action TEXT NOT NULL,
            EntityType TEXT NOT NULL,
            EntityId INTEGER NULL,
            Details TEXT NOT NULL DEFAULT '',
            CreatedAt TEXT NOT NULL
        );
    ");

    // cree un admin par defaut au premier lancement
    var adminEmail = "admin@admin.com";
    var hasAdmin = dbContext.Users.Any(user => user.Email == adminEmail);
    if (!hasAdmin)
    {
        dbContext.Users.Add(new User
        {
            Name = "Default Admin",
            Email = adminEmail,
            Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        });
        dbContext.SaveChanges();
    }
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.MapControllers();

app.Run();
