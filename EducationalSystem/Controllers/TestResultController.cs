using EducationalSystem.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EducationalSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TestResultController : ControllerBase
{
    private readonly EducationalSystemDbContext _context;
    private readonly ILogger<TestResultController> _logger;
    
    public TestResultController(EducationalSystemDbContext context, ILogger<TestResultController> logger)
    {
        _context = context; 
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "User,Tutor,Admin")]
    public async Task<IActionResult> GetAllTestResults()
    {
        try
        {
            var results = await _context.TestResults.ToListAsync();
            return Ok(results);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return StatusCode(500, new { Error = "Internal server error" }); 
        }
    }
}