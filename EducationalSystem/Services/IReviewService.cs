using EducationalSystem.Models;

namespace EducationalSystem.Services;

public interface IReviewService
{
    Task<Review> CreateReview(long userId, ReviewType type, Content content);
    Task DeleteReview(long id);
    Task<Review> GetReviewById(long id);
    Task<Review> UpdateContent(long id, Dictionary<string, object> newData);
    Task<List<Review>> GetAllReviews();
}