export class AppError extends Error {
    constructor(
      message: string,
      public code: string,
      public statusCode: number = 500,
      public details?: any
    ) {
      super(message);
      this.name = 'AppError';
      Object.setPrototypeOf(this, AppError.prototype);
    }
  }
  
  export function createError(
    message: string,
    code: string,
    statusCode: number = 500,
    details?: any
  ): AppError {
    return new AppError(message, code, statusCode, details);
  }
  
  export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }
  
  export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unknown error occurred';
  }
  
  export function getErrorStack(error: unknown): string | undefined {
    if (error instanceof Error) {
      return error.stack;
    }
    return undefined;
  }
  
  export function logError(error: unknown, context?: string): void {
    const message = getErrorMessage(error);
    const stack = getErrorStack(error);
    
    console.error(`[${context || 'Error'}]`, {
      message,
      stack,
      error,
    });
  }
  
  export function handleAsyncError<T>(
    promise: Promise<T>,
    fallback?: T
  ): Promise<T | undefined> {
    return promise.catch((error) => {
      logError(error, 'AsyncError');
      return fallback;
    });
  }
  
  export function withErrorHandling<T extends (...args: any[]) => any>(
    fn: T,
    errorHandler?: (error: unknown) => void
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        return fn(...args);
      } catch (error) {
        if (errorHandler) {
          errorHandler(error);
        } else {
          logError(error, 'FunctionError');
        }
        throw error;
      }
    }) as T;
  }  