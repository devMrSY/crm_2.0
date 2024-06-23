import { apiResponseErr, apiResponseSuccess } from '../utils/response.js';
import { statusCode } from '../utils/statusCodes.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
// import { removeFromBlacklist } from '../middleware/auth.js';
dotenv.config();

export const login = async (req, res) => {
  const { userName, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { userName } });

    if (!existingUser) {
      return apiResponseErr(null, false, statusCode.badRequest, 'User does not exist', res);
    }

    const isPasswordValid = await existingUser.validPassword(password);

    if (!isPasswordValid) {
      return apiResponseErr(null, false, statusCode.badRequest, 'Invalid username or password', res);
    }

    const userResponse = {
      userId: existingUser.userId,
      userName: existingUser.userName,
      role: existingUser.role,
    };

    const accessToken = jwt.sign(userResponse, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });

    return apiResponseSuccess(
      {
        accessToken,
        ...userResponse,
      },
      true,
      statusCode.success,
      'User login successfully',
      res
    )
  } catch (error) {
    apiResponseErr(
      error.data ?? null,
      false,
      statusCode.internalServerError,
      error.errMessage ?? error.message,
      res
    )
  }
};
