import { apiResponsePagination, apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";
import { approval } from "../constructor/string.js";
import Transaction from "../models/transaction.model.js";

export const getUserAllTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const transaction = await Transaction.findAll({
      where: { createdForId: userId, status: approval.Paid },
    });

    const userAllTransaction = transaction.map((transaction) => {
      return {
        type: transaction.paidAmt > 0 ? "credit" : "debit",
        paidAmt: transaction.paidAmt,
        date: transaction.updatedAt,
      };
    });
    return apiResponseSuccess(userAllTransaction, true, statusCode.success, "Transactions retrieved successfully", res)
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
