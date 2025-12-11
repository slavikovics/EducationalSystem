using EducationalSystem.Models;
using EducationalSystem.Repositories;

namespace EducationalSystem.Services;

public class TestService : ITestService
{
    private readonly ITestsRepository _testsRepository;

    public TestService(ITestsRepository testsRepository)
    {
        _testsRepository = testsRepository;
    }

    public Test CreateTest(long materialId, List<Question> questions)
    {
        return _testsRepository.CreateTest(materialId, questions);
    }

    public void DeleteTest(long testId)
    {
        _testsRepository.DeleteTest(testId);
    }

    public List<Test> GetAllTests()
    {
        return _testsRepository.GetAllTests();
    }

    public Test GetTestById(long testId)
    {
        return _testsRepository.GetTestById(testId);
    }

    public Test GetTestByMaterialId(long materialId)
    {
        return _testsRepository.GetTestByMaterialId(materialId);
    }

    public Test UpdateQuestions(long testId, List<Question> newQuestions)
    {
        return _testsRepository.UpdateQuestions(testId, newQuestions);
    }
}