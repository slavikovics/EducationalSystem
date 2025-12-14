using EducationalSystem.Models;
using EducationalSystem.Repositories;

namespace EducationalSystem.Services;

public class TestService : ITestService
{
    private readonly ITestsRepository _testsRepository;
    private readonly ILogger<TestService> _logger;

    public TestService(ITestsRepository testsRepository, ILogger<TestService> logger)
    {
        _testsRepository = testsRepository;
        _logger = logger;
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
        _logger.LogInformation($"Answers: {answers}");
        
        int score = 0;
        foreach (var (questionIndex, userAnswer) in answers)
        {
            var question = test.Questions.FirstOrDefault(q => q.QuestionId == questionIndex);
            if (question is not null && question.AnswerText.Equals(userAnswer, StringComparison.OrdinalIgnoreCase))
            {
                score++;
            }
        }

        var testResult = new TestResult
        {
            TestId = testId,
            UserId = userId,
            Score = score,
            TotalQuestions = test.Questions.Count,
            UserAnswers = answers,
            SubmittedAt = DateTime.UtcNow
        };

        return await _testsRepository.SaveTestResult(testResult);
    }
}