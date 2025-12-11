using EducationalSystem.Models;

namespace EducationalSystem.DTOs;

public class CreateReviewRequest
{
    public string Text { get; set; } = string.Empty;
    public List<string>? MediaFiles { get; set; }
    public ReviewType Type { get; set; }
}