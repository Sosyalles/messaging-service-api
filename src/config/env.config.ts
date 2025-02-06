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
  PORT: Number(process.env.PORT || 3000),
  NODE_ENV: (process.env.NODE_ENV || Environment.Development) as Environment,
  
  // External Services
  USER_SERVICE_URL: process.env.USER_SERVICE_URL || 'http://localhost:8080',
  USER_SERVICE_API_KEY: process.env.USER_SERVICE_API_KEY!,
  
  // Database
  DB: {
    HOST: process.env.DB_HOST!,
    PORT: Number(process.env.DB_PORT || 5432),
    USER: process.env.DB_USER!,
    PASSWORD: process.env.DB_PASSWORD!,
    NAME: process.env.DB_NAME!,
  },
  
  // JWT
  JWT: {
    SECRET: process.env.JWT_SECRET!,
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Utils
  isDevelopment: process.env.NODE_ENV === Environment.Development,
  isTest: process.env.NODE_ENV === Environment.Test,
  isProduction: process.env.NODE_ENV === Environment.Production
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'USER_SERVICE_API_KEY'
] as const;

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
} 