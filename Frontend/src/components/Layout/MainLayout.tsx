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
  GraduationCap,
  ChevronRight,
  ChevronDown,
  School
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
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../ui/accordion';
import { Separator } from '../ui/separator';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '../ui/navigation-menu';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';

export const MainLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  const currentNavigation = getNavigation();
  const userRole = user?.role || user?.userType || 'User';
  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <School className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">EduSystem</h1>
              <p className="text-xs text-muted-foreground">Educational Platform</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <div className="text-xs font-semibold leading-6 text-muted-foreground uppercase tracking-wider">
                  Navigation
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {currentNavigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`
                            group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-medium transition-colors
                            ${active 
                              ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                              : 'text-muted-foreground hover:text-primary hover:bg-accent'
                            }
                          `}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              
              {/* Profile Section */}
              <li className="mt-auto">
                <Separator className="my-4" />
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate capitalize">
                      {userRole} Account
                    </p>
                  </div>
                  <DropdownMenu>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Settings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-background/95 backdrop-blur px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                  <School className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <SheetTitle className="text-lg font-bold">EduSystem</SheetTitle>
                  <p className="text-xs text-muted-foreground">Educational Platform</p>
                </div>
              </div>
            </SheetHeader>
            
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="p-6">
                {/* User Info */}
                <div className="flex items-center gap-3 pb-6">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{user?.name}</p>
                    <p className="text-sm text-muted-foreground truncate capitalize">{userRole}</p>
                  </div>
                  <ThemeToggle />
                </div>

                <Separator className="my-4" />

                {/* Navigation */}
                <nav className="space-y-1">
                  {currentNavigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <SheetClose asChild key={item.name}>
                        <Link
                          to={item.href}
                          className={`
                            flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                            ${active 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-muted-foreground hover:text-primary hover:bg-accent'
                            }
                          `}
                        >
                          <Icon className="h-5 w-5" />
                          {item.name}
                          {active && <ChevronRight className="ml-auto h-4 w-4" />}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>

                <Separator className="my-6" />

                {/* Account Actions */}
                <div className="space-y-2">
                  <SheetClose asChild>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent"
                    >
                      <User className="h-5 w-5" />
                      Profile Settings
                    </Link>
                  </SheetClose>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Log out
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <div className="flex-1">
          <h1 className="text-lg font-semibold">EduSystem</h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {userRole}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
};