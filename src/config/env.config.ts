import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
const environment = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${environment}` });

export enum Environment {
  Development = 'development',
  Test = 'test',
  Production = 'production'
}

export const env = {
  // Server
  NODE_ENV: (process.env.NODE_ENV || Environment.Development) as Environment,
  PORT: Number(process.env.PORT || 3000),
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/messaging_db_dev',
  
  // External Services
  USER_SERVICE_URL: process.env.USER_SERVICE_URL || 'http://localhost:8080',
  USER_SERVICE_API_KEY: process.env.USER_SERVICE_API_KEY!,
  
  // Message Queue
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',

  // Utils
  isDevelopment: process.env.NODE_ENV === Environment.Development,
  isTest: process.env.NODE_ENV === Environment.Test,
  isProduction: process.env.NODE_ENV === Environment.Production
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'USER_SERVICE_API_KEY'
] as const;

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}

// Validate DATABASE_URL format
const validateDatabaseUrl = (url: string) => {
  try {
    new URL(url);
    if (!url.startsWith('postgresql://')) {
      throw new Error('DATABASE_URL must start with postgresql://');
    }
  } catch (error) {
    throw new Error('Invalid DATABASE_URL format');
  }
};

validateDatabaseUrl(env.DATABASE_URL); 