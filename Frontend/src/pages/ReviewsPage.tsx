// src/pages/ReviewsPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { reviewsAPI } from '../services/api'; // You'll need to create this API service
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
  RefreshCw
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
  user?: User;
  createdAt: string;
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

  // Fetch reviews from backend - FIXED: Proper API call
  const { 
    data: reviews = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      try {
        // Call the API service properly
        const response = await reviewsAPI.getAllReviews().data;
        
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
  });

  // Delete mutation - FIXED: Use proper API service
  const deleteMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      return await reviewsAPI.deleteReview(reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedReview(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete review: ${error.message}`);
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Text':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-muted text-muted-foreground border-muted';
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
    if (urlLower.includes('.jpg') || urlLower.includes('.png') || urlLower.includes('.gif')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    if (urlLower.includes('.mp4') || urlLower.includes('.mov') || urlLower.includes('.avi')) {
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reviews</h1>
            <p className="text-muted-foreground">
              User feedback and ratings
            </p>
          </div>
        </div>

        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold">Failed to Load Reviews</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                There was an error loading the reviews. Please try again.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => refetch()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleCreateReview}>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews & Feedback</h1>
          <p className="text-muted-foreground mt-2">
            {totalReviews === 0 ? 'No reviews yet' : `${totalReviews} review${totalReviews !== 1 ? 's' : ''} from our community`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button onClick={handleCreateReview}>
            <Plus className="mr-2 h-4 w-4" />
            Write Review
          </Button>
        </div>
      </div>

      {/* Stats Cards - Only show if there are reviews */}
      {totalReviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalReviews}</div>
                  <p className="text-sm text-muted-foreground">All user reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Star Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-3 rounded-xl">
                  <Star className="h-6 w-6 text-white fill-current" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{starReviews}</div>
                  <p className="text-sm text-muted-foreground">Ratings with stars</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Text Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{textReviews}</div>
                  <p className="text-sm text-muted-foreground">Written feedback</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Show filters only if there are reviews or search/filter is active */}
      {(totalReviews > 0 || search || typeFilter !== 'all') && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All Reviews</TabsTrigger>
                  <TabsTrigger value="star">
                    <Star className="h-4 w-4 mr-2" />
                    Star
                  </TabsTrigger>
                  <TabsTrigger value="text">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Text
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search reviews..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full lg:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Star">Star Reviews</SelectItem>
                    <SelectItem value="Text">Text Reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews Grid or Empty State */}
      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">
                {totalReviews === 0 ? 'No Reviews Yet' : 'No Matching Reviews'}
              </h3>
              <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                {totalReviews === 0 
                  ? 'Be the first to share your thoughts and feedback with the community!' 
                  : search || typeFilter !== 'all' 
                    ? 'Try adjusting your search filters to find what you\'re looking for.' 
                    : 'Start the conversation by writing the first review.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {search || typeFilter !== 'all' ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearch('');
                        setTypeFilter('all');
                        setActiveTab('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                    <Button onClick={handleCreateReview}>
                      <Plus className="mr-2 h-4 w-4" />
                      Write Review
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleCreateReview}>
                    <Plus className="mr-2 h-4 w-4" />
                    Write First Review
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReviews.map((review: Review) => (
            <Card key={review.reviewId} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials(review.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {review.user?.name || 'Anonymous User'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(review.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-1 ${getReviewTypeColor(review.type)}`}
                  >
                    {getReviewTypeIcon(review.type)}
                    {review.type}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                <div className="space-y-4">
                  <p className="text-foreground line-clamp-3">
                    {review.content?.text || 'No review text provided'}
                  </p>
                  
                  {review.content?.mediaFiles && review.content.mediaFiles.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Attachments ({review.content.mediaFiles.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {review.content.mediaFiles.slice(0, 2).map((file, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {getFileIcon(file)}
                            {extractFileName(file)}
                          </Badge>
                        ))}
                        {review.content.mediaFiles.length > 2 && (
                          <Badge variant="outline">
                            +{review.content.mediaFiles.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-3 border-t">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {review.type === 'Star' && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= 4 ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`}
                          />
                        ))}
                      </div>
                    )}
                    {review.type === 'Text' && (
                      <Button variant="ghost" size="sm" className="h-8">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewReview(review)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {(user?.role === 'Admin' || user?.userId === review.userId) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewReview(review)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedReview(review);
                            setCreateDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Review ID: #{selectedReview?.reviewId}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getUserInitials(selectedReview.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="font-semibold">{selectedReview.user?.name || 'Anonymous User'}</div>
                  <div className="text-sm text-muted-foreground">{selectedReview.user?.email}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {selectedReview.user?.role || 'User'}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={getReviewTypeColor(selectedReview.type)}
                    >
                      {getReviewTypeIcon(selectedReview.type)}
                      {selectedReview.type} Review
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Review Date</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {formatDate(selectedReview.createdAt)}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Review Content</Label>
                <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-line">
                  {selectedReview.content?.text || 'No content provided'}
                </div>
              </div>

              {selectedReview.content?.mediaFiles && selectedReview.content.mediaFiles.length > 0 && (
                <div className="space-y-3">
                  <Label>Attachments ({selectedReview.content.mediaFiles.length})</Label>
                  <div className="space-y-2">
                    {selectedReview.content.mediaFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(file)}
                          <div>
                            <div className="font-medium text-sm">{extractFileName(file)}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-md">
                              {file}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReview}
              disabled={deleteMutation.isPending}
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
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedReview ? 'Edit Review' : 'Write a Review'}
            </DialogTitle>
            <DialogDescription>
              Share your thoughts and feedback with the community
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Review Type</Label>
              <Select defaultValue={selectedReview?.type || "Text"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select review type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Text">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Text Review
                    </div>
                  </SelectItem>
                  <SelectItem value="Star">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Star Rating
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Your Review</Label>
              <textarea
                id="content"
                placeholder="Share your experience, suggestions, or feedback..."
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={selectedReview?.content?.text || ''}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setSelectedReview(null);
              }}
            >
              Cancel
            </Button>
            <Button>
              {selectedReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};