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
  File
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

interface Material {
  materialId: number;
  userId: number;
  userName?: string;
  creationDate: string; // FIXED: Changed from createdAt
  content: {
    text: string;
    mediaFiles: string[];
  };
  category?: number; // Added category
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
  const [error, setError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const response = await materialsAPI.getAllMaterials();
      console.log('Materials response:', response);
      
      // Handle different response formats
      let materialsData: Material[] = [];
      if (Array.isArray(response.data)) {
        materialsData = response.data;
      } else if (Array.isArray(response)) {
        materialsData = response;
      } else if (response && typeof response === 'object') {
        // Try to extract data from nested structure
        materialsData = response.data || response.items || [];
      }
      
      // Process materials to ensure consistent structure
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
    } catch (error: any) {
      console.error('Failed to fetch materials:', error);
      setError(error.message || 'Failed to load materials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (materialId: number) => {
    try {
      await materialsAPI.deleteMaterial(materialId);
      setMaterials(materials.filter(m => m.materialId !== materialId));
      setDeleteDialogOpen(false);
      setMaterialToDelete(null);
      toast.success('Material deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete material:', error);
      setError(error.message || 'Failed to delete material');
      toast.error('Failed to delete material');
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter className="flex gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Educational Materials</h1>
          <p className="text-muted-foreground mt-2">
            {materials.length} material{materials.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        {(user?.role === 'Admin' || user?.role === 'Tutor') && (
          <Button onClick={handleCreateMaterial}>
            <Plus className="mr-2 h-4 w-4" />
            Add Material
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {materials.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No materials available</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                {user?.role === 'Admin' || user?.role === 'Tutor' 
                  ? 'Start by adding your first educational material'
                  : 'Check back later for new content'
                }
              </p>
              {(user?.role === 'Admin' || user?.role === 'Tutor') && (
                <Button onClick={handleCreateMaterial}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Material
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Desktop View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.materialId} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="max-w-lg">
                        <p className="font-medium">
                          Material #{material.materialId}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {truncateText(material.content.text, 120)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {getCategoryIcon(material.category)}
                        {getCategoryName(material.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{material.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(material.creationDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {material.content.mediaFiles?.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {material.content.mediaFiles.slice(0, 2).map((file, index) => (
                            <Badge key={index} variant="secondary" className="text-xs max-w-[120px] truncate">
                              {extractFileName(file)}
                            </Badge>
                          ))}
                          {material.content.mediaFiles.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{material.content.mediaFiles.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No files</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewMaterial(material.materialId)}
                          title="View material"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(user?.role === 'Admin' || user?.role === 'Tutor' || user?.userId === material.userId) && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditMaterial(material.materialId)}
                              title="Edit material"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteDialog(material.materialId)}
                              title="Delete material"
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

          {/* Mobile/Tablet View */}
          <div className="lg:hidden space-y-4">
            {materials.map((material) => (
              <Card key={material.materialId} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getCategoryIcon(material.category)}
                          {getCategoryName(material.category)}
                        </Badge>
                        <Badge variant="secondary">
                          ID: {material.materialId}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <User className="h-3 w-3" />
                        <span className="text-xs">{material.userName}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">{formatDate(material.creationDate)}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <p className="text-sm line-clamp-3">
                    {material.content.text || 'No description available'}
                  </p>
                  
                  {material.content.mediaFiles?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Files ({material.content.mediaFiles.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {material.content.mediaFiles.slice(0, 3).map((file, index) => (
                          <Badge key={index} variant="secondary" className="text-xs max-w-[100px] truncate">
                            {extractFileName(file)}
                          </Badge>
                        ))}
                        {material.content.mediaFiles.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{material.content.mediaFiles.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-3 border-t">
                  <div className="flex justify-between w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewMaterial(material.materialId)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    
                    {(user?.role === 'Admin' || user?.role === 'Tutor' || user?.userId === material.userId) && (
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(material.materialId)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Material</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this material? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => materialToDelete && handleDelete(materialToDelete)}
            >
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