using System.Security.Claims;
using System.Text.Json;
using EducationalSystem.DTOs;
using EducationalSystem.Models;
using EducationalSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EducationalSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TestController : ControllerBase
{
    private readonly ITestService _testService;
    private readonly ILogger<TestController> _logger;
    private readonly IMaterialService _materialService;

    public TestController(ITestService testService,IMaterialService materialService, ILogger<TestController> logger)
    {
        _testService = testService;
        _logger = logger;
        _materialService = materialService;
    }

    [HttpGet("create-form")]
    [Authorize(Roles = "Tutor,Admin")]
    public async Task<IActionResult> GetCreateTestForm()
    {
        var materials = await _materialService.GetAllMaterials();
        return Ok(materials);
    }

    [HttpPost]
    [Authorize(Roles = "Tutor,Admin")]
    public async Task<IActionResult> CreateTest([FromBody] CreateTestRequest request)
    {
        try
        {
            var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var test = await _testService.CreateTest(request.MaterialId, request.Questions, userId);
            return CreatedAtAction(nameof(GetTestById), new { id = test.TestId }, test);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create test");
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Tutor,Admin")]
    public async Task<IActionResult> DeleteTest(long id)
    {
        try
        {
            await _testService.DeleteTest(id);
            return Ok(new { Message = $"Test {id} deleted successfully" });
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

    [HttpGet("{id}/edit-form")]
    [Authorize(Roles = "Tutor,Admin")]
    public async Task<IActionResult> GetEditQuestionsForm(long id)
    {
        try
        {
            var test = await _testService.GetTestById(id);
            return Ok(new
            {
                Test = test,
                Instructions = "Provide new list of questions to replace existing ones"
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Error = ex.Message });
        }
    }

    [HttpPut("{id}/questions")]
    [Authorize(Roles = "Tutor,Admin")]
    public async Task<IActionResult> UpdateQuestions(long id, [FromBody] List<Question> newQuestions)
    {
        try
        {
            var updatedTest = await _testService.UpdateQuestions(id, newQuestions);
            return Ok(updatedTest);
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

    [HttpPost("{testId}/submit")]
    [Authorize(Roles = "User,Student,Tutor,Admin")] // Any authenticated user can take tests
    public async Task<IActionResult> SubmitTest(long testId, [FromBody] TestSubmissionDto submission)
    {
        try
        {
            var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _testService.SubmitTest(testId, userId, submission.Answers);

            return Ok(new
            {
                Score = result.Score,
                TotalQuestions = result.TotalQuestions,
                Passed = result.Score >= result.PassingScore
            });
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

    [HttpGet("material/{materialId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTestByMaterialId(long materialId)
    {
        try
        {
            var test = await _testService.GetTestByMaterialId(materialId);
            return Ok(test);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Error = ex.Message });
        }
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllTests()
    {
        try
        {
            var tests = await _testService.GetAllTests();
            _logger.LogInformation($"All tests: {JsonSerializer.Serialize(tests)}");
            return Ok(tests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get all tests");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetTestById(long id)
    {
        try
        {
            var test = await _testService.GetTestById(id);
            return Ok(test);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Error = ex.Message });
        }
    }
}