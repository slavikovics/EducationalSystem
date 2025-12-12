// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

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
  
  const { 
    registerUser, 
    registerAdmin, 
    registerTutor 
  } = useAuth();
  const navigate = useNavigate();

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
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    const strength = passwordStrength();
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

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
      
      setSuccess('Registration successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 mb-4">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">EduSystem</h1>
          <p className="text-muted-foreground mt-2">
            Join our educational platform
          </p>
        </div>

        {/* Main Register Card */}
        <Card className="shadow-lg border-border/40">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register('name')}
                  className={errors.name ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register('email')}
                  className={errors.email ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  onValueChange={(value: 'User' | 'Tutor' | 'Admin') => setValue('role', value)}
                  defaultValue="User"
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.role ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">Student</SelectItem>
                    <SelectItem value="Tutor">Tutor</SelectItem>
                    <SelectItem value="Admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {selectedRole === 'Admin' 
                    ? '* Admin role requires access key' 
                    : selectedRole === 'Tutor'
                    ? '* Tutor role requires experience and specialty'
                    : '* Student role is default for all users'}
                </p>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                )}
              </div>

              {/* Admin-specific fields */}
              {selectedRole === 'Admin' && (
                <div className="space-y-2">
                  <Label htmlFor="accessKey">Access Key *</Label>
                  <Input
                    id="accessKey"
                    type="text"
                    placeholder="Enter admin access key"
                    {...register('accessKey')}
                    className={errors.accessKey ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.accessKey && (
                    <p className="text-sm text-destructive">{errors.accessKey.message}</p>
                  )}
                </div>
              )}

              {/* Tutor-specific fields */}
              {selectedRole === 'Tutor' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      placeholder="5"
                      {...register('experience')}
                      className={errors.experience ? "border-destructive" : ""}
                      disabled={isLoading}
                    />
                    {errors.experience && (
                      <p className="text-sm text-destructive">{errors.experience.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty *</Label>
                    <Input
                      id="specialty"
                      type="text"
                      placeholder="Mathematics, Computer Science, etc."
                      {...register('specialty')}
                      className={errors.specialty ? "border-destructive" : ""}
                      disabled={isLoading}
                    />
                    {errors.specialty && (
                      <p className="text-sm text-destructive">{errors.specialty.message}</p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register('password')}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                
                {password && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">
                        Password Strength: {getPasswordStrengthText()}
                      </span>
                      <span className="text-xs font-medium">
                        {passwordStrength()}/5
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: `${(passwordStrength() / 5) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <div className={`h-1.5 w-1.5 rounded-full mr-2 ${password.length >= 8 ? 'bg-green-500' : 'bg-muted'}`} />
                        At least 8 characters
                      </div>
                      <div className="flex items-center">
                        <div className={`h-1.5 w-1.5 rounded-full mr-2 ${/[a-z]/.test(password) ? 'bg-green-500' : 'bg-muted'}`} />
                        One lowercase letter
                      </div>
                      <div className="flex items-center">
                        <div className={`h-1.5 w-1.5 rounded-full mr-2 ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-muted'}`} />
                        One uppercase letter
                      </div>
                      <div className="flex items-center">
                        <div className={`h-1.5 w-1.5 rounded-full mr-2 ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-muted'}`} />
                        One number
                      </div>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                {confirmPassword && password === confirmPassword && (
                  <p className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Passwords match
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};