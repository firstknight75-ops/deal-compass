/**
 * Production Error Handling Framework
 * Centralized, typed errors + safe response formatting.
 * Never leak stack traces in production.
 */

import { getConfig } from './config';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    (this as any).details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too Many Requests') {
    super(message, 429, 'RATE_LIMITED');
  }
}

export function handleApiError(error: unknown): Response {
  const config = getConfig();

  if (error instanceof AppError) {
    const body: any = {
      error: error.message,
      code: error.code,
    };
    if (!config.isProduction && (error as any).details) {
      body.details = (error as any).details;
    }
    return Response.json(body, { status: error.statusCode });
  }

  // Unexpected error
  console.error('[UNHANDLED ERROR]', error);

  const message = config.isProduction 
    ? 'Internal Server Error' 
    : (error as Error)?.message || 'Unknown error';

  return Response.json(
    { error: message, code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}

// Helper for route handlers
export function withErrorHandling(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (err) {
      return handleApiError(err);
    }
  };
}
