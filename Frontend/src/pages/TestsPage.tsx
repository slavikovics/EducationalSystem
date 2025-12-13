// tests/components/TestsPage.tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, MoreHorizontal, Edit, Trash2, Eye, FileText, RefreshCw } from 'lucide-react'
import { testsAPI } from '../services/api/'
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
      const response = await testsAPI.getCreateForm() as ApiResponse<CreateTestFormResponse>
      
      if (response.success || response.data) {
        const data = response.data || response
        setMaterials(data.materials || [])
      }
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

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          <div className="flex justify-between items-center">
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-sm opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
          
          {errorDetails && (
            <div className="mt-2 pt-2 border-t border-red-200">
              <ul className="text-sm space-y-1">
                {Object.entries(errorDetails).map(([field, errors]) => (
                  <li key={field}>
                    <strong>{field}:</strong> {errors.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tests Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and submit tests
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Test
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tests by material content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select
              value={materialIdFilter.toString()}
              onValueChange={(value) => 
                setMaterialIdFilter(value === 'all' ? 'all' : parseInt(value))
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Materials</SelectItem>
                {materials.map((material) => (
                  <SelectItem key={material.MaterialId} value={material.MaterialId.toString()}>
                    {material.Content?.Text.substring(0, 30)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={loadTests}
              className="shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tests</CardTitle>
          <CardDescription>
            {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test ID</TableHead>
                <TableHead>Material Content</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test.testId}>
                  <TableCell className="font-medium">#{test.testId}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {test.material?.Content?.Text.substring(0, 50)}...
                  </TableCell>
                  <TableCell>{test.questions?.length || 0}</TableCell>
                  <TableCell>
                    {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewTest(test)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditTest(test)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Questions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedTest(test)
                          setSubmitDialogOpen(true)
                        }}>
                          <FileText className="mr-2 h-4 w-4" />
                          Take Test
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedTest(test)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Test Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Test</DialogTitle>
            <DialogDescription>
              Create a new test for a material
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="materialId">Select Material</Label>
              <Select
                value={createFormData.materialId.toString()}
                onValueChange={(value) => 
                  setCreateFormData({...createFormData, materialId: parseInt(value)})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((material) => (
                    <SelectItem key={material.MaterialId} value={material.MaterialId.toString()}>
                      {material.Content?.Text.substring(0, 100)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Test Questions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addQuestionToCreateForm}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Question
                </Button>
              </div>
              
              {createFormData.questions.map((question, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-${index}`}>Question {index + 1}</Label>
                      <Textarea
                        id={`question-${index}`}
                        value={question.questionText}
                        onChange={(e) => updateCreateQuestion(index, 'questionText', e.target.value)}
                        placeholder="Enter the question"
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
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`answer-${index}`}>Correct Answer</Label>
                      <Input
                        id={`answer-${index}`}
                        value={question.answerText}
                        onChange={(e) => updateCreateQuestion(index, 'answerText', e.target.value)}
                        placeholder="Enter the correct answer"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTest} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Test'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Test Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Test Details</DialogTitle>
            <DialogDescription>
              Test ID: #{selectedTest?.testId}
            </DialogDescription>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Material Content</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedTest.material?.Content?.Text}
                </p>
              </div>
              
              {selectedTest.questions && selectedTest.questions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Questions ({selectedTest.questions.length})</h4>
                  {selectedTest.questions.map((question, index) => (
                    <Card key={question.questionId || index} className="p-4">
                      <div className="space-y-3">
                        <p className="font-medium">Q{index + 1}: {question.questionText}</p>
                        {question.options && question.options.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Options:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {question.options.map((option, optIndex) => (
                                <li key={optIndex} className={option === question.answerText ? 'text-green-600 font-medium' : ''}>
                                  {option}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="text-sm">
                          <span className="font-medium">Answer:</span> {question.answerText}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Test Questions</DialogTitle>
            <DialogDescription>
              Test for: {selectedTest?.material?.Content?.Text.substring(0, 100)}...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editQuestions.map((question, index) => (
              <Card key={question.questionId || index} className="p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`edit-question-${index}`}>Question {index + 1}</Label>
                    <Textarea
                      id={`edit-question-${index}`}
                      value={question.questionText}
                      onChange={(e) => {
                        const newQuestions = [...editQuestions]
                        newQuestions[index].questionText = e.target.value
                        setEditQuestions(newQuestions)
                      }}
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
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor={`edit-answer-${index}`}>Correct Answer</Label>
                    <Input
                      id={`edit-answer-${index}`}
                      value={question.answerText}
                      onChange={(e) => {
                        const newQuestions = [...editQuestions]
                        newQuestions[index].answerText = e.target.value
                        setEditQuestions(newQuestions)
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedTest && handleUpdateTest(selectedTest.testId!)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Test'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the test
              for material: "{selectedTest?.material?.Content?.Text.substring(0, 50)}..."
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTest && handleDeleteTest(selectedTest.testId!)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Test Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Take Test</DialogTitle>
            <DialogDescription>
              Answer all questions below
            </DialogDescription>
          </DialogHeader>
          {selectedTest?.questions && selectedTest.questions.length > 0 ? (
            <div className="space-y-6 py-4">
              {selectedTest.questions.map((question, index) => (
                <Card key={question.questionId || index} className="p-4">
                  <div className="space-y-3">
                    <p className="font-medium">Q{index + 1}: {question.questionText}</p>
                    
                    {question.options && question.options.length > 0 ? (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2">
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
                            />
                            <Label 
                              htmlFor={`answer-${question.questionId || index}-${optIndex}`}
                              className="cursor-pointer"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor={`text-answer-${index}`}>Your Answer:</Label>
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
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No questions available for this test.
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedTest && handleSubmitTest(selectedTest.testId!)}
              disabled={isSubmitting || Object.keys(submitFormData.answers).length < (selectedTest?.questions?.length || 0)}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}