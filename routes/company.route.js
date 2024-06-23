import { string } from '../constructor/string.js';
import { changeStatus, companyCreate, getAllCompanies, getCompany } from '../controller/company.controller.js';
import { authorize } from '../middleware/auth.js';
import { validateActivateDeactivateCompany, validateCompanyCreate, validateCompanyId } from '../utils/commonSchema.js';
import customErrorHandler from '../utils/customErrorHandler.js';

export const companyRoute = (app) => {
  app.post('/api/company/create', validateCompanyCreate, customErrorHandler, authorize([string.Admin]), companyCreate);
  app.get('/api/company/list', customErrorHandler, authorize([string.Admin]), getAllCompanies);
  app.get('/api/company/:companyId', validateCompanyId, customErrorHandler, authorize([string.Admin]), getCompany);
  app.post(
    '/api/company/change-status',
    validateActivateDeactivateCompany,
    customErrorHandler,
    authorize([string.Admin]),
    changeStatus,
  );
};
