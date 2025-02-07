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
  
  // Message Queue
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/messaging_db_dev',
  DB_SSL: process.env.DB_SSL === 'true',

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