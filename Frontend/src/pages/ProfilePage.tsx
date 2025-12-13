// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Sparkles, 
  CheckCircle,
  Zap,
  Star,
  Award,
  TrendingUp,
  BookOpen,
  FileText,
  MessageSquare,
  Target,
  Clock,
  Heart
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [animateAvatar, setAnimateAvatar] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  useEffect(() => {
    // Stagger animations
    setTimeout(() => setAnimateAvatar(true), 300);
    setTimeout(() => setAnimateCards(true), 600);
    setTimeout(() => setAnimateStats(true), 900);

    // Simulate loading achievements
    setTimeout(() => {
      setAchievements([
        "First Login",
        "Profile Completed",
        "Active Member"
      ]);
    }, 1200);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 animate-pulse-slow">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'from-red-500 to-red-600';
      case 'tutor': return 'from-blue-500 to-blue-600';
      case 'student': return 'from-green-500 to-green-600';
      default: return 'from-primary to-primary/80';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'tutor': return <Zap className="h-4 w-4" />;
      case 'student': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const stats = [
    { label: "Materials Created", value: 0, icon: BookOpen, color: "from-blue-500 to-cyan-500" },
    { label: "Tests Taken", value: 0, icon: FileText, color: "from-purple-500 to-pink-500" },
    { label: "Reviews Written", value: 0, icon: MessageSquare, color: "from-green-500 to-emerald-500" },
    { label: "Achievements", value: achievements.length, icon: Award, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className={`
        transform transition-all duration-700
        ${animateAvatar ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
      `}>
        <h1 className="text-3xl font-bold tracking-tight mb-2 animate-slide-in-right">
          My Profile
        </h1>
        <p className="text-muted-foreground animate-fade-in animation-delay-300">
          Welcome to your personalized account dashboard
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information Card */}
        <Card className={`
          transform transition-all duration-700
          ${animateCards ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
          hover:shadow-xl hover:scale-[1.02] transition-all duration-300
          relative overflow-hidden group
        `}>
          {/* Card Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2 animate-fade-in">
              <User className="h-5 w-5 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription className="animate-fade-in animation-delay-200">
              Your personal details and account settings
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Profile Avatar */}
            <div className="flex flex-col items-center mb-4">
              <div className={`
                relative mb-4 transform transition-all duration-1000
                ${animateAvatar ? 'scale-100' : 'scale-0'}
                group-hover:scale-105
              `}>
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary via-primary/80 to-secondary flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold text-primary-foreground">
                    {getInitials(user.name || 'User')}
                  </span>
                </div>
                <div className="absolute -top-2 -right-2 p-1 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full animate-pulse-slow">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 p-1.5 bg-gradient-to-br from-primary to-secondary rounded-full animate-pulse animation-delay-700">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-1 animate-fade-in">{user.name}</h2>
                <Badge 
                  className={`
                    px-3 py-1 mt-2 bg-gradient-to-r ${getRoleColor(user.role || 'user')} text-white
                    animate-scale-in
                    hover:scale-105 transition-transform
                  `}
                >
                  {getRoleIcon(user.role || 'user')}
                  <span className="ml-2 capitalize">{user.role || 'User'}</span>
                </Badge>
              </div>
            </div>

            <Separator className="animate-fade-in animation-delay-300" />

            {/* Account Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-muted/50 to-background hover:from-muted/70 transition-all duration-300 group/item animate-fade-in animation-delay-400">
                <div className="p-2 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 group-hover/item:scale-110 transition-transform">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                  <p className="font-medium truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-muted/50 to-background hover:from-muted/70 transition-all duration-300 group/item animate-fade-in animation-delay-500">
                <div className="p-2 rounded-full bg-gradient-to-br from-green-100 to-green-50 group-hover/item:scale-110 transition-transform">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                  <p className="font-medium capitalize">{user.role || user.userType || 'User'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-muted/50 to-background hover:from-muted/70 transition-all duration-300 group/item animate-fade-in animation-delay-600">
                <div className="p-2 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 group-hover/item:scale-110 transition-transform">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {new Date().toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="animate-fade-in animation-delay-700">
            <div className="w-full text-center text-sm text-muted-foreground">
              <p className="flex items-center justify-center gap-1">
                <Heart className="h-3 w-3 animate-heartbeat" />
                Account is active and verified
              </p>
            </div>
          </CardFooter>
        </Card>

    </div>
    </div>
  )};