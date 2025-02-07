import { Sequelize } from 'sequelize';
import { env } from './env.config';

// Connection pool configuration
const poolConfig = {
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  min: parseInt(process.env.DB_POOL_MIN || '0', 10),
  acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
  idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)
};

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV !== 'production',
  pool: poolConfig,
  define: {
    timestamps: true,
    underscored: true
  },
  dialectOptions: {
    ssl: env.DB_SSL ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// Connection management
let isConnected = false;

export const connectDB = async (): Promise<void> => {
  try {
    if (!isConnected) {
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
      isConnected = true;
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export const closeDB = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('Database connection closed successfully.');
    isConnected = false;
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};

// Graceful shutdown handler
process.on('SIGINT', async () => {
  try {
    await closeDB();
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}); 