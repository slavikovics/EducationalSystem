using EducationalSystem.Models;
using EducationalSystem.Repositories;

namespace EducationalSystem.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewsRepository _reviewsRepository;

    public ReviewService(IReviewsRepository reviewsRepository)
    {
        _reviewsRepository = reviewsRepository;
    }

    public Review CreateReview(long userId, ReviewType type, Content content)
    {
        return _reviewsRepository.CreateReview(userId, type, content);
    }

    public void DeleteReview(long reviewId, string accessKey)
    {
        _reviewsRepository.DeleteReview(reviewId, accessKey);
    }

    public List<Review> GetAllReviews()
    {
        return _reviewsRepository.GetAllReviews();
    }

    public Review GetReviewById(long reviewId)
    {
        return _reviewsRepository.GetReviewById(reviewId);
    }

    public Review UpdateContent(long reviewId, Dictionary<string, object> newData)
    {
        return _reviewsRepository.UpdateContent(reviewId, newData);
    }
}