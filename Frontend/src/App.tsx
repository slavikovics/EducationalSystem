// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { TestsPage } from './pages/TestsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { UsersPage } from './pages/UsersPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ViewMaterialPage } from './pages/ViewMaterialPage';
import { CreateMaterialPage } from './pages/CreateMaterialPage';
import { EditMaterialContentPage } from './pages/UpdateContentPage';
import { TestResultPage } from './pages/TestResultsPage';

// Configure QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="educational-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes (no authentication required) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes (authentication required) */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                // In App.tsx, add this route:
              <Route path="materials/:id" element={
  <ProtectedRoute>
    <ViewMaterialPage />
  </ProtectedRoute>
} />


                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="materials" element={<MaterialsPage />} />
                <Route path="tests" element={<TestsPage />} />
                <Route path="test-results" element={<TestResultPage />}/>
                <Route path="reviews" element={<ReviewsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                
                {/* Admin-only routes */}
                <Route path="users" element={
                  <ProtectedRoute requiredRole="Admin">
                    <UsersPage />
                  </ProtectedRoute>
                } />
                <Route path="admin" element={
                  <ProtectedRoute requiredRole="Admin">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
                      <p>Admin-specific features and settings.</p>
                    </div>
                  </ProtectedRoute>
                } />

                <Route path="materials/create" element={
                  <ProtectedRoute requiredRole="Tutor">
                    <CreateMaterialPage />
                  </ProtectedRoute>
                } />

                <Route path="/materials/:id/edit" element={
                  <ProtectedRoute requiredRole="Tutor">
                    <EditMaterialContentPage />
                  </ProtectedRoute>
                } />
                
                {/* Catch-all route for nested paths */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
              
              {/* Global 404 route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;