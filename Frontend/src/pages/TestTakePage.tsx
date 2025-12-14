// tests/components/TestTakePage.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  GraduationCap, 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  CircleCheck, 
  Circle,
  Brain
} from 'lucide-react'
import { testsAPI } from '../services/api/'
import type { Test, SubmitTestFormData, ApiResponse, Question } from '@/types'

export function TestTakePage() {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const [test, setTest] = useState<Test | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [submitFormData, setSubmitFormData] = useState<SubmitTestFormData>({
    answers: {}
  })
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    loadTest()
  }, [testId])

  const loadTest = async () => {
    try {
      setIsLoading(true)
      if (!testId) {
        showMessage('Test ID is required', 'error')
        navigate('/tests')
        return
      }
      
      const response = await testsAPI.getById(parseInt(testId)) as ApiResponse<Test>
      
      if (response.success || response.data) {
        const testData = response.data || response.Test
        
        // Sort questions by questionId or maintain original order
        const sortedQuestions = [...(testData.questions || [])].sort((a, b) => {
          // Sort by questionId if available, otherwise maintain original order
          if (a.questionId && b.questionId) {
            return a.questionId - b.questionId
          }
          return 0
        })
        
        setTest({
          ...testData,
          questions: sortedQuestions
        })
      } else {
        showMessage(response.error || 'Failed to load test', 'error')
        navigate('/tests')
      }
    } catch (error: any) {
      showMessage(error.message || 'An error occurred', 'error')
      navigate('/tests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitTest = async () => {
    try {
      setIsSubmitting(true)
      if (!testId) return
      
      const response = await testsAPI.submitAnswers(parseInt(testId), submitFormData) as ApiResponse
      
      if (response.success || response.data || response.Message) {
        showMessage(response.message || response.Message || 'Test submitted successfully', 'success')
        
        // Show results if returned
        if (response.data || response.TestResult) {
          const result = response.data || response.TestResult
          setTimeout(() => {
            showMessage(`Test submitted! Score: ${result.score}/${result.totalQuestions} (${result.passed ? 'Passed' : 'Failed'})`, 'success')
          }, 100)
        }
        
        navigate('/tests')
      } else {
        showMessage(response.error || 'Failed to submit test', 'error')
      }
    } catch (error: any) {
      showMessage(error.message || 'An error occurred', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentQuestion = (): Question | null => {
    if (!test?.questions || test.questions.length === 0) return null
    // FIX: Use sorted questions in correct order
    return test.questions[currentQuestionIndex] || null
  }

  const handleAnswerChange = (questionId: number, answer: string) => {
    setSubmitFormData({
      ...submitFormData,
      answers: {
        ...submitFormData.answers,
        [questionId]: answer
      }
    })
  }

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleNextQuestion = () => {
    if (test?.questions && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!test) {
    return (
      <div className="container mx-auto py-12 text-center">
        <Brain className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Test not found</h3>
        <p className="text-muted-foreground">The test you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/tests')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tests
        </Button>
      </div>
    )
  }

  const currentQuestion = getCurrentQuestion()
  const totalQuestions = test.questions?.length || 0
  const answeredQuestions = Object.keys(submitFormData.answers).length
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/tests')} className="hover-scale transition-smooth">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tests
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Take Test</h1>
          <p className="text-muted-foreground">
            Test for: {test.material?.content?.text?.substring(0, 100) || test.material?.Content?.Text?.substring(0, 100) || 'No material'}...
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">Progress</h3>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>
            <Badge variant="outline" className="animate-pulse-slow">
              {answeredQuestions}/{totalQuestions} answered
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation */}
      {totalQuestions > 1 && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="hover-scale transition-smooth"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {test.questions?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-3 h-3 rounded-full transition-all hover:scale-125 ${
                  index === currentQuestionIndex 
                    ? 'bg-primary' 
                    : submitFormData.answers[test.questions![index].questionId!] 
                      ? 'bg-primary/50' 
                      : 'bg-muted'
                }`}
                title={`Question ${index + 1}`}
              />
            ))}
          </div>
          <Button 
            variant="outline" 
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className="hover-scale transition-smooth"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Current Question */}
      {currentQuestion ? (
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="shrink-0 animate-pulse-slow">
                Q{currentQuestionIndex + 1}
              </Badge>
              <div>
                <CardTitle className="text-lg">{currentQuestion.questionText}</CardTitle>
                <CardDescription className="mt-2">
                  Select the correct answer
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentQuestion.options && currentQuestion.options.length > 0 ? (
              <div className="space-y-3">
                {currentQuestion.options.map((option, optIndex) => {
                  const isSelected = submitFormData.answers[currentQuestion.questionId!] === option
                  return (
                    <div key={optIndex} className="group/option">
                      <input
                        type="radio"
                        id={`answer-${currentQuestion.questionId}-${optIndex}`}
                        name={`question-${currentQuestion.questionId}`}
                        value={option}
                        checked={isSelected}
                        onChange={(e) => handleAnswerChange(currentQuestion.questionId!, e.target.value)}
                        className="peer hidden"
                      />
                      <Label 
                        htmlFor={`answer-${currentQuestion.questionId}-${optIndex}`}
                        className={`
                          cursor-pointer block p-4 border rounded-lg transition-all duration-300
                          hover:scale-[1.02] hover:shadow-md
                          peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary
                          peer-checked:scale-[1.03]
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {isSelected ? (
                            <CircleCheck className="w-5 h-5 text-primary fill-current" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                          <span className="flex-1">{option}</span>
                        </div>
                      </Label>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor={`text-answer-${currentQuestionIndex}`}>Your Answer:</Label>
                <Input
                  id={`text-answer-${currentQuestionIndex}`}
                  value={submitFormData.answers[currentQuestion.questionId!] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.questionId!, e.target.value)}
                  placeholder="Enter your answer"
                  className="transition-all duration-300 focus:scale-[1.02] focus:shadow-md"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="py-8 text-center">
          <Brain className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No questions available</h3>
          <p className="text-muted-foreground">This test doesn't have any questions.</p>
        </Card>
      )}

      {/* Submit Button */}
      {totalQuestions > 0 && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmitTest}
            disabled={isSubmitting || answeredQuestions < totalQuestions}
            className="hover-scale transition-smooth group"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <GraduationCap className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                {isLastQuestion ? 'Submit Test' : 'Submit Test'}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}