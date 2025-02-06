import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Message extends Model {
  public id!: number;
  public senderId!: number;
  public receiverId!: number;
  public content!: string;
  public isRead!: boolean;
  public createdAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
  }
); 