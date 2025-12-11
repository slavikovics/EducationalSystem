using EducationalSystem.Data;
using EducationalSystem.Repositories;
using Microsoft.EntityFrameworkCore;

namespace EducationalSystem;

public class Program
{
    public static void ConfigureServices(WebApplicationBuilder builder)
    {
        builder.Services.AddDbContext<EducationalSystemDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

        builder.Services.AddScoped<IAuthRepository, AuthRepository>();
        builder.Services.AddScoped<IMaterialsRepository, MaterialsRepository>();
        builder.Services.AddScoped<IReviewsRepository, ReviewsRepository>();
        builder.Services.AddScoped<ITestsRepository, TestsRepository>();
    }
    
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Services.AddAuthorization();
        
        ConfigureServices(builder);
        builder.Services.AddOpenApi();
        var app = builder.Build();
        
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseHttpsRedirection();
        app.UseAuthorization();
        
        app.Run();
    }
}