import { HttpException, HttpStatus } from '@nestjs/common';
import { type ErrorCode } from './error-codes';

/**
 * Response structure for API errors
 */
export interface AppErrorResponse {
  /** Machine-readable error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: Record<string, unknown>;
  /** ISO timestamp when error occurred */
  timestamp: string;
  /** Request path (added by filter) */
  path?: string;
}

/**
 * Standardized application exception
 *
 * Provides consistent error responses across all API endpoints with:
 * - Machine-readable error codes for client handling
 * - Human-readable messages for display
 * - Optional details for debugging
 *
 * @example
 * // Basic usage
 * throw new AppException(
 *   TEE_TIME_BLOCKED,
 *   'This tee time is blocked for maintenance',
 *   HttpStatus.BAD_REQUEST,
 * );
 *
 * @example
 * // With details
 * throw new AppException(
 *   TEE_TIME_FULLY_BOOKED,
 *   'Only 2 positions available at this tee time',
 *   HttpStatus.CONFLICT,
 *   { availableSlots: 2, requestedSlots: 4, teeTime: '08:30' },
 * );
 */
export class AppException extends HttpException {
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode | string,
    message: string,
    statusCode: HttpStatus,
    details?: Record<string, unknown>,
  ) {
    const response: AppErrorResponse = {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };

    super(response, statusCode);
    this.code = code;
    this.details = details;
  }
}

/**
 * Factory functions for common error types
 */

export function notFound(
  code: ErrorCode | string,
  message: string,
  details?: Record<string, unknown>,
): AppException {
  return new AppException(code, message, HttpStatus.NOT_FOUND, details);
}

export function badRequest(
  code: ErrorCode | string,
  message: string,
  details?: Record<string, unknown>,
): AppException {
  return new AppException(code, message, HttpStatus.BAD_REQUEST, details);
}

export function conflict(
  code: ErrorCode | string,
  message: string,
  details?: Record<string, unknown>,
): AppException {
  return new AppException(code, message, HttpStatus.CONFLICT, details);
}

export function forbidden(
  code: ErrorCode | string,
  message: string,
  details?: Record<string, unknown>,
): AppException {
  return new AppException(code, message, HttpStatus.FORBIDDEN, details);
}

export function unauthorized(
  code: ErrorCode | string,
  message: string,
  details?: Record<string, unknown>,
): AppException {
  return new AppException(code, message, HttpStatus.UNAUTHORIZED, details);
}

export function internal(
  code: ErrorCode | string,
  message: string,
  details?: Record<string, unknown>,
): AppException {
  return new AppException(
    code,
    message,
    HttpStatus.INTERNAL_SERVER_ERROR,
    details,
  );
}
