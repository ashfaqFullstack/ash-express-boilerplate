const { User, Token } = require("../models");
const ApiError = require("../utils/ApiError");
const { userService, tokenService } = require(".");
const httpStatus = require('http-status');
const { tokenTypes } = require("../config/tokens");


/**
 * Login User
 * @param {string} email 
 * @param {string} password
 * @return {Promise<User>}  
 */
const loginUserWithEmailandPassword = async (email, password) => {
    const user = await userService.getUserByEmail(email);
    if (!user || !(await user.isPasswordMatch(password))) {
        throw new ApiError(httpStatus.UNATHORIZED, 'Incorrect credentials')
    };
    return user;
};

/**
 * Logout User
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
    const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });

    if (!refreshTokenDoc) {
        throw new ApiError(httpStatus.NOT_FOUND, "Not found")
    };

    await refreshTokenDoc.deleteOne();
}

/**
 * Refresh Token
 * @param {string} token
 * @returns {Promise<Tokens>}
 */
const refreshAuth = async (token) => {
    try {
        const refreshTokenDoc = await tokenService.verifyToken(token, tokenTypes.REFRESH);
        const user = await userService.getUserById(refreshTokenDoc.user);
        if (!user) {
            throw new Error();
        }
        await refreshTokenDoc.deleteOne();
        return tokenService.generateAuthTokens(user);
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
}


module.exports = {
    loginUserWithEmailandPassword,
    logout,
    refreshAuth
}