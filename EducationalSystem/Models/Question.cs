namespace EducationalSystem.Models;

public class Question
{
    public long QuestionId { get; set; }
    public required string QuestionText { get; set; }
    public required string AnswerText { get; set; }
}