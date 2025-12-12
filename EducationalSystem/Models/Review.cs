using System.ComponentModel.DataAnnotations;

namespace EducationalSystem.Models;

public class Review
{
    [Key]
    public long ReviewId { get; set; }
    
    [Required]
    public ReviewType Type { get; set; }
    
    public long? ContentId { get; set; }
    
    public virtual Content? Content { get; set; }
    
    public long UserId { get; set; }
    
    public virtual User? User { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}