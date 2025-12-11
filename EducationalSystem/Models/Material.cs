namespace EducationalSystem.Models;

public class Material
{
    public long MaterialId { get; set; }
    public long UserId { get; set; }
    public DateTime CreationDate { get; set; }
    public Content? Content { get; set; }
    public ContentCategory Category { get; set; }
}