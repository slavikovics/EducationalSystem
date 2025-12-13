// src/pages/RegisterPage.tsx
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
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Lock,
  Mail,
  User,
  Key,
  Shield,
  GraduationCap,
  ChevronRight,
  Loader2,
  Zap,
  Star,
  Globe,
  ShieldCheck,
  ArrowRight
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Alert,
  AlertDescription,
} from '../components/ui/alert';
import { Badge } from '../components/ui/badge';

// Define validation schema with Zod
const registerSchema = z.object({
  name: z.string()
    .min(1, { message: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters" }),
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string()
    .min(1, { message: "Please confirm your password" }),
  role: z.enum(['User', 'Tutor', 'Admin']),
  // Admin-specific fields (conditionally required)
  accessKey: z.string().optional(),
  // Tutor-specific fields (conditionally required)
  experience: z.coerce.number().optional(),
  specialty: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === 'Admin') {
    return data.accessKey && data.accessKey.length > 0;
  }
  return true;
}, {
  message: "Access key is required for Admin registration",
  path: ["accessKey"],
}).refine((data) => {
  if (data.role === 'Tutor') {
    return data.experience !== undefined && data.experience >= 0 && data.specialty && data.specialty.length > 0;
  }
  return true;
}, {
  message: "Experience and specialty are required for Tutor registration",
  path: ["experience"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animateLogo, setAnimateLogo] = useState(false);
  const [animateCard, setAnimateCard] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [floatingIcons, setFloatingIcons] = useState<Array<{id: number, x: number, y: number, icon: string}>>([]);
  
  const { 
    registerUser, 
    registerAdmin, 
    registerTutor 
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Stagger animations
    setTimeout(() => setAnimateLogo(true), 200);
    setTimeout(() => setAnimateCard(true), 400);
    setTimeout(() => setAnimateForm(true), 600);

    // Create floating icons
    const icons = ['book', 'graduation', 'shield', 'star', 'zap', 'globe'];
    const iconElements = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      icon: icons[Math.floor(Math.random() * icons.length)],
    }));
    setFloatingIcons(iconElements);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'User',
      accessKey: '',
      experience: 0,
      specialty: '',
    },
  });

  const selectedRole = watch('role');
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const passwordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = () => {
    const strength = passwordStrength();
    if (strength <= 2) return 'from-red-500 to-red-600';
    if (strength <= 3) return 'from-yellow-500 to-amber-500';
    return 'from-green-500 to-emerald-600';
  };

  const getPasswordStrengthText = () => {
    const strength = passwordStrength();
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin': return <Shield className="h-4 w-4" />;
      case 'Tutor': return <GraduationCap className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    setShowSuccess(false);

    try {
      switch (data.role) {
        case 'Admin':
          await registerAdmin({
            name: data.name,
            email: data.email,
            password: data.password,
            accessKey: data.accessKey || ''
          });
          break;
        
        case 'Tutor':
          await registerTutor({
            name: data.name,
            email: data.email,
            password: data.password,
            experience: data.experience || 0,
            specialty: data.specialty || ''
          });
          break;
        
        default: // User
          await registerUser({
            name: data.name,
            email: data.email,
            password: data.password
          });
      }
      
      setShowSuccess(true);
      setSuccess('Registration successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map((icon) => (
          <div
            key={icon.id}
            className="absolute text-primary/5 animate-float-slow"
            style={{
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              animationDelay: `${icon.id * 300}ms`,
              animationDuration: `${5 + icon.id * 0.5}s`,
            }}
          >
            {icon.icon === 'book' && <BookOpen className="h-8 w-8" />}
            {icon.icon === 'graduation' && <GraduationCap className="h-8 w-8" />}
            {icon.icon === 'shield' && <Shield className="h-8 w-8" />}
            {icon.icon === 'star' && <Star className="h-8 w-8" />}
            {icon.icon === 'zap' && <Zap className="h-8 w-8" />}
            {icon.icon === 'globe' && <Globe className="h-8 w-8" />}
          </div>
        ))}
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full animate-float-slow animation-delay-1000" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,oklch(var(--muted))_1px,transparent_0)] bg-[length:50px_50px] opacity-[0.03]" />
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
            Start your educational journey with us
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

        {/* Main Register Card */}
        <Card className={`
          shadow-2xl border-border/50 backdrop-blur-sm
          transform transition-all duration-1000
          ${animateCard ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}
          hover:shadow-primary/10 hover:shadow-xl
          relative overflow-hidden group
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
              Create Account
            </CardTitle>
            <CardDescription className={`
              text-center animate-fade-in animation-delay-200
            `}>
              Join our community of learners and educators
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

            {success && (
              <Alert 
                className={`
                  mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200
                  animate-bounce-in
                `}
              >
                <CheckCircle className="h-4 w-4 text-green-600 animate-pulse" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className={`
              space-y-5 transform transition-all duration-700
              ${animateForm ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}
            `}>
              <div className="space-y-3 animate-fade-in animation-delay-300">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Full Name *
                </Label>
                <div className="relative group">
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    {...register('name')}
                    className={`
                      transition-all duration-300
                      ${errors.name ? "border-destructive" : ""}
                      group-hover:scale-[1.02] group-hover:shadow-md
                      pl-10
                    `}
                    disabled={isLoading}
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive animate-shake flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-3 animate-fade-in animation-delay-400">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address *
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
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive animate-shake flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-3 animate-fade-in animation-delay-500">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Account Role
                </Label>
                <Select 
                  onValueChange={(value: 'User' | 'Tutor' | 'Admin') => setValue('role', value)}
                  defaultValue="User"
                  disabled={isLoading}
                >
                  <SelectTrigger className={`
                    transition-all duration-300 hover:scale-[1.02] hover:shadow-md
                    ${errors.role ? "border-destructive" : ""}
                  `}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="animate-scale-in">
                    {['User', 'Tutor', 'Admin'].map((role, index) => (
                      <SelectItem 
                        key={role} 
                        value={role}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center gap-2 transition-transform hover:translate-x-1">
                          {getRoleIcon(role)}
                          {role}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-in animation-delay-200">
                  <Badge variant="outline" className="text-xs animate-pulse-slow">
                    {selectedRole === 'Admin' ? '🔐 Requires Access Key' : 
                     selectedRole === 'Tutor' ? '🎓 Requires Experience' : 
                     '👤 Default Access'}
                  </Badge>
                </div>
              </div>

              {/* Admin-specific fields */}
              {selectedRole === 'Admin' && (
                <div className="space-y-3 animate-fade-in animation-delay-600">
                  <Label htmlFor="accessKey" className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    Access Key *
                  </Label>
                  <div className="relative group">
                    <Input
                      id="accessKey"
                      type="text"
                      placeholder="Enter admin access key"
                      {...register('accessKey')}
                      className={`
                        transition-all duration-300
                        ${errors.accessKey ? "border-destructive" : ""}
                        group-hover:scale-[1.02] group-hover:shadow-md
                        pl-10
                      `}
                      disabled={isLoading}
                    />
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  {errors.accessKey && (
                    <p className="text-sm text-destructive animate-shake flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.accessKey.message}
                    </p>
                  )}
                </div>
              )}

              {/* Tutor-specific fields */}
              {selectedRole === 'Tutor' && (
                <div className="space-y-4 animate-fade-in animation-delay-600">
                  <div className="space-y-3">
                    <Label htmlFor="experience" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      Years of Experience *
                    </Label>
                    <div className="relative group">
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        placeholder="5"
                        {...register('experience')}
                        className={`
                          transition-all duration-300
                          ${errors.experience ? "border-destructive" : ""}
                          group-hover:scale-[1.02] group-hover:shadow-md
                          pl-10
                        `}
                        disabled={isLoading}
                      />
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    {errors.experience && (
                      <p className="text-sm text-destructive animate-shake flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.experience.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="specialty" className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      Specialty *
                    </Label>
                    <div className="relative group">
                      <Input
                        id="specialty"
                        type="text"
                        placeholder="Mathematics, Computer Science, etc."
                        {...register('specialty')}
                        className={`
                          transition-all duration-300
                          ${errors.specialty ? "border-destructive" : ""}
                          group-hover:scale-[1.02] group-hover:shadow-md
                          pl-10
                        `}
                        disabled={isLoading}
                      />
                      <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    {errors.specialty && (
                      <p className="text-sm text-destructive animate-shake flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.specialty.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3 animate-fade-in animation-delay-700">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Password *
                </Label>
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
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-transform hover:scale-110"
                    onClick={() => setShowPassword(!showPassword)}
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
                
                {password && (
                  <div className="space-y-3 pt-2 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">
                        Password Strength: <span className={`
                          ${passwordStrength() <= 2 ? 'text-red-500' : 
                            passwordStrength() <= 3 ? 'text-yellow-500' : 
                            'text-green-500'}
                        `}>
                          {getPasswordStrengthText()}
                        </span>
                      </span>
                      <Badge variant="outline" className="text-xs animate-pulse-slow">
                        {passwordStrength()}/5
                      </Badge>
                    </div>
                    <div className="h-2 bg-gradient-to-r from-muted to-muted/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${getPasswordStrengthColor()} transition-all duration-500`}
                        style={{ width: `${(passwordStrength() / 5) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {[
                        { label: 'At least 8 characters', test: password.length >= 8 },
                        { label: 'One lowercase letter', test: /[a-z]/.test(password) },
                        { label: 'One uppercase letter', test: /[A-Z]/.test(password) },
                        { label: 'One number', test: /[0-9]/.test(password) },
                      ].map((req, index) => (
                        <div 
                          key={index} 
                          className="flex items-center animate-fade-in"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className={`
                            h-2 w-2 rounded-full mr-2 transition-all duration-300
                            ${req.test ? 'bg-green-500 scale-125' : 'bg-muted'}
                          `} />
                          <span className={req.test ? 'text-green-600 font-medium' : ''}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-sm text-destructive animate-shake flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-3 animate-fade-in animation-delay-800">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  Confirm Password *
                </Label>
                <div className="relative group">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register('confirmPassword')}
                    className={`
                      transition-all duration-300
                      ${errors.confirmPassword ? "border-destructive pr-12" : "pr-12"}
                      group-hover:scale-[1.02] group-hover:shadow-md
                      pl-10
                    `}
                    disabled={isLoading}
                  />
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-transform hover:scale-110"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground transition-transform hover:scale-110" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground transition-transform hover:scale-110" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                {confirmPassword && password === confirmPassword && (
                  <p className="text-sm text-green-600 flex items-center gap-1 animate-fade-in">
                    <CheckCircle className="h-4 w-4 animate-pulse" />
                    Passwords match perfectly!
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive animate-shake flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword.message}
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
                  animate-fade-in animation-delay-900
                `}
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </div>
                ) : showSuccess ? (
                  <div className="flex items-center justify-center animate-bounce-in">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Account Created!
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <ArrowRight className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    Create Account
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 relative z-10">
            <div className={`
              text-center text-sm text-muted-foreground
              animate-fade-in animation-delay-1000
            `}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary font-medium underline-offset-4 hover:underline group transition-all duration-300 inline-flex items-center gap-1"
              >
                Sign in here
                <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse-slow">
              <Shield className="h-3 w-3" />
              <span>Secure Registration • SSL Protected</span>
            </div>
          </CardFooter>
        </Card>

        {/* Floating Particles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-1 h-1 rounded-full bg-primary/20
                animate-float
              `}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 150}ms`,
                animationDuration: `${3 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};