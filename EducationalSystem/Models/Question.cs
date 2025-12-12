using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EducationalSystem.Models;

public class Question
{
    [Key]
    public long QuestionId { get; set; }
    
    [Required]
    public string QuestionText { get; set; } = string.Empty;
    
    public List<string> Options { get; set; } = new();
    
    [Required]
    public string AnswerText { get; set; } = string.Empty;
    
    [Required]
    public long TestId { get; set; }
    
    [ForeignKey("TestId")]
    public virtual Test? Test { get; set; }
}