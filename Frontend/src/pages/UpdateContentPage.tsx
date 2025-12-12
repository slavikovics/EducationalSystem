// src/pages/EditMaterialContentPage.tsx
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
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
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
  Save,
  X,
  Plus,
  Link,
  AlertCircle,
  Calendar,
  User,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';

interface ContentData {
  text: string;
  mediaFiles: string[];
}

interface MaterialInfo {
  materialId: number;
  categoryName: string;
  creationDate: string;
  userName: string;
  currentContent: ContentData;
}

export const EditMaterialContentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  
  const [materialInfo, setMaterialInfo] = useState<MaterialInfo | null>(null);
  const [content, setContent] = useState<ContentData>({
    text: '',
    mediaFiles: []
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await materialsAPI.getMaterialById(parseInt(id));
      
      if (!response) {
        throw new Error('Material not found');
      }

      // Parse the material data
      const materialId = response.materialId;
      const creationDate = response.creationDate;
      const contentObj = response.content;
      const text = contentObj?.text || '';
      const mediaFiles = contentObj?.mediaFiles || [];
      const userId = response.userId;
      const userObj = response.user;
      const userName = userObj?.name || userObj?.Name || `User ${userId}`;
      
      // Map category
      const categoryNumber = response.category;
      const categoryMap: Record<number, string> = {
        1: 'Science',
        2: 'Art',
        3: 'Technology',
        4: 'Business',
        5: 'Health',
      };
      const categoryName = categoryMap[categoryNumber] || `Category ${categoryNumber}`;

      const info: MaterialInfo = {
        materialId,
        categoryName,
        creationDate,
        userName,
        currentContent: { text, mediaFiles }
      };

      setMaterialInfo(info);
      setContent({ text, mediaFiles: [...mediaFiles] });
      
    } catch (error: any) {
      console.error('Fetch error:', error);
      setError(error.message || 'Failed to load material');
      toast.error('Failed to load material');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setContent(prev => ({ ...prev, text: newText }));
    checkForChanges({ ...content, text: newText });
  };

  const handleAddMediaUrl = () => {
    if (!newMediaUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(newMediaUrl);
    } catch {
      toast.error('Please enter a valid URL (include http:// or https://)');
      return;
    }

    if (content.mediaFiles.includes(newMediaUrl)) {
      toast.error('This URL is already added');
      return;
    }

    const updatedMediaFiles = [...content.mediaFiles, newMediaUrl];
    const updatedContent = { ...content, mediaFiles: updatedMediaFiles };
    
    setContent(updatedContent);
    setNewMediaUrl('');
    checkForChanges(updatedContent);
    toast.success('Media URL added');
  };

  const handleRemoveMediaUrl = (index: number) => {
    const updatedMediaFiles = content.mediaFiles.filter((_, i) => i !== index);
    const updatedContent = { ...content, mediaFiles: updatedMediaFiles };
    
    setContent(updatedContent);
    checkForChanges(updatedContent);
    toast.success('Media URL removed');
  };

  const checkForChanges = (newContent: ContentData) => {
    if (!materialInfo) return;
    
    const hasTextChanged = newContent.text !== materialInfo.currentContent.text;
    const hasMediaChanged = 
      newContent.mediaFiles.length !== materialInfo.currentContent.mediaFiles.length ||
      newContent.mediaFiles.some((url, i) => url !== materialInfo.currentContent.mediaFiles[i]);
    
    setHasChanges(hasTextChanged || hasMediaChanged);
  };

  const handleSave = async () => {
    if (!id || !materialInfo) return;
    
    try {
      setIsSaving(true);
      
      // Convert to camelCase as expected by API
      const payload = {
        text: content.text,
        mediaFiles: content.mediaFiles
      };
      
      await materialsAPI.updateContent(parseInt(id), payload);
      
      toast.success('Content updated successfully');
      navigate(`/materials/${id}`);
      
    } catch (error: any) {
      console.error('Update error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update content';
      toast.error(`Update failed: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (materialInfo) {
      setContent({ ...materialInfo.currentContent });
      setHasChanges(false);
    }
    setDiscardDialogOpen(false);
  };

  const handleBack = () => {
    if (hasChanges) {
      setDiscardDialogOpen(true);
    } else {
      navigate(`/materials/${id}`);
    }
  };

  const getFileIcon = (url: string) => {
    if (!url) return <FileText className="h-4 w-4" />;
    
    const urlLower = url.toLowerCase();
    if (urlLower.includes('youtube') || urlLower.includes('vimeo')) {
      return <Video className="h-4 w-4" />;
    }
    if (urlLower.includes('.jpg') || urlLower.includes('.png') || urlLower.includes('.gif') || urlLower.includes('.webp')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    if (urlLower.includes('.pdf')) {
      return <FileText className="h-4 w-4" />;
    }
    if (urlLower.includes('.mp4') || urlLower.includes('.mov') || urlLower.includes('.avi')) {
      return <Video className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const extractDomain = (url: string) => {
    if (!url) return '';
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url.substring(0, 30) + '...';
    }
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(`/materials/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Material
        </Button>
        
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !materialInfo) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
              <h3 className="text-lg font-semibold">Cannot Edit Material</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                You don't have permission or the material doesn't exist.
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Material
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setDiscardDialogOpen(true)}
            disabled={!hasChanges || isSaving}
          >
            Discard Changes
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving || !content.text.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Edit Content</CardTitle>
              <CardDescription>
                Update the description and media files for Material #{materialInfo.materialId}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Text Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-base font-semibold">
                    Description
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {content.text.length} characters
                  </span>
                </div>
                <Textarea
                  id="description"
                  value={content.text}
                  onChange={handleTextChange}
                  placeholder="Enter material description..."
                  className="min-h-[200px] text-base"
                  required
                />
                {!content.text.trim() && (
                  <p className="text-sm text-destructive">
                    Description is required
                  </p>
                )}
              </div>

              <Separator />

              {/* Media URLs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    Media Files ({content.mediaFiles.length})
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    Add links to images, videos, or documents
                  </span>
                </div>

                {/* Add URL Input */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddMediaUrl()}
                      className="h-10"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddMediaUrl}
                    variant="outline"
                    className="h-10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* Media URL List */}
                {content.mediaFiles.length > 0 ? (
                  <div className="space-y-3">
                    {content.mediaFiles.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
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
                          onClick={() => handleRemoveMediaUrl(index)}
                          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border rounded-lg text-center text-muted-foreground bg-muted/30">
                    <Link className="mx-auto h-8 w-8 mb-2" />
                    <p>No media files added yet</p>
                    <p className="text-sm mt-1">Add URLs to images, videos, or documents</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Change Indicator */}
          {hasChanges && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                You have unsaved changes. Remember to save your work.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Material Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Material Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Material ID</span>
                  <Badge variant="secondary" className="font-mono">
                    #{materialInfo.materialId}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Category</span>
                  <Badge variant="outline">
                    {materialInfo.categoryName}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span className="text-sm">{formatDate(materialInfo.creationDate)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Author</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {materialInfo.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{materialInfo.userName}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Editing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p className="font-medium">✓ Description should be clear and detailed</p>
                <p className="text-muted-foreground">Provide comprehensive information about the material.</p>
                
                <p className="font-medium mt-3">✓ Use valid URLs for media</p>
                <p className="text-muted-foreground">Include http:// or https:// in all URLs.</p>
                
                <p className="font-medium mt-3">✓ Supported media types:</p>
                <p className="text-muted-foreground">Images (JPG, PNG, GIF), Videos (YouTube, MP4), PDFs, and more.</p>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium">
                    {content.text.length} chars
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Media files</span>
                  <span className="font-medium">
                    {content.mediaFiles.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Changes</span>
                  <span className={`font-medium ${hasChanges ? 'text-blue-600' : 'text-green-600'}`}>
                    {hasChanges ? 'Unsaved' : 'None'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Discard Changes Dialog */}
      <Dialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscardDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDiscard}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};