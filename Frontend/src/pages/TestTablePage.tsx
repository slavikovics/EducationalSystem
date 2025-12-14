// tests/components/TestsTablePage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Brain, 
  FileText, 
  Target, 
  BookOpen, 
  Award, 
  Clock, 
  Eye, 
  GraduationCap, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw, 
  Sparkles,
  Plus
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { testsAPI, materialsAPI } from '../services/api/'
import type { Test, Material, ApiResponse } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface TestsTablePageProps {
  onViewTest?: (test: Test) => void
  onTakeTest?: (test: Test) => void
  onCreateTest?: () => void
}

export function TestsTablePage({ onViewTest, onTakeTest, onCreateTest }: TestsTablePageProps) {
  const navigate = useNavigate()
  const [tests, setTests] = useState<Test[]>([])
  const [filteredTests, setFilteredTests] = useState<Test[]>([])
  const [selectedTest, setSelectedTest] = useState<Test | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [materialIdFilter, setMaterialIdFilter] = useState<number | 'all'>('all')
  const [materials, setMaterials] = useState<Material[]>([])
  const [animateHeader, setAnimateHeader] = useState(false)
  const [animateFilters, setAnimateFilters] = useState(false)
  const [animateTable, setAnimateTable] = useState(false)
  const [hoveredTest, setHoveredTest] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const { user } = useAuth()
  const isAdminOrTutor = user.role === 'Admin' || user.role === 'Tutor'

  // Load tests and materials
  useEffect(() => {
    loadTests()
    loadMaterials()
  }, [])

  useEffect(() => {
    setTimeout(() => setAnimateHeader(true), 200)
    setTimeout(() => setAnimateFilters(true), 400)
    setTimeout(() => setAnimateTable(true), 600)
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = tests

    if (searchTerm) {
      filtered = filtered.filter(test => {
        const materialText = test.material?.content?.text || 
                            test.material?.Content?.Text || 
                            ''
        return materialText.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    if (materialIdFilter !== 'all') {
      filtered = filtered.filter(test => test.materialId === materialIdFilter)
    }

    setFilteredTests(filtered)
  }, [tests, searchTerm, materialIdFilter])

  const loadTests = async () => {
    try {
      setIsLoading(true)
      const response = await testsAPI.getAll() as ApiResponse<Test[]>
      
      if (response.success || response.data) {
        const testsData = response.data || response.Test || []
        setTests(Array.isArray(testsData) ? testsData : [testsData])
      } else {
        showMessage(response.error || 'Failed to load tests', 'error')
      }
    } catch (error: any) {
      showMessage(error.message || 'An error occurred', 'error')
    } finally {
      setIsLoading(false)
    }
  }

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
    }
  }

  const handleDeleteTest = async (id: number) => {
    try {
      const response = await testsAPI.delete(id) as ApiResponse
      
      if (response.success || response.Message) {
        showMessage(response.message || response.Message || 'Test deleted successfully', 'success')
        setDeleteDialogOpen(false)
        loadTests()
      } else {
        showMessage(response.error || 'Failed to delete test', 'error')
      }
    } catch (error: any) {
      showMessage(error.message || 'An error occurred', 'error')
    }
  }

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
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

  const handleTakeTest = (test: Test) => {
    if (onTakeTest) {
      onTakeTest(test)
    } else {
      navigate(`/tests/take/${test.testId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 animate-fade-in">
        {/* Loading skeletons */}
        <div className={`flex items-center justify-between transform transition-all duration-700 ${animateHeader ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 animate-pulse" />
            <Skeleton className="h-4 w-64 animate-pulse animation-delay-200" />
          </div>
          <Skeleton className="h-10 w-32 animate-pulse animation-delay-400" />
        </div>

        <Card className={`transform transition-all duration-700 ${animateFilters ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1 animate-pulse animation-delay-300" />
              <Skeleton className="h-10 w-48 animate-pulse animation-delay-400" />
              <Skeleton className="h-10 w-10 animate-pulse animation-delay-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={`transform transition-all duration-700 ${animateTable ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <CardHeader>
            <Skeleton className="h-6 w-32 animate-pulse animation-delay-400" />
            <Skeleton className="h-4 w-48 animate-pulse animation-delay-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
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
      <div className={`flex items-center justify-between transform transition-all duration-700 ${animateHeader ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 animate-pulse-slow">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight animate-slide-in-right">
              Knowledge Tests
            </h1>
          </div>
          <p className="text-muted-foreground animate-fade-in animation-delay-300">
            Browse and take available knowledge assessments
          </p>
        </div>
        {isAdminOrTutor && (
          <Button 
            onClick={onCreateTest || (() => navigate('/tests/create'))}
            className="hover-scale transition-smooth group animate-fade-in animation-delay-400"
          >
            <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
            Create Test
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className={`transform transition-all duration-700 hover:shadow-xl transition-all duration-300 ${animateFilters ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
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
            </div>
            <Select value={materialIdFilter.toString()} onValueChange={(value) => setMaterialIdFilter(value === 'all' ? 'all' : parseInt(value))}>
              <SelectTrigger className="w-[200px] hover-scale transition-smooth group">
                <SelectValue placeholder="Filter by material" />
                <Filter className="h-4 w-4 ml-2 text-muted-foreground group-hover:text-primary transition-colors" />
              </SelectTrigger>
              <SelectContent className="animate-scale-in">
                <SelectItem value="all" className="hover-scale transition-smooth">All Materials</SelectItem>
                {materials.map((material, index) => (
                  <SelectItem 
                    key={material.materialId} 
                    value={material.materialId.toString()}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {material.content.text.substring(0, 30)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} className="shrink-0 hover-scale transition-smooth group">
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
      <Card className={`transform transition-all duration-700 hover:shadow-xl transition-all duration-300 ${animateTable ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Available Tests
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
          <Table className='overflow-hidden'>
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
                    className={`hover:bg-muted/50 transition-all duration-300 group ${hoveredTest === test.testId ? 'bg-muted/30 scale-[1.01]' : ''} animate-fade-in`}
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
                        {test.material?.content?.text?.substring(0, 50) || test.material?.Content?.Text?.substring(0, 50) || 'No material content'}...
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
                      <Badge variant="outline" className={`${difficulty.color} hover:scale-105 transition-transform`}>
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
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleTakeTest(test)} className="hover-scale transition-smooth" title="Take Test">
                          <GraduationCap className="h-4 w-4" />
                        </Button>
                        {isAdminOrTutor && (
                          <Button variant="destructive" size="sm" onClick={() => { setSelectedTest(test); setDeleteDialogOpen(true) }} className="hover-scale transition-smooth" title="Delete Test">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Test
            </AlertDialogTitle>
            <AlertDialogDescription className="animate-fade-in animation-delay-200">
              This action cannot be undone. This will permanently delete the test
              for material: "{selectedTest?.material?.content?.text?.substring(0, 50) || selectedTest?.material?.Content?.Text?.substring(0, 50) || 'No material'}..."
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="animate-fade-in animation-delay-400">
            <AlertDialogCancel className="hover-scale transition-smooth">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedTest && handleDeleteTest(selectedTest.testId!)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 hover-scale transition-smooth">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}