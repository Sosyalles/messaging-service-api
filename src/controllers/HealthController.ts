import { Request, Response } from 'express';
import { sequelize } from '../config/database';
import { rabbitMQService } from '../services/RabbitMQService';
import { ApiResponse } from '../utils/response';

export const healthCheck = async (req: Request, res: Response) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    database: false,
    rabbitmq: false
  };

  try {
    await sequelize.authenticate();
    health.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    const channel = await rabbitMQService.getChannel();
    if (channel) {
      health.rabbitmq = true;
    }
  } catch (error) {
    console.error('RabbitMQ health check failed:', error);
  }

  const isHealthy = health.database && health.rabbitmq;
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json(
    ApiResponse.success(health, isHealthy ? 'Service is healthy' : 'Service is degraded')
  );
}; 