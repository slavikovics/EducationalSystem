// src/pages/MaterialsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { materialsAPI } from '../services/api';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  AlertCircle, 
  BookOpen, 
  Calendar, 
  Edit, 
  Trash2, 
  User,
  Video,
  Image,
  FileText,
  Plus,
  Eye,
  File,
  Search,
  Filter,
  SortAsc,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Loader2,
  CheckCircle,
  Zap,
  MoreVertical
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';

interface Material {
  materialId: number;
  userId: number;
  userName?: string;
  creationDate: string;
  content: {
    text: string;
    mediaFiles: string[];
  };
  category?: number;
  user?: {
    name?: string;
    Name?: string;
  };
}

export const MaterialsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [animateItems, setAnimateItems] = useState(false);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (materials.length > 0) {
      setTimeout(() => setAnimateItems(true), 100);
    }
  }, [materials]);

  useEffect(() => {
    // Filter materials based on search query
    const filtered = materials.filter(material => 
      material.content.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCategoryName(material.category).toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort materials
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.creationDate).getTime();
      const dateB = new Date(b.creationDate).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredMaterials(sorted);
  }, [materials, searchQuery, sortOrder]);

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const response = await materialsAPI.getAllMaterials();
      console.log('Materials response:', response);
      
      let materialsData: Material[] = [];
      if (Array.isArray(response.data)) {
        materialsData = response.data;
      } else if (Array.isArray(response)) {
        materialsData = response;
      } else if (response && typeof response === 'object') {
        materialsData = response.data || response.items || [];
      }
      
      const processedMaterials = materialsData.map((material: any) => ({
        materialId: material.materialId || material.id || 0,
        userId: material.userId || 0,
        userName: material.user?.name || material.user?.Name || material.userName || `User ${material.userId}`,
        creationDate: material.creationDate || material.createdAt || material.date || new Date().toISOString(),
        content: {
          text: material.content?.text || material.text || material.description || 'No description',
          mediaFiles: material.content?.mediaFiles || material.mediaFiles || [],
        },
        category: material.category,
        user: material.user
      }));
      
      setMaterials(processedMaterials);
      toast.success('Materials loaded successfully!', {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Failed to fetch materials:', error);
      setError(error.message || 'Failed to load materials');
      toast.error('Failed to load materials', {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setAnimateItems(false);
    await fetchMaterials();
  };

  const handleDelete = async (materialId: number) => {
    try {
      await materialsAPI.deleteMaterial(materialId);
      setMaterials(materials.filter(m => m.materialId !== materialId));
      setDeleteDialogOpen(false);
      setMaterialToDelete(null);
      toast.success('Material deleted successfully', {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Failed to delete material:', error);
      setError(error.message || 'Failed to delete material');
      toast.error('Failed to delete material', {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        duration: 3000,
      });
    }
  };

  const openDeleteDialog = (materialId: number) => {
    setMaterialToDelete(materialId);
    setDeleteDialogOpen(true);
  };

  const getCategoryName = (categoryNumber?: number) => {
    const categoryMap: Record<number, string> = {
      1: 'Science',
      2: 'Art',
      3: 'Technology',
      4: 'Business',
      5: 'Health',
    };
    return categoryNumber ? categoryMap[categoryNumber] || 'Uncategorized' : 'Uncategorized';
  };

  const getCategoryIcon = (categoryNumber?: number) => {
    switch (categoryNumber) {
      case 1: return <BookOpen className="h-4 w-4" />;
      case 2: return <Image className="h-4 w-4" />;
      case 3: return <Video className="h-4 w-4" />;
      case 4: return <FileText className="h-4 w-4" />;
      case 5: return <File className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (categoryNumber?: number) => {
    switch (categoryNumber) {
      case 1: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 2: return 'bg-purple-100 text-purple-800 border-purple-200';
      case 3: return 'bg-green-100 text-green-800 border-green-200';
      case 4: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 5: return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

  const handleViewMaterial = (materialId: number) => {
    navigate(`/materials/${materialId}`);
  };

  const handleEditMaterial = (materialId: number) => {
    navigate(`/materials/${materialId}/edit`);
  };

  const handleCreateMaterial = () => {
    navigate('/materials/create');
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        {/* Animated Loading Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-8 w-48 animate-pulse-slow" />
            <Skeleton className="h-4 w-64 mt-2 animate-pulse-slow animation-delay-200" />
          </div>
          <Skeleton className="h-10 w-32 animate-pulse-slow animation-delay-400" />
        </div>
        
        {/* Animated Loading Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card 
              key={i} 
              className="animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardHeader>
                <Skeleton className="h-6 w-3/4 animate-pulse" />
                <Skeleton className="h-4 w-1/2 mt-2 animate-pulse animation-delay-200" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full animate-pulse animation-delay-400" />
              </CardContent>
              <CardFooter className="flex gap-2">
                <Skeleton className="h-10 w-full animate-pulse animation-delay-600" />
                <Skeleton className="h-10 w-full animate-pulse animation-delay-800" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header Section */}
      <div className={`
        transform transition-all duration-700
        ${!isLoading ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
      `}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 animate-pulse-slow">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold animate-slide-in-right">
                Educational Materials
              </h1>
            </div>
            <p className="text-muted-foreground mt-2 animate-fade-in animation-delay-300">
              <span className="font-semibold text-primary animate-count-up">
                {materials.length}
              </span> material{materials.length !== 1 ? 's' : ''} available • 
              <span className="ml-2 inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-yellow-500 animate-spin-slow" />
                Updated just now
              </span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="hover-scale transition-smooth"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            
            {(user?.role === 'Admin' || user?.role === 'Tutor') && (
              <Button 
                onClick={handleCreateMaterial}
                className="hover-scale transition-smooth group"
              >
                <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                Add Material
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-background border animate-slide-in-up">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search materials by content, author, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 transition-all duration-300 focus:scale-[1.01] focus:shadow-lg"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:scale-110 transition-transform"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={toggleSortOrder}
                className="hover-scale transition-smooth group"
              >
                <SortAsc className={`h-4 w-4 mr-2 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
              </Button>
              
              <Button
                variant="outline"
                className="hover-scale transition-smooth"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
          
          {searchQuery && (
            <div className="mt-3 text-sm text-muted-foreground animate-fade-in">
              Found {filteredMaterials.length} result{filteredMaterials.length !== 1 ? 's' : ''} for "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert 
          variant="destructive" 
          className="mb-6 animate-shake border-l-4 border-l-destructive"
        >
          <AlertCircle className="h-4 w-4 animate-pulse" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {materials.length === 0 ? (
        <Card className={`
          animate-bounce-in border-dashed border-2
          hover:shadow-xl transition-all duration-500
        `}>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 mb-6 animate-pulse-slow">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 animate-fade-in">
                No materials available yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto animate-fade-in animation-delay-200">
                {user?.role === 'Admin' || user?.role === 'Tutor' 
                  ? 'Start building your educational library by adding the first material'
                  : 'Educational materials will appear here soon. Check back later!'
                }
              </p>
              {(user?.role === 'Admin' || user?.role === 'Tutor') && (
                <Button 
                  onClick={handleCreateMaterial}
                  size="lg"
                  className="hover-scale transition-smooth group animate-fade-in animation-delay-400"
                >
                  <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />
                  Create First Material
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Desktop View */}
          <div className="hidden lg:block animate-fade-in animation-delay-500">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[35%]">Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.map((material, index) => (
                    <TableRow 
                      key={material.materialId}
                      className={`
                        hover:bg-muted/50 transition-all duration-300 group
                        ${animateItems ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                      `}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        transitionDelay: `${index * 50}ms`,
                      }}
                    >
                      <TableCell>
                        <div className="max-w-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="animate-pulse-slow">
                              ID: {material.materialId}
                            </Badge>
                            <Zap className="h-3 w-3 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                            {truncateText(material.content.text, 80)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`
                            flex items-center gap-1 w-fit transition-all duration-300
                            hover:scale-105 ${getCategoryColor(material.category)}
                          `}
                        >
                          {getCategoryIcon(material.category)}
                          {getCategoryName(material.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 group/author">
                          <div className="p-1 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 group-hover/author:scale-110 transition-transform">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="group-hover/author:text-primary transition-colors">
                            {material.userName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-full bg-gradient-to-br from-gray-100 to-gray-50">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-sm font-medium">
                            {formatDate(material.creationDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {material.content.mediaFiles?.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {material.content.mediaFiles.slice(0, 2).map((file, fileIndex) => (
                              <Badge 
                                key={fileIndex} 
                                variant="secondary" 
                                className="text-xs max-w-[120px] truncate transition-all hover:scale-105 cursor-pointer"
                                title={file}
                              >
                                {extractFileName(file)}
                              </Badge>
                            ))}
                            {material.content.mediaFiles.length > 2 && (
                              <Badge 
                                variant="secondary" 
                                className="text-xs animate-pulse-slow"
                              >
                                +{material.content.mediaFiles.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm flex items-center gap-1">
                            <File className="h-3 w-3" />
                            No files
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewMaterial(material.materialId)}
                            title="View material"
                            className="hover-scale transition-smooth"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(user?.role === 'Admin' || user?.role === 'Tutor' || user?.userId === material.userId) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditMaterial(material.materialId)}
                                title="Edit material"
                                className="hover-scale transition-smooth"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openDeleteDialog(material.materialId)}
                                title="Delete material"
                                className="hover-scale transition-smooth"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile/Tablet View */}
          <div className="lg:hidden space-y-4">
            {filteredMaterials.map((material, index) => (
              <Card 
                key={material.materialId}
                className={`
                  overflow-hidden group hover:shadow-xl transition-all duration-500 hover:scale-[1.02] hover-lift
                  ${animateItems ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                  border-l-4 border-l-primary/50
                `}
                style={{
                  animationDelay: `${index * 100}ms`,
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
                
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`flex items-center gap-1 ${getCategoryColor(material.category)}`}
                        >
                          {getCategoryIcon(material.category)}
                          {getCategoryName(material.category)}
                        </Badge>
                        <Badge variant="secondary" className="animate-pulse-slow">
                          ID: {material.materialId}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="text-xs">{material.userName}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">{formatDate(material.creationDate)}</span>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-3 relative z-10">
                  <p className="text-sm line-clamp-3 group-hover:text-primary transition-colors">
                    {material.content.text || 'No description available'}
                  </p>
                  
                  {material.content.mediaFiles?.length > 0 && (
                    <div className="mt-4 animate-fade-in animation-delay-200">
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Files ({material.content.mediaFiles.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {material.content.mediaFiles.slice(0, 3).map((file, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs max-w-[100px] truncate hover:scale-105 transition-transform cursor-pointer"
                            title={file}
                          >
                            {extractFileName(file)}
                          </Badge>
                        ))}
                        {material.content.mediaFiles.length > 3 && (
                          <Badge variant="secondary" className="text-xs animate-pulse-slow">
                            +{material.content.mediaFiles.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-3 border-t relative z-10">
                  <div className="flex justify-between w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewMaterial(material.materialId)}
                      className="hover-scale transition-smooth group"
                    >
                      <Eye className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                      View Details
                      <ChevronRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Button>
                    
                    {(user?.role === 'Admin' || user?.role === 'Tutor' || user?.userId === material.userId) && (
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(material.materialId)}
                          className="hover-scale transition-smooth"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Material
            </DialogTitle>
            <DialogDescription className="animate-fade-in">
              Are you sure you want to delete this material? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="animate-fade-in animation-delay-200">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="hover-scale transition-smooth"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => materialToDelete && handleDelete(materialToDelete)}
              className="hover-scale transition-smooth"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// You need to import toast from sonner
import { toast } from 'sonner';

// Add X icon
const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);