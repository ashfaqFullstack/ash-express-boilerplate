const { User } = require("../models")
const ApiError = require("../utils/ApiError")
const httpStatus = require('http-status')


/**
 * Create a user
 * @param {Object} userBody 
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
    if (await User.isEmailTaken(userBody.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken")
    }
    return User.create(userBody);
}


module.exports = {
    createUser
}