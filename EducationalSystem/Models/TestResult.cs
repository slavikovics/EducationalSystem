using System.ComponentModel.DataAnnotations;

namespace EducationalSystem.Models;

public class TestResult
{
    [Key]
    public long TestResultId { get; set; }
    
    [Required]
    public long TestId { get; set; }
    
    [Required]
    public long UserId { get; set; }
    
    [Required]
    public int Score { get; set; }
    
    [Required]
    public int TotalQuestions { get; set; }
    
    [Required]
    public int PassingScore { get; set; }
    
    [Required]
    public bool Passed { get; set; }
    
    [Required]
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    
    public Dictionary<int, string> UserAnswers { get; set; } = new();
    
    public virtual Test? Test { get; set; }
    public virtual User? User { get; set; }
}