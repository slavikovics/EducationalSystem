using EducationalSystem.Models;

namespace EducationalSystem.Services;

public interface ITestService
{
    Test CreateTest(long materialId, List<Question> questions);
    void DeleteTest(long testId);
    Test UpdateQuestions(long testId, List<Question> newQuestions);
    Test GetTestByMaterialId(long materialId);
    List<Test> GetAllTests();
    Test GetTestById(long testId);
}