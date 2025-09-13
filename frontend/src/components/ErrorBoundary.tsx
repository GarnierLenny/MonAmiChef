import React from "react";
import * as Sentry from "@sentry/react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  eventId: string | null;
}

export function ErrorFallback({ error, resetError, eventId }: ErrorFallbackProps) {
  const handleReportError = () => {
    if (eventId) {
      // Open Sentry user feedback dialog
      Sentry.showReportDialog({ eventId });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">
            We're sorry, but something unexpected happened. Our team has been notified and is working on a fix.
          </p>
        </div>

        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error Details</AlertTitle>
          <AlertDescription className="text-red-700 font-mono text-sm mt-2">
            {error.message}
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button 
            onClick={resetError} 
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'} 
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Homepage
          </Button>

          {eventId && (
            <Button 
              variant="ghost" 
              onClick={handleReportError} 
              className="w-full text-gray-600 hover:text-gray-800"
            >
              <Bug className="w-4 h-4 mr-2" />
              Report this issue
            </Button>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Error ID: {eventId || 'Not available'}</p>
          <p className="mt-1">Please include this ID when reporting the issue</p>
        </div>
      </div>
    </div>
  );
}

// Main Error Boundary component using Sentry's ErrorBoundary
export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError, eventId }) => (
        <ErrorFallback error={error} resetError={resetError} eventId={eventId} />
      )}
      beforeCapture={(scope, error, errorInfo) => {
        // Add additional context to Sentry
        scope.setTag("errorBoundary", "app");
        scope.setContext("errorInfo", errorInfo);
        scope.setLevel("error");
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

// Smaller error boundary for specific components
interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  componentName?: string;
}

export function ComponentErrorBoundary({ 
  children, 
  fallback: FallbackComponent,
  componentName = "Component" 
}: ComponentErrorBoundaryProps) {
  const DefaultFallback = ({ error, resetError }: ErrorFallbackProps) => (
    <Alert className="m-4 bg-red-50 border-red-200">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">{componentName} Error</AlertTitle>
      <AlertDescription className="text-red-700 space-y-2">
        <p>This component encountered an error and couldn't load properly.</p>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={resetError}
          className="mt-2"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );

  return (
    <Sentry.ErrorBoundary
      fallback={FallbackComponent || DefaultFallback}
      beforeCapture={(scope, error, errorInfo) => {
        scope.setTag("errorBoundary", "component");
        scope.setTag("componentName", componentName);
        scope.setContext("errorInfo", errorInfo);
        scope.setLevel("warning");
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}