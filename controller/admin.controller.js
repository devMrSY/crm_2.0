import {
  apiResponseErr,
  apiResponseSuccess,
  apiResponsePagination,
} from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import { approval, string } from "../constructor/string.js";
import CustomError from "../utils/extendError.js";
import TransactionRefDoc from "../models/transactionRefDoc.model.js";
import { Op } from "sequelize";

dotenv.config();

export const createAdmin = async (req, res) => {
  try {
    let { userName, password, role } = req.body;
    userName = userName.toLowerCase();

    const existingAdmin = await User.findOne({ where: { userName: userName } });

    if (existingAdmin) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Admin already exist",
        res
      );
    }

    const newAdmin = await User.create({
      userId: uuidv4(),
      userName,
      password,
      role,
    });

    return apiResponseSuccess(
      newAdmin,
      true,
      statusCode.create,
      "Admin create successfully",
      res
    );
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(
        apiResponseErr(
          error.data ?? null,
          false,
          error.responseCode ?? statusCode.internalServerError,
          error.errMessage ?? error.message
        )
      );
  }
};

export const createUser = async (req, res) => {
  try {
    console.log("req.body", req.body);
    let { firstName, lastName, userName, phoneNumber, password, role } =
      req.body;
    userName = userName.toLowerCase();

    const existingUser = await User.findOne({ where: { userName } });
    if (existingUser) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "User already exists",
        res
      );
    }

    if (isNaN(phoneNumber)) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Phone Number must be a number",
        res
      );
    }

    const userId = uuidv4();

    const newUser = await User.create({
      userId,
      firstName,
      lastName,
      userName,
      phoneNumber,
      password,
      role,
    });

    return apiResponseSuccess(
      newUser,
      true,
      statusCode.create,
      "User created successfully",
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

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ where: { role: string.User } });

    if (users.length === 0) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "No user found",
        res
      );
    }

    return users, true, statusCode.success, "Users retrieved successfully", res;
  } catch (error) {
    apiResponseErr(
      error.data ?? null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.errMessage ?? error.message,
      res
    );
  }
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({
      where: { userId: userId, role: string.User },
    });

    if (!user) {
      return res
        .status(statusCode.badRequest)
        .json(
          apiResponseErr(null, false, statusCode.badRequest, "No user found")
        );
    }
    return res
      .status(statusCode.success)
      .json(
        apiResponseSuccess(
          user,
          true,
          statusCode.success,
          "User retrieved successfully"
        )
      );
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(
        apiResponseErr(
          error.data ?? null,
          false,
          error.responseCode ?? statusCode.internalServerError,
          error.errMessage ?? error.message
        )
      );
  }
};

