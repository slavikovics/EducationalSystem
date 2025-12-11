using EducationalSystem.Models;

namespace EducationalSystem.DTOs;

public class CreateMaterialRequest
{
    public string Text { get; set; } = string.Empty;
    public List<string>? MediaFiles { get; set; }
    public ContentCategory Category { get; set; }
}