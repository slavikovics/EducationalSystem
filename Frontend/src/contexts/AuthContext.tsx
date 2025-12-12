// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import type { 
  User, 
  AuthContextType, 
  LoginFormData,
  RegisterUserFormData,
  RegisterAdminFormData,
  RegisterTutorFormData,
  ChangePasswordFormData 
} from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUserFromStorage = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('Loading from storage:', { storedToken, storedUser }); // Debug log
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    loadUserFromStorage();
  }, []);

  // Log auth state changes
  useEffect(() => {
    console.log('Auth state changed:', { 
      user, 
      token, 
      isAuthenticated: !!token && !!user 
    }); // Debug log
  }, [user, token]);

  // Verify token validity
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          console.log('Token verification response:', response); // Debug log
          
          // Check if response indicates success (not false or has data)
          if (response.success !== false) {
            // Extract user data - handle different response structures
            const userResponse = response.data || response.User || response;
            
            if (userResponse) {
              const userData = {
                userId: userResponse.UserId || userResponse.userId,
                name: userResponse.Name || userResponse.name,
                email: userResponse.Email || userResponse.email,
                role: userResponse.UserType || userResponse.userType,
                status: userResponse.Status || userResponse.status
              };
              
              localStorage.setItem('user', JSON.stringify(userData));
              setUser(userData);
            }
          } else {
            // Token invalid, clear storage
            throw new Error('Token validation failed');
          }
        } catch (error) {
          console.log('Token verification failed:', error); // Debug log
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { email }); // Debug log
      const response = await authAPI.login({ email, password });
      
      console.log('Login API response:', response); // Debug log
      
      // Extract token - check both uppercase and lowercase
      const authToken = response.Token || response.token;
      
      if (authToken) {
        // Extract user data - check both uppercase and lowercase
        const userResponse = response.User || response.user || response.data;
        
        if (!userResponse) {
          throw new Error('Login failed - no user data received');
        }
        
        const userData: User = {
          userId: userResponse.UserId || userResponse.userId,
          name: userResponse.Name || userResponse.name,
          email: userResponse.Email || userResponse.email,
          role: userResponse.UserType || userResponse.userType,
          status: userResponse.Status || userResponse.status
        };
        
        console.log('Setting user data:', userData); // Debug log
        console.log('Setting token:', authToken); // Debug log
        
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(authToken);
        setUser(userData);
        
        // Return success - let the calling component handle navigation
        return true;
      }
      
      // Check for error in response
      if (response.Error || response.error) {
        throw new Error(response.Message || response.message || response.Error || response.error);
      }
      
      throw new Error(response.Message || response.message || 'Login failed - no token received');
    } catch (error: any) {
      console.error('Login error:', error); // Debug log
      
      // Handle API error responses
      if (error.response?.data) {
        const apiError = error.response.data;
        throw new Error(apiError.Message || apiError.message || apiError.Error || apiError.error || 'Login failed');
      }
      
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerUser = useCallback(async (data: RegisterUserFormData) => {
    setIsLoading(true);
    try {
      console.log('Attempting user registration with:', data); // Debug log
      const response = await authAPI.registerUser(data);
      
      console.log('User registration API response:', response); // Debug log
      
      // Extract token - check both uppercase and lowercase
      const authToken = response.Token || response.token;
      
      if (authToken) {
        // Extract user data - check both uppercase and lowercase
        const userResponse = response.User || response.user || response.data;
        
        if (!userResponse) {
          throw new Error('Registration failed - no user data received');
        }
        
        const userData: User = {
          userId: userResponse.UserId || userResponse.userId,
          name: userResponse.Name || userResponse.name,
          email: userResponse.Email || userResponse.email,
          role: userResponse.UserType || userResponse.userType,
          status: userResponse.Status || userResponse.status
        };
        
        console.log('Setting user data:', userData); // Debug log
        
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(authToken);
        setUser(userData);
        
        // Return success - let the calling component handle navigation
        return true;
      }
      
      // Check for error in response
      if (response.Error || response.error) {
        throw new Error(response.Message || response.message || response.Error || response.error);
      }
      
      throw new Error(response.Message || response.message || 'Registration failed - no token received');
    } catch (error: any) {
      console.error('Registration error:', error); // Debug log
      
      // Handle API error responses
      if (error.response?.data) {
        const apiError = error.response.data;
        throw new Error(apiError.Message || apiError.message || apiError.Error || apiError.error || 'Registration failed');
      }
      
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerAdmin = useCallback(async (data: RegisterAdminFormData) => {
    setIsLoading(true);
    try {
      console.log('Attempting admin registration with:', data); // Debug log
      const response = await authAPI.registerAdmin(data);
      
      console.log('Admin registration API response:', response); // Debug log
      
      // Extract token - check both uppercase and lowercase
      const authToken = response.Token || response.token;
      
      if (authToken) {
        // Extract user data - check both uppercase and lowercase
        const userResponse = response.User || response.user || response.data;
        
        if (!userResponse) {
          throw new Error('Registration failed - no user data received');
        }
        
        const userData: User = {
          userId: userResponse.UserId || userResponse.userId,
          name: userResponse.Name || userResponse.name,
          email: userResponse.Email || userResponse.email,
          role: userResponse.UserType || userResponse.userType,
          status: userResponse.Status || userResponse.status
        };
        
        console.log('Setting user data:', userData); // Debug log
        
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(authToken);
        setUser(userData);
        
        // Return success - let the calling component handle navigation
        return true;
      }
      
      // Check for error in response
      if (response.Error || response.error) {
        throw new Error(response.Message || response.message || response.Error || response.error);
      }
      
      throw new Error(response.Message || response.message || 'Admin registration failed - no token received');
    } catch (error: any) {
      console.error('Admin registration error:', error); // Debug log
      
      // Handle API error responses
      if (error.response?.data) {
        const apiError = error.response.data;
        throw new Error(apiError.Message || apiError.message || apiError.Error || apiError.error || 'Admin registration failed');
      }
      
      throw new Error(error.message || 'Admin registration failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerTutor = useCallback(async (data: RegisterTutorFormData) => {
    setIsLoading(true);
    try {
      console.log('Attempting tutor registration with:', data); // Debug log
      const response = await authAPI.registerTutor(data);
      
      console.log('Tutor registration API response:', response); // Debug log
      
      // Extract token - check both uppercase and lowercase
      const authToken = response.Token || response.token;
      
      if (authToken) {
        // Extract user data - check both uppercase and lowercase
        const userResponse = response.User || response.user || response.data;
        
        if (!userResponse) {
          throw new Error('Registration failed - no user data received');
        }
        
        const userData: User = {
          userId: userResponse.UserId || userResponse.userId,
          name: userResponse.Name || userResponse.name,
          email: userResponse.Email || userResponse.email,
          role: userResponse.UserType || userResponse.userType,
          status: userResponse.Status || userResponse.status
        };
        
        console.log('Setting user data:', userData); // Debug log
        
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(authToken);
        setUser(userData);
        
        // Return success - let the calling component handle navigation
        return true;
      }
      
      // Check for error in response
      if (response.Error || response.error) {
        throw new Error(response.Message || response.message || response.Error || response.error);
      }
      
      throw new Error(response.Message || response.message || 'Tutor registration failed - no token received');
    } catch (error: any) {
      console.error('Tutor registration error:', error); // Debug log
      
      // Handle API error responses
      if (error.response?.data) {
        const apiError = error.response.data;
        throw new Error(apiError.Message || apiError.message || apiError.Error || apiError.error || 'Tutor registration failed');
      }
      
      throw new Error(error.message || 'Tutor registration failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    console.log('Logging out'); // Debug log
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // Use window.location for navigation since we can't use useNavigate here
    window.location.href = '/login';
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordFormData) => {
    try {
      const response = await authAPI.changePassword(data);
      
      if (response.success === false || response.Success === false) {
        throw new Error(response.Message || response.message || 'Password change failed');
      }
    } catch (error: any) {
      // Handle API error responses
      if (error.response?.data) {
        const apiError = error.response.data;
        throw new Error(apiError.Message || apiError.message || apiError.Error || apiError.error || 'Password change failed');
      }
      
      throw new Error(error.message || 'Password change failed');
    }
  }, []);

  const blockUser = useCallback(async (userId: number) => {
    try {
      const response = await authAPI.blockUser(userId);
      
      if (response.success === false || response.Success === false) {
        throw new Error(response.Message || response.message || 'Failed to block user');
      }
    } catch (error: any) {
      // Handle API error responses
      if (error.response?.data) {
        const apiError = error.response.data;
        throw new Error(apiError.Message || apiError.message || apiError.Error || apiError.error || 'Failed to block user');
      }
      
      throw new Error(error.message || 'Failed to block user');
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    login,
    registerUser,
    registerAdmin,
    registerTutor,
    logout,
    changePassword,
    blockUser,
    isLoading,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};