import jwt from 'jsonwebtoken';
import { string } from '../constructor/string.js';
import { statusCode } from '../utils/statusCodes.js';
import User from '../models/user.model.js';
import { apiResponseErr } from '../utils/response.js';

// const tokenBlacklist = new Set();

export const authorize = (roles) => {
  return async (req, res, next) => {
    try {
      const authToken = req?.headers?.authorization;
      console.log(authToken)
      if (!authToken) {
        console.log("Hello")
        return apiResponseErr(null, false, statusCode.unauthorize, 'Token not found', res);
      }


      const tokenParts = authToken.split(' ');
      if (tokenParts.length !== 2 || !(tokenParts[0] === 'Bearer' && tokenParts[1])) {
        return apiResponseErr(null, false, statusCode.unauthorize, 'Invalid token format', res);
      }

      // const token = tokenParts[1];

      // if (tokenBlacklist.has(token)) {
      //   return res
      //     .status(statusCode.unauthorize)
      //     .send(apiResponseErr(null, false, statusCode.unauthorize, 'Token has been revoked'));
      // }

      let user;
      try {
        user = jwt.verify(tokenParts[1], process.env.JWT_SECRET_KEY);
        console.log(user)
      } catch (error) {
        return apiResponseErr(null, false, statusCode.unauthorize, 'Token verification failed', res);
      }

      if (!user) {
        return apiResponseErr(null, false, statusCode.unauthorize, 'Unauthorized access: No user decoded from token', res);
      }

      let existingUser;

      if (roles.includes(string.Admin)) {
        existingUser = await User.findOne({
          where: {
            userId: user.userId,
          },
        });
      }

      if (roles.includes(string.User)) {
        existingUser = await User.findOne({
          where: {
            userId: user.userId,
          },
        });
      }

      if (roles.includes(string.Maker)) {
        existingUser = await User.findOne({
          where: {
            userId: user.userId,
          },
        });
      }

      if (roles.includes(string.Checker)) {
        existingUser = await User.findOne({
          where: {
            userId: user.userId,
          },
        });
      }

      if (roles.includes(string.Carrier)) {
        existingUser = await User.findOne({
          where: {
            userId: user.userId,
          },
        });
      }

      if (!existingUser) {
        return apiResponseErr(null, false, statusCode.unauthorize, 'Unauthorized access: User not found in database', res);
      }

      const rolesArray = existingUser.role ? existingUser.role.split(',') : [];

      if (roles && roles.length > 0) {
        const userHasRequiredRole = roles.some((role) => rolesArray.includes(role));

        if (!userHasRequiredRole) {
          return apiResponseErr(
            rolesArray,
            false,
            statusCode.unauthorize,
            'Unauthorized access: User does not have required role',
            res
          )
        }
      }

      req.user = existingUser;
      next();
    } catch (error) {
      return apiResponseErr(
        error.data ?? null,
        false,
        error.responseCode ?? statusCode.internalServerError,
        error.errMessage ?? error.message,
        res
      )
    }
  };
};

// export const addToBlacklist = (token) => {
//   tokenBlacklist.add(token);
// };

// export const removeFromBlacklist = (token) => {
//   tokenBlacklist.delete(token);
// };
