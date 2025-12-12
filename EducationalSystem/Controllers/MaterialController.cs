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
    [Authorize(Roles = "Admin,Tutor")]
    public IActionResult GetCreateMaterialForm()
    {
        return Ok(new
        {
            Categories = Enum.GetNames(typeof(ContentCategory))
        });
    }

    [HttpPost("create-material")]
    [Authorize(Roles = "Admin, Tutor")]
    public async Task<IActionResult> CreateMaterial([FromBody] CreateMaterialRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Category))
            {
                return BadRequest(new { Error = "Category is required" });
            }

            if (!Enum.TryParse<ContentCategory>(request.Category, true, out var category))
            {
                var validCategories = Enum.GetNames(typeof(ContentCategory));
                return BadRequest(new { 
                    Error = $"Invalid category '{request.Category}'. Valid values are: {string.Join(", ", validCategories)}"
                });
            }
            
            var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            _logger.LogError($"Creating material for user {userId}");

            var content = new Content
            {
                Text = request.Text,
                MediaFiles = request.MediaFiles,
            };

            var material = await _materialService.CreateMaterial(userId, DateTime.UtcNow, content, category);

            return Ok(new
            {
                Message = "Material created successfully",
                Material = new
                {
                    material.MaterialId,
                    material.CreationDate,
                    material.UserId,
                    Content = material.Content != null
                        ? new
                        {
                            material.Content.Text,
                            material.Content.MediaFiles,
                            request.Category
                        }
                        : null
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create material");
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Tutor")]
    public async Task<IActionResult> DeleteMaterial(long id)
    {
        try
        {
            await _materialService.DeleteMaterial(id);
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
    public async Task<IActionResult> GetEditContentForm(long id)
    {
        try
        {
            var material = await _materialService.GetMaterialById(id);
            var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            if (material.UserId != userId &&
                !User.IsInRole("Admin") &&
                !User.IsInRole("Tutor"))
            {
                return Forbid();
            }

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
    public async Task<IActionResult> UpdateContent(long id, [FromBody] Dictionary<string, object> newData)
    {
        try
        {
            var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var material = await _materialService.GetMaterialById(id);

            if (material.UserId != userId &&
                !User.IsInRole("Admin") &&
                !User.IsInRole("Tutor"))
            {
                return Forbid();
            }

            var updatedMaterial = await _materialService.UpdateContent(id, newData);
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
    public async Task<IActionResult> GetAllMaterials()
    {
        try
        {
            var materials = await _materialService.GetAllMaterials();
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
    public async Task<IActionResult> GetMaterialById(long id)
    {
        try
        {
            var material = await _materialService.GetMaterialById(id);
            return Ok(material);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Error = ex.Message });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserMaterials(long userId)
    {
        try
        {
            var currentUserId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            if (currentUserId != userId &&
                !User.IsInRole("Admin") &&
                !User.IsInRole("Tutor"))
            {
                return Forbid();
            }

            var materials = await _materialService.GetMaterialsByUserId(userId);
            return Ok(materials);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get user materials for user {UserId}", userId);
            return BadRequest(new { Error = ex.Message });
        }
    }
}