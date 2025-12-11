namespace EducationalSystem.Models;

public class Content
{
    public long ContentId { get; set; }
    public required string Text { get; set; }
    public List<string>? MediaFiles { get; set; }
}