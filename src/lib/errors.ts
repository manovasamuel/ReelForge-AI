// Custom error classes for structured error handling

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code: string = "VALIDATION_ERROR") {
    super(message, code, 400);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ExternalServiceError extends AppError {
  public readonly service: string;

  constructor(service: string, message: string, code: string = "EXTERNAL_SERVICE_ERROR") {
    super(`[${service}] ${message}`, code, 502);
    this.name = "ExternalServiceError";
    this.service = service;
  }
}

export class InstagramError extends ExternalServiceError {
  constructor(message: string) {
    super("Instagram", message, "INSTAGRAM_ERROR");
    this.name = "InstagramError";
  }
}

export class AIProviderError extends ExternalServiceError {
  constructor(provider: string, message: string) {
    super(provider, message, "AI_PROVIDER_ERROR");
    this.name = "AIProviderError";
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfterMs: number;

  constructor(service: string, retryAfterMs: number = 60000) {
    super(`Rate limited by ${service}. Retry after ${retryAfterMs}ms.`, "RATE_LIMIT", 429);
    this.name = "RateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}

// Structured API error response type
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Helper to create NextResponse-compatible error responses
export function createErrorResponse(error: unknown): ApiErrorResponse {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
      },
    };
  }

  // Unknown errors — don't leak details
  return {
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    },
  };
}

export function getStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return 500;
}
