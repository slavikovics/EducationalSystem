// src/pages/DashboardPage.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { materialsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  FileText,
  Star,
  Users,
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
  Clock,
  CheckCircle,
  FileCheck,
  BookMarked,
  Lightbulb,
  Target,
  Zap,
  Brain,
  Rocket,
  Sparkles
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Fetch materials data
  const { data: materialsResponse, isLoading: materialsLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: () => materialsAPI.getAllMaterials(),
  });

  // Mock data for other sections (since we don't have endpoints for tests and reviews yet)
  const mockTests = { data: [] };
  const mockReviews = { data: [] };
  const mockActivities = [
    {
      user: 'Alex Johnson',
      action: 'created a new learning material',
      time: '2 hours ago',
      type: 'material',
      avatar: 'AJ',
    },
    {
      user: 'Maria Garcia',
      action: 'completed a science module',
      time: '4 hours ago',
      type: 'completion',
      avatar: 'MG',
    },
    {
      user: 'Dr. Chen',
      action: 'added new course content',
      time: '1 day ago',
      type: 'content',
      avatar: 'DC',
    },
  ];

  const materials = materialsResponse?.data || [];
  const tests = mockTests.data || [];
  const reviews = mockReviews.data || [];

  const stats = [
    {
      name: 'Learning Materials',
      value: materials.length || 0,
      icon: BookOpen,
      description: 'Available resources',
      color: 'from-blue-500 to-blue-600',
      badge: 'Updated daily',
    },
    {
      name: 'Active Students',
      value: user?.role === 'Tutor' ? '24' : '156+',
      icon: Users,
      description: 'Currently learning',
      color: 'from-green-500 to-green-600',
      badge: 'Growing',
    },
    {
      name: 'Completion Rate',
      value: user?.role === 'Tutor' ? '89%' : '92%',
      icon: TrendingUp,
      description: 'Average success',
      color: 'from-purple-500 to-purple-600',
      badge: 'Excellent',
    },
    {
      name: 'Learning Streak',
      value: '7 days',
      icon: Zap,
      description: 'Consistent progress',
      color: 'from-orange-500 to-orange-600',
      badge: 'Active',
    },
  ];

  const quickActions = [
    {
      title: 'Browse Materials',
      description: 'Explore learning resources',
      icon: BookOpen,
      href: '/materials',
      color: 'border-blue-200 bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Create Content',
      description: 'Add new learning material',
      icon: FileText,
      href: user?.role === 'Tutor' ? '/materials/create' : '/materials',
      color: 'border-green-200 bg-green-50',
      iconColor: 'text-green-600',
      badge: user?.role === 'Tutor' ? 'Tutor Only' : undefined,
    },
    {
      title: 'Track Progress',
      description: 'View learning analytics',
      icon: BarChart3,
      href: '/dashboard',
      color: 'border-purple-200 bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Upcoming Tests',
      description: 'Prepare for assessments',
      icon: FileCheck,
      href: '/tests',
      color: 'border-amber-200 bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  const learningTips = [
    {
      title: 'Consistency is Key',
      description: 'Study 30 minutes daily for better retention',
      icon: Clock,
    },
    {
      title: 'Active Recall',
      description: 'Test yourself regularly to strengthen memory',
      icon: Brain,
    },
    {
      title: 'Set Clear Goals',
      description: 'Define what you want to achieve each week',
      icon: Target,
    },
  ];

  if (materialsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="text-xs">
              {user?.role || 'Learner'}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-primary">{user?.name}</span>!
          </h1>
          <p className="text-muted-foreground mt-2">
            Your learning journey continues. Here's your current progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {stat.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Start learning or contribute to the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className={`h-auto p-4 justify-start border-2 ${action.color} hover:border-primary transition-all`}
                    onClick={() => window.location.href = action.href}
                  >
                    <div className={`p-2 rounded-lg ${action.color.replace('border', 'bg').replace('200', '100')} mr-3`}>
                      <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                      {action.badge && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from the learning community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {activity.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        <span className="text-foreground">{activity.user}</span>{' '}
                        <span className="text-muted-foreground">{activity.action}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full">
                View all activity
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column - Progress & Tips */}
        <div className="space-y-6">
          {/* Learning Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>Your current learning journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Course Completion</span>
                  <span className="text-sm font-bold text-primary">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Material Engagement</span>
                  <span className="text-sm font-bold text-green-600">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Learning Consistency</span>
                  <span className="text-sm font-bold text-amber-600">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                <Target className="mr-2 h-4 w-4" />
                Set Learning Goals
              </Button>
            </CardFooter>
          </Card>

          {/* Learning Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Tips</CardTitle>
              <CardDescription>Strategies for success</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {learningTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="p-2 rounded-full bg-primary/10 mt-0.5">
                    <tip.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tip.title}</p>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Featured Material */}
          {materials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Featured Material</CardTitle>
                <CardDescription>Top learning resource this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <BookMarked className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Introduction to Modern Science</p>
                      <p className="text-sm text-muted-foreground">By Dr. Anderson</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Completed by 124 students</span>
                    </div>
                    <Badge variant="secondary">Science</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="sm" className="w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Start Learning
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {/* Platform Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
          <CardDescription>EduSystem at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">150+</div>
              <p className="text-sm text-muted-foreground">Learning Materials</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">89%</div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">24/7</div>
              <p className="text-sm text-muted-foreground">Platform Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">4.8</div>
              <p className="text-sm text-muted-foreground">User Rating</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Always improving your learning experience
              </span>
            </div>
            <Button variant="ghost" size="sm">
              <Lightbulb className="mr-2 h-4 w-4" />
              Give Feedback
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};