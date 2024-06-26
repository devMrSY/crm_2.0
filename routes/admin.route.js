import { string } from "../constructor/string.js";
import {
  createAdmin,
  createTransaction,
  getAllUsers,
  createUser,
  getAllTransactions,
  approveTransaction,
  getUser,
  updateTransaction,
  getTallyData,
} from "../controller/admin.controller.js";
import { authorize } from "../middleware/auth.js";
import {
  validateAdminCreate,
  validateApproveTransaction,
  validateTransactionCreate,
  validateUserCreate,
  validateTallyData,
} from "../utils/commonSchema.js";
import customErrorHandler from "../utils/customErrorHandler.js";

export const adminRoute = (app) => {
  app.post(
    "/api/create-superAdmin",
    validateAdminCreate,
    customErrorHandler,
    createAdmin
  );
  app.post(
    "/api/admin/create-user",
    validateUserCreate,
    customErrorHandler,
    authorize([string.Admin]),
    createUser
  );
  app.get(
    "/api/admin/user-list",
    customErrorHandler,
    authorize([string.Admin, string.Carrier, string.Maker, string.Checker]),
    getAllUsers
  );
  app.get(
    "/api/admin/single-user/:userId",
    customErrorHandler,
    authorize([string.Admin, string.Carrier, string.Maker, string.Checker]),
    getUser
  );
  app.post(
    "/api/admin/transaction-create",
    validateTransactionCreate,
    customErrorHandler,
    authorize([string.Maker, string.Checker]),
    createTransaction
  );
  app.get(
    "/api/admin/transaction/list",
    // customErrorHandler,
    authorize([string.Admin, string.Carrier, string.Maker, string.Checker]),
    getAllTransactions
  );
  app.post(
    "/api/admin/tally-data",
    validateTallyData,
    customErrorHandler,
    authorize([string.Admin]),
    getTallyData
  );
  app.post(
    '/api/admin/approve-transaction',
    validateApproveTransaction,
    customErrorHandler,
    authorize([string.Admin, string.Carrier]),
    approveTransaction,
  );
  // app.post(
  //   '/api/admin/update-transaction',
  //   validateTransactionCreate,
  //   customErrorHandler,
  //   authorize([string.Admin, string.Maker, string.Checker]),
  //   updateTransaction,
  // );
};
