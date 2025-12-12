using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EducationalSystem.Models;

public class Test
{
    [Key]
    public long TestId { get; set; }
    
    [Required]
    public DateTime CreatedAt { get; set; }
    
    [Required]
    public long MaterialId { get; set; }
    
    public virtual Material? Material { get; set; }
    
    [Required]
    public long CreatedByUserId { get; set; }
    
    [ForeignKey("CreatedByUserId")]
    public virtual User? CreatedByUser { get; set; }
    
    public virtual List<Question> Questions { get; set; } = new();
    
    public int PassingScore { get; set; }
}