import React from "react";
import { AlertTriangle, RefreshCw, Wifi, WifiOff, Clock, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ErrorType, type AppError } from "@/lib/errors";

interface ErrorAlertProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetry?: boolean;
  className?: string;
}

export function ErrorAlert({ 
  error, 
  onRetry, 
  onDismiss, 
  showRetry = true,
  className = "" 
}: ErrorAlertProps) {
  const getErrorIcon = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return <WifiOff className="h-4 w-4" />;
      case ErrorType.AUTH:
        return <Shield className="h-4 w-4" />;
      case ErrorType.API:
        if (error.statusCode === 408) return <Clock className="h-4 w-4" />;
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getErrorColor = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return "border-yellow-200 bg-yellow-50";
      case ErrorType.AUTH:
        return "border-blue-200 bg-blue-50";
      case ErrorType.API:
        return "border-red-200 bg-red-50";
      default:
        return "border-red-200 bg-red-50";
    }
  };

  const getIconColor = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return "text-yellow-600";
      case ErrorType.AUTH:
        return "text-blue-600";
      case ErrorType.API:
        return "text-red-600";
      default:
        return "text-red-600";
    }
  };

  const getTitleColor = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return "text-yellow-800";
      case ErrorType.AUTH:
        return "text-blue-800";
      case ErrorType.API:
        return "text-red-800";
      default:
        return "text-red-800";
    }
  };

  const getDescriptionColor = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return "text-yellow-700";
      case ErrorType.AUTH:
        return "text-blue-700";
      case ErrorType.API:
        return "text-red-700";
      default:
        return "text-red-700";
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return "Connection Issue";
      case ErrorType.AUTH:
        return "Authentication Required";
      case ErrorType.API:
        return "Request Failed";
      case ErrorType.VALIDATION:
        return "Validation Error";
      default:
        return "Error";
    }
  };

  return (
    <Alert className={`${getErrorColor()} ${className}`}>
      <div className={getIconColor()}>
        {getErrorIcon()}
      </div>
      <AlertTitle className={getTitleColor()}>
        {getErrorTitle()}
      </AlertTitle>
      <AlertDescription className={`${getDescriptionColor()} space-y-3`}>
        <p>{error.userMessage || error.message}</p>
        
        {(showRetry && (onRetry || error.retryable)) && (
          <div className="flex gap-2">
            {onRetry && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onRetry}
                className="bg-white hover:bg-gray-50"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Try Again
              </Button>
            )}
            {onDismiss && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onDismiss}
                className="text-gray-600 hover:text-gray-800"
              >
                Dismiss
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Compact inline error component
interface InlineErrorProps {
  error: AppError;
  onRetry?: () => void;
}

export function InlineError({ error, onRetry }: InlineErrorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{error.userMessage || error.message}</span>
      {onRetry && error.retryable && (
        <Button size="sm" variant="ghost" onClick={onRetry} className="h-6 px-2">
          <RefreshCw className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

// Network status indicator
export function NetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <Alert className="border-yellow-200 bg-yellow-50 mb-4">
      <WifiOff className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">You're offline</AlertTitle>
      <AlertDescription className="text-yellow-700">
        Some features may not work properly. Please check your internet connection.
      </AlertDescription>
    </Alert>
  );
}

// Loading error component for failed data fetches
interface LoadingErrorProps {
  error: AppError;
  onRetry: () => void;
  loading?: boolean;
}

export function LoadingError({ error, onRetry, loading = false }: LoadingErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-600" />
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900">Failed to load</h3>
        <p className="text-sm text-gray-600">{error.userMessage || error.message}</p>
      </div>

      <Button 
        onClick={onRetry} 
        disabled={loading}
        variant="outline"
        className="bg-white"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
            Retrying...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </>
        )}
      </Button>
    </div>
  );
}