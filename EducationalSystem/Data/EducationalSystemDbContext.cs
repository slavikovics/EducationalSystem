using EducationalSystem.Models;

namespace EducationalSystem.Data;
using Microsoft.EntityFrameworkCore;

public class EducationalSystemDbContext : DbContext
{
    public EducationalSystemDbContext(DbContextOptions<EducationalSystemDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Admin> Admins { get; set; }
    public DbSet<Tutor> Tutors { get; set; }
    public DbSet<Material> Materials { get; set; }
    public DbSet<Content> Contents { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Test> Tests { get; set; }
    public DbSet<Question> Questions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<User>()
            .HasDiscriminator<string>("UserType")
            .HasValue<User>("User")
            .HasValue<Admin>("Admin")
            .HasValue<Tutor>("Tutor");

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.UserId);
            entity.Property(u => u.Name).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Password).IsRequired().HasMaxLength(255);
            entity.Property(u => u.Status).HasConversion<string>();
            entity.HasIndex(u => u.Email).IsUnique();
        });
        
        modelBuilder.Entity<Admin>(entity => { entity.Property(a => a.AccessKey).IsRequired().HasMaxLength(100); });

        modelBuilder.Entity<Tutor>(entity =>
        {
            entity.Property(t => t.Specialty).IsRequired().HasMaxLength(100);
            entity.Property(t => t.Experience).IsRequired();
        });
        
        modelBuilder.Entity<Material>(entity =>
        {
            entity.HasKey(m => m.MaterialId);
            entity.Property(m => m.CreationDate).IsRequired();
            entity.Property(m => m.Category).HasConversion<string>();

            entity.HasOne(m => m.Content)
                .WithMany()
                .HasForeignKey("ContentId")
                .OnDelete(DeleteBehavior.Restrict);
        });
        
        modelBuilder.Entity<Content>(entity =>
        {
            entity.HasKey(c => c.ContentId);
            entity.Property(c => c.Text).IsRequired();
            
            entity.Property(c => c.MediaFiles)
                .HasConversion(
                    v => string.Join(';', v ?? new List<string>()),
                    v => v.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList());
        });
        
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(r => r.ReviewId);
            entity.Property(r => r.Type).HasConversion<string>();

            entity.HasOne(r => r.Content)
                .WithMany()
                .HasForeignKey("ContentId")
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Test>(entity =>
        {
            entity.HasKey(t => t.TestId);

            entity.HasOne<Material>()
                .WithMany()
                .HasForeignKey("MaterialId")
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasKey(q => q.QuestionId);
            entity.Property(q => q.QuestionText).IsRequired().HasMaxLength(500);
            entity.Property(q => q.AnswerText).IsRequired().HasMaxLength(500);

            entity.HasOne<Test>()
                .WithMany(t => t.Questions)
                .HasForeignKey("TestId")
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}