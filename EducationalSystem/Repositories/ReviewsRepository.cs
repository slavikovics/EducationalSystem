using EducationalSystem.Data;
using EducationalSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace EducationalSystem.Repositories;

public class ReviewsRepository : IReviewsRepository
{
    private readonly EducationalSystemDbContext _context;

    public ReviewsRepository(EducationalSystemDbContext context)
    {
        _context = context;
    }

    public async Task<Review> CreateReview(long userId, ReviewType type, Content content, int? rating)
    {
        var user = await _context.Users.FindAsync(userId)
                   ?? throw new KeyNotFoundException("User not found");

        var review = new Review
        {
            UserId = userId,
            Type = type,
            Content = content,
            Rating = rating
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        return review;
    }

    public async Task DeleteReview(long reviewId)
    {
        var review = await _context.Reviews
                         .Include(r => r.Content)
                         .FirstOrDefaultAsync(r => r.ReviewId == reviewId)
                     ?? throw new KeyNotFoundException("Review not found");

        _context.Reviews.Remove(review);

        if (review.Content != null)
        {
            _context.Contents.Remove(review.Content);
        }

        await _context.SaveChangesAsync();
    }

    public async Task<List<Review>> GetAllReviews()
    {
        var reviews = await _context.Reviews
            .Include(r => r.Content)
            .OrderByDescending(r => r.ReviewId)
            .ToListAsync();
        
        return reviews;
    }

    public async Task<Review> GetReviewById(long reviewId)
    {
        return await _context.Reviews
                   .Include(r => r.Content)
                   .FirstOrDefaultAsync(r => r.ReviewId == reviewId)
               ?? throw new KeyNotFoundException("Review not found");
    }

    public async Task<Review> UpdateContent(long reviewId, Dictionary<string, object> newData)
    {
        var review = await _context.Reviews
                         .Include(r => r.Content)
                         .FirstOrDefaultAsync(r => r.ReviewId == reviewId)
                     ?? throw new KeyNotFoundException("Review not found");

        if (review.Content == null)
            throw new InvalidOperationException("Review has no content to update");

        foreach (var kvp in newData)
        {
            switch (kvp.Key.ToLower())
            {
                case "text":
                    review.Content.Text = kvp.Value.ToString();
                    break;
                case "mediafiles":
                    if (kvp.Value is List<string> mediaFiles)
                        review.Content.MediaFiles = mediaFiles;
                    break;
            }
        }

        await _context.SaveChangesAsync();
        return review;
    }
}