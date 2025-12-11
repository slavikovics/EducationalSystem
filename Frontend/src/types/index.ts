// src/types/index.ts
export interface User {
  userId: number;
  name: string;
  email: string;
  status: 'Active' | 'Blocked';
  role?: string;
}

export interface Admin extends User {
  accessKey: string;
}

export interface Tutor extends User {
  experience: number;
  specialty: string;
}

export interface Content {
  contentId?: number;
  text: string;
  mediaFiles?: string[];
}

export interface Material {
  materialId: number;
  userId: number;
  creationDate: string;
  content?: Content;
  category: 'Science' | 'Art' | 'Technology' | 'Business' | 'Health';
  user?: User;
}

export interface Question {
  questionId?: number;
  questionText: string;
  answerText: string;
}

export interface Test {
  testId: number;
  materialId: number;
  questions?: Question[];
  material?: Material;
}

export interface Review {
  reviewId: number;
  userId: number;
  content?: Content;
  type: 'Star' | 'Text';
  user?: User;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}