import { Sequelize } from 'sequelize';
import { env } from './env.config';

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export default sequelize;

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