using System.ComponentModel.DataAnnotations;

namespace EducationalSystem.Models;

public class Content
{
    [Key] public long ContentId { get; set; }
    public string Text { get; set; } = string.Empty;
    public List<string>? MediaFiles { get; set; } = new();
}