using EducationalSystem.Models;

namespace EducationalSystem.DTOs;

public class CreateTestRequest
{
    public long MaterialId { get; set; }
    public List<Question> Questions { get; set; } = new();
}