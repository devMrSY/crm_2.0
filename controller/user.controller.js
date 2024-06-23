import { apiResponsePagination, apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";
import { approval } from "../constructor/string.js";
import Transaction from "../models/transaction.model.js";

export const getUserAllTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1 } = req.query; // required
    const limit = 10;

    const offset = page && limit ? (page - 1) * parseInt(limit, 10) : null;

    const whereClause = {};
    const options = {};

    if (page && limit) {
      options["limit"] = parseInt(limit, 10);
      options["offset"] = offset;
    }

    const { rows: transactions, count: totalTransactions } = await Transaction.findAndCountAll({
      where: { createdForId: userId, status: approval.Paid },
    });

    const totalPages = page && limit ? Math.ceil(totalTransactions / limit) : 1;

    const userAllTransaction = transactions.map((transaction) => {
      return {
        type: transaction.paidAmt > 0 ? "credit" : "debit",
        paidAmt: transaction.paidAmt,
        date: transaction.updatedAt,
      };
    });
    return apiResponsePagination(
      userAllTransaction,
      true,
      statusCode.success,
      "Transactions retrieved successfully",
      {
        totalItems: totalTransactions,
        totalPages: totalPages,
        page: page,
      },
      res
    );
  } catch (error) {
    return apiResponseErr(
      error.data ?? null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.errMessage ?? error.message,
      res
    );
  }
};
