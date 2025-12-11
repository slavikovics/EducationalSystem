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

    public Review CreateReview(long userId, ReviewType type, Content content)
    {
        var user = _context.Users.Find(userId)
                   ?? throw new KeyNotFoundException("User not found");

        var review = new Review
        {
            UserId = userId,
            Type = type,
            Content = content
        };

        _context.Reviews.Add(review);
        _context.SaveChanges();
        return review;
    }

    public void DeleteReview(long reviewId, string accessKey)
    {
        var admin = _context.Admins.FirstOrDefault(a => a.AccessKey == accessKey)
                    ?? throw new UnauthorizedAccessException("Invalid access key");

        var review = _context.Reviews
                         .Include(r => r.Content)
                         .FirstOrDefault(r => r.ReviewId == reviewId)
                     ?? throw new KeyNotFoundException("Review not found");

        _context.Reviews.Remove(review);

        if (review.Content != null)
        {
            _context.Contents.Remove(review.Content);
        }

        _context.SaveChanges();
    }

    public List<Review> GetAllReviews()
    {
        return _context.Reviews
            .Include(r => r.Content)
            .OrderByDescending(r => r.ReviewId)
            .ToList();
    }

    public Review GetReviewById(long reviewId)
    {
        return _context.Reviews
                   .Include(r => r.Content)
                   .FirstOrDefault(r => r.ReviewId == reviewId)
               ?? throw new KeyNotFoundException("Review not found");
    }

    public Review UpdateContent(long reviewId, Dictionary<string, object> newData)
    {
        var review = _context.Reviews
                         .Include(r => r.Content)
                         .FirstOrDefault(r => r.ReviewId == reviewId)
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

        _context.SaveChanges();
        return review;
    }
}