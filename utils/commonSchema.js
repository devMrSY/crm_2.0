import { body, param, query } from 'express-validator';
import { string } from '../constructor/string.js';

export const validateAdminCreate = [
  body('userName').notEmpty().withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role').notEmpty().withMessage('Role is required').isIn([string.Admin])
    .withMessage('Invalid role. Must be superAdmin"'),
];

export const validateAdminLogin = [
  body('userName').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateUserCreate = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('userName').notEmpty().withMessage('Username is required'),
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .isNumeric()
    .withMessage('Phone number must be numeric')
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must be exactly 10 digits'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .isString()
    .withMessage('Password must be a string'),
  body('role')
    .isIn([string.User, string.Maker, string.Checker, string.Carrier])
    .withMessage('Invalid role. Must be either "user", "maker", "checker", or "carrier"'),
];

export const validateUserLogin = [
  body('userName').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateCompanyCreate = [body('companyName').notEmpty().withMessage('Company name is required')];

export const validateCompanyId = [param('companyId').notEmpty().withMessage('Company ID is required')];

export const validateActivateDeactivateCompany = [
  body('companyId').notEmpty().withMessage('Company ID is required'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean value'),
];

export const validateTransactionCreate = [
  body('companyId').notEmpty().withMessage('Company ID is required'),
  body('createdForId').notEmpty().withMessage('Created For ID is required'),
  body('companyName').notEmpty().withMessage('companyName For ID is required'),
  body('customerName').notEmpty().withMessage('customerName For ID is required'),
  body('manualId').notEmpty().withMessage('Manual ID is required'),
  body('rate').notEmpty().withMessage('Rate is required').isDecimal().withMessage('Rate must be a number'),
  body('settlementAmt')
    .notEmpty()
    .withMessage('Settlement Amount is required')
    .isString()
    .withMessage('Settlement Amount must be a string')
    .custom((value) => {
      if (!value.includes('@')) {
        throw new Error('Settlement Amount format is invalid');
      }
      const [amount, type] = value.split('@');
      if (isNaN(parseFloat(amount))) {
        throw new Error('Settlement Amount must be a number');
      }
      if (type !== 'p' && type !== 'n') {
        throw new Error('Settlement Amount type must be "p" for positive or "n" for negative');
      }
      return true;
    }),
  body('role').notEmpty().withMessage('Role is required').isIn([string.Maker, string.Checker]).withMessage(`Role either be ${string.Maker} or ${string.Checker}`),
];

export const validateApproveTransaction = [
  body('makerRefId').notEmpty().withMessage('makerRefId is required'),
  body('makerRefId').notEmpty().notEmpty().withMessage('makerRefId is required'),
  body('status').notEmpty().withMessage('status is required'),
];

export const validateTallyData=[
  body('makerRefId').notEmpty().withMessage("MakerRefId is required"),
  body('checkerRefId').notEmpty().withMessage("CheckerRefId is required")
]
