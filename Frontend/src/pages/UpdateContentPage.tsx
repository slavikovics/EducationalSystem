// src/pages/EditMaterialContentPage.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Zap,
  Wand2,
  RefreshCw,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Info,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isPageReady, setIsPageReady] = useState(false);
  const [pulseSave, setPulseSave] = useState(false);
  const [mediaHoverIndex, setMediaHoverIndex] = useState<number | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [materialInfo, setMaterialInfo] = useState<MaterialInfo | null>(null);
  const [content, setContent] = useState<ContentData>({
    text: '',
    mediaFiles: []
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  useEffect(() => {
    if (!isLoading && !error && materialInfo) {
      setTimeout(() => setIsPageReady(true), 100);
      setTimeout(() => setStatsVisible(true), 500);
    }
  }, [isLoading, error, materialInfo]);

  useEffect(() => {
    if (hasChanges && !pulseSave) {
      setPulseSave(true);
      const timer = setTimeout(() => setPulseSave(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasChanges]);

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
      setCharacterCount(text.length);
      
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
    setCharacterCount(newText.length);
    checkForChanges({ ...content, text: newText });
    
    // Auto-expand textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
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
      
      toast.success('Content updated successfully!', {
        icon: <CheckCircle className="h-5 w-5 text-green-500 animate-bounce-in" />,
      });
      
      // Small delay for animation
      setTimeout(() => {
        navigate(`/materials/${id}`);
      }, 800);
      
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
      toast.info('Changes discarded', {
        icon: <RefreshCw className="h-5 w-5 text-blue-500" />,
      });
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
      <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
        <Button 
          variant="ghost" 
          className="mb-6 animate-pulse-slow"
          onClick={() => navigate(`/materials/${id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Material
        </Button>
        
        <div className="space-y-6">
          <Skeleton className="h-10 w-64 rounded-lg animate-pulse-slow" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full rounded-lg animate-pulse-slow" />
              <Skeleton className="h-32 w-full rounded-lg animate-pulse-slow animation-delay-200" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg animate-pulse-slow animation-delay-300" />
              <Skeleton className="h-32 w-full rounded-lg animate-pulse-slow animation-delay-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !materialInfo) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
        <Button 
          variant="ghost" 
          className="mb-6 hover-lift btn-press"
          onClick={() => navigate('/materials')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Materials
        </Button>
        
        <Alert 
          variant="destructive" 
          className="mb-6 animate-alert-shake border-l-4 border-l-destructive"
        >
          <AlertCircle className="h-4 w-4 animate-pulse" />
          <AlertDescription>
            {error || 'Failed to load material'}
          </AlertDescription>
        </Alert>
        
        <Card className="animate-bounce-in">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="relative inline-block mb-4">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground animate-pulse-slow" />
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-spin-slow" />
              </div>
              <h3 className="text-lg font-semibold animate-gradient-text">Cannot Edit Material</h3>
              <p className="text-muted-foreground mt-2 mb-6 animate-fade-in">
                You don't have permission or the material doesn't exist.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/materials')}
                  className="hover-lift btn-press transition-all duration-300"
                >
                  Browse Materials
                </Button>
                <Button 
                  variant="outline" 
                  onClick={fetchMaterial}
                  className="hover-lift btn-press transition-all duration-300"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
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
    <div className={`container mx-auto px-4 py-8 max-w-6xl ${isPageReady ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-slide-in-up">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="group hover-lift btn-press transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Material
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setDiscardDialogOpen(true)}
            disabled={!hasChanges || isSaving}
            className={`hover-lift btn-press transition-all duration-300 ${!hasChanges ? 'opacity-50' : 'hover:shadow-md'}`}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Discard Changes
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving || !content.text.trim()}
            className={`hover-lift btn-press transition-all duration-300 ${pulseSave ? 'animate-pulse-slow' : ''} ${
              !content.text.trim() ? 'opacity-50' : 'hover:shadow-lg'
            }`}
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="card-glow hover-lift transition-all duration-500">
              <CardHeader className="relative overflow-hidden">
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <Wand2 className="h-5 w-5 text-primary animate-pulse-slow" />
                    <CardTitle className="text-2xl animate-gradient-text">Edit Content</CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-2 animate-fade-in animation-delay-100">
                    <Sparkles className="h-4 w-4" />
                    Update the description and media files for Material #{materialInfo.materialId}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 animate-fade-in animation-delay-300">
                {/* Text Editor */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
                      <BookOpen className="h-4 w-4 animate-pulse-slow" />
                      Description
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${characterCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className={`text-sm ${characterCount > 1000 ? 'text-green-600' : characterCount > 500 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {characterCount} characters
                      </span>
                    </div>
                  </div>
                  <Textarea
                    ref={textareaRef}
                    id="description"
                    value={content.text}
                    onChange={handleTextChange}
                    placeholder="Enter material description..."
                    className="min-h-[200px] text-base transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    required
                  />
                  {!content.text.trim() && (
                    <motion.p 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-sm text-destructive flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Description is required
                    </motion.p>
                  )}
                </div>

                <Separator className="animate-fade-in" />

                {/* Media URLs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Upload className="h-4 w-4 animate-pulse-slow" />
                      Media Files ({content.mediaFiles.length})
                    </Label>
                    <span className="text-sm text-muted-foreground animate-fade-in animation-delay-100">
                      Add links to images, videos, or documents
                    </span>
                  </div>

                  {/* Add URL Input */}
                  <motion.div 
                    className="flex gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex-1 relative">
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddMediaUrl()}
                        className="h-10 pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddMediaUrl}
                      variant="outline"
                      className="h-10 hover-lift btn-press transition-all duration-300 hover:shadow-md"
                    >
                      <Plus className="h-4 w-4 mr-2 animate-bounce-in" />
                      Add
                    </Button>
                  </motion.div>

                  {/* Media URL List */}
                  <AnimatePresence>
                    {content.mediaFiles.length > 0 ? (
                      <motion.div 
                        className="space-y-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.1 }}
                      >
                        {content.mediaFiles.map((url, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className={`stagger-item animate file-badge flex items-center justify-between p-3 border rounded-lg transition-all duration-300 ${
                              mediaHoverIndex === index 
                                ? 'bg-accent/50 scale-[1.02] shadow-lg ring-1 ring-primary/20' 
                                : 'hover:bg-accent/30'
                            }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                            onMouseEnter={() => setMediaHoverIndex(index)}
                            onMouseLeave={() => setMediaHoverIndex(null)}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <motion.div 
                                className="text-muted-foreground"
                                whileHover={{ scale: 1.2, rotate: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                {getFileIcon(url)}
                              </motion.div>
                              <div className="min-w-0">
                                <div className="font-medium text-sm truncate animate-fade-in">
                                  {extractDomain(url)}
                                </div>
                                <div className="text-xs text-muted-foreground truncate animate-fade-in animation-delay-100">
                                  {url}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMediaUrl(index)}
                              className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 hover-lift btn-press transition-all duration-300"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 border-2 border-dashed rounded-xl text-center text-muted-foreground bg-gradient-to-br from-muted/20 to-muted/10 hover:from-muted/30 hover:to-muted/20 transition-all duration-500"
                      >
                        <div className="relative inline-block mb-3">
                          <Link className="h-10 w-10 mx-auto animate-pulse-slow" />
                          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary animate-pulse" />
                        </div>
                        <p className="font-medium mb-1">No media files added yet</p>
                        <p className="text-sm">Add URLs to images, videos, or documents</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Change Indicator */}
          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Alert className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20 animate-pulse-slow">
                  <Zap className="h-4 w-4 text-blue-600 animate-pulse" />
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    <span className="font-semibold">You have unsaved changes!</span> Remember to save your work.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Material Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="card-glow hover-lift transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary animate-pulse-slow" />
                  Material Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { 
                      label: 'Material ID', 
                      value: materialInfo.materialId, 
                      icon: <Badge variant="secondary" className="font-mono animate-fade-in">#{materialInfo.materialId}</Badge>,
                      animateDelay: 100 
                    },
                    { 
                      label: 'Category', 
                      value: materialInfo.categoryName, 
                      icon: <Badge variant="outline" className="animate-fade-in">{materialInfo.categoryName}</Badge>,
                      animateDelay: 200 
                    },
                    { 
                      label: 'Created', 
                      value: formatDate(materialInfo.creationDate), 
                      icon: (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 animate-pulse-slow" />
                          <span className="text-sm animate-fade-in">{formatDate(materialInfo.creationDate)}</span>
                        </div>
                      ),
                      animateDelay: 300 
                    },
                    { 
                      label: 'Author', 
                      value: materialInfo.userName, 
                      icon: (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 animate-avatar-pulse">
                            <AvatarFallback className="text-xs bg-primary/10">
                              {materialInfo.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm animate-fade-in">{materialInfo.userName}</span>
                        </div>
                      ),
                      animateDelay: 400 
                    },
                  ].map((item, index) => (
                    <motion.div 
                      key={item.label}
                      className="stagger-item animate flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                      style={{ animationDelay: `${item.animateDelay}ms` }}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                      {item.icon}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="card-glow hover-lift transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500 animate-pulse-slow" />
                  Editing Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    title: "✓ Description should be clear and detailed",
                    desc: "Provide comprehensive information about the material.",
                    icon: <BookOpen className="h-4 w-4 text-green-500" />,
                    delay: 100
                  },
                  {
                    title: "✓ Use valid URLs for media",
                    desc: "Include http:// or https:// in all URLs.",
                    icon: <Link className="h-4 w-4 text-blue-500" />,
                    delay: 200
                  },
                  {
                    title: "✓ Supported media types",
                    desc: "Images (JPG, PNG, GIF), Videos (YouTube, MP4), PDFs, and more.",
                    icon: <FileText className="h-4 w-4 text-purple-500" />,
                    delay: 300
                  },
                ].map((tip, index) => (
                  <motion.div 
                    key={tip.title}
                    className="stagger-item animate space-y-1"
                    style={{ animationDelay: `${tip.delay}ms` }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-2">
                      {tip.icon}
                      <p className="font-medium text-sm">{tip.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">{tip.desc}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            onViewportEnter={() => setStatsVisible(true)}
          >
            <Card className="card-glow hover-lift transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary animate-pulse-slow" />
                  Current Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      label: 'Description', 
                      value: `${characterCount} chars`, 
                      progress: Math.min((characterCount / 2000) * 100, 100),
                      color: characterCount > 1000 ? 'bg-green-500' : characterCount > 500 ? 'bg-yellow-500' : 'bg-red-500',
                      delay: 100
                    },
                    { 
                      label: 'Media files', 
                      value: content.mediaFiles.length,
                      progress: Math.min((content.mediaFiles.length / 5) * 100, 100),
                      color: 'bg-blue-500',
                      delay: 200
                    },
                    { 
                      label: 'Changes', 
                      value: hasChanges ? 'Unsaved' : 'None',
                      progress: hasChanges ? 100 : 0,
                      color: hasChanges ? 'bg-orange-500' : 'bg-green-500',
                      delay: 300
                    },
                  ].map((stat, index) => (
                    <motion.div 
                      key={stat.label}
                      className="stagger-item animate"
                      style={{ animationDelay: `${stat.delay}ms` }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={statsVisible ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{stat.label}</span>
                        <span className={`font-medium animate-stat-count ${stat.label === 'Changes' ? (hasChanges ? 'text-orange-600' : 'text-green-600') : ''}`}>
                          {stat.value}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full rounded-full ${stat.color}`}
                          initial={{ width: 0 }}
                          animate={statsVisible ? { width: `${stat.progress}%` } : {}}
                          transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Discard Changes Dialog */}
      <Dialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5 animate-pulse" />
              Discard Changes?
            </DialogTitle>
            <DialogDescription className="animate-fade-in">
              You have <span className="font-bold text-orange-600 animate-pulse">unsaved changes</span>. 
              Are you sure you want to discard them?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="animate-slide-in-up">
            <Button 
              variant="outline" 
              onClick={() => setDiscardDialogOpen(false)}
              className="hover-lift btn-press transition-all duration-300"
            >
              Keep Editing
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDiscard}
              className="hover-lift btn-press transition-all duration-300 hover:shadow-destructive/30"
            >
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};