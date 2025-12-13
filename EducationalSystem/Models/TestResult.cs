using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace EducationalSystem.Models;

public class TestResult
{
    [Key] public long TestResultId { get; set; }

    [Required] public long TestId { get; set; }

    [Required] public long UserId { get; set; }

    [Required] public int Score { get; set; }

    [Required] public int TotalQuestions { get; set; }

    [Required] public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore] public Dictionary<int, string> UserAnswers { get; set; } = new();

    [JsonIgnore] public virtual Test? Test { get; set; }

    [JsonIgnore] public virtual User? User { get; set; }
}