// src/pages/ViewMaterialPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { materialsAPI } from '../services/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
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
  BookOpen,
  ArrowLeft,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Video,
  Edit,
  Trash2,
  Palette,
  Globe,
  Briefcase,
  Heart,
  File,
  AlertCircle,
  Calendar,
  User,
  Tag,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';

// Category mapping
const CATEGORY_MAP: Record<number, string> = {
  1: 'Science',
  2: 'Art',
  3: 'Technology',
  4: 'Business',
  5: 'Health',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Science': <BookOpen className="h-4 w-4" />,
  'Art': <Palette className="h-4 w-4" />,
  'Technology': <Globe className="h-4 w-4" />,
  'Business': <Briefcase className="h-4 w-4" />,
  'Health': <Heart className="h-4 w-4" />,
  'default': <Tag className="h-4 w-4" />,
};

interface ParsedMaterial {
  materialId: number;
  creationDate: string;
  contentId: number;
  text: string;
  mediaFiles: string[];
  userId: string;
  userName: string;
  categoryName: string;
  userObj: any;
}

export const ViewMaterialPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [rawData, setRawData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await materialsAPI.getMaterialById(parseInt(id));
      
      if (response) {
        setRawData(response);
      } else {
        throw new Error('Material not found');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load material');
      toast.error('Error loading material');
    } finally {
      setIsLoading(false);
    }
  };

  const parseMaterialData = (): ParsedMaterial | null => {
    if (!rawData) return null;

    const materialId = rawData.materialId;
    const creationDate = rawData.creationDate;
    const contentObj = rawData.content;
    const text = contentObj?.text || 'No description';
    const mediaFiles = contentObj?.mediaFiles || [];
    const userId = rawData.userId;
    const userObj = rawData.user;
    
    // Map category number to name
    const categoryNumber = rawData.category;
    let categoryName = 'Uncategorized';
    if (typeof categoryNumber === 'number') {
      categoryName = CATEGORY_MAP[categoryNumber] || `Category ${categoryNumber}`;
    }
    
    const userName = userObj?.Name || `User ${userId}`;
    
    return {
      materialId,
      creationDate,
      contentId: rawData.contentId,
      text,
      mediaFiles,
      userId,
      userName,
      categoryName,
      userObj
    };
  };

  const handleDelete = async () => {
    const parsed = parseMaterialData();
    if (!parsed) return;
    
    try {
      await materialsAPI.deleteMaterial(parsed.materialId);
      toast.success('Material deleted successfully');
      navigate('/materials');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete material');
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    return CATEGORY_ICONS[categoryName] || CATEGORY_ICONS.default;
  };

  const getFileIcon = (url: string) => {
    if (!url) return <File className="h-4 w-4" />;
    
    const urlLower = url.toLowerCase();
    if (urlLower.includes('youtube') || urlLower.includes('vimeo')) {
      return <Video className="h-4 w-4" />;
    }
    if (urlLower.includes('.jpg') || urlLower.includes('.png') || urlLower.includes('.gif')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    if (urlLower.includes('.pdf')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Unknown date';
    }
  };

  const extractDomain = (url: string) => {
    if (!url) return 'No URL';
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      const match = url.match(/\/\/([^\/]+)/);
      return match ? match[1].replace('www.', '') : url.substring(0, 30) + '...';
    }
  };

  const openExternalLink = (url: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const parsed = parseMaterialData();
  const isOwner = user?.userId === parsed?.userId;
  const canEdit = isOwner || user?.role === 'Admin' || user?.role === 'Tutor';

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/materials')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Materials
        </Button>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !parsed) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/materials')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Materials
        </Button>
        
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Failed to load material'}
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Material Not Found</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                The requested material could not be loaded.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/materials')}>
                  Browse Materials
                </Button>
                <Button variant="outline" onClick={fetchMaterial}>
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { 
    materialId, 
    creationDate, 
    text, 
    mediaFiles, 
    userName, 
    categoryName 
  } = parsed;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/materials')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Materials
        </Button>
        
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/materials/${materialId}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
                  {getCategoryIcon(categoryName)}
                  {categoryName}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(creationDate)}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Material #{materialId}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Created by {userName}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <div className="p-4 bg-muted/20 rounded-lg border">
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {text}
                  </p>
                </div>
              </div>

              {mediaFiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Attachments ({mediaFiles.length})</h3>
                  <div className="space-y-3">
                    {mediaFiles.map((url: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-muted-foreground">
                            {getFileIcon(url)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">
                              {extractDomain(url)}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {url}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openExternalLink(url)}
                          className="shrink-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Material Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Material Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ID</span>
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {materialId}
                  </code>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Category</span>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(categoryName)}
                    <span className="text-sm">{categoryName}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created</span>
                  <span className="text-sm">{formatDate(creationDate)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Author</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary/10">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{userName}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Attachments</span>
                  <span className="text-sm">{mediaFiles.length} file(s)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Description length</span>
                  <span className="font-medium">{text.length} characters</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Media files</span>
                  <span className="font-medium">{mediaFiles.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Material?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete Material #{materialId}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};