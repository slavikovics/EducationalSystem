// tests/components/TestsPage.tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { 
  X, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  RefreshCw,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
  Target,
  Brain,
  GraduationCap,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { testsAPI, materialsAPI } from '../services/api/'
import type { Test, Material, Question, CreateTestFormData, SubmitTestFormData, ApiResponse } from '@/types'

interface CreateTestFormResponse {
  materials: Material[]
}

export function TestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [filteredTests, setFilteredTests] = useState<Test[]>([])
  const [selectedTest, setSelectedTest] = useState<Test | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [materialIdFilter, setMaterialIdFilter] = useState<number | 'all'>('all')
  const [materials, setMaterials] = useState<Material[]>([])
  const [animateHeader, setAnimateHeader] = useState(false)
  const [animateFilters, setAnimateFilters] = useState(false)
  const [animateTable, setAnimateTable] = useState(false)
  const [hoveredTest, setHoveredTest] = useState<number | null>(null)
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Messages
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [errorDetails, setErrorDetails] = useState<Record<string, string[]> | null>(null)

  // Form states
  const [createFormData, setCreateFormData] = useState<CreateTestFormData>({
    materialId: 0,
    questions: [
      {
        questionText: '',
        options: ['', '', '', ''],
        answerText: ''
      }
    ]
  })

  const [editQuestions, setEditQuestions] = useState<Question[]>([])
  const [submitFormData, setSubmitFormData] = useState<SubmitTestFormData>({
    answers: {}
  })

  // Load tests and form data
  useEffect(() => {
    loadTests()
    loadCreateForm()
  }, [])

  useEffect(() => {
    // Stagger animations
    setTimeout(() => setAnimateHeader(true), 200)
    setTimeout(() => setAnimateFilters(true), 400)
    setTimeout(() => setAnimateTable(true), 600)
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = tests

    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.material?.Content?.Text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (materialIdFilter !== 'all') {
      filtered = filtered.filter(test => test.materialId === materialIdFilter)
    }

    setFilteredTests(filtered)
  }, [tests, searchTerm, materialIdFilter])

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const showError = (error: any) => {
    if (error?.details) {
      setErrorDetails(error.details)
    }
    showMessage(error?.message || error?.Message || 'An error occurred', 'error')
  }

  const clearErrors = () => {
    setErrorDetails(null)
  }

  const loadTests = async () => {
    try {
      setIsLoading(true)
      clearErrors()
      const response = await testsAPI.getAll() as ApiResponse<Test[]>
      
      if (response.success || response.data) {
        const testsData = response.data || response.Test || []
        setTests(Array.isArray(testsData) ? testsData : [testsData])
      } else {
        showError(response.error || 'Failed to load tests')
      }
    } catch (error: any) {
      showError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCreateForm = async () => {
    try {
      clearErrors()
      const response = await materialsAPI.getAllMaterials();
      console.log('Materials response:', response);

      const processedMaterials = response.map((material: any) => ({
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
      console.log("Materials count: " + processedMaterials.length)
    } catch (error) {
      console.error('Failed to load create form data:', error)
    }
  }

  const loadTestDetails = async (id: number) => {
    try {
      clearErrors()
      const response = await testsAPI.getById(id) as ApiResponse<Test>
      
      if (response.success || response.data) {
        const testData = response.data || response.Test
        setSelectedTest(testData)
        return testData
      } else {
        showError(response.error || 'Failed to load test details')
      }
    } catch (error: any) {
      showError(error)
    }
    return null
  }

  const loadEditForm = async (id: number) => {
    try {
      clearErrors()
      const response = await testsAPI.getEditForm(id) as ApiResponse<{ questions: Question[] }>
      
      if (response.success || response.data) {
        const data = response.data || response
        setEditQuestions(data.questions || [])
        return data
      } else {
        showError(response.error || 'Failed to load edit form')
      }
    } catch (error: any) {
      showError(error)
    }
    return null
  }

  const handleCreateTest = async () => {
    try {
      setIsSubmitting(true)
      clearErrors()
      const response = await testsAPI.create(createFormData) as ApiResponse<Test>
      
      if (response.success || response.data || response.Message) {
        showMessage(response.message || response.Message || 'Test created successfully')
        setCreateDialogOpen(false)
        resetCreateForm()
        loadTests()
      } else {
        showError(response.error || 'Failed to create test')
      }
    } catch (error: any) {
      showError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateTest = async (id: number) => {
    try {
      setIsSubmitting(true)
      clearErrors()
      const response = await testsAPI.update(id, editQuestions) as ApiResponse<Test>
      
      if (response.success || response.data || response.Message) {
        showMessage(response.message || response.Message || 'Test updated successfully')
        setEditDialogOpen(false)
        loadTests()
      } else {
        showError(response.error || 'Failed to update test')
      }
    } catch (error: any) {
      showError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTest = async (id: number) => {
    try {
      clearErrors()
      const response = await testsAPI.delete(id) as ApiResponse
      
      if (response.success || response.Message) {
        showMessage(response.message || response.Message || 'Test deleted successfully')
        setDeleteDialogOpen(false)
        loadTests()
      } else {
        showError(response.error || 'Failed to delete test')
      }
    } catch (error: any) {
      showError(error)
    }
  }

  const handleSubmitTest = async (testId: number) => {
    try {
      setIsSubmitting(true)
      clearErrors()
      const response = await testsAPI.submitAnswers(testId, submitFormData) as ApiResponse
      
      if (response.success || response.data || response.Message) {
        showMessage(response.message || response.Message || 'Test submitted successfully')
        setSubmitDialogOpen(false)
        resetSubmitForm()
        
        // Show results if returned
        if (response.data || response.TestResult) {
          const result = response.data || response.TestResult
          showMessage(`Test submitted! Score: ${result.score}/${result.totalQuestions} (${result.passed ? 'Passed' : 'Failed'})`)
        }
      } else {
        showError(response.error || 'Failed to submit test')
      }
    } catch (error: any) {
      showError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadTestsByMaterial = async (materialId: number) => {
    try {
      setIsLoading(true)
      clearErrors()
      const response = await testsAPI.getByMaterialId(materialId) as ApiResponse<Test[]>
      
      if (response.success || response.data) {
        const testsData = response.data || response.Test || []
        setTests(Array.isArray(testsData) ? testsData : [testsData])
      } else {
        showError(response.error || 'Failed to load tests by material')
      }
    } catch (error: any) {
      showError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetCreateForm = () => {
    setCreateFormData({
      materialId: 0,
      questions: [
        {
          questionText: '',
          options: ['', '', '', ''],
          answerText: ''
        }
      ]
    })
  }

  const resetSubmitForm = () => {
    setSubmitFormData({
      answers: {}
    })
  }

  const handleViewTest = async (test: Test) => {
    const details = await loadTestDetails(test.testId!)
    if (details) {
      setSelectedTest(details)
      setViewDialogOpen(true)
    }
  }

  const handleEditTest = async (test: Test) => {
    const formData = await loadEditForm(test.testId!)
    if (formData) {
      setSelectedTest(test)
      setEditDialogOpen(true)
    }
  }

  const addQuestionToCreateForm = () => {
    setCreateFormData({
      ...createFormData,
      questions: [
        ...createFormData.questions,
        {
          questionText: '',
          options: ['', '', '', ''],
          answerText: ''
        }
      ]
    })
  }

  const updateCreateQuestion = (index: number, field: keyof Question, value: string) => {
    const newQuestions = [...createFormData.questions]
    if (field === 'options') {
      // This would need more logic for updating specific options
    } else {
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value
      }
    }
    setCreateFormData({ ...createFormData, questions: newQuestions })
  }

  const handleRefresh = async () => {
    await loadTests()
    showMessage('Tests refreshed!', 'success')
  }

  const getDifficultyBadge = (test: Test) => {
    const questionCount = test.questions?.length || 0
    if (questionCount > 10) return { color: 'bg-red-100 text-red-800 border-red-200', text: 'Hard' }
    if (questionCount > 5) return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Medium' }
    return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Easy' }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 animate-fade-in">
        {/* Animated Loading Header */}
        <div className={`
          flex items-center justify-between transform transition-all duration-700
          ${animateHeader ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
        `}>
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 animate-pulse" />
            <Skeleton className="h-4 w-64 animate-pulse animation-delay-200" />
          </div>
          <Skeleton className="h-10 w-32 animate-pulse animation-delay-400" />
        </div>

        {/* Animated Loading Filters */}
        <Card className={`
          transform transition-all duration-700
          ${animateFilters ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
        `}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1 animate-pulse animation-delay-300" />
              <Skeleton className="h-10 w-48 animate-pulse animation-delay-400" />
              <Skeleton className="h-10 w-10 animate-pulse animation-delay-500" />
            </div>
          </CardContent>
        </Card>

        {/* Animated Loading Table */}
        <Card className={`
          transform transition-all duration-700
          ${animateTable ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
        `}>
          <CardHeader>
            <Skeleton className="h-6 w-32 animate-pulse animation-delay-400" />
            <Skeleton className="h-4 w-48 animate-pulse animation-delay-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton 
                  key={i}
                  className="h-12 w-full animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className={`
        flex items-center justify-between transform transition-all duration-700
        ${animateHeader ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
      `}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 animate-pulse-slow">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight animate-slide-in-right">
              Tests Management
            </h1>
          </div>
          <p className="text-muted-foreground animate-fade-in animation-delay-300">
            Create, manage, and submit knowledge assessments
          </p>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="hover-scale transition-smooth group animate-fade-in animation-delay-400"
        >
          <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
          Create Test
        </Button>
      </div>

      {/* Filters */}
      <Card className={`
        transform transition-all duration-700
        ${animateFilters ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
        hover:shadow-xl transition-all duration-300
      `}>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                placeholder="Search tests by material content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-md"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:scale-110 transition-transform"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select
              value={materialIdFilter.toString()}
              onValueChange={(value) => 
                setMaterialIdFilter(value === 'all' ? 'all' : parseInt(value))
              }
            >
              <SelectTrigger className="w-[200px] hover-scale transition-smooth group">
                <SelectValue placeholder="Filter by material" />
                <Filter className="h-4 w-4 ml-2 text-muted-foreground group-hover:text-primary transition-colors" />
              </SelectTrigger>
              <SelectContent className="animate-scale-in">
                <SelectItem value="all" className="hover-scale transition-smooth">All Materials</SelectItem>
                {materials.map((material, index) => (
                  <SelectItem 
                    key={material.MaterialId} 
                    value={material.MaterialId}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {material.Content?.Text.substring(0, 30)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="shrink-0 hover-scale transition-smooth group"
            >
              <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in animation-delay-500">
        <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold animate-count-up">{filteredTests.length}</div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold animate-count-up animation-delay-200">
                  {tests.reduce((acc, test) => acc + (test.questions?.length || 0), 0)}
                </div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-50 group-hover:scale-110 transition-transform">
                <Target className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold animate-count-up animation-delay-400">{materials.length}</div>
                <p className="text-sm text-muted-foreground">Materials</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold animate-count-up animation-delay-600">
                  {tests.filter(t => t.questions && t.questions.length > 5).length}
                </div>
                <p className="text-sm text-muted-foreground">Advanced Tests</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-50 group-hover:scale-110 transition-transform">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tests Table */}
      <Card className={`
        transform transition-all duration-700
        ${animateTable ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        hover:shadow-xl transition-all duration-300
      `}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Knowledge Assessments
          </CardTitle>
          <CardDescription className="animate-fade-in">
            {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} found • 
            <span className="ml-2 inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-yellow-500 animate-spin-slow" />
              Interactive learning tools
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Test ID</TableHead>
                <TableHead>Material Content</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map((test, index) => {
                const difficulty = getDifficultyBadge(test)
                return (
                  <TableRow 
                    key={test.testId}
                    className={`
                      hover:bg-muted/50 transition-all duration-300 group
                      ${hoveredTest === test.testId ? 'bg-muted/30 scale-[1.01]' : ''}
                      animate-fade-in
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onMouseEnter={() => setHoveredTest(test.testId!)}
                    onMouseLeave={() => setHoveredTest(null)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-gradient-to-br from-primary/10 to-secondary/10">
                          <FileText className="h-3 w-3 text-primary" />
                        </div>
                        #{test.testId}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate group-hover:text-primary transition-colors">
                        {test.material?.Content?.Text.substring(0, 50)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="animate-pulse-slow">
                          {test.questions?.length || 0}
                        </Badge>
                        <Brain className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${difficulty.color} hover:scale-105 transition-transform`}
                      >
                        {difficulty.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTest(test)}
                          className="hover-scale transition-smooth"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTest(test)}
                          className="hover-scale transition-smooth"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTest(test)
                            setSubmitDialogOpen(true)
                          }}
                          className="hover-scale transition-smooth"
                        >
                          <GraduationCap className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedTest(test)
                            setDeleteDialogOpen(true)
                          }}
                          className="hover-scale transition-smooth"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Test Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 animate-fade-in">
              <Plus className="h-5 w-5 text-primary" />
              Create New Test
            </DialogTitle>
            <DialogDescription className="animate-fade-in animation-delay-200">
              Design a new knowledge assessment for learning materials
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3 animate-fade-in animation-delay-300">
              <Label htmlFor="materialId" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                Select Material
              </Label>
              <Select
                value={createFormData.materialId}
                onValueChange={(value) => 
                  setCreateFormData({...createFormData, materialId: parseInt(value)})
                }
              >
                <SelectTrigger className="hover-scale transition-smooth">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent className="animate-scale-in">
                  {materials.map((material, index) => (
                    <SelectItem 
                      key={material.MaterialId} 
                      value={material.MaterialId}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {material.Content?.Text.substring(0, 100)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 animate-fade-in animation-delay-400">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  Test Questions
                </Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addQuestionToCreateForm}
                  className="hover-scale transition-smooth group"
                >
                  <Plus className="h-4 w-4 mr-1 group-hover:rotate-90 transition-transform duration-300" />
                  Add Question
                </Button>
              </div>
              
              {createFormData.questions.map((question, index) => (
                <Card 
                  key={index} 
                  className="p-4 hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-${index}`} className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-muted-foreground" />
                        Question {index + 1}
                      </Label>
                      <Textarea
                        id={`question-${index}`}
                        value={question.questionText}
                        onChange={(e) => updateCreateQuestion(index, 'questionText', e.target.value)}
                        placeholder="Enter the question"
                        className="transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Options</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options?.map((option, optIndex) => (
                          <Input
                            key={optIndex}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(question.options || [])]
                              newOptions[optIndex] = e.target.value
                              const newQuestions = [...createFormData.questions]
                              newQuestions[index].options = newOptions
                              setCreateFormData({...createFormData, questions: newQuestions})
                            }}
                            placeholder={`Option ${optIndex + 1}`}
                            className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md"
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`answer-${index}`} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Correct Answer
                      </Label>
                      <Input
                        id={`answer-${index}`}
                        value={question.answerText}
                        onChange={(e) => updateCreateQuestion(index, 'answerText', e.target.value)}
                        placeholder="Enter the correct answer"
                        className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 animate-fade-in animation-delay-600">
            <Button 
              variant="outline" 
              onClick={() => setCreateDialogOpen(false)}
              className="hover-scale transition-smooth"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTest} 
              disabled={isSubmitting}
              className="hover-scale transition-smooth group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  Create Test
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Test Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl animate-scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 animate-fade-in">
              <Eye className="h-5 w-5 text-primary" />
              Test Details
            </DialogTitle>
            <DialogDescription className="animate-fade-in animation-delay-200">
              Test ID: #{selectedTest?.testId}
            </DialogDescription>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-6 animate-fade-in animation-delay-300">
              <div className="p-4 bg-gradient-to-r from-muted/50 to-background rounded-lg hover:scale-[1.01] transition-transform">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Material Content
                </h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedTest.material?.Content?.Text}
                </p>
              </div>
              
              {selectedTest.questions && selectedTest.questions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Questions ({selectedTest.questions.length})
                  </h4>
                  {selectedTest.questions.map((question, index) => (
                    <Card 
                      key={question.questionId || index} 
                      className="p-4 hover:shadow-lg transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="space-y-3">
                        <p className="font-medium">Q{index + 1}: {question.questionText}</p>
                        {question.options && question.options.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                              <Brain className="h-3 w-3" />
                              Options:
                            </p>
                            <ul className="space-y-1">
                              {question.options.map((option, optIndex) => (
                                <li 
                                  key={optIndex} 
                                  className={`p-2 rounded border transition-all duration-300 ${option === question.answerText ? 'bg-green-50 border-green-200 text-green-700 scale-[1.02]' : ''}`}
                                >
                                  {option}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="text-sm pt-2 border-t">
                          <span className="font-medium flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Answer:
                          </span> {question.answerText}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Test Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 animate-fade-in">
              <Edit className="h-5 w-5 text-primary" />
              Edit Test Questions
            </DialogTitle>
            <DialogDescription className="animate-fade-in animation-delay-200">
              Test for: {selectedTest?.material?.Content?.Text.substring(0, 100)}...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editQuestions.map((question, index) => (
              <Card 
                key={question.questionId || index} 
                className="p-4 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`edit-question-${index}`} className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-muted-foreground" />
                      Question {index + 1}
                    </Label>
                    <Textarea
                      id={`edit-question-${index}`}
                      value={question.questionText}
                      onChange={(e) => {
                        const newQuestions = [...editQuestions]
                        newQuestions[index].questionText = e.target.value
                        setEditQuestions(newQuestions)
                      }}
                      className="transition-all duration-300 focus:scale-[1.01] focus:shadow-md"
                    />
                  </div>
                  
                  {question.options && question.options.length > 0 && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((option, optIndex) => (
                          <Input
                            key={optIndex}
                            value={option}
                            onChange={(e) => {
                              const newQuestions = [...editQuestions]
                              if (!newQuestions[index].options) newQuestions[index].options = []
                              newQuestions[index].options![optIndex] = e.target.value
                              setEditQuestions(newQuestions)
                            }}
                            className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor={`edit-answer-${index}`} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Correct Answer
                    </Label>
                    <Input
                      id={`edit-answer-${index}`}
                      value={question.answerText}
                      onChange={(e) => {
                        const newQuestions = [...editQuestions]
                        newQuestions[index].answerText = e.target.value
                        setEditQuestions(newQuestions)
                      }}
                      className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex justify-end gap-2 animate-fade-in animation-delay-600">
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              className="hover-scale transition-smooth"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => selectedTest && handleUpdateTest(selectedTest.testId!)}
              disabled={isSubmitting}
              className="hover-scale transition-smooth group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  Update Test
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 animate-fade-in">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Test
            </AlertDialogTitle>
            <AlertDialogDescription className="animate-fade-in animation-delay-200">
              This action cannot be undone. This will permanently delete the test
              for material: "{selectedTest?.material?.Content?.Text.substring(0, 50)}..."
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="animate-fade-in animation-delay-400">
            <AlertDialogCancel className="hover-scale transition-smooth">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTest && handleDeleteTest(selectedTest.testId!)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 hover-scale transition-smooth"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Test Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="max-w-2xl animate-scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 animate-fade-in">
              <GraduationCap className="h-5 w-5 text-primary" />
              Take Test
            </DialogTitle>
            <DialogDescription className="animate-fade-in animation-delay-200">
              Answer all questions below to assess your knowledge
            </DialogDescription>
          </DialogHeader>
          {selectedTest?.questions && selectedTest.questions.length > 0 ? (
            <div className="space-y-6 py-4">
              {selectedTest.questions.map((question, index) => (
                <Card 
                  key={question.questionId || index} 
                  className="p-4 hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="shrink-0 animate-pulse-slow">
                        Q{index + 1}
                      </Badge>
                      <p className="font-medium">{question.questionText}</p>
                    </div>
                    
                    {question.options && question.options.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        <Label className="text-sm text-muted-foreground">Select the correct answer:</Label>
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2 group/option">
                            <div className="relative">
                              <input
                                type="radio"
                                id={`answer-${question.questionId || index}-${optIndex}`}
                                name={`question-${question.questionId || index}`}
                                value={option}
                                onChange={(e) => {
                                  setSubmitFormData({
                                    ...submitFormData,
                                    answers: {
                                      ...submitFormData.answers,
                                      [question.questionId!]: e.target.value
                                    }
                                  })
                                }}
                                className="peer hidden"
                              />
                              <Label 
                                htmlFor={`answer-${question.questionId || index}-${optIndex}`}
                                className={`
                                  cursor-pointer block p-3 border rounded-lg transition-all duration-300
                                  hover:scale-[1.02] hover:shadow-md
                                  peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary
                                  peer-checked:scale-[1.03]
                                `}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground peer-checked:border-primary peer-checked:bg-primary transition-all"></div>
                                  <span>{option}</span>
                                </div>
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 mt-3">
                        <Label htmlFor={`text-answer-${index}`} className="text-sm">Your Answer:</Label>
                        <Input
                          id={`text-answer-${index}`}
                          value={submitFormData.answers[question.questionId!] || ''}
                          onChange={(e) => {
                            setSubmitFormData({
                              ...submitFormData,
                              answers: {
                                ...submitFormData.answers,
                                [question.questionId!]: e.target.value
                              }
                            })
                          }}
                          placeholder="Enter your answer"
                          className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground animate-fade-in">
              <Brain className="mx-auto h-12 w-12 mb-4 opacity-50" />
              No questions available for this test.
            </div>
          )}
          <div className="flex justify-end gap-2 animate-fade-in animation-delay-600">
            <Button 
              variant="outline" 
              onClick={() => setSubmitDialogOpen(false)}
              className="hover-scale transition-smooth"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => selectedTest && handleSubmitTest(selectedTest.testId!)}
              disabled={isSubmitting || Object.keys(submitFormData.answers).length < (selectedTest?.questions?.length || 0)}
              className="hover-scale transition-smooth group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  Submit Test
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}