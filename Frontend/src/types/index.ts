// src/types/index.ts

// User Types
export interface User {
  userId?: number;
  name: string;
  email: string;
  password?: string;
  status?: 'Active' | 'Blocked';
  role?: 'User' | 'Tutor' | 'Admin';
  userType?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface Admin extends User {
  accessKey?: string;
}

export interface Tutor extends User {
  experience?: number;
  specialty?: string;
}

// Content Types
export interface Content {
  contentId?: number;
  text: string;
  mediaFiles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Material Types
export enum ContentCategory {
  Science = 'Science',
  Art = 'Art',
  Technology = 'Technology',
  Business = 'Business',
  Health = 'Health'
}

interface Material {
  materialId: number;
  userId: number;
  userName?: string;
  creationDate: string;
  content: {
    text: string;
    mediaFiles: string[];
  };
  category?: number;
  user?: {
    name?: string;
    Name?: string;
  };
}

export const mapApiMaterial = (apiMaterial: any): Material => ({
  ...apiMaterial,
  // If Category is a number, map it to string
  Category: typeof apiMaterial.Category === 'number' 
    ? ContentCategory[apiMaterial.Category as keyof typeof ContentCategory]
    : apiMaterial.Category,
  // Ensure Content.Category is also mapped
  Content: apiMaterial.Content ? {
    ...apiMaterial.Content,
    Category: typeof apiMaterial.Content?.Category === 'number'
      ? ContentCategory[apiMaterial.Content.Category as keyof typeof ContentCategory]
      : apiMaterial.Content?.Category
  } : undefined
});

// Question Types
export interface Question {
  questionId?: number;
  questionText: string;
  options?: string[];
  answerText: string;
  testId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Test Types
export interface Test {
  testId?: number;
  materialId?: number;
  createdByUserId?: number;
  questions?: Question[];
  passingScore?: number;
  material?: Material;
  createdByUser?: User;
  createdAt?: string;
  updatedAt?: string;
}

// Review Types
export enum ReviewType {
  Feedback = 'Feedback',
  Rating = 'Rating',
  Comment = 'Comment',
  Suggestion = 'Suggestion',
  Critique = 'Critique'
}

export interface Review {
  reviewId?: number;
  userId?: number;
  content?: Content;
  contentId?: number;
  type: ReviewType | string;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

// types/index.ts (add these interfaces)
export interface TestResult {
  testResultId: number;
  testId: number;
  userId: number;
  score: number;
  totalQuestions: number;
  submittedAt: string;
  userAnswers: Record<number, string>;
  test?: Test;
  user?: {
    userId: number;
    name: string;
    email: string;
  };
}

export interface TestResultResponse {
  testResultId: number;
  testId: number;
  userId: number;
  score: number;
  totalQuestions: number;
  submittedAt: string;
  userAnswers: Record<number, string>;
  test?: Test;
  user?: {
    userId: number;
    name: string;
    email: string;
  };
}

// Auth Responses
export interface LoginResponse {
  Message: string;
  Token: string;
  User: {
    UserId: number;
    Email: string;
    Name: string;
    UserType: string;
    Status: string;
  };
}

export interface RegisterResponse {
  Message: string;
  Token: string;
  User: {
    UserId: number;
    Email: string;
    Name: string;
    UserType: string;
    Status?: string;
  };
}

// API Responses
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: Record<string, string[]>;
  status?: number;
  // Backend specific fields
  Message?: string;
  Token?: string;
  User?: any;
  Material?: any;
  Review?: any;
  Test?: any;
  TestResult?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterUserFormData {
  name: string;
  email: string;
  password: string;
}

export interface RegisterAdminFormData extends RegisterUserFormData {
  accessKey: string;
}

export interface RegisterTutorFormData extends RegisterUserFormData {
  experience: number;
  specialty: string;
}

export interface ChangePasswordFormData {
  userId: number;
  oldPassword: string;
  newPassword: string;
}

export interface CreateMaterialFormData {
  text: string;
  mediaFiles?: string[];
  category?: ContentCategory | string;
}

export interface CreateReviewFormData {
  text: string;
  mediaFiles?: string[];
  type: ReviewType | string;
}

export interface CreateTestFormData {
  materialId: number;
  questions: Question[];
}

export interface SubmitTestFormData {
  answers: Record<number, string>;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (data: RegisterUserFormData) => Promise<void>;
  registerAdmin: (data: RegisterAdminFormData) => Promise<void>;
  registerTutor: (data: RegisterTutorFormData) => Promise<void>;
  logout: () => void;
  changePassword: (data: ChangePasswordFormData) => Promise<void>;
  blockUser: (userId: number) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}