export const createTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      companyId,
      createdForId,
      manualId,
      rate,
      settlementAmt,
      role,
      companyName,
      customerName,
      admin,
    } = req.body;

    const [amount, type] = settlementAmt.split("@");
    const amountValue = amount;

    const calcAmtValue = rate * amountValue * (type === "p" ? -1 : 1);

    let transaction = await Transaction.findOne({
      where: {
        companyId: companyId,
        createdForId: createdForId,
        status: approval.Tally,
      },
    });

    console.log("transaction", transaction);

    const doneBy = {
      maker: false,
      checker: false,
    };

    const newTransactionObj = {};

    const isTransactionExist = transaction ? true : false;

    if (isTransactionExist) {
      if (transaction && transaction.makerRefId) {
        doneBy.maker = true;
      }
      if (transaction && transaction.checkerRefId) {
        doneBy.checker = true;
      }

      console.log(doneBy);

      if (
        (doneBy.maker && doneBy.checker) ||
        (doneBy.maker && role === string.Maker) ||
        (doneBy.checker && role === string.Checker)
      ) {
        throw new CustomError(
          "Request already pending. Please edit from edit panel",
          null,
          409
        );
      }
    }

    newTransactionObj["transactionId"] = transaction?.transactionId
      ? transaction?.transactionId
      : uuidv4();
    newTransactionObj["companyId"] = companyId;
    newTransactionObj["companyName"] = companyName;
    newTransactionObj["createdById"] = userId;
    newTransactionObj["createdForId"] = createdForId;
    newTransactionObj["customerName"] = customerName;
    newTransactionObj["manualId"] = manualId;
    newTransactionObj["rate"] = rate;
    newTransactionObj["settlementAmt"] = settlementAmt;
    newTransactionObj["date"] = new Date();
    newTransactionObj["calcAmt"] = calcAmtValue;
    newTransactionObj["role"] = role;

    // transaction Reference Object
    let transactionReferenceDoc = {
      id: uuidv4(),
      createdById: userId,
      manualId: manualId,
      rate: rate,
      settlementAmt: settlementAmt,
      date: new Date(),
      calcAmt: calcAmtValue,
      role: role,
    };

    if (role === string.Maker) {
      transactionReferenceDoc = await TransactionRefDoc.create({
        ...transactionReferenceDoc,
      });
      newTransactionObj["makerRefId"] = transactionReferenceDoc.id;
    } else if (role === string.Checker) {
      transactionReferenceDoc = await TransactionRefDoc.create({
        ...transactionReferenceDoc,
      });
      newTransactionObj["checkerRefId"] = transactionReferenceDoc.id;
    }

    if (transaction) {
      transaction = await Transaction.update(
        { ...newTransactionObj },
        {
          where: { transactionId: transaction.transactionId },
        }
      );
    } else {
      transaction = await Transaction.create({
        ...newTransactionObj,
      });
    }

    return apiResponseSuccess(
      transaction,
      true,
      statusCode.create,
      "Successfully record saved",
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

export const getAllTransactions = async (req, res) => {
  try {
    const { page, limit, status = "", companyName = "" } = req.query;

    const offset = page && limit ? (page - 1) * parseInt(limit, 10) : null;

    const whereClause = {};
    const options = {};

    if (status) whereClause["status"] = status;
    if (companyName) whereClause["companyName"] = companyName;

    if (page && limit) {
      options["limit"] = parseInt(limit, 10);
      options["offset"] = offset;
    }

    const { rows: transactions, count: totalTransactions } =
      await Transaction.findAndCountAll({ ...options, where: whereClause });

    const totalPages = page && limit ? Math.ceil(totalTransactions / limit) : 1;

    // const transactions = await Transaction.findAll();

    // return apiResponseSuccess(transactions, true, statusCode.success, 'All transactions retrieved successfully', res);
    return apiResponsePagination(
      transactions,
      true,
      statusCode.success,
      "All transactions retrieved successfully",
      {
        totalItems: totalTransactions,
        totalPages: totalPages,
        page: page || 1,
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

export const approveTransaction = async (req, res) => {
  try {
    const { createdForId, status } = req.body;
    const { userId } = req.user;

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(statusCode.badRequest)
        .json(
          apiResponseErr(null, false, statusCode.badRequest, "User not found")
        );
    }

    const transaction = await Transaction.findOne({ where: { createdForId } });
    if (!transaction) {
      return res
        .status(statusCode.badRequest)
        .json(
          apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            "Transaction not found"
          )
        );
    }

    if (status === "approved") {
      if (user.role === string.Maker) {
        transaction.status = approval.Tally;
      } else if (user.role === string.Checker) {
        transaction.status = approval.Carrier;
      } else if (user.role === string.Carrier) {
        transaction.status = approval.Admin;
      } else if (user.role === string.Admin) {
        transaction.status = approval.Approved;
      }
    } else if (status === "rejected") {
      transaction.status = approval.Rejected;
    } else {
      return res
        .status(statusCode.badRequest)
        .json(
          apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            "Invalid status provided"
          )
        );
    }

    await transaction.save();

    return res
      .status(statusCode.success)
      .json(
        apiResponseSuccess(
          transaction,
          true,
          statusCode.success,
          "Transaction status updated successfully"
        )
      );
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(
        apiResponseErr(
          error.data ?? null,
          false,
          error.responseCode ?? statusCode.internalServerError,
          error.errMessage ?? error.message
        )
      );
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const {
      transactionId,
      companyId,
      createdForId,
      manualId,
      rate,
      settlementAmt,
      role,
    } = req.body;

    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) {
      return res
        .status(statusCode.badRequest)
        .json(
          apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            "Transaction not found"
          )
        );
    }

    const [amount, type] = settlementAmt.split("@");
    const amountValue = parseFloat(amount);
    const calcAmtValue = rate * amountValue * (type === "p" ? -1 : 1);

    transaction.companyId = companyId || transaction.companyId;
    transaction.createdForId = createdForId || transaction.createdForId;
    transaction.manualId = manualId || transaction.manualId;
    transaction.rate = rate || transaction.rate;
    transaction.settlementAmt = settlementAmt || transaction.settlementAmt;
    transaction.calcAmt = calcAmtValue;
    transaction.role = role || transaction.role;
    transaction.updatedAt = new Date();

    await transaction.save();

    return res
      .status(statusCode.success)
      .json(
        apiResponseSuccess(
          transaction,
          true,
          statusCode.success,
          "Transaction updated successfully"
        )
      );
  } catch (error) {
    res
      .status(statusCode.internalServerError)
      .send(
        apiResponseErr(
          error.data ?? null,
          false,
          error.responseCode ?? statusCode.internalServerError,
          error.errMessage ?? error.message
        )
      );
  }
};

export const getTallyData = async (req, res) => {
  try {
    const { makerRefId, checkerRefId } = req.body;

    const makerRefData = await TransactionRefDoc.findOne({
      where: { id: makerRefId },
    });

    const checkerRefData = await TransactionRefDoc.findOne({
      where: { id: checkerRefId },
    });
    console.log(makerRefData,checkerRefData)
    if (!makerRefData || !checkerRefData) {
      throw new Error(
        `${
          makerRefData ? "Record found for maker" : "Record not found for maker"
        } and ${
          checkerRefData
            ? "Record found for checker"
            : "Record not found for checker"
        }`
      );
    }

    const tallyData = {
      makerRefDetails: makerRefData,
      checkerRefDetails: checkerRefData,
    };

    return apiResponseSuccess(
      tallyData,
      true,
      statusCode.success,
      "Tally data retrieved successfully",
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
