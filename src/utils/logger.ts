import winston from 'winston';
import { Log, LogAttributes } from '../models/Log';

interface LogData {
  level: string;
  message: string;
  timestamp: string;
  service?: string;
  userId?: number;
  path?: string;
  method?: string;
  statusCode?: number;
  error?: any;
  stack?: string;
  metadata?: any;
}

class Logger {
  private logger: winston.Logger;
  private static instance: Logger;

  private constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'messaging-service' },
      transports: [
        // File transport for errors
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),
        
        // File transport for all logs
        new winston.transports.File({ 
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      ]
    });

    // Add console transport in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async saveToDatabase(logData: LogAttributes) {
    try {
      await Log.create(logData);
    } catch (error) {
      console.error('Failed to save log to database:', error);
      // Still log to file if database save fails
      this.logger.error('Failed to save log to database', { error, logData });
    }
  }

  info(message: string, metadata?: any) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: any) {
    this.log('warn', message, metadata);
  }

  error(message: string, error?: any, metadata?: any) {
    this.log('error', message, {
      ...metadata,
      error: error?.message || error,
      stack: error?.stack
    });
  }

  debug(message: string, metadata?: any) {
    this.log('debug', message, metadata);
  }

  private log(level: string, message: string, metadata?: any) {
    const timestamp = new Date();
    const logData: LogAttributes = {
      timestamp,
      level,
      message,
      service: 'messaging-service',
      ...metadata
    };

    // Log to files
    this.logger.log({ level, message, ...metadata, timestamp });
    
    // Save to database
    this.saveToDatabase(logData);
  }

  // HTTP request logging
  logRequest(req: any, res: any, error?: any) {
    const timestamp = new Date();
    const logData: LogAttributes = {
      timestamp,
      level: error ? 'error' : 'info',
      message: error ? `Request Failed: ${error.message}` : 'Request Completed',
      service: 'messaging-service',
      userId: req.user?.userId,
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      error: error ? {
        name: error.name,
        message: error.message,
        code: error.code
      } : undefined,
      stack: error?.stack,
      metadata: {
        query: req.query,
        params: req.params,
        headers: req.headers,
        responseTime: res.responseTime
      }
    };

    // Log to files
    this.logger.log(logData);

    // Save to database
    this.saveToDatabase(logData);
  }
}

export const logger = Logger.getInstance(); 