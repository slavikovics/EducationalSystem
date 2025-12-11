using System.Security.Claims;
using EducationalSystem.DTOs;
using EducationalSystem.Models;
using EducationalSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EducationalSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaterialController : ControllerBase
{
    private readonly IMaterialService _materialService;
    private readonly ILogger<MaterialController> _logger;

    public MaterialController(IMaterialService materialService, ILogger<MaterialController> logger)
    {
        _materialService = materialService;
        _logger = logger;
    }

    [HttpGet("create-form")]
    public IActionResult GetCreateMaterialForm()
    {
        return Ok(new
        {
            Fields = new[] { "Text", "MediaFiles", "Category" },
            Categories = Enum.GetNames(typeof(ContentCategory))
        });
    }

    [HttpPost]
    public IActionResult CreateMaterial([FromBody] CreateMaterialRequest request)
    {
        try
        {
            var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var content = new Content
            {
                Text = request.Text,
                MediaFiles = request.MediaFiles
            };

            var material = _materialService.CreateMaterial(userId, DateTime.UtcNow, content);
            return CreatedAtAction(nameof(GetMaterialById), new { id = material.MaterialId }, material);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create material");
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Tutor")]
    public IActionResult DeleteMaterial(long id)
    {
        try
        {
            _materialService.DeleteMaterial(id);
            return Ok(new { Message = $"Material {id} deleted successfully" });
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
    public IActionResult GetEditContentForm(long id)
    {
        try
        {
            var material = _materialService.GetMaterialById(id);
            return Ok(new
            {
                Material = material,
                EditableFields = new[] { "Text", "MediaFiles", "Category" }
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Error = ex.Message });
        }
    }

    [HttpPut("{id}/content")]
    public IActionResult UpdateContent(long id, [FromBody] Dictionary<string, object> newData)
    {
        try
        {
            var userId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var material = _materialService.GetMaterialById(id);

            if (material.UserId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var updatedMaterial = _materialService.UpdateContent(id, newData);
            return Ok(updatedMaterial);
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

    [HttpGet]
    [AllowAnonymous]
    public IActionResult GetAllMaterials()
    {
        try
        {
            var materials = _materialService.GetAllMaterials();
            return Ok(materials);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get all materials");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public IActionResult GetMaterialById(long id)
    {
        try
        {
            var material = _materialService.GetMaterialById(id);
            return Ok(material);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Error = ex.Message });
        }
    }

    [HttpGet("user/{userId}")]
    [Authorize]
    public IActionResult GetUserMaterials(long userId)
    {
        try
        {
            var currentUserId = long.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (currentUserId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var materials = _materialService.GetMaterialsByUserId(userId);
            return Ok(materials);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get user materials for user {UserId}", userId);
            return BadRequest(new { Error = ex.Message });
        }
    }
}