// src/pages/NotFoundPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { AlertCircle, Home, Compass, Ghost, Search, ArrowLeft, Navigation, Map, Zap, Sparkles, Satellite } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../components/ui/alert';

export const NotFoundPage: React.FC = () => {
  const [animateAlert, setAnimateAlert] = useState(false);
  const [animateContent, setAnimateContent] = useState(false);
  const [animateButton, setAnimateButton] = useState(false);
  const [floatingElements, setFloatingElements] = useState<Array<{id: number, x: number, y: number, size: number}>>([]);

  useEffect(() => {
    // Stagger animations
    setTimeout(() => setAnimateAlert(true), 300);
    setTimeout(() => setAnimateContent(true), 600);
    setTimeout(() => setAnimateButton(true), 900);

    // Create floating elements
    const elements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
    }));
    setFloatingElements(elements);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute rounded-full bg-gradient-to-r from-primary/10 to-secondary/10"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.size}px`,
              height: `${element.size}px`,
              animation: `float-particle ${3 + element.id * 0.2}s ease-in-out infinite`,
              animationDelay: `${element.id * 0.2}s`,
            }}
          />
        ))}
        
        {/* Large floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full animate-float animation-delay-1000" />
        <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-bl from-accent/5 to-transparent rounded-full animate-float-slow animation-delay-2000" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,oklch(var(--muted))_1px,transparent_0)] bg-[length:40px_40px] opacity-[0.03]" />
      </div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Error Alert with Animation */}
<Alert 
  variant="destructive"
  className={`
    transform transition-all duration-700
    ${animateAlert ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-10 opacity-0 scale-95'}
    border-l-4 border-l-destructive
    hover:shadow-lg hover:scale-[1.02] transition-all duration-300
    relative overflow-hidden
  `}
>
  <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 via-transparent to-destructive/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
  
  <div className="relative z-10">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-full bg-destructive/10 animate-pulse">
        <AlertCircle className="h-5 w-5 text-destructive animate-pulse" />
      </div>
      <div>
        <AlertTitle className="flex items-center gap-2 w-80 text-base font-semibold">
          404 - Page Not Found
          <Sparkles className="h-4 w-4 text-destructive/70 animate-pulse-slow" />
        </AlertTitle>
        <AlertDescription className="mt-1 text-sm">
          The page you are looking for doesn't exist or has been moved.
        </AlertDescription>
      </div>
    </div>
  </div>
</Alert>

        {/* Main Content */}
        <div className={`
          text-center space-y-8 transform transition-all duration-700
          ${animateContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        `}>
          {/* 404 Number with Animation */}
          <div className="relative">
            <div className="text-[120px] md:text-[140px] font-bold tracking-tighter leading-none">
              <span className="text-transparent bg-gradient-to-br from-destructive/20 via-muted-foreground/10 to-background bg-clip-text">
                4
              </span>
              <span className={`
                text-transparent bg-gradient-to-br from-destructive via-destructive/70 to-destructive/40 bg-clip-text
                relative inline-block animate-pulse-slow
              `}>
                0
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/30 to-transparent blur-xl opacity-50" />
              </span>
              <span className="text-transparent bg-gradient-to-br from-background via-muted-foreground/10 to-destructive/20 bg-clip-text">
                4
              </span>
            </div>
            
            {/* Animated orbiting elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
              <div className="absolute inset-0 animate-spin-slow">
                <Compass className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary/50" />
                <Navigation className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 h-5 w-5 text-secondary/50" />
                <Map className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-6 w-6 text-accent/50" />
                <Satellite className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 h-5 w-5 text-muted-foreground/50" />
              </div>
            </div>
          </div>

          {/* Message with Animation */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-3">
              <Ghost className="h-6 w-6 text-primary animate-float" />
              <span>You've Discovered</span>
              <Ghost className="h-6 w-6 text-secondary animate-float animation-delay-500" />
            </h2>
            <div className="space-y-3">
              <p className="text-xl text-muted-foreground animate-fade-in">
                The <span className="font-semibold text-primary">Digital Void</span>
              </p>
              <p className="text-muted-foreground max-w-sm mx-auto animate-fade-in animation-delay-200">
                This uncharted territory doesn't exist in our database. 
                Maybe it's lost in cyberspace?
              </p>
            </div>

            {/* Search Icon Animation */}
            <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-muted to-background border animate-pulse-slow">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Animated Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto animate-fade-in animation-delay-400">
              <div className="p-3 rounded-lg bg-gradient-to-b from-muted/50 to-background border text-center">
                <div className="text-2xl font-bold text-primary animate-count-up">404</div>
                <div className="text-xs text-muted-foreground">Error Code</div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-b from-muted/50 to-background border text-center">
                <div className="text-2xl font-bold text-secondary animate-count-up animation-delay-200">∞</div>
                <div className="text-xs text-muted-foreground">Possibilities</div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-b from-muted/50 to-background border text-center">
                <div className="text-2xl font-bold text-accent animate-count-up animation-delay-400">1</div>
                <div className="text-xs text-muted-foreground">Way Back</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`
          flex flex-col sm:flex-row gap-4 justify-center transform transition-all duration-700
          ${animateButton ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
        `}>
          <Button 
            asChild
            size="lg"
            className="hover-scale transition-smooth group relative overflow-hidden"
          >
            <Link to="/dashboard">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Back to Dashboard
              <Zap className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all" />
            </Link>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="hover-scale transition-smooth group"
          >
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </Button>
        </div>

        {/* Fun Easter Egg Text */}
        <div className="text-center mt-8 animate-fade-in animation-delay-800">
          <p className="text-xs text-muted-foreground/50 flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3 animate-spin-slow" />
            Pro tip: This page exists because you tried to access something that doesn't exist
            <Sparkles className="h-3 w-3 animate-spin-slow animation-delay-300" />
          </p>
        </div>
      </div>

      {/* Animated corner decorations */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-primary/20 rounded-tl-lg animate-pulse-slow" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-secondary/20 rounded-tr-lg animate-pulse-slow animation-delay-500" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-accent/20 rounded-bl-lg animate-pulse-slow animation-delay-1000" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-primary/20 rounded-br-lg animate-pulse-slow animation-delay-1500" />
    </div>
  );
};