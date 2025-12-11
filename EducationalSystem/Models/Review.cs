namespace EducationalSystem.Models;

public class Review
{
    public long ReviewId { get; set; }
    public long UserId { get; set; }
    public Content? Content { get; set; }
    public ReviewType Type { get; set; }
}