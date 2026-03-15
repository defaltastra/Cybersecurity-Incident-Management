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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// create the database automatically for the demo project
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();

    // Ensure there is a default admin for first-time access.
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
