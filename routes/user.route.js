import { authorize } from "../middleware/auth.js";
import { string } from '../constructor/string.js';
import { getUserAllTransactions } from "../controller/user.controller.js";
export const userRoute = (app) => {
    app.get('/api/user/user-transactions', authorize([string.User]), getUserAllTransactions);
};
