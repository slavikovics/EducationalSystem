// src/pages/ReviewsPage.tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { reviewsAPI } from '../services/api';
import { 
  Star, 
  Search, 
  Calendar, 
  MessageSquare, 
  ThumbsUp, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  MessageCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Video,
  Loader2,
  Plus,
  ExternalLink,
  RefreshCw,
  X,
  Upload,
  Sparkles,
  TrendingUp,
  Zap,
  Heart,
  Award,
  Filter,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Users,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';

// Types based on your backend model
interface User {
  userId: number;
  name: string;
  email: string;
  role?: string;
}

interface Content {
  contentId?: number;
  text: string;
  mediaFiles?: string[];
}

export interface Review {
  reviewId: number;
  type: 'Star' | 'Text';
  contentId?: number;
  content?: Content;
  userId: number;
  name: string;
  user?: User;
  createdAt: string;
  rating?: number;
}

// Create review form data type
interface CreateReviewData {
  type: 'Star' | 'Text';
  text: string;
  rating?: number;
  mediaFiles?: string[];
}

export const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [animateHeader, setAnimateHeader] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [animateReviews, setAnimateReviews] = useState(false);
  const [hoveredReview, setHoveredReview] = useState<number | null>(null);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [starRatingStats, setStarRatingStats] = useState<number[]>([0, 0, 0, 0, 0]);
  
  // Form state
  const [reviewType, setReviewType] = useState<'Star' | 'Text'>('Text');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Stagger animations
    setTimeout(() => setAnimateHeader(true), 200);
    setTimeout(() => setAnimateStats(true), 400);
    setTimeout(() => setAnimateReviews(true), 600);
  }, []);

  // Fetch reviews from backend
  const { 
    data: reviews = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      try {
        const response = await reviewsAPI.getAll();
        
        // Handle different response formats
        if (response && Array.isArray(response)) {
          return response; // Direct array
        } else if (response && response.data && Array.isArray(response.data)) {
          return response.data; // Response with data property
        } else if (response && Array.isArray(response.reviews)) {
          return response.reviews; // Response with reviews property
        } else {
          console.warn('Unexpected response format:', response);
          return []; // Return empty array for unexpected formats
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }
    },
    retry: 2,
    onSuccess: (data) => {
      // Calculate star rating distribution
      const starReviews = data.filter((r: Review) => r.type === 'Star');
      const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
      starReviews.forEach((review: Review) => {
        if (review.rating && review.rating >= 1 && review.rating <= 5) {
          distribution[review.rating - 1]++;
        }
      });
      setStarRatingStats(distribution);
      setStatsLoaded(true);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      return await reviewsAPI.delete(reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review deleted successfully', {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        duration: 2000,
      });
      setDeleteDialogOpen(false);
      setSelectedReview(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete review: ${error.message}`, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        duration: 3000,
      });
    },
  });

  // Create/Update mutation
  const createUpdateMutation = useMutation({
    mutationFn: async (data: { reviewId?: number; data: CreateReviewData }) => {
      if (data.reviewId) {
        // Update existing review
        return await reviewsAPI.update(data.reviewId, data.data);
      } else {
        // Create new review
        return await reviewsAPI.create(data.data);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success(variables.reviewId ? 'Review updated successfully' : 'Review created successfully', {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        duration: 2000,
      });
      resetForm();
      setCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to ${selectedReview ? 'update' : 'create'} review: ${error.message}`, {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        duration: 3000,
      });
    },
  });

  // Filter reviews based on search and type
  const filteredReviews = reviews.filter((review: Review) => {
    const reviewText = review.content?.text || '';
    const userName = review.user?.name || '';
    
    const matchesSearch = 
      reviewText.toLowerCase().includes(search.toLowerCase()) ||
      userName.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = 
      typeFilter === 'all' || 
      review.type.toLowerCase() === typeFilter.toLowerCase();
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'star' && review.type === 'Star') ||
      (activeTab === 'text' && review.type === 'Text');
    
    return matchesSearch && matchesType && matchesTab;
  });

  // Statistics
  const totalReviews = reviews.length;
  const starReviews = reviews.filter((r: Review) => r.type === 'Star').length;
  const textReviews = reviews.filter((r: Review) => r.type === 'Text').length;
  const avgRating = starReviews > 0 
    ? (reviews
        .filter((r: Review) => r.type === 'Star' && r.rating)
        .reduce((sum: number, r: Review) => sum + (r.rating || 0), 0) / starReviews
      ).toFixed(1)
    : '0.0';

  // Initialize form when creating/editing
  useEffect(() => {
    if (createDialogOpen) {
      if (selectedReview) {
        // Edit mode
        setReviewType(selectedReview.type);
        setReviewText(selectedReview.content?.text || '');
        setRating(selectedReview.rating || 5);
        setMediaFiles(selectedReview.content?.mediaFiles || []);
      } else {
        // Create mode
        setReviewType('Text');
        setReviewText('');
        setRating(5);
        setMediaFiles([]);
        setNewMediaUrl('');
      }
    }
  }, [createDialogOpen, selectedReview]);

  const resetForm = () => {
    setReviewType('Text');
    setReviewText('');
    setRating(5);
    setMediaFiles([]);
    setNewMediaUrl('');
    setSelectedReview(null);
    setIsSubmitting(false);
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim()) {
      toast.error('Please enter your review text');
      return;
    }

    if (reviewType === 'Star' && (rating < 1 || rating > 5)) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }

    setIsSubmitting(true);
    
    const reviewData: CreateReviewData = {
      type: reviewType,
      rating: rating,
      text: reviewText.trim(),
      mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
    };

    if (reviewType === 'Star') {
      reviewData.rating = rating;
    }

    createUpdateMutation.mutate({
      reviewId: selectedReview?.reviewId,
      data: reviewData
    });
  };

  const handleAddMediaUrl = () => {
    if (!newMediaUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      new URL(newMediaUrl); // Validate URL
      if (!mediaFiles.includes(newMediaUrl)) {
        setMediaFiles([...mediaFiles, newMediaUrl]);
        setNewMediaUrl('');
        toast.success('Media URL added');
      } else {
        toast.error('This URL is already added');
      }
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const handleRemoveMediaUrl = (index: number) => {
    const newMediaFiles = [...mediaFiles];
    newMediaFiles.splice(index, 1);
    setMediaFiles(newMediaFiles);
  };

  const getReviewTypeIcon = (type: string) => {
    switch (type) {
      case 'Star':
        return <Star className="h-4 w-4 text-yellow-500 fill-current" />;
      case 'Text':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getReviewTypeColor = (type: string) => {
    switch (type) {
      case 'Star':
        return 'bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200';
      case 'Text':
        return 'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gradient-to-br from-muted to-muted/50 text-muted-foreground border-muted';
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  const getFileIcon = (url: string) => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('.jpg') || urlLower.includes('.png') || urlLower.includes('.gif') || urlLower.includes('.jpeg') || urlLower.includes('.webp')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    if (urlLower.includes('.mp4') || urlLower.includes('.mov') || urlLower.includes('.avi') || urlLower.includes('.mkv')) {
      return <Video className="h-4 w-4" />;
    }
    if (urlLower.includes('.pdf')) {
      return <FileText className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const extractFileName = (url: string) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      return path.split('/').pop() || url.substring(0, 20) + '...';
    } catch {
      return url.substring(0, 20) + '...';
    }
  };

  const handleDeleteReview = () => {
    if (selectedReview) {
      deleteMutation.mutate(selectedReview.reviewId);
    }
  };

  const handleViewReview = (review: Review) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };

  const handleCreateReview = () => {
    setSelectedReview(null);
    setCreateDialogOpen(true);
  };

  const renderStars = (review: Review) => {
    const reviewRating = review.rating || 0;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= reviewRating ? 'text-yellow-500 fill-current animate-pulse-slow' : 'text-muted-foreground'}`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({reviewRating}/5)</span>
      </div>
    );
  };

  const handleRefresh = async () => {
    await refetch();
    toast.success('Reviews refreshed!', {
      icon: <RefreshCw className="h-5 w-5 text-primary animate-spin-slow" />,
      duration: 1500,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Animated Loading Header */}
        <div className={`
          flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4
          transform transition-all duration-700
          ${animateHeader ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
        `}>
          <div>
            <Skeleton className="h-8 w-48 animate-pulse" />
            <Skeleton className="h-4 w-64 mt-2 animate-pulse animation-delay-200" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-24 animate-pulse animation-delay-400" />
            <Skeleton className="h-10 w-32 animate-pulse animation-delay-600" />
          </div>
        </div>

        {/* Animated Loading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card 
              key={i}
              className={`
                transform transition-all duration-700
                ${animateStats ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
              `}
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl animate-pulse animation-delay-200" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16 animate-pulse animation-delay-400" />
                    <Skeleton className="h-3 w-32 animate-pulse animation-delay-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Animated Loading Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card 
              key={i}
              className={`
                transform transition-all duration-700
                ${animateReviews ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
              `}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full animate-pulse" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 animate-pulse animation-delay-200" />
                      <Skeleton className="h-3 w-24 animate-pulse animation-delay-400" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 animate-pulse animation-delay-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-16 animate-pulse animation-delay-200" />
                <Skeleton className="h-16 w-full animate-pulse animation-delay-400" />
                <Skeleton className="h-8 w-24 animate-pulse animation-delay-600" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full animate-pulse animation-delay-800" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center animate-slide-in-down">
          <div>
            <h1 className="text-3xl font-bold">Reviews</h1>
            <p className="text-muted-foreground">
              User feedback and ratings
            </p>
          </div>
        </div>

        <Card className="border-destructive/50 animate-shake">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold">Failed to Load Reviews</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                There was an error loading the reviews. Please try again.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => refetch()}
                  className="hover-scale transition-smooth"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCreateReview}
                  className="hover-scale transition-smooth"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Write Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className={`
        flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4
        transform transition-all duration-700
        ${animateHeader ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
      `}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 animate-pulse-slow">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight animate-slide-in-right">
              Reviews & Feedback
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 animate-fade-in animation-delay-300">
            <span className="font-semibold text-primary animate-count-up">
              {totalReviews}
            </span> review{totalReviews !== 1 ? 's' : ''} from our community • 
            <span className="ml-2 inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-yellow-500 animate-spin-slow" />
              Real user experiences
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 animate-fade-in animation-delay-500">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="hover-scale transition-smooth group"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            )}
            Refresh
          </Button>
          <Button 
            onClick={handleCreateReview}
            className="hover-scale transition-smooth group"
          >
            <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
            Write Review
          </Button>
        </div>
      </div>

      {/* Stats Cards - Only show if there are reviews */}
      {totalReviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={`
            transform transition-all duration-700
            ${animateStats ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
            hover:shadow-xl hover:scale-[1.02] transition-all duration-300
            group
          `}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold animate-count-up">
                    {totalReviews}
                  </div>
                  <p className="text-sm text-muted-foreground">All user reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`
            transform transition-all duration-700
            ${animateStats ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
            hover:shadow-xl hover:scale-[1.02] transition-all duration-300
            group
          `}
          style={{ transitionDelay: '100ms' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Star Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-6 w-6 text-white fill-current" />
                </div>
                <div>
                  <div className="text-2xl font-bold animate-count-up animation-delay-200">
                    {starReviews}
                  </div>
                  <p className="text-sm text-muted-foreground">Ratings with stars</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`
            transform transition-all duration-700
            ${animateStats ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
            hover:shadow-xl hover:scale-[1.02] transition-all duration-300
            group
          `}
          style={{ transitionDelay: '200ms' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold flex items-center gap-2 animate-count-up animation-delay-400">
                    {avgRating}
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(parseFloat(avgRating))
                              ? 'text-yellow-500 fill-current animate-pulse-slow'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Based on {starReviews} ratings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Star Rating Distribution */}
      {statsLoaded && starReviews > 0 && (
        <Card className={`
          transform transition-all duration-700
          ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
          hover:shadow-xl hover:scale-[1.02] transition-all duration-300
        `}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Rating Distribution
            </CardTitle>
            <CardDescription>
              How users are rating our platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starRatingStats[star - 1];
              const percentage = starReviews > 0 ? (count / starReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-4 group">
                  <div className="flex items-center gap-2 w-16">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{star} star{star !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex-1">
                    <Progress 
                      value={percentage} 
                      className="h-2 group-hover:scale-y-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground w-16 text-right animate-fade-in">
                    {count} ({percentage.toFixed(0)}%)
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Show filters only if there are reviews or search/filter is active */}
      {(totalReviews > 0 || search || typeFilter !== 'all') && (
        <Card className={`
          transform transition-all duration-700
          ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
          hover:shadow-xl transition-all duration-300
        `}>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto animate-fade-in">
                <TabsList>
                  <TabsTrigger value="all" className="hover-scale transition-smooth">
                    All Reviews
                  </TabsTrigger>
                  <TabsTrigger value="star" className="hover-scale transition-smooth">
                    <Star className="h-4 w-4 mr-2" />
                    Star
                  </TabsTrigger>
                  <TabsTrigger value="text" className="hover-scale transition-smooth">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Text
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto animate-fade-in animation-delay-200">
                <div className="relative flex-1 lg:w-64 group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder="Search reviews..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-md"
                  />
                  {search && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:scale-110 transition-transform"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews Grid or Empty State */}
      {filteredReviews.length === 0 ? (
        <Card className={`
          transform transition-all duration-700
          ${animateReviews ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
          hover:shadow-xl transition-all duration-300
          border-dashed border-2
        `}>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-muted to-background mb-6 animate-pulse-slow">
                <MessageSquare className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 animate-fade-in">
                {totalReviews === 0 ? 'No Reviews Yet' : 'No Matching Reviews'}
              </h3>
              <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto animate-fade-in animation-delay-200">
                {totalReviews === 0 
                  ? 'Be the first to share your thoughts and feedback with the community!' 
                  : search || typeFilter !== 'all' 
                    ? 'Try adjusting your search filters to find what you\'re looking for.' 
                    : 'Start the conversation by writing the first review.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in animation-delay-400">
                {search || typeFilter !== 'all' ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearch('');
                        setTypeFilter('all');
                        setActiveTab('all');
                      }}
                      className="hover-scale transition-smooth"
                    >
                      Clear Filters
                    </Button>
                    <Button 
                      onClick={handleCreateReview}
                      className="hover-scale transition-smooth group"
                    >
                      <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                      Write Review
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={handleCreateReview}
                    className="hover-scale transition-smooth group"
                  >
                    <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                    Write First Review
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReviews.map((review: Review, index: number) => (
            <Card 
              key={review.reviewId}
              className={`
                overflow-hidden hover:shadow-xl transition-all duration-500 hover:scale-[1.02] hover-lift
                group relative
                transform transition-all duration-700
                ${animateReviews ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                ${hoveredReview === review.reviewId ? 'shadow-xl scale-[1.02]' : ''}
              `}
              style={{
                animationDelay: `${index * 100}ms`,
                transitionDelay: `${index * 50}ms`,
              }}
              onMouseEnter={() => setHoveredReview(review.reviewId)}
              onMouseLeave={() => setHoveredReview(null)}
            >
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
              
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 group-hover:scale-110 transition-transform duration-300">
                      <AvatarFallback className="bg-gradient-to-br from-primary/10 to-secondary/10 text-primary animate-pulse-slow">
                        {getUserInitials(review.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                        {review.user?.name || 'Anonymous User'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1 animate-fade-in animation-delay-200">
                        <Calendar className="h-3 w-3" />
                        {formatDate(review.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-1 ${getReviewTypeColor(review.type)} hover:scale-105 transition-transform`}
                  >
                    {getReviewTypeIcon(review.type)}
                    {review.type}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3 relative z-10">
                <div className="space-y-4">
                  {review.type === 'Star' && (
                    <div className="flex items-center gap-2 animate-fade-in">
                      {renderStars(review)}
                    </div>
                  )}
                  
                  <p className="text-foreground line-clamp-3 group-hover:text-primary transition-colors duration-300">
                    {review.content?.text || 'No review text provided'}
                  </p>
                  
                  {review.content?.mediaFiles && review.content.mediaFiles.length > 0 && (
                    <div className="animate-fade-in animation-delay-200">
                      <p className="text-sm font-medium mb-2">Attachments ({review.content.mediaFiles.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {review.content.mediaFiles.slice(0, 2).map((file, fileIndex) => (
                          <Badge 
                            key={fileIndex} 
                            variant="secondary" 
                            className="flex items-center gap-1 hover:scale-105 transition-transform cursor-pointer"
                          >
                            {getFileIcon(file)}
                            {extractFileName(file)}
                          </Badge>
                        ))}
                        {review.content.mediaFiles.length > 2 && (
                          <Badge variant="outline" className="animate-pulse-slow">
                            +{review.content.mediaFiles.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-3 border-t relative z-10">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {review.type === 'Star' && (
                      <div className="text-sm text-muted-foreground animate-fade-in">
                        Rated {review.rating || 0} out of 5
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewReview(review)}
                      className="transition-all duration-300 hover:scale-110"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {(user?.role === 'Admin' || user?.userId === review.userId) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="transition-all duration-300 hover:scale-110"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="animate-scale-in">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleViewReview(review)}
                            className="hover-scale transition-smooth"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedReview(review);
                              setCreateDialogOpen(true);
                            }}
                            className="hover-scale transition-smooth"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive hover-scale transition-smooth"
                            onClick={() => {
                              setSelectedReview(review);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* View Review Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl animate-scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 animate-fade-in">
              <MessageSquare className="h-5 w-5 text-primary" />
              Review Details
            </DialogTitle>
            <DialogDescription className="animate-fade-in animation-delay-200">
              Review ID: #{selectedReview?.reviewId}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-muted/50 to-background rounded-lg animate-fade-in animation-delay-300">
                <Avatar className="h-14 w-14 group hover:scale-110 transition-transform">
                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-secondary/10 text-primary text-lg animate-pulse-slow">
                    {getUserInitials(selectedReview.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="font-semibold">{selectedReview.name || 'Anonymous User'}</div>
                  <div className="text-sm text-muted-foreground">{selectedReview.user?.email}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="animate-scale-in animation-delay-400">
                      {selectedReview.user?.role || 'User'}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={getReviewTypeColor(selectedReview.type) + ' animate-scale-in animation-delay-500'}
                    >
                      {getReviewTypeIcon(selectedReview.type)}
                      {selectedReview.type} Review
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3 animate-fade-in animation-delay-400">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Review Date
                </Label>
                <div className="text-sm p-2 border rounded hover:scale-[1.02] transition-transform">
                  {formatDate(selectedReview.createdAt)}
                </div>
              </div>

              {selectedReview.type === 'Star' && (
                <div className="space-y-3 animate-fade-in animation-delay-500">
                  <Label>Rating</Label>
                  <div className="flex items-center gap-2 p-2 border rounded hover:scale-[1.02] transition-transform">
                    {renderStars(selectedReview)}
                  </div>
                </div>
              )}

              <div className="space-y-3 animate-fade-in animation-delay-600">
                <Label>Review Content</Label>
                <div className="p-4 bg-gradient-to-br from-muted/30 to-background rounded-lg whitespace-pre-line hover:scale-[1.01] transition-transform">
                  {selectedReview.content?.text || 'No content provided'}
                </div>
              </div>

              {selectedReview.content?.mediaFiles && selectedReview.content.mediaFiles.length > 0 && (
                <div className="space-y-3 animate-fade-in animation-delay-700">
                  <Label>Attachments ({selectedReview.content.mediaFiles.length})</Label>
                  <div className="space-y-2">
                    {selectedReview.content.mediaFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:scale-[1.02] transition-transform group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="p-2 rounded bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:scale-110 transition-transform">
                            {getFileIcon(file)}
                          </div>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="font-medium text-sm truncate animate-fade-in">
                              {extractFileName(file)}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-80 animate-fade-in animation-delay-100">
                              {file}
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild 
                          className="flex-shrink-0 hover-scale transition-smooth"
                        >
                          <a href={file} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Review
            </DialogTitle>
            <DialogDescription className="animate-fade-in">
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="animate-fade-in animation-delay-200">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="hover-scale transition-smooth"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReview}
              disabled={deleteMutation.isPending}
              className="hover-scale transition-smooth"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Review Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => {
        setCreateDialogOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[550px] animate-scale-in">
          <DialogHeader>
            <DialogTitle className="animate-fade-in">
              {selectedReview ? 'Edit Review' : 'Write a Review'}
            </DialogTitle>
            <DialogDescription className="animate-fade-in animation-delay-200">
              Share your thoughts and feedback with the community
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Review Type Selection */}
            <div className="space-y-3 animate-fade-in animation-delay-300">
              <Label htmlFor="review-type">Review Type *</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={reviewType === 'Text' ? 'default' : 'outline'}
                  className="h-auto py-4 hover-scale transition-smooth group"
                  onClick={() => setReviewType('Text')}
                >
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>Text Review</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Write detailed feedback
                    </span>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={reviewType === 'Star' ? 'default' : 'outline'}
                  className="h-auto py-4 hover-scale transition-smooth group"
                  onClick={() => setReviewType('Star')}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Star className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>Star Rating</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Rate with stars
                    </span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Star Rating (only for Star type) */}
            {reviewType === 'Star' && (
              <div className="space-y-3 animate-fade-in animation-delay-400">
                <Label>Rating *</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded hover:scale-110 transition-transform"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        className={`h-10 w-10 transition-all duration-300 ${
                          star <= (hoverRating || rating)
                            ? 'text-yellow-500 fill-current animate-pulse'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-4 text-lg font-semibold animate-fade-in">
                    {rating} / 5
                  </span>
                </div>
                <p className="text-sm text-muted-foreground animate-fade-in">
                  Click on a star to rate. 1 is lowest, 5 is highest.
                </p>
              </div>
            )}

            {/* Review Text */}
            <div className="space-y-3 animate-fade-in animation-delay-500">
              <Label htmlFor="review-text">
                Your Review {reviewType === 'Star' ? '(Optional)' : '*'}
              </Label>
              <Textarea
                id="review-text"
                placeholder={
                  reviewType === 'Star'
                    ? "Add comments about your rating (optional)..."
                    : "Share your detailed experience, suggestions, or feedback..."
                }
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="min-h-[120px] transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
              />
              {reviewType === 'Text' && !reviewText.trim() && (
                <p className="text-sm text-destructive animate-shake">Review text is required</p>
              )}
            </div>

            {/* Media URLs */}
            <div className="space-y-3 animate-fade-in animation-delay-600">
              <Label>Add Media URLs (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="flex-1 transition-all duration-300 focus:scale-[1.02] focus:shadow-md"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddMediaUrl}
                  disabled={!newMediaUrl.trim()}
                  className="hover-scale transition-smooth"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Add URLs to images, videos, or documents
              </p>

              {/* Added Media Files */}
              {mediaFiles.length > 0 && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Added Media ({mediaFiles.length})</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {mediaFiles.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded hover:scale-[1.02] transition-transform"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {getFileIcon(url)}
                          <span className="text-sm truncate">
                            {extractFileName(url)}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMediaUrl(index)}
                          className="h-8 w-8 p-0 hover:scale-110 transition-transform"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator className="animate-fade-in animation-delay-700" />

            {/* User Info */}
            <div className="space-y-2 animate-fade-in animation-delay-800">
              <Label>Reviewing as</Label>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-muted/30 to-background rounded hover:scale-[1.02] transition-transform group">
                <Avatar className="h-8 w-8 group-hover:scale-110 transition-transform">
                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-secondary/10">
                    {getUserInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user?.name || 'Anonymous'}</div>
                  <div className="text-sm text-muted-foreground">
                    {user?.email || 'User'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="animate-fade-in animation-delay-900">
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
              className="hover-scale transition-smooth"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting || (reviewType === 'Text' && !reviewText.trim())}
              className="hover-scale transition-smooth"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {selectedReview ? 'Updating...' : 'Submitting...'}
                </>
              ) : selectedReview ? (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Review
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};