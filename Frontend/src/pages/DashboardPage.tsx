// src/pages/DashboardPage.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  GraduationCap,
  Sparkles,
  Brain,
  Target,
  Zap,
  Shield,
  Globe,
  Heart,
  Lightbulb,
  Rocket,
  Star,
  Award,
  ArrowRight,
  ChevronRight,
  Clock,
  BarChart3,
  FileText,
  Calendar,
  CheckCircle,
  TrendingUp,
  Eye,
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
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: "Interactive Learning",
      description: "Engage with multimedia content including videos, images, and interactive exercises.",
      icon: Brain,
      color: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-600",
      badge: "New",
    },
    {
      title: "Expert-Curated Content",
      description: "All materials are created and reviewed by qualified educators and subject experts.",
      icon: GraduationCap,
      color: "from-purple-500 to-pink-500",
      iconColor: "text-purple-600",
      badge: "Verified",
    },
    {
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics and milestone achievements.",
      icon: Target,
      color: "from-green-500 to-emerald-500",
      iconColor: "text-green-600",
      badge: "Beta",
    },
    {
      title: "Collaborative Learning",
      description: "Share insights, discuss topics, and learn together with peers and mentors.",
      icon: Users,
      color: "from-orange-500 to-amber-500",
      iconColor: "text-orange-600",
      badge: "Community",
    },
  ];

  const quickStartCards = [
    {
      title: "Explore Materials",
      description: "Browse our library of educational resources",
      icon: BookOpen,
      action: "Browse Library",
      href: "/materials",
      gradient: "from-blue-400 to-blue-600",
    },
    {
      title: "Start Learning",
      description: "Begin with our recommended learning paths",
      icon: Brain,
      action: "View Paths",
      href: "/tests",
      gradient: "from-purple-400 to-purple-600",
    },
    {
      title: "Connect & Share",
      description: "Join discussions and share knowledge",
      icon: Users,
      action: "Join Community",
      href: "/reviews",
      gradient: "from-green-400 to-green-600",
    },
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Education Specialist",
      quote: "This platform has revolutionized how we deliver educational content.",
      avatar: "SC",
    },
    {
      name: "Marcus Johnson",
      role: "University Student",
      quote: "The interactive materials made complex concepts easy to understand.",
      avatar: "MJ",
    },
    {
      name: "Professor Alvaro",
      role: "Lead Educator",
      quote: "A perfect blend of technology and pedagogy for modern learning.",
      avatar: "PA",
    },
  ];

  const upcomingFeatures = [
    {
      title: "AI-Powered Recommendations",
      description: "Personalized learning paths based on your progress",
      icon: Sparkles,
      status: "Coming Soon",
    },
    {
      title: "Live Collaboration Tools",
      description: "Real-time study sessions and group projects",
      icon: Globe,
      status: "In Development",
    },
    {
      title: "Mobile Learning App",
      description: "Learn on-the-go with our dedicated mobile application",
      icon: Zap,
      status: "Q2 2024",
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="text-xs">
              {user?.role || 'Learner'}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {getGreeting()}, <span className="text-primary">{user?.name || 'Learner'}</span>!
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Welcome to EduSystem - where learning meets innovation. 
            Discover a world of knowledge through interactive materials, 
            expert guidance, and a supportive community.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Button size="lg" onClick={() => navigate('/materials')}>
              <BookOpen className="mr-2 h-5 w-5" />
              Start Learning
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full -translate-x-24 translate-y-24" />
      </div>

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStartCards.map((card, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
            <CardHeader className="pb-4">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="mt-4">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full justify-between group-hover:text-primary"
                onClick={() => navigate(card.href)}
              >
                {card.action}
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Platform Features */}
      <div>
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            Why Choose EduSystem
          </Badge>
          <h2 className="text-3xl font-bold mb-4">Designed for Modern Learning</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our platform combines cutting-edge technology with proven educational methodologies.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${feature.iconColor.replace('text', 'bg').replace('600', '100')}`}>
                      <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                    </div>
                    {feature.badge && (
                      <Badge variant="outline" className="text-xs">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3" />
                    <span>Available now</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Upcoming Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-5 w-5 text-primary" />
              <CardTitle>What's Coming Next</CardTitle>
            </div>
            <CardDescription>
              Exciting features currently in development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{feature.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {feature.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-primary" />
              <CardTitle>Our Mission</CardTitle>
            </div>
            <CardDescription>
              Making quality education accessible to everyone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-background/50 border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Vision Statement
              </h3>
              <p className="text-sm text-muted-foreground">
                To create a world where anyone, anywhere can transform their life through accessible, engaging, and effective education.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Our Commitment
              </h3>
              <p className="text-sm text-muted-foreground">
                We are dedicated to providing high-quality educational resources, fostering a supportive community, and continuously innovating to enhance the learning experience.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Join the Journey
              </h3>
              <p className="text-sm text-muted-foreground">
                Whether you're a learner, educator, or lifelong knowledge seeker, there's a place for you here. Start your journey today.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/materials')}>
              <Star className="mr-2 h-4 w-4" />
              Begin Your Learning Journey
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Learning?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of learners who have already started their educational journey with EduSystem.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" variant="default" onClick={() => navigate('/materials')}>
            <BookOpen className="mr-2 h-5 w-5" />
            Explore Learning Materials
          </Button>
        </div>
      </div>
    </div>
  );
};

// Add missing Quote icon component
const Quote: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </svg>
);