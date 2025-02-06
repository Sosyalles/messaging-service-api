import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

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

export class Log extends Model<LogAttributes> implements LogAttributes {
  public id!: number;
  public timestamp!: Date;
  public level!: string;
  public message!: string;
  public service?: string;
  public userId?: number;
  public path?: string;
  public method?: string;
  public statusCode?: number;
  public error?: any;
  public stack?: string;
  public metadata?: any;
  public readonly createdAt!: Date;
}

Log.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    level: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    service: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id'
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'status_code'
    },
    error: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    stack: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'application_logs',
    timestamps: true,
    indexes: [
      { fields: ['timestamp'] },
      { fields: ['level'] },
      { fields: ['user_id'] },
      { fields: ['status_code'] }
    ]
  }
); 