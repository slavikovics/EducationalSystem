using EducationalSystem.Models;

namespace EducationalSystem.Repositories;

public interface ITestsRepository
{
    public Test CreateTest(long materialId, List<Question> questions);
    public void DeleteTest(long testId);
    public Test UpdateQuestions(long testId, List<Question> newQuestions);
    public Test GetTestByMaterialId(long materialId);
    public List<Test> GetAllTests();
    public Test GetTestById(long testId);
}