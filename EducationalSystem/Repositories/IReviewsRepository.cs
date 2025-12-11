using EducationalSystem.Models;

namespace EducationalSystem.Repositories;

public interface IReviewsRepository
{
    public Review CreateReview(long userId, ReviewType type, Content content);
    public void DeleteReview(long reviewId, string accessKey);
    public List<Review> GetAllReviews();
    public Review GetReviewById(long reviewId);
    public Review UpdateContent(long reviewId, Dictionary<string, object> newData);
}