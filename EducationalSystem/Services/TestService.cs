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

    public async Task<Test> CreateTest(long materialId, List<Question> questions, long createdByUserId)
    {
        return await _testsRepository.CreateTest(materialId, questions, createdByUserId);
    }

    public async Task DeleteTest(long testId)
    {
        await _testsRepository.DeleteTest(testId);
    }

    public async Task<List<Test>> GetAllTests()
    {
        return await _testsRepository.GetAllTests();
    }

    public async Task<Test> GetTestById(long testId)
    {
        return await _testsRepository.GetTestById(testId);
    }

    public async Task<Test> GetTestByMaterialId(long materialId)
    {
        return await _testsRepository.GetTestByMaterialId(materialId);
    }

    public async Task<Test> UpdateQuestions(long testId, List<Question> newQuestions)
    {
        return await _testsRepository.UpdateQuestions(testId, newQuestions);
    }

    public async Task<TestResult> SubmitTest(long testId, long userId, Dictionary<int, string> answers)
    {
        var test = await _testsRepository.GetTestById(testId);
        
        int score = 0;
        foreach (var (questionIndex, userAnswer) in answers)
        {
            if (questionIndex >= 0 && questionIndex < test.Questions.Count)
            {
                var question = test.Questions[questionIndex];
                if (question.AnswerText.Equals(userAnswer, StringComparison.OrdinalIgnoreCase))
                {
                    score++;
                }
            }
        }

        var testResult = new TestResult
        {
            TestId = testId,
            UserId = userId,
            Score = score,
            TotalQuestions = test.Questions.Count,
            PassingScore = test.PassingScore,
            Passed = score >= test.PassingScore,
            UserAnswers = answers,
            SubmittedAt = DateTime.UtcNow
        };

        // Save the test result
        return await _testsRepository.SaveTestResult(testResult);
    }
}