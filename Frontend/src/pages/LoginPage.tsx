// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Eye, 
  EyeOff,
  LogIn,
  AlertCircle,
  Sparkles,
  Lock,
  Mail,
  Key,
  ChevronRight,
  Loader2
} from 'lucide-react';

// Import shadcn/ui components
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Alert,
  AlertDescription,
} from '../components/ui/alert';

// Define validation schema with Zod
const loginSchema = z.object({
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animateLogo, setAnimateLogo] = useState(false);
  const [animateCard, setAnimateCard] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Stagger animations
    setTimeout(() => setAnimateLogo(true), 200);
    setTimeout(() => setAnimateCard(true), 400);
    setTimeout(() => setAnimateForm(true), 600);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    setIsLoading(true);
    setShowSuccess(false);

    try {
      await login(data.email, data.password);
      
      // Show success animation before navigation
      setShowSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate with smooth transition
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEyeClick = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-full animate-float-slow animation-delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-gradient-to-tl from-secondary/10 to-primary/10 rounded-full animate-float animation-delay-2000" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full animate-float-slow animation-delay-1500" />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Logo and Header */}
        <div className={`
          text-center mb-8 transform transition-all duration-1000
          ${animateLogo ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}
        `}>
          <div className={`
            inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary via-primary/80 to-secondary
            mb-6 relative group transition-all duration-700
            ${animateLogo ? 'scale-100' : 'scale-0'}
            hover:scale-110 hover:rotate-12
          `}>
            <BookOpen className="h-10 w-10 text-primary-foreground relative z-10 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-spin-slow" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 animate-text-gradient">
            EduSystem
          </h1>
          <p className="text-muted-foreground mt-2 animate-fade-in animation-delay-300">
            Welcome back to your educational platform
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className={`
                  w-2 h-2 rounded-full bg-primary/50
                  animate-pulse-slow
                `}
                style={{ animationDelay: `${i * 300}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Main Login Card */}
        <Card className={`
          shadow-2xl border-border/50 backdrop-blur-sm
          transform transition-all duration-1000
          ${animateCard ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}
          hover:shadow-primary/10 hover:shadow-xl
          relative overflow-hidden
        `}>
          {/* Card Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-lg p-[1px] bg-gradient-to-r from-primary/30 via-transparent to-secondary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-transparent to-secondary/30 animate-gradient-shift" />
          </div>

          <CardHeader className="space-y-1 relative z-10">
            <CardTitle className={`
              text-2xl text-center flex items-center justify-center gap-2
              animate-fade-in
            `}>
              <Lock className="h-5 w-5 text-primary animate-pulse" />
              Sign In
            </CardTitle>
            <CardDescription className={`
              text-center animate-fade-in animation-delay-200
            `}>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10">
            {error && (
              <Alert 
                variant="destructive" 
                className={`
                  mb-6 animate-shake border-l-4 border-l-destructive
                  transform transition-all duration-500
                  ${error ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
                `}
              >
                <AlertCircle className="h-4 w-4 animate-pulse" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className={`
              space-y-5 transform transition-all duration-700
              ${animateForm ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}
            `}>
              <div className="space-y-3 animate-fade-in animation-delay-300">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register('email')}
                    className={`
                      transition-all duration-300
                      ${errors.email ? "border-destructive" : ""}
                      group-hover:scale-[1.02] group-hover:shadow-md
                      pl-10
                    `}
                    disabled={isLoading}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  {!errors.email && (
                    <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive animate-shake flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-3 animate-fade-in animation-delay-400">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:text-primary/90 underline-offset-4 hover:underline transition-all duration-300 hover:scale-105"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register('password')}
                    className={`
                      transition-all duration-300
                      ${errors.password ? "border-destructive pr-12" : "pr-12"}
                      group-hover:scale-[1.02] group-hover:shadow-md
                      pl-10
                    `}
                    disabled={isLoading}
                  />
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-transform hover:scale-110"
                    onClick={handleEyeClick}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground transition-transform hover:scale-110" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground transition-transform hover:scale-110" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive animate-shake flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className={`
                  w-full relative overflow-hidden group
                  transition-all duration-500
                  ${showSuccess ? 'bg-green-600 hover:bg-green-700' : ''}
                  hover:scale-[1.02] hover:shadow-lg
                  animate-fade-in animation-delay-500
                `}
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </div>
                ) : showSuccess ? (
                  <div className="flex items-center justify-center animate-bounce-in">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Welcome Back!
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 relative z-10">
            <div className={`
              text-center text-sm text-muted-foreground
              animate-fade-in animation-delay-600
            `}>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary font-medium underline-offset-4 hover:underline group transition-all duration-300 inline-flex items-center gap-1"
              >
                Create account
                <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Decorative Line */}
            <div className="relative flex items-center justify-center">
              <div className="flex-grow border-t border-border/50" />
              <span className="px-3 text-xs text-muted-foreground">Secure Access</span>
              <div className="flex-grow border-t border-border/50" />
            </div>
            
            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse-slow">
              <Lock className="h-3 w-3" />
              <span>Encrypted Connection • Secure Login</span>
            </div>
          </CardFooter>
        </Card>

        {/* Floating Particles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-1 h-1 rounded-full bg-primary/20
                animate-float
              `}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 200}ms`,
                animationDuration: `${3 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};