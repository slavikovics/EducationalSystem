import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Star, 
  Search, 
  Filter, 
  User as UserIcon, 
  Calendar, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye 
} from 'lucide-react';
import { format } from 'date-fns';

// Define the interfaces locally to avoid import issues
interface User {
  userId: number;
  name: string;
  email: string;
  status: 'Active' | 'Blocked';
  role?: string;
}

interface Content {
  contentId?: number;
  text: string;
  mediaFiles?: string[];
}

interface Review {
  reviewId: number;
  userId: number;
  content?: Content;
  type: 'Star' | 'Text';
  user?: User;
}

// Mock data
const mockReviews: Review[] = [
  {
    reviewId: 1,
    userId: 1,
    type: 'Star',
    content: {
      text: 'Excellent course material! Very comprehensive and well-structured.',
      mediaFiles: ['image1.jpg'],
    },
    user: {
      userId: 1,
      name: 'John Doe',
      email: 'john@example.com',
      status: 'Active',
      role: 'User',
    },
  },
  {
    reviewId: 2,
    userId: 2,
    type: 'Text',
    content: {
      text: 'The tests were challenging but fair. Helped me understand the concepts better.',
      mediaFiles: [],
    },
    user: {
      userId: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'Active',
      role: 'Tutor',
    },
  },
  {
    reviewId: 3,
    userId: 3,
    type: 'Star',
    content: {
      text: 'Could use more practical examples, but overall good content.',
      mediaFiles: ['screenshot.png', 'notes.pdf'],
    },
    user: {
      userId: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      status: 'Blocked',
      role: 'User',
    },
  },
];

export const ReviewsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const queryClient = useQueryClient();

  // Fetch reviews
  const { data: reviews = mockReviews, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      // In a real app, you would fetch from your API
      // const response = await fetch('/api/reviews');
      // return response.json();
      
      // For now, return mock data with a delay
      return new Promise<Review[]>((resolve) => {
        setTimeout(() => resolve(mockReviews), 500);
      });
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: number) => {
      // In a real app, you would call your API
      // await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setShowDeleteModal(false);
    },
  });

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.content?.text.toLowerCase().includes(search.toLowerCase()) ||
                         review.user?.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || review.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getReviewTypeIcon = (type: string) => {
    return type === 'Star' ? <Star className="h-4 w-4 text-yellow-500 fill-current" /> : 
                             <MessageSquare className="h-4 w-4 text-blue-500" />;
  };

  const getRatingStars = () => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= 4 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage user reviews and feedback
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Write Review
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <Star className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">{reviews.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <ThumbsUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Star Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reviews.filter(r => r.type === 'Star').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Text Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reviews.filter(r => r.type === 'Text').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <Star className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
              <p className="text-2xl font-semibold text-gray-900">4.2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Star">Star Reviews</option>
              <option value="Text">Text Reviews</option>
            </select>
          </div>

          <div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
          <p className="text-gray-600">Try changing your search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReviews.map((review) => (
            <div
              key={review.reviewId}
              className="bg-white rounded-lg shadow border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {review.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900">
                        {review.user?.name || 'Anonymous'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {review.user?.role || 'User'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getReviewTypeIcon(review.type)}
                      <span className="ml-1">{review.type}</span>
                    </span>
                  </div>
                </div>

                {review.type === 'Star' && (
                  <div className="mb-4">
                    {getRatingStars()}
                  </div>
                )}

                <p className="text-gray-700 mb-4">
                  {review.content?.text}
                </p>

                {review.content?.mediaFiles && review.content.mediaFiles.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Attachments:</p>
                    <div className="flex flex-wrap gap-2">
                      {review.content.mediaFiles.map((file, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          File {index + 1}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setShowReviewModal(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Details
                    </button>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-green-600 transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600 transition-colors">
                        <ThumbsDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Details Modal */}
      {showReviewModal && selectedReview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowReviewModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Review Details
                </h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-500 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedReview.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {selectedReview.user?.name || 'Anonymous'}
                    </h4>
                    <p className="text-gray-600">{selectedReview.user?.email}</p>
                    <div className="flex items-center mt-2 space-x-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {selectedReview.user?.role || 'User'}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedReview.user?.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedReview.user?.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        {getReviewTypeIcon(selectedReview.type)}
                        <span className="ml-2">{selectedReview.type} Review</span>
                      </span>
                      {selectedReview.type === 'Star' && getRatingStars()}
                    </div>
                    <span className="text-sm text-gray-500">
                      Review ID: #{selectedReview.reviewId}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedReview.content?.text}
                    </p>
                  </div>
                </div>

                {/* Media Files */}
                {selectedReview.content?.mediaFiles && selectedReview.content.mediaFiles.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Attached Files</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedReview.content.mediaFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center mr-3">
                              <Eye className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Attachment {index + 1}
                              </p>
                              <p className="text-xs text-gray-500">{file}</p>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setSelectedReview(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Edit className="h-4 w-4 inline mr-2" />
                    Edit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Review Modal (Simplified) */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Write a Review
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Review creation form will be implemented here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};