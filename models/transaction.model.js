import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import { approval } from '../constructor/string.js';

const Transaction = sequelize.define('transaction', {
  transactionId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'transactionId'
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdForId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      approval.Pending,
      approval.Tally,
      approval.Carrier,
      approval.Admin,
      approval.Approved,
      approval.Rejected,
      approval.Paid,
    ),
    defaultValue: approval.Tally,
  },
  makerRefId: {
    type: DataTypes.UUID,
    defaultValue: null,
  },
  checkerRefId: {
    type: DataTypes.UUID,
    defaultValue: null,
  },
  paidAmt: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: -1
  }
});

export default Transaction;
