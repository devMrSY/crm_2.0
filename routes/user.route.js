import { authorize } from "../middleware/auth.js";
import { string } from '../constructor/string.js';
import { getUserAllTransactions } from "../controller/user.controller.js";
import { ValidateUserTransaction } from "../utils/commonSchema.js";
import customErrorHandler from "../utils/customErrorHandler.js";
export const userRoute = (app) => {
    // app.get('/api/user/user-transaction', ValidateUserTransaction, customErrorHandler, authorize([string.User]), getUserAllTransactions);
    app.get('/api/user/user-transaction', authorize([string.User]), getUserAllTransactions);
};
