// src/components/Layout/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  GraduationCap,
  ChevronRight,
  ChevronDown,
  School,
  Sun,
  Moon,
  Sparkles,
  Activity,
  Zap,
  Bell,
  Search,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '../ui/sheet';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export const MainLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeHover, setActiveHover] = useState<string | null>(null);

  // Check scroll position for header animation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // Navigation items
  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['User', 'Tutor', 'Admin'] },
    { name: 'Materials', href: '/materials', icon: BookOpen, roles: ['User', 'Tutor', 'Admin'] },
    { name: 'Tests', href: '/tests', icon: FileText, roles: ['User', 'Tutor', 'Admin'] },
    { name: 'Reviews', href: '/reviews', icon: Star, roles: ['User', 'Tutor', 'Admin'] },
  ];

  const adminNavigation = [
    { name: 'User Management', href: '/users', icon: Users, roles: ['Admin'] },
    { name: 'System Settings', href: '/admin', icon: Settings, roles: ['Admin'] },
  ];

  const tutorNavigation = [
    { name: 'Test Results', href: '/test-results', icon: ClipboardCheck, roles: ['Tutor', 'Admin'] },
  ];

  const getNavigation = () => {
    const userRole = user?.role || user?.userType || 'User';
    
    return [
      ...mainNavigation.filter(item => item.roles.includes(userRole)),
      ...(userRole === 'Admin' || userRole === 'Tutor' ? tutorNavigation.filter(item => item.roles.includes(userRole)) : []),
      ...(userRole === 'Admin' ? adminNavigation : []),
    ];
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <Skeleton className="h-12 w-12 rounded-full animate-pulse-slow" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary animate-pulse" />
          </div>
          <Skeleton className="h-4 w-32 animate-pulse-slow animation-delay-100" />
          <Skeleton className="h-4 w-24 animate-pulse-slow animation-delay-200" />
        </motion.div>
      </div>
    );
  }

  const currentNavigation = getNavigation();
  const userRole = user?.role || user?.userType || 'User';
  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <motion.div 
        className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 pb-4">
          {/* Logo */}
          <motion.div 
            className="flex h-16 shrink-0 items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg"
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <School className="h-6 w-6 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight animate-gradient-text">EduSystem</h1>
              <motion.p 
                className="text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Educational Platform
              </motion.p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <motion.li
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-xs font-semibold leading-6 text-muted-foreground uppercase tracking-wider animate-fade-in">
                  Navigation
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {currentNavigation.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <motion.li 
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + (index * 0.1) }}
                      >
                        <Link
                          to={item.href}
                          onMouseEnter={() => setActiveHover(item.name)}
                          onMouseLeave={() => setActiveHover(null)}
                          className={cn(
                            "group relative flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-medium transition-all duration-300 hover-lift",
                            active 
                              ? 'bg-primary/10 text-primary shadow-sm' 
                              : 'text-muted-foreground hover:text-primary hover:bg-accent/50'
                          )}
                        >

                          <Icon className="h-5 w-5 shrink-0" />
                          {item.name}
                          
                          {activeHover === item.name && !active && (
                            <motion.div
                              className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 to-transparent rounded-lg"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            />
                          )}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.li>
              
              {/* Profile Section */}
              <motion.li 
                className="mt-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Separator className="my-4" />
                <motion.div 
                  className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 rounded-lg hover:bg-accent/50 transition-all duration-300 hover-lift"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <Avatar className="ring-2 ring-primary/20 ring-offset-2">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate animate-fade-in">
                      {user?.name}
                    </p>
                    <motion.p 
                      className="text-xs text-muted-foreground truncate capitalize"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {userRole} Account
                    </motion.p>
                  </div>
                  <div className="flex items-center gap-1">

                    <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Settings</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DropdownMenuContent 
                        align="end" 
                        className="w-56 animate-scale-in"
                        onCloseAutoFocus={(e) => e.preventDefault()}
                      >
                        <DropdownMenuLabel>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user?.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                            </div>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/profile')}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={handleLogout} 
                          className="text-destructive focus:text-destructive"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              </motion.li>
            </ul>
          </nav>
        </div>
      </motion.div>

      {/* Mobile Navigation */}
      <motion.div 
        className={cn(
          "sticky top-0 z-40 flex items-center gap-x-6 px-4 py-4 shadow-sm transition-all duration-300",
          isScrolled 
            ? "bg-background/95 backdrop-blur border-b" 
            : "bg-background/80 backdrop-blur-sm"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </motion.div>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-72 p-0 overflow-hidden"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <SheetHeader className="p-6 border-b">
              <motion.div 
                className="flex items-center gap-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div 
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <School className="h-6 w-6 text-primary-foreground" />
                </motion.div>
                <div>
                  <SheetTitle className="text-lg font-bold animate-gradient-text">EduSystem</SheetTitle>
                  <p className="text-xs text-muted-foreground">Educational Platform</p>
                </div>
              </motion.div>
            </SheetHeader>
            
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="p-6">
                {/* User Info */}
                <motion.div 
                  className="flex items-center gap-3 pb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Avatar className="ring-2 ring-primary/20 ring-offset-2">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{user?.name}</p>
                    <p className="text-sm text-muted-foreground truncate capitalize">{userRole}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={toggleTheme}
                    >
                      {theme === 'dark' ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                    </Button>
                  </motion.div>
                </motion.div>

                <Separator className="my-4" />

                {/* Navigation */}
                <nav className="space-y-1">
                  {currentNavigation.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <SheetClose asChild key={item.name}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + (index * 0.1) }}
                        >
                          <Link
                            to={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 hover-lift",
                              active 
                                ? 'bg-primary/10 text-primary shadow-sm' 
                                : 'text-muted-foreground hover:text-primary hover:bg-accent/50'
                            )}
                          >

                            <Icon className="h-5 w-5" />
                            {item.name}
                            {active && (
                              <motion.div
                                className="ml-auto"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </motion.div>
                            )}
                          </Link>
                        </motion.div>
                      </SheetClose>
                    );
                  })}
                </nav>

                <Separator className="my-6" />

                {/* Account Actions */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <SheetClose asChild>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent/50 transition-all duration-300 hover-lift"
                    >
                      <User className="h-5 w-5" />
                      Profile Settings
                    </Link>
                  </SheetClose>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 hover-lift transition-all duration-300"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Log out
                  </Button>
                </motion.div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <motion.div 
          className="flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-lg font-semibold animate-gradient-text">EduSystem</h1>
        </motion.div>

        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
          
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="lg:pl-72">
        <motion.main 
          className="py-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
};