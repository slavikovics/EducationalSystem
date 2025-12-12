using EducationalSystem.Models;

namespace EducationalSystem.Repositories;

public interface ITestsRepository
{
    Task<Test> CreateTest(long materialId, List<Question> questions, long createdByUserId);
    Task DeleteTest(long testId);
    Task<Test> GetTestById(long testId);
    Task<Test> GetTestByMaterialId(long materialId);
    Task<List<Test>> GetAllTests();
    Task<Test> UpdateQuestions(long testId, List<Question> newQuestions);
    Task<TestResult> SaveTestResult(TestResult testResult);
    Task<List<TestResult>> GetTestResultsByUserId(long userId);
    Task<List<TestResult>> GetTestResultsByTestId(long testId);
}