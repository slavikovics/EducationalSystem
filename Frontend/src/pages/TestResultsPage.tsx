// tests/components/TestResultPage.tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { 
  X, 
  RefreshCw,
  Sparkles,
  Award,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Target,
  Brain,
  Search,
  Filter,
  Eye,
  Trophy,
  Calendar,
  Percent
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { testsAPI } from '../services/api/'
import type { TestResult, ApiResponse } from '@/types'

export function TestResultPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([])
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [testFilter, setTestFilter] = useState<number | 'all'>('all')
  const [userFilter, setUserFilter] = useState<number | 'all'>('all')
  const [animateHeader, setAnimateHeader] = useState(false)
  const [animateFilters, setAnimateFilters] = useState(false)
  const [animateTable, setAnimateTable] = useState(false)
  const [hoveredResult, setHoveredResult] = useState<number | null>(null)
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  
  // Messages
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [errorDetails, setErrorDetails] = useState<Record<string, string[]> | null>(null)

  // Load test results
  useEffect(() => {
    loadTestResults()
  }, [])

  useEffect(() => {
    // Stagger animations
    setTimeout(() => setAnimateHeader(true), 200)
    setTimeout(() => setAnimateFilters(true), 400)
    setTimeout(() => setAnimateTable(true), 600)
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = testResults

    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.test?.material?.Content?.Text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (testFilter !== 'all') {
      filtered = filtered.filter(result => result.testId === testFilter)
    }

    if (userFilter !== 'all') {
      filtered = filtered.filter(result => result.userId === userFilter)
    }

    setFilteredResults(filtered)
  }, [testResults, searchTerm, testFilter, userFilter])

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

  const loadTestResults = async () => {
    try {
      setIsLoading(true)
      clearErrors()
      const response = await testsAPI.getResults() as ApiResponse<TestResult[]>
      
      if (response.success || response.data) {
        const resultsData = response.data || response.TestResults || []
        setTestResults(Array.isArray(resultsData) ? resultsData : [resultsData])
      } else {
        showError(response.error || 'Failed to load test results')
      }
    } catch (error: any) {
      showError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadResultDetails = async (id: number) => {
    try {
      clearErrors()
      const response = await testsAPI.getResultById(id) as ApiResponse<TestResult>
      
      if (response.success || response.data) {
        const resultData = response.data || response.TestResult
        setSelectedResult(resultData)
        return resultData
      } else {
        showError(response.error || 'Failed to load test result details')
      }
    } catch (error: any) {
      showError(error)
    }
    return null
  }

  const handleViewResult = async (result: TestResult) => {
    const details = await loadResultDetails(result.testResultId)
    if (details) {
      setSelectedResult(details)
      setViewDialogOpen(true)
    }
  }

  const handleRefresh = async () => {
    await loadTestResults()
    showMessage('Test results refreshed!', 'success')
  }

  const getPerformanceBadge = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Excellent', icon: Trophy }
    if (percentage >= 60) return { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Good', icon: TrendingUp }
    if (percentage >= 40) return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Average', icon: BarChart3 }
    return { color: 'bg-red-100 text-red-800 border-red-200', text: 'Needs Improvement', icon: TrendingDown }
  }

  const getUniqueTests = () => {
    const testMap = new Map()
    testResults.forEach(result => {
      if (result.testId && !testMap.has(result.testId)) {
        testMap.set(result.testId, {
          id: result.testId,
          name: result.test?.material?.Content?.Text?.substring(0, 30) || `Test #${result.testId}`
        })
      }
    })
    return Array.from(testMap.values())
  }

  const getUniqueUsers = () => {
    const userMap = new Map()
    testResults.forEach(result => {
      if (result.userId && !userMap.has(result.userId)) {
        userMap.set(result.userId, {
          id: result.userId,
          name: result.user?.name || `User #${result.userId}`
        })
      }
    })
    return Array.from(userMap.values())
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
              <Skeleton className="h-10 w-48 animate-pulse animation-delay-400" />
              <Skeleton className="h-10 w-10 animate-pulse animation-delay-500" />
            </div>
          </CardContent>
        </Card>

        {/* Animated Loading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

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
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight animate-slide-in-right">
              Test Results
            </h1>
          </div>
          <p className="text-muted-foreground animate-fade-in animation-delay-300">
            View performance analytics and assessment results
          </p>
        </div>
        <Button 
          onClick={handleRefresh}
          className="hover-scale transition-smooth group animate-fade-in animation-delay-400"
        >
          <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
          Refresh
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
                placeholder="Search by material, user name, or email..."
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
              value={testFilter.toString()}
              onValueChange={(value) => 
                setTestFilter(value === 'all' ? 'all' : parseInt(value))
              }
            >
              <SelectTrigger className="w-[200px] hover-scale transition-smooth group">
                <SelectValue placeholder="Filter by test" />
                <FileText className="h-4 w-4 ml-2 text-muted-foreground group-hover:text-primary transition-colors" />
              </SelectTrigger>
              <SelectContent className="animate-scale-in">
                <SelectItem value="all" className="hover-scale transition-smooth">All Tests</SelectItem>
                {getUniqueTests().map((test, index) => (
                  <SelectItem 
                    key={test.id} 
                    value={test.id.toString()}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {test.name}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={userFilter.toString()}
              onValueChange={(value) => 
                setUserFilter(value === 'all' ? 'all' : parseInt(value))
              }
            >
              <SelectTrigger className="w-[200px] hover-scale transition-smooth group">
                <SelectValue placeholder="Filter by user" />
                <User className="h-4 w-4 ml-2 text-muted-foreground group-hover:text-primary transition-colors" />
              </SelectTrigger>
              <SelectContent className="animate-scale-in">
                <SelectItem value="all" className="hover-scale transition-smooth">All Users</SelectItem>
                {getUniqueUsers().map((user, index) => (
                  <SelectItem 
                    key={user.id} 
                    value={user.id.toString()}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {user.name}
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
                <div className="text-2xl font-bold animate-count-up">{filteredResults.length}</div>
                <p className="text-sm text-muted-foreground">Total Results</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold animate-count-up animation-delay-200">
                  {testResults.reduce((acc, result) => acc + result.score, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Total Points</p>
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
                <div className="text-2xl font-bold animate-count-up animation-delay-400">
                  {testResults.length > 0 
                    ? Math.round(testResults.reduce((acc, result) => acc + (result.score / result.totalQuestions * 100), 0) / testResults.length)
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 group-hover:scale-110 transition-transform">
                <Percent className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold animate-count-up animation-delay-600">
                  {getUniqueTests().length}
                </div>
                <p className="text-sm text-muted-foreground">Unique Tests</p>
              </div>
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-50 group-hover:scale-110 transition-transform">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results Table */}
      <Card className={`
        transform transition-all duration-700
        ${animateTable ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        hover:shadow-xl transition-all duration-300
      `}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Assessment Results
          </CardTitle>
          <CardDescription className="animate-fade-in">
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found • 
            <span className="ml-2 inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-yellow-500 animate-spin-slow" />
              Performance analytics
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden">
            <Table className='overflow-hidden'>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Result ID</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result, index) => {
                  const performance = getPerformanceBadge(result.score, result.totalQuestions)
                  const PerformanceIcon = performance.icon
                  const percentage = Math.round((result.score / result.totalQuestions) * 100)
                  
                  return (
                    <TableRow 
                      key={result.testResultId}
                      className={`
                        hover:bg-muted/50 transition-all duration-300 group
                        ${hoveredResult === result.testResultId ? 'bg-muted/30 scale-[1.01]' : ''}
                        animate-fade-in
                      `}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onMouseEnter={() => setHoveredResult(result.testResultId)}
                      onMouseLeave={() => setHoveredResult(null)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-gradient-to-br from-primary/10 to-secondary/10">
                            <BarChart3 className="h-3 w-3 text-primary" />
                          </div>
                          #{result.testResultId}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate group-hover:text-primary transition-colors">
                          {result.test?.material?.Content?.Text?.substring(0, 50) || 
                           result.test?.material?.content?.text?.substring(0, 50) || 
                           `Test #${result.testId}`}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-full bg-muted">
                            <User className="h-3 w-3" />
                          </div>
                          <span>{result.user?.name || `User #${result.userId}`}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {result.score}/{result.totalQuestions}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {percentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${performance.color} hover:scale-105 transition-transform flex items-center gap-1`}
                        >
                          <PerformanceIcon className="h-3 w-3" />
                          {performance.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(result.submittedAt).toLocaleDateString()}
                          <span className="text-xs">
                            {new Date(result.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewResult(result)}
                            className="hover-scale transition-smooth"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Result Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl animate-scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 animate-fade-in">
              <Eye className="h-5 w-5 text-primary" />
              Test Result Details
            </DialogTitle>
            <DialogDescription className="animate-fade-in animation-delay-200">
              Result ID: #{selectedResult?.testResultId}
            </DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-6 animate-fade-in animation-delay-300">
              {/* Result Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 hover:shadow-lg transition-all duration-300">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="h-4 w-4" />
                      User
                    </Label>
                    <p className="font-medium">
                      {selectedResult.user?.name || `User #${selectedResult.userId}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedResult.user?.email || 'No email available'}
                    </p>
                  </div>
                </Card>
                
                <Card className="p-4 hover:shadow-lg transition-all duration-300">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Test
                    </Label>
                    <p className="font-medium">
                      {selectedResult.test?.material?.Content?.Text?.substring(0, 50) || 
                       selectedResult.test?.material?.content?.text?.substring(0, 50) || 
                       `Test #${selectedResult.testId}`}...
                    </p>
                  </div>
                </Card>
                
                <Card className="p-4 hover:shadow-lg transition-all duration-300">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Submitted
                    </Label>
                    <p className="font-medium">
                      {new Date(selectedResult.submittedAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedResult.submittedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </Card>
              </div>
              
              {/* Score Card */}
              <Card className="p-6 bg-gradient-to-r from-muted/50 to-background hover:scale-[1.01] transition-transform">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      Test Score
                    </h4>
                    <div className="text-4xl font-bold">
                      {selectedResult.score}/{selectedResult.totalQuestions}
                    </div>
                    <div className="text-2xl font-semibold">
                      {Math.round((selectedResult.score / selectedResult.totalQuestions) * 100)}%
                    </div>
                  </div>
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-muted stroke-current"
                        strokeWidth="10"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-primary stroke-current"
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                        strokeDasharray={`${(selectedResult.score / selectedResult.totalQuestions) * 251.2} 251.2`}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">
                        {Math.round((selectedResult.score / selectedResult.totalQuestions) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* User Answers */}
              {selectedResult.test?.questions && selectedResult.test.questions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Question Analysis
                  </h4>
                  {selectedResult.test.questions.map((question, index) => {
                    const userAnswer = selectedResult.userAnswers[question.questionId!]
                    const isCorrect = userAnswer === question.answerText
                    
                    return (
                      <Card 
                        key={question.questionId || index} 
                        className="p-4 hover:shadow-lg transition-all duration-300 animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="space-y-3">
                          <p className="font-medium">Q{index + 1}: {question.questionText}</p>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {question.options?.map((option, optIndex) => {
                              const isUserAnswer = option === userAnswer
                              const isCorrectAnswer = option === question.answerText
                              
                              return (
                                <div 
                                  key={optIndex}
                                  className={`p-2 rounded border transition-all duration-300 ${
                                    isUserAnswer && isCorrectAnswer 
                                      ? 'bg-green-50 border-green-200 text-green-700 scale-[1.02]' 
                                      : isUserAnswer 
                                        ? 'bg-red-50 border-red-200 text-red-700 scale-[1.02]'
                                        : isCorrectAnswer
                                          ? 'bg-green-50 border-green-200 text-green-700'
                                          : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {isCorrectAnswer && (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    )}
                                    {isUserAnswer && !isCorrectAnswer && (
                                      <AlertCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span>{option}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          
                          <div className="pt-2 border-t">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium flex items-center gap-1">
                                {isCorrect ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Correct Answer:
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    Your Answer:
                                  </>
                                )}
                              </span> 
                              <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                                {userAnswer || 'Not answered'}
                              </span>
                              {!isCorrect && question.answerText && (
                                <>
                                  <span className="text-muted-foreground">• Correct:</span>
                                  <span className="text-green-700">{question.answerText}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}