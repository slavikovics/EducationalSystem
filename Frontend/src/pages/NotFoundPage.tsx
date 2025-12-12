// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { AlertCircle, Home } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../components/ui/alert';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>404 - Page Not Found</AlertTitle>
          <AlertDescription>
            The page you are looking for doesn't exist or has been moved.
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold text-muted-foreground mb-2">404</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Oops! Looks like you've wandered into uncharted territory.
          </p>
          
          <Button asChild>
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};