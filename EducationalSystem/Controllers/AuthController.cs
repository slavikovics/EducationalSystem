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

    [HttpPost("register/user")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterUser([FromBody] RegisterUserRequest request)
    {
        try
        {
            var (user, token) = await _authService.RegisterUserAsync(
                request.Email, request.Password, request.Name);

            if (user == null)
                return BadRequest(new { Error = "Email already exists" });

            return Ok(new
            {
                Message = "User registered successfully",
                Token = token,
                User = new
                {
                    user.UserId,
                    user.Email,
                    user.Name,
                    user.UserType
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "User registration failed");
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpPost("register/tutor")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterTutor([FromBody] RegisterTutorRequest request)
    {
        try
        {
            var (user, token) = await _authService.RegisterTutorAsync(
                request.Email, request.Password, request.Name, request.Experience, request.Specialty);

            if (user == null)
                return BadRequest(new { Error = "Email already exists" });

            return Ok(new
            {
                Message = "Tutor registered successfully",
                Token = token,
                User = new
                {
                    user.UserId,
                    user.Email,
                    user.Name,
                    user.UserType
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Tutor registration failed");
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpPost("register/admin")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterAdmin([FromBody] RegisterAdminRequest request)
    {
        try
        {
            var (user, token) = await _authService.RegisterAdminAsync(
                request.Email, request.Password, request.Name, request.AccessKey);

            if (user == null)
                return BadRequest(new { Error = "Email already exists" });

            return Ok(new
            {
                Message = "Admin registered successfully",
                Token = token,
                User = new
                {
                    user.UserId,
                    user.Email,
                    user.Name,
                    user.UserType
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Admin registration failed");
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var (user, token) = await _authService.LoginAsync(request.Email, request.Password);

            if (user == null)
                return Unauthorized(new { Error = "Invalid credentials or account blocked" });

            return Ok(new
            {
                Message = "Login successful",
                Token = token,
                User = new
                {
                    user.UserId,
                    user.Email,
                    user.Name,
                    user.UserType,
                    user.Status
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed");
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var success = await _authService.ChangePasswordAsync(
                userId, request.OldPassword, request.NewPassword);

            if (!success)
                return BadRequest(new { Error = "Failed to change password" });

            return Ok(new { Message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Password change failed");
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpPost("block-user/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> BlockUser(long userId)
    {
        try
        {
            var success = await _authService.BlockUserAsync(userId);

            if (!success)
                return BadRequest(new { Error = "Failed to block user" });

            return Ok(new { Message = $"User {userId} blocked successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Block user failed");
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var email = User.FindFirstValue(ClaimTypes.Email);
            var name = User.FindFirstValue(ClaimTypes.Name);
            var role = User.FindFirstValue(ClaimTypes.Role);
            var statusClaim = User.FindFirst("Status")?.Value ?? "Active";

            return Ok(new
            {
                UserId = userId,
                Email = email,
                Name = name,
                UserType = role,
                Status = statusClaim
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get current user failed");
            return BadRequest(new { Error = ex.Message });
        }
    }
}