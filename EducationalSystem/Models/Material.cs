using System.ComponentModel.DataAnnotations;

namespace EducationalSystem.Models;

public class Material
{
    [Key] public long MaterialId { get; set; }
    [Required] public DateTime CreationDate { get; set; }
    public long? ContentId { get; set; }
    public virtual Content? Content { get; set; }
    public long UserId { get; set; }
    public virtual User? User { get; set; }
    public virtual Test? Test { get; set; }
    public ContentCategory? Category { get; set; }
}