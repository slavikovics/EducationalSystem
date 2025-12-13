// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
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
  Quote,
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
  const [animateHero, setAnimateHero] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [animateFeatures, setAnimateFeatures] = useState(false);
  const [animateMission, setAnimateMission] = useState(false);
  const [animateTestimonials, setAnimateTestimonials] = useState(false);

  useEffect(() => {
    // Stagger animations
    const timers = [
      setTimeout(() => setAnimateHero(true), 100),
      setTimeout(() => setAnimateCards(true), 300),
      setTimeout(() => setAnimateFeatures(true), 500),
      setTimeout(() => setAnimateMission(true), 700),
      setTimeout(() => setAnimateTestimonials(true), 900),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const features = [
    {
      title: "Interactive Learning",
      description: "Engage with multimedia content including videos, images, and interactive exercises.",
      icon: Brain,
      color: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-600",
      badge: "New",
      animationDelay: 0,
    },
    {
      title: "Expert-Curated Content",
      description: "All materials are created and reviewed by qualified educators and subject experts.",
      icon: GraduationCap,
      color: "from-purple-500 to-pink-500",
      iconColor: "text-purple-600",
      badge: "Verified",
      animationDelay: 100,
    },
    {
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics and milestone achievements.",
      icon: Target,
      color: "from-green-500 to-emerald-500",
      iconColor: "text-green-600",
      badge: "Beta",
      animationDelay: 200,
    },
    {
      title: "Collaborative Learning",
      description: "Share insights, discuss topics, and learn together with peers and mentors.",
      icon: Users,
      color: "from-orange-500 to-amber-500",
      iconColor: "text-orange-600",
      badge: "Community",
      animationDelay: 300,
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
      animationDelay: 0,
    },
    {
      title: "Start Learning",
      description: "Begin with our recommended learning paths",
      icon: Brain,
      action: "View Paths",
      href: "/tests",
      gradient: "from-purple-400 to-purple-600",
      animationDelay: 150,
    },
    {
      title: "Connect & Share",
      description: "Join discussions and share knowledge",
      icon: Users,
      action: "Join Community",
      href: "/reviews",
      gradient: "from-green-400 to-green-600",
      animationDelay: 300,
    },
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Education Specialist",
      quote: "This platform has revolutionized how we deliver educational content.",
      avatar: "SC",
      animationDelay: 0,
    },
    {
      name: "Marcus Johnson",
      role: "University Student",
      quote: "The interactive materials made complex concepts easy to understand.",
      avatar: "MJ",
      animationDelay: 200,
    },
    {
      name: "Professor Alvaro",
      role: "Lead Educator",
      quote: "A perfect blend of technology and pedagogy for modern learning.",
      avatar: "PA",
      animationDelay: 400,
    },
  ];

  const upcomingFeatures = [
    {
      title: "AI-Powered Recommendations",
      description: "Personalized learning paths based on your progress",
      icon: Sparkles,
      status: "Coming Soon",
      animationDelay: 0,
    },
    {
      title: "Live Collaboration Tools",
      description: "Real-time study sessions and group projects",
      icon: Globe,
      status: "In Development",
      animationDelay: 100,
    },
    {
      title: "Mobile Learning App",
      description: "Learn on-the-go with our dedicated mobile application",
      icon: Zap,
      status: "Q2 2024",
      animationDelay: 200,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className={`
        relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8
        transition-all duration-1000 transform
        ${animateHero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
      `}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 animate-fade-in">
            <Sparkles className="h-5 w-5 text-primary animate-pulse-slow" />
            <Badge 
              variant="outline" 
              className="text-xs animate-scale-in"
              style={{ animationDelay: '200ms' }}
            >
              {user?.role || 'Learner'}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 animate-slide-in-right">
            {getGreeting()}, <span className="text-primary animate-text-gradient">{user?.name || 'Learner'}</span>!
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl animate-fade-in animation-delay-300">
            Welcome to EduSystem - where learning meets innovation. 
            Discover a world of knowledge through interactive materials, 
            expert guidance, and a supportive community.
          </p>
          <div className="flex flex-wrap gap-4 mt-8 animate-fade-in animation-delay-500">
            <Button 
              size="lg" 
              onClick={() => navigate('/materials')}
              className="hover-scale transition-smooth group"
            >
              <BookOpen className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Start Learning
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-y-32 translate-x-32 animate-float-slow" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full -translate-x-24 translate-y-24 animate-float" />
      </div>

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStartCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card 
              key={index}
              className={`
                group hover:shadow-xl transition-all duration-500 border-2 hover:border-primary/50 
                hover:scale-[1.02] hover-lift
                transform transition-all duration-700
                ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
              `}
              style={{ 
                transitionDelay: `${card.animationDelay}ms`,
                animationDelay: `${card.animationDelay}ms`,
              }}
            >
              <CardHeader className="pb-4">
                <div className={`
                  inline-flex p-3 rounded-xl bg-gradient-to-br ${card.gradient} 
                  animate-pulse-slow group-hover:scale-110 transition-transform duration-300
                `}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="mt-4 animate-fade-in animation-delay-200">{card.title}</CardTitle>
                <CardDescription className="animate-fade-in animation-delay-300">{card.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between group-hover:text-primary transition-all duration-300"
                  onClick={() => navigate(card.href)}
                >
                  {card.action}
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Platform Features */}
      <div>
        <div className={`
          text-center mb-8 transform transition-all duration-700
          ${animateFeatures ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        `}>
          <Badge 
            variant="secondary" 
            className="mb-4 animate-bounce-in"
            style={{ animationDelay: '100ms' }}
          >
            <Sparkles className="h-3 w-3 mr-1 animate-spin-slow" />
            Why Choose EduSystem
          </Badge>
          <h2 className="text-3xl font-bold mb-4 animate-fade-in animation-delay-200">Designed for Modern Learning</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in animation-delay-300">
            Our platform combines cutting-edge technology with proven educational methodologies.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className={`
                  relative overflow-hidden group hover:shadow-xl transition-all duration-500
                  hover:scale-[1.03] hover-lift animate-fade-in
                  ${animateFeatures ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                `}
                style={{ 
                  animationDelay: `${feature.animationDelay}ms`,
                  transitionDelay: `${feature.animationDelay}ms`,
                }}
              >
                <div className={`
                  absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color}
                  group-hover:h-2 transition-all duration-300
                `} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`
                      p-2 rounded-lg ${feature.iconColor.replace('text', 'bg').replace('600', '100')}
                      group-hover:scale-110 transition-transform duration-300
                    `}>
                      <Icon className={`h-5 w-5 ${feature.iconColor} animate-pulse`} />
                    </div>
                    {feature.badge && (
                      <Badge 
                        variant="outline" 
                        className="text-xs animate-scale-in"
                        style={{ animationDelay: `${feature.animationDelay + 200}ms` }}
                      >
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-lg animate-fade-in animation-delay-100">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground animate-fade-in animation-delay-200">
                    {feature.description}
                  </p>
                </CardContent>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-in animation-delay-300">
                    <CheckCircle className="h-3 w-3 animate-pulse-slow" />
                    <span>Available now</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Upcoming Features & Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className={`
          transform transition-all duration-700
          ${animateMission ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
        `}>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2 animate-fade-in">
              <Rocket className="h-5 w-5 text-primary animate-bounce" />
              <CardTitle className="animate-slide-in-right">What's Coming Next</CardTitle>
            </div>
            <CardDescription className="animate-fade-in animation-delay-200">
              Exciting features currently in development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className={`
                    flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-all duration-300
                    hover:scale-[1.02] hover-lift animate-fade-in
                  `}
                  style={{ animationDelay: `${feature.animationDelay}ms` }}
                >
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold animate-fade-in">{feature.title}</p>
                      <Badge 
                        variant="outline" 
                        className="text-xs animate-scale-in"
                        style={{ animationDelay: `${feature.animationDelay + 100}ms` }}
                      >
                        {feature.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground animate-fade-in animation-delay-100">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className={`
          bg-gradient-to-br from-primary/5 via-transparent to-secondary/5
          transform transition-all duration-700
          ${animateMission ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}
        `}>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2 animate-fade-in">
              <Heart className="h-5 w-5 text-primary animate-heartbeat" />
              <CardTitle className="animate-slide-in-left">Our Mission</CardTitle>
            </div>
            <CardDescription className="animate-fade-in animation-delay-200">
              Making quality education accessible to everyone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-background/50 border hover:scale-[1.02] transition-all duration-300 animate-fade-in">
              <h3 className="font-semibold mb-2 flex items-center gap-2 animate-fade-in">
                <Target className="h-4 w-4 text-primary animate-spin-slow" />
                Vision Statement
              </h3>
              <p className="text-sm text-muted-foreground animate-fade-in animation-delay-100">
                To create a world where anyone, anywhere can transform their life through accessible, engaging, and effective education.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border hover:scale-[1.02] transition-all duration-300 animate-fade-in animation-delay-200">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary animate-pulse" />
                Our Commitment
              </h3>
              <p className="text-sm text-muted-foreground">
                We are dedicated to providing high-quality educational resources, fostering a supportive community, and continuously innovating to enhance the learning experience.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border hover:scale-[1.02] transition-all duration-300 animate-fade-in animation-delay-300">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary animate-pulse-slow" />
                Join the Journey
              </h3>
              <p className="text-sm text-muted-foreground">
                Whether you're a learner, educator, or lifelong knowledge seeker, there's a place for you here. Start your journey today.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full hover-scale transition-smooth group animate-fade-in animation-delay-400"
              onClick={() => navigate('/materials')}
            >
              <Star className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-700" />
              Begin Your Learning Journey
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Call to Action */}
      <div className={`
        text-center py-8 transform transition-all duration-700
        ${animateTestimonials ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
      `}>
        <h2 className="text-2xl font-bold mb-4 animate-fade-in">Ready to Transform Your Learning?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in animation-delay-200">
          Join thousands of learners who have already started their educational journey with EduSystem.
        </p>
        <div className="flex flex-wrap gap-4 justify-center animate-fade-in animation-delay-400">
          <Button 
            size="lg" 
            variant="default" 
            onClick={() => navigate('/materials')}
            className="hover-scale transition-smooth group animate-pulse-slow"
          >
            <BookOpen className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            Explore Learning Materials
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate('/tests')}
            className="hover-scale transition-smooth group"
          >
            <Brain className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Take a Knowledge Test
          </Button>
        </div>
      </div>
    </div>
  );
};