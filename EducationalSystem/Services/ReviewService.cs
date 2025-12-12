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

    public async Task<Review> CreateReview(long userId, ReviewType type, Content content, int? rating)
    {
        return await _reviewsRepository.CreateReview(userId, type, content, rating);
    }

    public async Task DeleteReview(long reviewId)
    {
        await _reviewsRepository.DeleteReview(reviewId);
    }

    public async Task<List<Review>> GetAllReviews()
    {
        return await _reviewsRepository.GetAllReviews();
    }

    public async Task<Review> GetReviewById(long reviewId)
    {
        return await _reviewsRepository.GetReviewById(reviewId);
    }

    public async Task<Review> UpdateContent(long reviewId, Dictionary<string, object> newData)
    {
        return await _reviewsRepository.UpdateContent(reviewId, newData);
    }
}