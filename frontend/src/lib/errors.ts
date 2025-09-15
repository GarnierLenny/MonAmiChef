import * as Sentry from "@sentry/react";

// Error types for better categorization
export enum ErrorType {
  NETWORK = "NETWORK",
  API = "API", 
  AUTH = "AUTH",
  VALIDATION = "VALIDATION",
  UNKNOWN = "UNKNOWN"
}

export interface AppError extends Error {
  type: ErrorType;
  statusCode?: number;
  retryable?: boolean;
  userMessage?: string;
}

// Create custom error classes
export class NetworkError extends Error implements AppError {
  type = ErrorType.NETWORK as const;
  retryable = true;
  userMessage: string;

  constructor(message: string = "Network connection failed") {
    super(message);
    this.name = "NetworkError";
    this.userMessage = "Please check your internet connection and try again.";
  }
}

export class APIError extends Error implements AppError {
  type = ErrorType.API as const;
  statusCode: number;
  retryable: boolean;
  userMessage: string;

  constructor(statusCode: number, message: string = "API request failed") {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.retryable = statusCode >= 500; // Only retry server errors
    this.userMessage = this.getReadableMessage(statusCode, message);
  }

  private getReadableMessage(statusCode: number, originalMessage: string): string {
    switch (statusCode) {
      case 400:
        return "Invalid request. Please check your input and try again.";
      case 401:
        return "You need to sign in to continue.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 408:
        return "Request timed out. Please try again.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Our servers are experiencing issues. Please try again in a few moments.";
      default:
        return originalMessage || "Something went wrong. Please try again.";
    }
  }
}

export class AuthError extends Error implements AppError {
  type = ErrorType.AUTH as const;
  retryable = false;
  userMessage: string;

  constructor(message: string = "Authentication failed") {
    super(message);
    this.name = "AuthError";
    this.userMessage = "Please sign in again to continue.";
  }
}

export class ValidationError extends Error implements AppError {
  type = ErrorType.VALIDATION as const;
  retryable = false;
  userMessage: string;
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.userMessage = message;
  }
}

// Error categorization utility
export function categorizeError(error: unknown): AppError {
  if (error && typeof error === 'object' && 'type' in error && 'userMessage' in error) {
    return error as AppError;
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return new NetworkError();
  }

  if (error instanceof Error) {
    // Check if it's an HTTP error from our API client
    const httpMatch = error.message.match(/HTTP (\d+)/);
    if (httpMatch) {
      const statusCode = parseInt(httpMatch[1]);
      return new APIError(statusCode, error.message);
    }

    // Check for specific error patterns
    if (error.message.includes("Not authenticated")) {
      return new AuthError();
    }

    if (error.message.includes("Network request failed") || 
        error.message.includes("Failed to fetch")) {
      return new NetworkError();
    }
  }

  // Default to unknown error
  const unknownError = new Error(
    error instanceof Error ? error.message : String(error)
  ) as AppError;
  unknownError.type = ErrorType.UNKNOWN;
  unknownError.retryable = false;
  unknownError.userMessage = "An unexpected error occurred. Please try again.";

  return unknownError;
}

// Error reporting utilities
export function reportError(error: AppError, context?: Record<string, any>) {
  // Add error context for Sentry
  Sentry.withScope((scope) => {
    scope.setTag("errorType", error.type);
    scope.setLevel(error.type === ErrorType.NETWORK ? "warning" : "error");
    
    if (error.statusCode) {
      scope.setTag("statusCode", error.statusCode);
    }
    
    if (context) {
      scope.setContext("errorContext", context);
    }

    scope.setFingerprint([error.type, error.message]);
    
    Sentry.captureException(error);
  });

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error(`[${error.type}]`, error.message, context);
  }
}

// User-friendly error messages
export const ERROR_MESSAGES = {
  OFFLINE: "You appear to be offline. Please check your connection.",
  TIMEOUT: "Request timed out. Please try again.",
  SERVER_ERROR: "Our servers are having trouble. We're working to fix this.",
  NOT_FOUND: "The requested item could not be found.",
  UNAUTHORIZED: "Please sign in to continue.",
  FORBIDDEN: "You don't have permission for this action.",
  RATE_LIMITED: "Too many requests. Please wait a moment.",
  VALIDATION_FAILED: "Please check your input and try again.",
  GENERIC: "Something went wrong. Please try again.",
} as const;

// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  retryCondition: (error: AppError) => boolean;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  retryCondition: (error: AppError) => error.retryable || false,
};

// Retry utility function
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: AppError;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = categorizeError(error);
      
      // Don't retry if error is not retryable or this is the last attempt
      if (!finalConfig.retryCondition(lastError) || attempt === finalConfig.maxAttempts) {
        throw lastError;
      }

      // Wait before retrying with exponential backoff
      const delay = finalConfig.delayMs * Math.pow(finalConfig.backoffMultiplier, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}