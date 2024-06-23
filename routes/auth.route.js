import { login } from '../controller/auth.controller.js';
import { validateAdminLogin } from '../utils/commonSchema.js';
import customErrorHandler from '../utils/customErrorHandler.js';

export const authRoute = (app) => {
  app.post('/api/login', validateAdminLogin, customErrorHandler, login);
  // app.post('/api/logout',  customErrorHandler, logout);
};
