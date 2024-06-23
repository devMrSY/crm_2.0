import { apiResponsePagination, apiResponseErr, apiResponseSuccess } from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import { approval } from "../constructor/string";
import { string } from "../constructor/string.js";

export const getUserAllTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const transaction = Transaction.findAll({
      where: { createdForId: userId, status: approval.Paid },
    });
    const userAllTransaction = await transaction.map((transaction) => {
      return {
        type: transaction.paidAmt > 0 ? "credit" : "debit",
        paidAmt: transaction.paidAmt,
        date: transaction.updatedAt,
      };

    });
    return apiResponseSuccess(userAllTransaction,true,statusCode.success,"Transactions retrieved successfully",res)
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
