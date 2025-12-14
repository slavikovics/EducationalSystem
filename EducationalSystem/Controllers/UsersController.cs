using EducationalSystem.Data;
using EducationalSystem.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EducationalSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly EducationalSystemDbContext _context;
    private readonly ILogger<UsersController> _logger;

    public UsersController(EducationalSystemDbContext context, ILogger<UsersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(long id)
    {
        try
        {
            var result = await _context.Users.FirstOrDefaultAsync();
            return Ok(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpGet("get-all")]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            var result = await _context.Users.ToListAsync();
            return Ok(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpPatch("{id}/block")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> BlockUser(long id)
    {
        try
        {
            var user = await _context.Users
                .Where(u => u.UserId == id)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { Error = $"User with ID {id} not found" });
            }

            user.Status = UserStatus.Blocked;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = $"User has been blocked successfully",
                UserId = user.UserId,
                Name = user.Name,
                Status = user.Status.ToString()
            });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error blocking user with ID {Id}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpPatch("{id}/unblock")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UnblockUser(long id)
    {
        try
        {
            var user = await _context.Users
                .Where(u => u.UserId == id)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { Error = $"User with ID {id} not found" });
            }

            user.Status = UserStatus.Active;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = $"User has been unblocked successfully",
                UserId = user.UserId,
                Name = user.Name,
                Status = user.Status.ToString()
            });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error unblocking user with ID {Id}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(long id)
    {
        try
        {
            var user = await _context.Users
                .Where(u => u.UserId == id)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { Error = $"User with ID {id} not found" });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = $"User has been deleted successfully",
                DeletedUserId = id
            });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error deleting user with ID {Id}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }
}