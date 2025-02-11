export interface LogData {
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

export interface LogAttributes {
  id?: number;
  timestamp: Date;
  level: string;
  message: string;
  service?: string;
  userId?: number;
  path?: string;
  method?: string;
  statusCode?: number;
  error?: any;
  stack?: string;
  metadata?: any;
  createdAt?: Date;
}

export interface LogOptions {
  service?: string;
  userId?: number;
  metadata?: any;
} 