// src/pages/MaterialsPage.tsx
import React, { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  createdAt: string;
  content: {
    text: string;
    mediaFiles: string[];
    category: string;
  };
}

export const MaterialsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
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
      
      if (response.data) {
        setMaterials(response.data);
      } else {
        setMaterials(response);
      }
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
    } catch (error: any) {
      console.error('Failed to delete material:', error);
      setError(error.message || 'Failed to delete material');
    }
  };

  const openDeleteDialog = (materialId: number) => {
    setMaterialToDelete(materialId);
    setDeleteDialogOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Materials</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Educational Materials</h1>
          <p className="text-muted-foreground mt-2">
            Browse and manage educational content
          </p>
        </div>
        
        {(user?.role === 'Admin' || user?.role === 'Tutor') && (
          <Button onClick={() => window.location.href = '/materials/create'}>
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
              <p className="text-muted-foreground mt-2">
                {user?.role === 'Admin' || user?.role === 'Tutor' 
                  ? 'Start by adding your first educational material'
                  : 'Check back later for new content'
                }
              </p>
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
                  <TableHead>Title/Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Media Files</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.materialId}>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="font-medium line-clamp-2">
                          {material.content.text || 'No description'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {getCategoryIcon(material.content.category)}
                        {material.content.category || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{material.userName || `User ${material.userId}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(material.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {material.content.mediaFiles?.length > 0 ? (
                        <div className="flex gap-1">
                          {material.content.mediaFiles.slice(0, 3).map((file, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {file.split('/').pop()?.split('?')[0] || 'File'}
                            </Badge>
                          ))}
                          {material.content.mediaFiles.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{material.content.mediaFiles.length - 3} more
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
                          onClick={() => window.location.href = `/materials/${material.materialId}`}
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        {(user?.role === 'Admin' || user?.role === 'Tutor') && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = `/admin/materials/${material.materialId}/edit`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteDialog(material.materialId)}
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
              <Card key={material.materialId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-2">
                        {material.content.text?.substring(0, 100) || 'Material'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <User className="h-3 w-3" />
                        {material.userName || `User ${material.userId}`}
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        {formatDate(material.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getCategoryIcon(material.content.category)}
                      {material.content.category || 'Uncategorized'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {material.content.text || 'No description available'}
                  </p>
                  
                  {material.content.mediaFiles?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Files:</p>
                      <div className="flex flex-wrap gap-2">
                        {material.content.mediaFiles.map((file, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {file.split('/').pop()?.split('?')[0] || 'File'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/materials/${material.materialId}`}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  {(user?.role === 'Admin' || user?.role === 'Tutor') && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/admin/materials/${material.materialId}/edit`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(material.materialId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
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