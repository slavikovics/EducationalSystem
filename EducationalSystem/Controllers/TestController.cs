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

    public TestController(ITestService testService, ILogger<TestController> logger)
    {
        _testService = testService;
        _logger = logger;
    }

    [HttpGet("create-form")]
    [Authorize(Roles = "Tutor,Admin")]
    public IActionResult GetCreateTestForm()
    {
        return Ok(new
        {
            Fields = new[] { "MaterialId", "Questions" },
            QuestionFormat = "Each question should have QuestionText and AnswerText"
        });
    }

    [HttpPost]
    [Authorize(Roles = "Tutor,Admin")]
    public IActionResult CreateTest([FromBody] CreateTestRequest request)
    {
        try
        {
            var test = _testService.CreateTest(request.MaterialId, request.Questions);
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
    public IActionResult DeleteTest(long id)
    {
        try
        {
            _testService.DeleteTest(id);
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
    public IActionResult GetEditQuestionsForm(long id)
    {
        try
        {
            var test = _testService.GetTestById(id);
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
    public IActionResult UpdateQuestions(long id, [FromBody] List<Question> newQuestions)
    {
        try
        {
            var updatedTest = _testService.UpdateQuestions(id, newQuestions);
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

    [HttpGet("material/{materialId}")]
    [AllowAnonymous]
    public IActionResult GetTestByMaterialId(long materialId)
    {
        try
        {
            var test = _testService.GetTestByMaterialId(materialId);
            return Ok(test);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Error = ex.Message });
        }
    }

    [HttpGet]
    [AllowAnonymous]
    public IActionResult GetAllTests()
    {
        try
        {
            var tests = _testService.GetAllTests();
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
    public IActionResult GetTestById(long id)
    {
        try
        {
            var test = _testService.GetTestById(id);
            return Ok(test);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Error = ex.Message });
        }
    }
}