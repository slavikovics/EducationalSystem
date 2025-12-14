// tests/components/TestCreatePage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { 
  Plus, 
  BookOpen, 
  Target, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ArrowLeft 
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { testsAPI, materialsAPI } from '../services/api/'
import type { CreateTestFormData, Question, ApiResponse, Material } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export function TestCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdminOrTutor = user.role === 'Admin' || user.role === 'Tutor'
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([])
  const [duplicateQuestions, setDuplicateQuestions] = useState<string[]>([])
  const [duplicateOptions, setDuplicateOptions] = useState<{[key: number]: string[]}>({})
  const [answerNotInOptions, setAnswerNotInOptions] = useState<{[key: number]: boolean}>({})
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  
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

  useEffect(() => {
    if (!isAdminOrTutor) {
      navigate('/tests')
      return
    }
    loadMaterials()
  }, [isAdminOrTutor, navigate])

  useEffect(() => {
    validateTestForm()
  }, [createFormData])

  const loadMaterials = async () => {
    try {
      const response = await materialsAPI.getAllMaterials()
      const materialsData = response.data || response.Materials || response
      
      if (Array.isArray(materialsData)) {
        const processedMaterials = materialsData.map((material: any) => ({
          materialId: material.materialId || material.id || material.MaterialId || 0,
          content: {
            text: material.content?.text || material.Content?.Text || material.text || material.description || 'No description'
          }
        }))
        setMaterials(processedMaterials)
      }
    } catch (error) {
      console.error('Failed to load materials:', error)
      showMessage('Failed to load materials', 'error')
    }
  }

  const validateTestForm = () => {
    const questions = createFormData.questions
    
    // Check for duplicate questions
    const questionTexts = questions.map(q => q.questionText.trim().toLowerCase())
    const duplicates: string[] = []
    const seen = new Set()
    
    questionTexts.forEach((text, index) => {
      if (text && seen.has(text)) {
        duplicates.push(`Question ${index + 1}`)
      }
      seen.add(text)
    })
    
    setDuplicateQuestions(duplicates)
    
    // Check for duplicate options within each question
    const optionsDuplicates: {[key: number]: string[]} = {}
    const answerNotInOptionsMap: {[key: number]: boolean} = {}
    
    questions.forEach((question, qIndex) => {
      const optionMap = new Map()
      question.options?.forEach((option, oIndex) => {
        const trimmedOption = option.trim().toLowerCase()
        if (trimmedOption) {
          if (optionMap.has(trimmedOption)) {
            if (!optionsDuplicates[qIndex]) {
              optionsDuplicates[qIndex] = []
            }
            optionsDuplicates[qIndex].push(`Option ${oIndex + 1}`)
          }
          optionMap.set(trimmedOption, oIndex)
        }
      })
      
      // Check if answer is in options
      if (question.answerText && question.options) {
        const answerInOptions = question.options.some(option => 
          option.trim().toLowerCase() === question.answerText.trim().toLowerCase()
        )
        if (!answerInOptions) {
          answerNotInOptionsMap[qIndex] = true
        }
      }
    })
    
    setDuplicateOptions(optionsDuplicates)
    setAnswerNotInOptions(answerNotInOptionsMap)
  }

  const handleCreateTest = async () => {
    if (duplicateQuestions.length > 0) {
      showMessage('Please fix duplicate questions before creating test', 'error')
      return
    }
    
    const hasDuplicateOptions = Object.keys(duplicateOptions).length > 0
    if (hasDuplicateOptions) {
      showMessage('Please fix duplicate options before creating test', 'error')
      return
    }
    
    const hasAnswerNotInOptions = Object.keys(answerNotInOptions).length > 0
    if (hasAnswerNotInOptions) {
      showMessage('Please ensure answers match one of the options', 'error')
      return
    }
    
    try {
      setIsSubmitting(true)
      const response = await testsAPI.create(createFormData) as ApiResponse
      
      if (response.success || response.data || response.Message) {
        showMessage(response.message || response.Message || 'Test created successfully', 'success')
        navigate('/tests')
      } else {
        showMessage(response.error || 'Failed to create test', 'error')
      }
    } catch (error: any) {
      showMessage(error.message || 'An error occurred', 'error')
    } finally {
      setIsSubmitting(false)
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

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/tests')} className="hover-scale transition-smooth">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tests
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
          <p className="text-muted-foreground">Design a new knowledge assessment for learning materials</p>
        </div>
      </div>

      {/* Validation Alerts */}
      {duplicateQuestions.length > 0 && (
        <Alert variant="destructive" className="animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Duplicate Questions</AlertTitle>
          <AlertDescription>
            The following questions are duplicates: {duplicateQuestions.join(', ')}. Please make each question unique.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6">
        {/* Material Selection */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Select Material
            </CardTitle>
            <CardDescription>
              Choose the learning material for this test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={createFormData.materialId.toString()}
              onValueChange={(value) => setCreateFormData({...createFormData, materialId: parseInt(value)})}
            >
              <SelectTrigger className="hover-scale transition-smooth">
                <SelectValue placeholder="Select a material" />
              </SelectTrigger>
              <SelectContent className="animate-scale-in">
                {materials.map((material, index) => (
                  <SelectItem 
                    key={material.materialId} 
                    value={material.materialId.toString()}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {material.content.text.substring(0, 100)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Test Questions
              </CardTitle>
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
            <CardDescription>
              Create questions and options for your test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {createFormData.questions.map((question, index) => (
              <Card 
                key={index} 
                className="p-4 border hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Question Text */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`question-${index}`} className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-muted-foreground" />
                        Question {index + 1}
                      </Label>
                      {duplicateQuestions.includes(`Question ${index + 1}`) && (
                        <Badge variant="destructive" className="text-xs">
                          Duplicate
                        </Badge>
                      )}
                    </div>
                    <Textarea
                      id={`question-${index}`}
                      value={question.questionText}
                      onChange={(e) => updateCreateQuestion(index, 'questionText', e.target.value)}
                      placeholder="Enter the question"
                      className={`transition-all duration-300 focus:scale-[1.01] focus:shadow-md ${
                        duplicateQuestions.includes(`Question ${index + 1}`) ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  
                  {/* Options */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Options</Label>
                      {duplicateOptions[index] && (
                        <Badge variant="destructive" className="text-xs">
                          Duplicate options
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className="relative">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(question.options || [])]
                              newOptions[optIndex] = e.target.value
                              const newQuestions = [...createFormData.questions]
                              newQuestions[index].options = newOptions
                              setCreateFormData({...createFormData, questions: newQuestions})
                            }}
                            placeholder={`Option ${optIndex + 1}`}
                            className={`transition-all duration-300 focus:scale-[1.02] focus:shadow-md ${
                              duplicateOptions[index]?.includes(`Option ${optIndex + 1}`) ? 'border-red-500' : ''
                            }`}
                          />
                          {duplicateOptions[index]?.includes(`Option ${optIndex + 1}`) && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Correct Answer */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`answer-${index}`} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Correct Answer
                      </Label>
                      {answerNotInOptions[index] && (
                        <Badge variant="destructive" className="text-xs">
                          Not in options
                        </Badge>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id={`answer-${index}`}
                        value={question.answerText}
                        onChange={(e) => updateCreateQuestion(index, 'answerText', e.target.value)}
                        placeholder="Enter the correct answer (must match one of the options)"
                        className={`transition-all duration-300 focus:scale-[1.02] focus:shadow-md ${
                          answerNotInOptions[index] ? 'border-red-500' : ''
                        }`}
                      />
                      {answerNotInOptions[index] && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                      )}
                    </div>
                    {!answerNotInOptions[index] && question.answerText && (
                      <div className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Answer matches one of the options
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/tests')}
            className="hover-scale transition-smooth"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTest} 
            disabled={isSubmitting || 
              duplicateQuestions.length > 0 || 
              Object.keys(duplicateOptions).length > 0 ||
              Object.keys(answerNotInOptions).length > 0}
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
      </div>
    </div>
  )
}