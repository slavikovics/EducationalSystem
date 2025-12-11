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
        _logger.LogInformation(
            "Access attempt: {Method} {Path} by User: {User}",
            context.Request.Method,
            context.Request.Path,
            context.User.Identity?.Name ?? "Anonymous");

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