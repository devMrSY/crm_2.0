import { apiResponseErr, apiResponsePagination, apiResponseSuccess } from '../utils/response.js';
import { statusCode } from '../utils/statusCodes.js';
import { v4 as uuidv4 } from 'uuid';
import Company from '../models/company.model.js';
import { Op } from 'sequelize';

export const companyCreate = async (req, res) => {
  try {
    const { companyName } = req.body;

    const existingCompany = await Company.findOne({ where: { companyName: companyName } });

    if (existingCompany) {
      return apiResponseErr(null, false, statusCode.badRequest, 'Company already exist', res);
    }

    const newAdmin = await Company.create({
      companyId: uuidv4(),
      companyName,
    });

    return apiResponseSuccess(newAdmin, true, statusCode.create, 'Company create successfully', res);
  } catch (error) {
    apiResponseErr(
      error.data ?? null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.errMessage ?? error.message,
      res
    )
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const { page, limit, search = '' } = req.query;

    const offset = page && limit ? (page - 1) * parseInt(limit, 10) : null;

    const whereClause = {
      isActive: true,
      companyName: {
        [Op.like]: `%${search}%`,
      },
    };

    const options = {
      where: whereClause,
    };

    if (page && limit) {
      options.limit = parseInt(limit, 10);
      options.offset = offset;
    }

    const { rows: companies, count: totalCompanies } = await Company.findAndCountAll(options);

    const totalPages = page && limit ? Math.ceil(totalCompanies / limit) : 1;

    return apiResponsePagination(companies, true, statusCode.success, 'Companies retrieved successfully', {
      totalItems: totalCompanies,
      totalPages: totalPages,
      page: page || 1,
    }, res)
  } catch (error) {
    apiResponseErr(
      error.data ?? null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.errMessage ?? error.message,
      res
    )
  }
};

export const getCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findOne({
      where: {
        companyId,
      },
    });

    if (!company) {
      return apiResponseErr(null, false, statusCode.notFound, 'Company not found', res);
    }

    return apiResponseSuccess(company, true, statusCode.success, 'Company retrieved successfully', res);
  } catch (error) {
    apiResponseErr(
      error.data ?? null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.errMessage ?? error.message,
      res
    )
  }
};

export const changeStatus = async (req, res) => {
  try {
    const { isActive, companyId } = req.body;

    const company = await Company.findOne({
      where: {
        companyId,
      },
    });

    if (!company) {
      return apiResponseErr(null, false, statusCode.notFound, 'Company not found', res);
    }

    await company.update({ isActive });

    const message = isActive ? 'Company activated successfully' : 'Company deactivated successfully';

    return apiResponseSuccess(null, true, statusCode.success, message, res);
  } catch (error) {
    apiResponseErr(
      error.data ?? null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.errMessage ?? error.message,
      res
    )
  }
};
