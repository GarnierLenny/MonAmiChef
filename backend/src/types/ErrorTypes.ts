// Error response interfaces for API
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: any;
}

export interface ValidationErrorResponse extends ErrorResponse {
  field?: string;
  validationErrors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

// Custom error classes for better error handling
export class APIError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends APIError {
  public field?: string;

  constructor(message: string, field?: string) {
    super(400, message);
    this.name = "ValidationError";
    this.field = field;
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string = "Resource") {
    super(404, `${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends APIError {
  constructor(message: string = "Forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends APIError {
  constructor(message: string = "Conflict") {
    super(409, message);
    this.name = "ConflictError";
  }
}

export class TooManyRequestsError extends APIError {
  constructor(message: string = "Too many requests") {
    super(429, message);
    this.name = "TooManyRequestsError";
  }
}

export class InternalServerError extends APIError {
  constructor(message: string = "Internal server error") {
    super(500, message);
    this.name = "InternalServerError";
  }
}

export class ServiceUnavailableError extends APIError {
  constructor(service: string = "Service") {
    super(503, `${service} is currently unavailable`);
    this.name = "ServiceUnavailableError";
  }
}

// Error utilities
export function createErrorResponse(
  error: APIError | Error,
  path?: string
): ErrorResponse {
  const statusCode = error instanceof APIError ? error.statusCode : 500;
  const details = error instanceof APIError ? error.details : undefined;

  return {
    error: error.name,
    message: error.message,
    statusCode,
    timestamp: new Date().toISOString(),
    path,
    details,
  };
}

export function handleControllerError(error: unknown, path?: string): ErrorResponse {
  console.error(`[Controller Error] ${path}:`, error);

  if (error instanceof APIError) {
    return createErrorResponse(error, path);
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes("Unique constraint failed")) {
      return createErrorResponse(new ConflictError("Resource already exists"), path);
    }

    if (error.message.includes("Record to update not found")) {
      return createErrorResponse(new NotFoundError(), path);
    }

    if (error.message.includes("Invalid `prisma")) {
      return createErrorResponse(new ValidationError("Invalid data provided"), path);
    }

    // Default to internal server error for unknown errors
    return createErrorResponse(new InternalServerError("An unexpected error occurred"), path);
  }

  return createErrorResponse(
    new InternalServerError("An unexpected error occurred"),
    path
  );
}