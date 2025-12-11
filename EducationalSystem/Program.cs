using EducationalSystem.Data;
using EducationalSystem.Models;
using EducationalSystem.Repositories;
using EducationalSystem.Services;
using Microsoft.EntityFrameworkCore;

namespace EducationalSystem;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        
        builder.Services.AddDbContext<EducationalSystemDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
        
        builder.Services.AddControllers();
        
        builder.Services.AddEndpointsApiExplorer();
        
        builder.Services.AddScoped<IAuthRepository, AuthRepository>();
        builder.Services.AddScoped<IMaterialsRepository, MaterialsRepository>();
        builder.Services.AddScoped<IReviewsRepository, ReviewsRepository>();
        builder.Services.AddScoped<ITestsRepository, TestsRepository>();
        
        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddScoped<IMaterialService, MaterialService>();
        builder.Services.AddScoped<IReviewService, ReviewService>();
        builder.Services.AddScoped<ITestService, TestService>();
        
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
        
        using (var scope = app.Services.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<EducationalSystemDbContext>();
            dbContext.Database.Migrate();
        }
        
        if (app.Environment.IsDevelopment())
        {
            app.UseCors("AllowAll");
            app.UseDeveloperExceptionPage();
        }
        
        app.UseHttpsRedirection();
        app.UseAuthorization();
        app.MapControllers();
        
        app.Run();
    }
}