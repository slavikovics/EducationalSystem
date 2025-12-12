namespace EducationalSystem.DTOs;

public class QuestionDto
{
    public string QuestionText { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public string AnswerText { get; set; } = string.Empty;
}