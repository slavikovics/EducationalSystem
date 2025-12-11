using System.Security.Claims;
using EducationalSystem.DTOs;
using EducationalSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EducationalSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpGet("registration-form")]
    [AllowAnonymous]
    public IActionResult GetRegistrationForm()
    {
        return Ok(new
        {
            Fields = new[] { "Email", "Password", "Name" },
            Requirements = "Password must be at least 8 characters long"
        });
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        try
        {
            var user = _authService.SaveUser(request.Email, request.Password, request.Name);
            return Ok(new
            {
                Message = "User registered successfully",
                UserId = user.UserId,
                Email = user.Email,
                Name = user.Name
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration failed for {Email}", request.Email);
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet("login-form")]
    [AllowAnonymous]
    public IActionResult GetLoginForm()
    {
        return Ok(new
        {
            Fields = new[] { "Email", "Password" }
        });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = _authService.Login(request.Email, request.Password);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name)
            };

            return Ok(new
            {
                Message = "Login successful",
                UserId = user.UserId,
                Name = user.Name,
                Email = user.Email,
                Status = user.Status.ToString()
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet("reset-password-form")]
    [Authorize]
    public IActionResult GetResetPasswordForm()
    {
        return Ok(new
        {
            Fields = new[] { "OldPassword", "NewPassword" }
        });
    }

    [HttpPost("reset-password")]
    [Authorize]
    public IActionResult ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            _authService.RefreshPassword(request.OldPassword, request.NewPassword);
            return Ok(new { Message = "Password reset successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpPost("block-user/{userId}")]
    [Authorize(Roles = "Admin")]
    public IActionResult BlockUser(long userId, [FromQuery] string accessKey)
    {
        try
        {
            _authService.BlockUser(userId, accessKey);
            return Ok(new { Message = $"User {userId} blocked successfully" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }
}