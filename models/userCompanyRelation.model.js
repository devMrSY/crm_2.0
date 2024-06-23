import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const userCompanyRelation = sequelize.define('userCompanyRelation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default userCompanyRelation;
