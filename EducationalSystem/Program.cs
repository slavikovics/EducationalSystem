using EducationalSystem.Data;
using EducationalSystem.Repositories;
using EducationalSystem.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using EducationalSystem.Middleware;

var builder = WebApplication.CreateBuilder(args);

// DISABLE HTTPS - Run on HTTP only for development
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ConfigureEndpointDefaults(listenOptions =>
    {
        // Do NOT use HTTPS
    });
});

// Add JWT settings
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["Secret"] ?? "YourSuperSecretKeyForJWT12345";

builder.Services.AddDbContext<EducationalSystemDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseNpgsql(connectionString);

    // For development logging
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.LogTo(Console.WriteLine, LogLevel.Information);
    }
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Add JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };

        // For development, disable HTTPS requirement
        options.RequireHttpsMetadata = false;
    });

// Add Authorization
builder.Services.AddAuthorization();

// Register ALL services and repositories
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IMaterialService, MaterialService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<ITestService, TestService>();

// Register repositories
builder.Services.AddScoped<IMaterialsRepository, MaterialsRepository>();
builder.Services.AddScoped<IReviewsRepository, ReviewsRepository>();
builder.Services.AddScoped<ITestsRepository, TestsRepository>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Apply database migrations with error handling
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var dbContext = scope.ServiceProvider.GetRequiredService<EducationalSystemDbContext>();

    try
    {
        logger.LogInformation("Checking database connection...");

        // First check if we can connect
        if (await dbContext.Database.CanConnectAsync())
        {
            logger.LogInformation("Database connection successful");

            // Check if migrations table exists
            var migrationTableExists = await dbContext.Database.ExecuteSqlRawAsync(@"
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = '__EFMigrationsHistory'
                )") > 0;

            if (!migrationTableExists)
            {
                logger.LogInformation("Migrations table doesn't exist. Creating database from scratch...");
                await dbContext.Database.EnsureDeletedAsync();
                await dbContext.Database.EnsureCreatedAsync();
                logger.LogInformation("Database created successfully");
            }
            else
            {
                logger.LogInformation("Applying pending migrations...");
                var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
                if (pendingMigrations.Any())
                {
                    logger.LogInformation($"Found {pendingMigrations.Count()} pending migration(s):");
                    foreach (var migration in pendingMigrations)
                    {
                        logger.LogInformation($"  - {migration}");
                    }

                    await dbContext.Database.MigrateAsync();
                    logger.LogInformation("Migrations applied successfully");
                }
                else
                {
                    logger.LogInformation("No pending migrations");
                }
            }
        }
        else
        {
            logger.LogInformation("Cannot connect to database. Ensure PostgreSQL is running.");
            // For development, create database if it doesn't exist
            logger.LogInformation("Attempting to create database...");
            await dbContext.Database.EnsureCreatedAsync();
            logger.LogInformation("Database created (if it didn't exist)");
        }
    }
    catch (Exception ex)
    {
        logger.LogInformation($"Error during database setup: {ex.Message}");
        logger.LogInformation($"Full error: {ex}");

        // For development, try to continue anyway
        if (builder.Environment.IsDevelopment())
        {
            logger.LogInformation("Continuing in development mode despite database error");
        }
        else
        {
            throw;
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll");
    app.UseDeveloperExceptionPage();
}

// DISABLE HTTPS REDIRECTION - Comment this out
// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.UseRoleCheckMiddleware();
app.UseRequestLoggingMiddleware();

app.MapControllers();

// Add a simple health check endpoint
app.MapGet("/", () => "Educational System API is running");
app.MapGet("/health", () => "Healthy");

builder.WebHost.UseUrls("http://0.0.0.0:8080");
app.Run();