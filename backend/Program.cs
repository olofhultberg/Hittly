using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add HttpClient for external API calls
builder.Services.AddHttpClient();

// Configure Database - PostgreSQL for production, SQLite for development
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString))
{
    // Default to SQLite for local development
    connectionString = "Data Source=hittly.db";
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite(connectionString));
}
else if (connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
         connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
{
    // Convert PostgreSQL URI format to Npgsql format
    // Format: postgresql://user:password@host:port/database
    try
    {
        var uri = new Uri(connectionString);
        var userInfo = uri.UserInfo.Split(':');
        var username = userInfo[0];
        var password = userInfo.Length > 1 ? userInfo[1] : "";
        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 5432;
        var database = uri.AbsolutePath.TrimStart('/');
        
        connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
    }
    catch
    {
        // If parsing fails, use original connection string
    }
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else if (connectionString.Contains("Host=", StringComparison.OrdinalIgnoreCase) ||
         connectionString.Contains("Server=", StringComparison.OrdinalIgnoreCase))
{
    // PostgreSQL connection string in standard format
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else
{
    // SQLite fallback
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite(connectionString));
}

// Configure Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 8;

    // User settings
    options.User.RequireUniqueEmail = true;

    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add authentication
builder.Services.AddAuthentication();
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Apply database migrations
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();
        
        // Check if database exists and has tables
        var canConnect = context.Database.CanConnect();
        var pendingMigrations = context.Database.GetPendingMigrations().Any();
        
        if (!canConnect || pendingMigrations)
        {
            try
            {
                // Suppress the pending model changes warning for now
                // In production, you should create proper migrations for PostgreSQL
                context.Database.Migrate();
                logger.LogInformation("Migrations applicerade framgångsrikt.");
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("pending changes"))
            {
                // If there are pending model changes, we need to create a new migration
                // For now, log a warning and continue
                logger.LogWarning("Det finns pending model changes. Skapa en ny migration för PostgreSQL med: dotnet ef migrations add MigrationName");
                logger.LogWarning("Försöker skapa databas med EnsureCreated som fallback...");
                
                // Try EnsureCreated as fallback (only works if database is empty)
                if (!canConnect)
                {
                    context.Database.EnsureCreated();
                    logger.LogInformation("Databas skapad med EnsureCreated.");
                }
                else
                {
                    logger.LogError("Databas finns redan men migrations matchar inte modellen. Skapa en ny migration.");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Ett fel uppstod vid applicering av migrations.");
                // Don't throw - let the app start, but migrations might not be applied
            }
        }
        else
        {
            logger.LogInformation("Databas är uppdaterad, inga migrations behövs.");
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ett fel uppstod vid databashantering.");
        // Don't throw - let the app start anyway
    }
}

app.Run();
