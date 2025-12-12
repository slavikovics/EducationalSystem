// src/pages/admin/CreateMaterialPage.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { materialsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { 
  AlertCircle, 
  BookOpen, 
  Upload, 
  X, 
  Link,
  FileText,
  Image,
  Video,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

// Define validation schema
const createMaterialSchema = z.object({
  text: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  category: z.string()
    .min(1, 'Category is required'),
  mediaFiles: z.array(z.string().url('Must be a valid URL'))
    .optional()
    .default([]),
});

type CreateMaterialFormData = z.infer<typeof createMaterialSchema>;

export const CreateMaterialPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [newFileUrl, setNewFileUrl] = useState('');

  const form = useForm<CreateMaterialFormData>({
    resolver: zodResolver(createMaterialSchema),
    defaultValues: {
      text: '',
      category: '',
      mediaFiles: [],
    },
  });

  // Fetch form configuration
useEffect(() => {
  const fetchFormConfig = async () => {
    try {
      const response = await materialsAPI.getCreateMaterialForm();
      
      // Backend returns { "Categories": ["Science", "Art", "Technology", "Business", "Health"] }
      // So just access response.Categories directly
      if (response.Categories && Array.isArray(response.Categories)) {
        setAvailableCategories(response.Categories);
      } else {
        // Fallback in case of unexpected response
        console.warn('Unexpected response format:', response);
        setAvailableCategories(['Science', 'Art', 'Technology', 'Business', 'Health']);
      }
    } catch (error) {
      console.error('Failed to fetch form configuration:', error);
      setAvailableCategories(['Science', 'Art', 'Technology', 'Business', 'Health']);
    }
  };
  fetchFormConfig();
}, []);

  // Redirect if not authorized
  useEffect(() => {
    if (user && user.role !== 'Admin' && user.role !== 'Tutor') {
      navigate('/materials');
    }
  }, [user, navigate]);

  const onSubmit = async (data: CreateMaterialFormData) => {
    if (!user) {
      setError('You must be logged in to create materials');
      return;
    }

    if (user.role !== 'Admin' && user.role !== 'Tutor') {
      setError('You do not have permission to create materials');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Prepare the request data
      const requestData = {
        text: data.text,
        category: data.category,
        mediaFiles: data.mediaFiles || [],
      };

      console.log('Creating material with data:', requestData);
      
      const response = await materialsAPI.createMaterial(requestData);
      console.log('Material created:', response);

      toast.success('Material created successfully!', {
        description: 'The educational material has been added to the system.',
      });

      // Redirect to materials page
      navigate('/materials');
    } catch (error: any) {
      console.error('Failed to create material:', error);
      
      let errorMessage = 'Failed to create material';
      if (error.response?.data?.Error) {
        errorMessage = error.response.data.Error;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast.error('Failed to create material', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFileUrl = () => {
    if (!newFileUrl.trim()) return;

    const currentFiles = form.getValues('mediaFiles') || [];
    const updatedFiles = [...currentFiles, newFileUrl.trim()];
    form.setValue('mediaFiles', updatedFiles, { shouldValidate: true });
    setNewFileUrl('');
  };

  const removeFileUrl = (index: number) => {
    const currentFiles = form.getValues('mediaFiles') || [];
    const updatedFiles = currentFiles.filter((_, i) => i !== index);
    form.setValue('mediaFiles', updatedFiles, { shouldValidate: true });
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

  if (!user || (user.role !== 'Admin' && user.role !== 'Tutor')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/materials')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Materials
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Educational Material</h1>
        <p className="text-muted-foreground mt-2">
          Add new educational content to the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material Details</CardTitle>
          <CardDescription>
            Fill in the details for the new educational material
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(category)}
                              {category}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the type of content you're adding
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a detailed description of the material..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a clear description of what this material contains
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="mb-4 block">Media Files</FormLabel>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://example.com/file.pdf"
                      value={newFileUrl}
                      onChange={(e) => setNewFileUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addFileUrl();
                        }
                      }}
                    />
                    <Button type="button" onClick={addFileUrl}>
                      <Upload className="h-4 w-4 mr-2" />
                      Add URL
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Add links to educational resources like:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>YouTube videos (https://youtube.com/watch?v=...)</li>
                      <li>PDF documents (https://example.com/document.pdf)</li>
                      <li>Image galleries (https://imgur.com/gallery/...)</li>
                      <li>Online articles (https://medium.com/article/...)</li>
                    </ul>
                  </div>

                  {form.watch('mediaFiles')?.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Added Files</span>
                        <span className="text-sm text-muted-foreground">
                          {form.watch('mediaFiles')?.length} file(s)
                        </span>
                      </div>
                      <Separator />
                      <div className="space-y-2 mt-3">
                        {form.watch('mediaFiles')?.map((url, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Link className="h-4 w-4 text-muted-foreground" />
                              <div className="truncate max-w-md">
                                <p className="text-sm font-medium truncate">
                                  {url.replace(/^https?:\/\//, '').split('/')[0]}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {url}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFileUrl(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-medium mb-2">Preview</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    {form.watch('category') ? (
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getCategoryIcon(form.watch('category'))}
                        {form.watch('category')}
                      </Badge>
                    ) : (
                      <span className="text-sm">Not selected</span>
                    )}
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Description:</span>
                    <p className="text-sm mt-1">
                      {form.watch('text') || 'No description provided'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Files:</span>
                    <p className="text-sm mt-1">
                      {form.watch('mediaFiles')?.length || 0} file(s) attached
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/materials')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Create Material
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};