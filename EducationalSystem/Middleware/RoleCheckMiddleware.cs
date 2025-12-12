using System.Security.Claims;

namespace EducationalSystem.Middleware;

public class RoleCheckMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RoleCheckMiddleware> _logger;

    public RoleCheckMiddleware(RequestDelegate next, ILogger<RoleCheckMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var user = context.User;
        var userName = user.Identity?.Name ?? "Anonymous";
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? "Unknown";
        var userRoles = user.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value)
            .ToList();

        _logger.LogInformation(
            "Access attempt: {Method} {Path} by User: {UserName} (ID: {UserId}) with Roles: {Roles}",
            context.Request.Method,
            context.Request.Path,
            userName,
            userId,
            string.Join(", ", userRoles));

        await _next(context);
    }
}

public static class RoleCheckMiddlewareExtensions
{
    public static IApplicationBuilder UseRoleCheckMiddleware(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RoleCheckMiddleware>();
    }
}