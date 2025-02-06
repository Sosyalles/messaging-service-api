import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Conversation extends Model {
  public id!: number;
  public userOneId!: number;
  public userTwoId!: number;
  public lastMessageId!: number | null;
  public readonly updatedAt!: Date;
}

Conversation.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userOneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_one_id'
  },
  userTwoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_two_id'
  },
  lastMessageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'last_message_id'
  }
}, {
  sequelize,
  tableName: 'conversations',
  underscored: true
}); 