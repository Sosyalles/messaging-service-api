import { AppError } from '../../utils/errors';

/**
 * Validates and sanitizes numeric IDs
 * @param id The ID to validate
 * @param paramName The name of the parameter for error messages
 * @returns The validated and sanitized ID
 */
export const validateId = (id: any, paramName: string = 'ID'): number => {
  // Convert to number and check if it's valid
  const numId = Number(id);
  
  if (isNaN(numId) || !Number.isInteger(numId) || numId <= 0) {
    throw AppError.validation(`Invalid ${paramName}: must be a positive integer`);
  }

  // Additional checks for SQL injection prevention
  const idStr = String(id);
  if (idStr.includes(';') || idStr.includes('--') || idStr.includes('/*')) {
    throw AppError.validation(`Invalid ${paramName}: contains forbidden characters`);
  }

  return numId;
};

/**
 * Validates and sanitizes string input
 * @param input The string to validate
 * @param paramName The name of the parameter for error messages
 * @param options Validation options
 * @returns The validated and sanitized string
 */
export const validateString = (
  input: any,
  paramName: string,
  options: {
    minLength?: number;
    maxLength?: number;
    allowEmpty?: boolean;
    pattern?: RegExp;
  } = {}
): string => {
  const {
    minLength = 1,
    maxLength = 1000,
    allowEmpty = false,
    pattern
  } = options;

  if (typeof input !== 'string') {
    throw AppError.validation(`Invalid ${paramName}: must be a string`);
  }

  if (!allowEmpty && input.trim().length === 0) {
    throw AppError.validation(`${paramName} cannot be empty`);
  }

  if (input.length < minLength) {
    throw AppError.validation(`${paramName} must be at least ${minLength} characters long`);
  }

  if (input.length > maxLength) {
    throw AppError.validation(`${paramName} cannot exceed ${maxLength} characters`);
  }

  if (pattern && !pattern.test(input)) {
    throw AppError.validation(`Invalid ${paramName} format`);
  }

  // SQL Injection prevention
  const sqlInjectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,      // Basic patterns
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i, // Typical SQL injection
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i, // Basic OR attacks
    /(union).+(select)/i,                    // UNION based
    /exec(\s|\+)+(s|x)p\w+/i                // Stored procedure attacks
  ];

  for (const pattern of sqlInjectionPatterns) {
    if (pattern.test(input)) {
      throw AppError.validation(`Invalid ${paramName}: contains forbidden characters or patterns`);
    }
  }

  // Sanitize the string
  return input.trim();
};

/**
 * Validates request parameters for SQL injection and other security concerns
 * @param params Object containing request parameters
 * @returns Validated and sanitized parameters
 */
export const validateRequestParams = (params: Record<string, any>): Record<string, any> => {
  const sanitizedParams: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'number' || /^\d+$/.test(value)) {
      sanitizedParams[key] = validateId(value, key);
    } else if (typeof value === 'string') {
      sanitizedParams[key] = validateString(value, key);
    } else {
      sanitizedParams[key] = value; // Pass through other types
    }
  }

  return sanitizedParams;
}; 