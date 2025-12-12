// src/components/Layout/MainLayout.tsx
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../theme-toggle';
import { 
  Home, 
  BookOpen, 
  FileText, 
  Star, 
  Users,
  LogOut,
  User,
  Menu,
  X,
  Settings,
  ClipboardCheck,
  GraduationCap
} from 'lucide-react';
import { Button } from '../ui/button';

export const MainLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if a path is active (including nested paths)
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // Base navigation items
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['User', 'Tutor', 'Admin'] },
    { name: 'Materials', href: '/materials', icon: BookOpen, roles: ['User', 'Tutor', 'Admin'] },
    { name: 'Tests', href: '/tests', icon: FileText, roles: ['User', 'Tutor', 'Admin'] },
    { name: 'Reviews', href: '/reviews', icon: Star, roles: ['User', 'Tutor', 'Admin'] },
    { name: 'Profile', href: '/profile', icon: User, roles: ['User', 'Tutor', 'Admin'] },
  ];

  // Admin-only navigation items
  const adminNavigation = [
    { name: 'Users', href: '/users', icon: Users, roles: ['Admin'] },
    { name: 'Admin Panel', href: '/admin', icon: Settings, roles: ['Admin'] },
  ];

  // Tutor-only navigation items
  const tutorNavigation = [
    { name: 'Tutor Dashboard', href: '/tutor', icon: GraduationCap, roles: ['Tutor', 'Admin'] },
    { name: 'Test Results', href: '/test-results', icon: ClipboardCheck, roles: ['Tutor', 'Admin'] },
  ];

  // Combine navigation based on user role
  const getNavigation = () => {
    const userRole = user?.role || user?.userType || 'User';
    
    return [
      ...navigation.filter(item => item.roles.includes(userRole)),
      ...(userRole === 'Admin' || userRole === 'Tutor' ? tutorNavigation.filter(item => item.roles.includes(userRole)) : []),
      ...(userRole === 'Admin' ? adminNavigation : []),
    ];
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't render until auth is loaded
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentNavigation = getNavigation();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-1 border-r bg-card">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary text-primary-foreground">
            <BookOpen className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold">EduSystem</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="flex-1 px-2 space-y-1">
              {currentNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">
                  {user?.role || user?.userType || 'User'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="fixed inset-y-0 left-0 flex max-w-xs w-full bg-card">
            <div className="flex flex-col flex-1 w-64">
              <div className="flex items-center h-16 px-4 bg-primary text-primary-foreground">
                <BookOpen className="h-8 w-8 mr-2" />
                <span className="text-xl font-bold">EduSystem</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="ml-auto"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex-1 px-2 py-4 space-y-1">
                {currentNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <Icon className="mr-4 h-6 w-6" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate capitalize">
                      {user?.role || user?.userType || 'User'}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center space-x-2">
                    <ThemeToggle />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className="h-8 w-8"
                      title="Logout"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-card border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="-ml-0.5 -mt-0.5 h-12 w-12"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="inline-flex ml-2">
            <span className="text-lg font-semibold">EduSystem</span>
          </div>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};