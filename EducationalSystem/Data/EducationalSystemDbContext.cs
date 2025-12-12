using System.Text.Json;
using EducationalSystem.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace EducationalSystem.Data;

public class EducationalSystemDbContext : DbContext
{
    public EducationalSystemDbContext(DbContextOptions<EducationalSystemDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Material> Materials { get; set; }
    public DbSet<Content> Contents { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Test> Tests { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<TestResult> TestResults { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User inheritance (TPH - Table Per Hierarchy)
        modelBuilder.Entity<User>()
            .ToTable("Users")
            .HasDiscriminator<string>("UserType")
            .HasValue<User>("User")
            .HasValue<Admin>("Admin")
            .HasValue<Tutor>("Tutor");

        // Configure User properties
        modelBuilder.Entity<User>()
            .Property(u => u.Name)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(150);

        modelBuilder.Entity<User>()
            .Property(u => u.Password)
            .IsRequired()
            .HasMaxLength(100);

        modelBuilder.Entity<User>()
            .Property(u => u.UserType)
            .IsRequired()
            .HasMaxLength(20);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Configure Admin-specific properties
        modelBuilder.Entity<Admin>()
            .Property(a => a.AccessKey)
            .IsRequired()
            .HasMaxLength(100);

        // Configure Tutor-specific properties
        modelBuilder.Entity<Tutor>()
            .Property(t => t.Experience)
            .IsRequired();

        modelBuilder.Entity<Tutor>()
            .Property(t => t.Specialty)
            .IsRequired()
            .HasMaxLength(100);

        // Configure Material
        modelBuilder.Entity<Material>()
            .ToTable("Materials")
            .HasKey(m => m.MaterialId);

        modelBuilder.Entity<Material>()
            .Property(m => m.CreationDate)
            .IsRequired();

        modelBuilder.Entity<Material>()
            .Property(m => m.Category)
            .HasConversion<string>()
            .HasMaxLength(50);

        // Material -> User relationship
        modelBuilder.Entity<Material>()
            .HasOne(m => m.User)
            .WithMany(u => u.Materials)
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Material -> Content relationship
        modelBuilder.Entity<Material>()
            .HasOne(m => m.Content)
            .WithOne()
            .HasForeignKey<Material>(m => m.ContentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Content
        modelBuilder.Entity<Content>()
            .ToTable("Contents")
            .HasKey(c => c.ContentId);

        modelBuilder.Entity<Content>()
            .Property(c => c.Text)
            .HasColumnType("text");

        // JSON conversion for MediaFiles WITH VALUE COMPARER
        modelBuilder.Entity<Content>()
            .Property(c => c.MediaFiles)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>(),
                new ValueComparer<List<string>>(
                    (c1, c2) => c1.SequenceEqual(c2),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()))
            .HasColumnType("text");

        // Configure Review
        modelBuilder.Entity<Review>()
            .ToTable("Reviews")
            .HasKey(r => r.ReviewId);

        modelBuilder.Entity<Review>()
            .Property(r => r.Type)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);

        modelBuilder.Entity<Review>()
            .Property(r => r.CreatedAt)
            .IsRequired();
        
        // Review -> Content relationship
        modelBuilder.Entity<Review>()
            .HasOne(r => r.Content)
            .WithOne()
            .HasForeignKey<Review>(r => r.ContentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Test
        modelBuilder.Entity<Test>()
            .ToTable("Tests")
            .HasKey(t => t.TestId);

        modelBuilder.Entity<Test>()
            .Property(t => t.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<Test>()
            .Property(t => t.PassingScore)
            .IsRequired();

        // Test -> User relationship (CreatedBy)
        modelBuilder.Entity<Test>()
            .HasOne(t => t.CreatedByUser)
            .WithMany()
            .HasForeignKey(t => t.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Test -> Questions relationship
        modelBuilder.Entity<Test>()
            .HasMany(t => t.Questions)
            .WithOne(q => q.Test)
            .HasForeignKey(q => q.TestId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Question
        modelBuilder.Entity<Question>()
            .ToTable("Questions")
            .HasKey(q => q.QuestionId);

        modelBuilder.Entity<Question>()
            .Property(q => q.QuestionText)
            .IsRequired()
            .HasColumnType("text");

        modelBuilder.Entity<Question>()
            .Property(q => q.AnswerText)
            .IsRequired()
            .HasMaxLength(500);

        // JSON conversion for Options WITH VALUE COMPARER
        modelBuilder.Entity<Question>()
            .Property(q => q.Options)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>(),
                new ValueComparer<List<string>>(
                    (c1, c2) => c1.SequenceEqual(c2),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()))
            .HasColumnType("text");

        // Configure TestResult
        modelBuilder.Entity<TestResult>()
            .ToTable("TestResults")
            .HasKey(tr => tr.TestResultId);

        modelBuilder.Entity<TestResult>()
            .Property(tr => tr.Score)
            .IsRequired();

        modelBuilder.Entity<TestResult>()
            .Property(tr => tr.TotalQuestions)
            .IsRequired();

        modelBuilder.Entity<TestResult>()
            .Property(tr => tr.PassingScore)
            .IsRequired();

        modelBuilder.Entity<TestResult>()
            .Property(tr => tr.Passed)
            .IsRequired();

        modelBuilder.Entity<TestResult>()
            .Property(tr => tr.SubmittedAt)
            .IsRequired();

        // TestResult -> Test relationship
        modelBuilder.Entity<TestResult>()
            .HasOne(tr => tr.Test)
            .WithMany()
            .HasForeignKey(tr => tr.TestId)
            .OnDelete(DeleteBehavior.Restrict);

        // TestResult -> User relationship
        modelBuilder.Entity<TestResult>()
            .HasOne(tr => tr.User)
            .WithMany(u => u.TestResults)
            .HasForeignKey(tr => tr.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // JSON conversion for UserAnswers WITH VALUE COMPARER
        modelBuilder.Entity<TestResult>()
            .Property(tr => tr.UserAnswers)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<Dictionary<int, string>>(v, (JsonSerializerOptions?)null) ??
                     new Dictionary<int, string>(),
                new ValueComparer<Dictionary<int, string>>(
                    (c1, c2) => c1.SequenceEqual(c2),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.Key.GetHashCode(), v.Value.GetHashCode())),
                    c => c.ToDictionary(kv => kv.Key, kv => kv.Value)))
            .HasColumnType("text");
    }
}