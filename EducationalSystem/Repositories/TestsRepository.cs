using EducationalSystem.Data;
using EducationalSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace EducationalSystem.Repositories;

public class TestsRepository : ITestsRepository
    {
        private readonly EducationalSystemDbContext _context;

        public TestsRepository(EducationalSystemDbContext context)
        {
            _context = context;
        }

        public Test CreateTest(long materialId, List<Question> questions)
        {
            var material = _context.Materials.Find(materialId)
                ?? throw new KeyNotFoundException("Material not found");

            var test = new Test
            {
                Questions = questions,
                MaterialId = materialId,
            };

            _context.Tests.Add(test);
            _context.SaveChanges();
            return test;
        }

        public void DeleteTest(long testId)
        {
            var test = _context.Tests
                .Include(t => t.Questions)
                .FirstOrDefault(t => t.TestId == testId)
                ?? throw new KeyNotFoundException("Test not found");

            _context.Tests.Remove(test);
            _context.SaveChanges();
        }

        public Test UpdateQuestions(long testId, List<Question> newQuestions)
        {
            var test = _context.Tests
                .Include(t => t.Questions)
                .FirstOrDefault(t => t.TestId == testId)
                ?? throw new KeyNotFoundException("Test not found");

            _context.Questions.RemoveRange(test.Questions ?? new List<Question>());
            test.Questions = newQuestions;
            
            _context.SaveChanges();
            return test;
        }

        public Test GetTestByMaterialId(long materialId)
        {
            return _context.Tests
                .Include(t => t.Questions)
                .FirstOrDefault(t => EF.Property<long>(t, "MaterialId") == materialId)
                ?? throw new KeyNotFoundException("Test not found for this material");
        }

        public List<Test> GetAllTests()
        {
            return _context.Tests
                .Include(t => t.Questions)
                .OrderBy(t => t.TestId)
                .ToList();
        }

        public Test GetTestById(long testId)
        {
            return _context.Tests
                .Include(t => t.Questions)
                .FirstOrDefault(t => t.TestId == testId)
                ?? throw new KeyNotFoundException("Test not found");
        }
    }