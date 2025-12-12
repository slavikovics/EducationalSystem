using EducationalSystem.Models;

namespace EducationalSystem.Services;

public interface ITestService
{
    Task<Test> CreateTest(long materialId, List<Question> questions, long createdByUserId);
    Task DeleteTest(long id);
    Task<Test> GetTestById(long id);
    Task<Test> UpdateQuestions(long id, List<Question> newQuestions);
    Task<Test> GetTestByMaterialId(long materialId);
    Task<List<Test>> GetAllTests();
    Task<TestResult> SubmitTest(long testId, long userId, Dictionary<int, string> answers);
}