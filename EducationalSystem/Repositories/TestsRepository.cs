using EducationalSystem.Data;
using EducationalSystem.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace EducationalSystem.Repositories;

public class TestsRepository : ITestsRepository
{
    private readonly EducationalSystemDbContext _context;

    public TestsRepository(EducationalSystemDbContext context)
    {
        _context = context;
    }

    public async Task<Test> CreateTest(long materialId, List<Question> questions, long createdByUserId)
    {
        var material = await _context.Materials.FindAsync(materialId)
            ?? throw new KeyNotFoundException("Material not found");

        var test = new Test
        {
            Questions = questions,
            MaterialId = materialId,
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow,
            PassingScore = (int)Math.Ceiling(questions.Count * 0.7) // 70% passing by default
        };

        _context.Tests.Add(test);
        await _context.SaveChangesAsync();
        return test;
    }

    public async Task DeleteTest(long testId)
    {
        var test = await _context.Tests
            .Include(t => t.Questions)
            .FirstOrDefaultAsync(t => t.TestId == testId)
            ?? throw new KeyNotFoundException("Test not found");

        _context.Tests.Remove(test);
        await _context.SaveChangesAsync();
    }

    public async Task<Test> UpdateQuestions(long testId, List<Question> newQuestions)
    {
        var test = await _context.Tests
            .Include(t => t.Questions)
            .FirstOrDefaultAsync(t => t.TestId == testId)
            ?? throw new KeyNotFoundException("Test not found");

        _context.Questions.RemoveRange(test.Questions ?? new List<Question>());
        test.Questions = newQuestions;
        test.PassingScore = (int)Math.Ceiling(newQuestions.Count * 0.7);
        
        await _context.SaveChangesAsync();
        return test;
    }

    public async Task<Test> GetTestByMaterialId(long materialId)
    {
        return await _context.Tests
            .Include(t => t.Questions)
            .FirstOrDefaultAsync(t => EF.Property<long>(t, "MaterialId") == materialId)
            ?? throw new KeyNotFoundException("Test not found for this material");
    }

    public async Task<List<Test>> GetAllTests()
    {
        return await _context.Tests
            .Include(t => t.Questions)
            .Include(t => t.Material)
            .ThenInclude(m => m.Content)
            .OrderBy(t => t.TestId)
            .ToListAsync();
    }

    public async Task<Test> GetTestById(long testId)
    {
        return await _context.Tests
            .Include(t => t.Questions)
            .FirstOrDefaultAsync(t => t.TestId == testId)
            ?? throw new KeyNotFoundException("Test not found");
    }

    public async Task<TestResult> SaveTestResult(TestResult testResult)
    {
        _context.TestResults.Add(testResult);
        await _context.SaveChangesAsync();
        return testResult;
    }

    public async Task<List<TestResult>> GetTestResultsByUserId(long userId)
    {
        return await _context.TestResults
            .Where(tr => tr.UserId == userId)
            .Include(tr => tr.Test)
            .OrderByDescending(tr => tr.SubmittedAt)
            .ToListAsync();
    }

    public async Task<List<TestResult>> GetTestResultsByTestId(long testId)
    {
        return await _context.TestResults
            .Where(tr => tr.TestId == testId)
            .Include(tr => tr.User)
            .OrderByDescending(tr => tr.SubmittedAt)
            .ToListAsync();
    }
}