using EducationalSystem.Models;

namespace EducationalSystem.Repositories;

public interface IReviewsRepository
{
    Task<Review> CreateReview(long userId, ReviewType type, Content content);
    Task DeleteReview(long reviewId);
    Task<List<Review>> GetAllReviews();
    Task<Review> GetReviewById(long reviewId);
    Task<Review> UpdateContent(long reviewId, Dictionary<string, object> newData);
}