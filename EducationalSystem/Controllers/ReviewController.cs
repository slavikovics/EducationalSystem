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
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;
    private readonly ILogger<ReviewController> _logger;

    public ReviewController(IReviewService reviewService, ILogger<ReviewController> logger)
    {
        _reviewService = reviewService;
        _logger = logger;
    }

    [HttpGet("create-form")]
    [Authorize]
    public IActionResult GetCreateReviewForm()
    {
        return Ok(new
        {
            Fields = new[] { "Text", "MediaFiles", "Type" },
            ReviewTypes = Enum.GetNames(typeof(ReviewType))
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
    {
        try
        {
            var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var content = new Content
            {
                Text = request.Text,
                MediaFiles = request.MediaFiles
            };

            var review = await _reviewService.CreateReview(userId, request.Type, content);
            return CreatedAtAction(nameof(GetReviewById), new { id = review.ReviewId }, review);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create review");
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteReview(long id)
    {
        try
        {
            await _reviewService.DeleteReview(id);
            return Ok(new { Message = $"Review {id} deleted successfully" });
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
    public async Task<IActionResult> GetAllReviews()
    {
        try
        {
            var reviews = await _reviewService.GetAllReviews();
            return Ok(reviews);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get all reviews");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetReviewById(long id)
    {
        try
        {
            var review = await _reviewService.GetReviewById(id);
            return Ok(review);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Error = ex.Message });
        }
    }

    [HttpGet("{id}/edit-form")]
    public async Task<IActionResult> GetEditContentForm(long id)
    {
        try
        {
            var review = await _reviewService.GetReviewById(id);
            var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            if (review.UserId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            return Ok(new
            {
                Review = review,
                EditableFields = new[] { "Text", "MediaFiles" }
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
            var review = await _reviewService.GetReviewById(id);

            if (review.UserId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            var updatedReview = await _reviewService.UpdateContent(id, newData);
            return Ok(updatedReview);
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