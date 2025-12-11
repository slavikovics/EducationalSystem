using EducationalSystem.Models;

namespace EducationalSystem.Services;

public interface IReviewService
{
    Review CreateReview(long userId, ReviewType type, Content content);
    void DeleteReview(long reviewId, string accessKey);
    List<Review> GetAllReviews();
    Review GetReviewById(long reviewId);
    Review UpdateContent(long reviewId, Dictionary<string, object> newData);
}