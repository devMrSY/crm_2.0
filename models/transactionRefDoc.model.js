import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const TransactionRefDoc = sequelize.define('transactionRefDocs', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  manualId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  settlementAmt: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  calcAmt: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default TransactionRefDoc;