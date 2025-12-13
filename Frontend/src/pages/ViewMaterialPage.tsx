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
  Sparkles,
  ChevronRight,
  Download,
  Eye,
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
  const [isPageReady, setIsPageReady] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [fileHoverIndex, setFileHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  useEffect(() => {
    if (!isLoading && !error && parsed) {
      // Trigger page entrance animation after load
      setTimeout(() => setIsPageReady(true), 100);
    }
  }, [isLoading, error]);

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

  const getCategoryBadgeClass = (categoryName: string) => {
    const baseClass = "animate-fade-in transition-all duration-300 hover-scale";
    switch(categoryName) {
      case 'Science': return `${baseClass} badge-science hover:shadow-blue-500/20`;
      case 'Art': return `${baseClass} badge-art hover:shadow-purple-500/20`;
      case 'Technology': return `${baseClass} badge-technology hover:shadow-green-500/20`;
      case 'Business': return `${baseClass} badge-business hover:shadow-yellow-500/20`;
      case 'Health': return `${baseClass} badge-health hover:shadow-pink-500/20`;
      default: return `${baseClass} hover:shadow-primary/20`;
    }
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
      <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
        <Button 
          variant="ghost" 
          className="mb-6 animate-pulse-slow transition-all"
          onClick={() => navigate('/materials')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Materials
        </Button>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4 animate-pulse-slow">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-lg animate-pulse-slow" />
          <Skeleton className="h-32 w-full rounded-lg animate-pulse-slow" />
        </div>
      </div>
    );
  }

  if (error || !parsed) {
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
              <h3 className="text-lg font-semibold animate-gradient-text">Material Not Found</h3>
              <p className="text-muted-foreground mt-2 mb-6 animate-fade-in">
                The requested material could not be loaded.
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
    <div className={`container mx-auto px-4 py-8 max-w-6xl ${isPageReady ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-slide-in-up">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/materials')}
          className="group hover-lift btn-press transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Materials
        </Button>
        
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/materials/${materialId}/edit`)}
                className="hover-lift btn-press transition-all duration-300 hover:shadow-md"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="hover-lift btn-press transition-all duration-300 hover:shadow-destructive/20 animate-pulse-slow"
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
        <div className="lg:col-span-2 animate-slide-in-right animation-delay-200">
          <Card 
            className={`card-glow hover-lift transition-all duration-500 ${isCardHovered ? 'ring-2 ring-primary/20' : ''}`}
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => setIsCardHovered(false)}
          >
            <CardHeader className="relative overflow-hidden">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center justify-between mb-2 relative z-10">
                <Badge 
                  className={`${getCategoryBadgeClass(categoryName)} badge-shine`}
                >
                  {getCategoryIcon(categoryName)}
                  {categoryName}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in animation-delay-300">
                  <Calendar className="h-3 w-3 animate-pulse-slow" />
                  {formatDate(creationDate)}
                </div>
              </div>
              
              <div className="relative z-10">
                <CardTitle className="text-2xl font-bold animate-gradient-text">
                  Material #{materialId}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 animate-fade-in animation-delay-100">
                  <User className="h-4 w-4 animate-pulse-slow" />
                  Created by {userName}
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 animate-fade-in animation-delay-300">
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 animate-bounce-in animation-delay-400" />
                  Description
                </h3>
                <div className="p-4 bg-muted/20 rounded-lg border hover:bg-muted/30 transition-all duration-300 hover:shadow-inner">
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed animate-fade-in">
                    {text}
                  </p>
                </div>
              </div>

              {mediaFiles.length > 0 && (
                <div className="animate-slide-in-up animation-delay-500">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 animate-bounce-in animation-delay-600" />
                    Attachments ({mediaFiles.length})
                  </h3>
                  <div className="space-y-3">
                    {mediaFiles.map((url: string, index: number) => (
                      <div
                        key={index}
                        className={`stagger-item animate file-badge flex items-center justify-between p-3 border rounded-lg transition-all duration-300 ${fileHoverIndex === index ? 'bg-accent/50 scale-[1.02] shadow-md' : 'hover:bg-accent/30'}`}
                        style={{ animationDelay: `${700 + index * 100}ms` }}
                        onMouseEnter={() => setFileHoverIndex(index)}
                        onMouseLeave={() => setFileHoverIndex(null)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-muted-foreground transition-transform duration-300 group-hover:scale-110">
                            {getFileIcon(url)}
                          </div>
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
                          onClick={() => openExternalLink(url)}
                          className="shrink-0 hover-lift btn-press transition-all duration-300 group"
                        >
                          <ExternalLink className="h-4 w-4 group-hover:rotate-12 transition-transform" />
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
        <div className="space-y-6 animate-slide-in-left animation-delay-300">
          {/* Material Details */}
          <Card className="hover-lift transition-all duration-500 card-glow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse-slow" />
                Material Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { label: 'ID', value: materialId, animateDelay: 100, isCode: true },
                  { label: 'Category', value: categoryName, icon: getCategoryIcon(categoryName), animateDelay: 200 },
                  { label: 'Created', value: formatDate(creationDate), animateDelay: 300 },
                  { label: 'Author', value: userName, icon: (
                    <Avatar className="h-6 w-6 animate-avatar-pulse">
                      <AvatarFallback className="text-xs bg-primary/10">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ), animateDelay: 400 },
                  { label: 'Attachments', value: `${mediaFiles.length} file(s)`, animateDelay: 500 }
                ].map((item, index) => (
                  <div 
                    key={item.label}
                    className="stagger-item animate flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    style={{ animationDelay: `${item.animateDelay}ms` }}
                  >
                    <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-2">
                      {item.icon}
                      {item.isCode ? (
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded animate-fade-in hover:bg-primary/10 transition-colors">
                          {item.value}
                        </code>
                      ) : (
                        <span className="text-sm font-medium animate-fade-in">{item.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="hover-lift transition-all duration-500 card-glow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary animate-pulse-slow" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: 'Description length', value: `${text.length} characters`, progress: Math.min((text.length / 1000) * 100, 100) },
                  { label: 'Media files', value: mediaFiles.length, progress: (mediaFiles.length / 10) * 100 },
                  { label: 'Category', value: categoryName, progress: 75 }
                ].map((stat, index) => (
                  <div 
                    key={stat.label}
                    className="stagger-item animate"
                    style={{ animationDelay: `${600 + index * 100}ms` }}
                  >
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{stat.label}</span>
                      <span className="font-medium animate-stat-count">{stat.value}</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full progress-animate"
                        style={{ 
                          width: `${stat.progress}%`,
                          animationDelay: `${700 + index * 100}ms`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="hover-lift transition-all duration-500 card-glow">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between hover-lift btn-press transition-all duration-300"
                onClick={() => window.print()}
              >
                <span>Print Material</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between hover-lift btn-press transition-all duration-300"
                onClick={() => toast.info('Download feature coming soon!')}
              >
                <span>Download All</span>
                <Download className="h-4 w-4 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5 animate-pulse" />
              Delete Material?
            </DialogTitle>
            <DialogDescription className="animate-fade-in">
              This action <span className="font-bold text-destructive animate-pulse">cannot be undone</span>. This will permanently delete Material #{materialId}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="animate-slide-in-up">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="hover-lift btn-press transition-all duration-300"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="hover-lift btn-press transition-all duration-300 hover:shadow-destructive/30 animate-pulse-slow"
            >
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};