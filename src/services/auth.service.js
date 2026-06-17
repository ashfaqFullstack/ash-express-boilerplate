const { User } = require("../models");
const ApiError = require("../utils/ApiError");
const { userService } = require(".");
const httpStatus = require('http-status')


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


module.exports = {
    loginUserWithEmailandPassword
}