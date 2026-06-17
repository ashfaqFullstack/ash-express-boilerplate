const { User } = require("../models")
const ApiError = require("../utils/ApiError")
const httpStatus = require('http-status').default;
const dns = require('dns').promises;


/**
 * Create a user also checks if email domain is valid
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
    if (await User.isEmailTaken(userBody.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    }

    const domain = userBody.email.split('@')[1];
    let mxRecords;

    // STEP 1: ONLY wrap the unstable network call in the try-catch
    try {
        mxRecords = await dns.resolveMx(domain);
    } catch (error) {
        // If DNS lookup physically fails, throw and exit early
        throw new ApiError(httpStatus.BAD_REQUEST, 'The email domain does not exist or is invalid');
    }

    // STEP 2: Handle the business logic check safely outside the try-catch context
    if (!mxRecords || mxRecords.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'The provided email domain cannot receive emails');
    }

    return User.create(userBody);
};


/**
 * Get user with email
 * @param {string} email 
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
    return User.findOne({ email })
}

/**
 * Get user by Id
 * @param {string} userId
 * @returns {Promise<User>}
 */
const getUserById = async (userId) => {
    return User.findById(userId)
}

/**
 * Query all users for admin
 * @param {options} filter - Mongo filter
 * @param {number} options - Query options
 * @returns {Promise<Results>}
 */

const queryUsers = async (filter, options) => {
    const results = await User.paginate(filter, options);
    return results;
}

/**
 * Update User [admin , user]
 * @param {string} userId
 * @param {Object} User
 * @returns {Promise<User>}
 */

const updateUserById = async (userId, userData) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User with associated id not found");
    };
    if (userData.email && (await User.isEmailTaken(userData.email, userId))) {
        throw new ApiError(httpStatus.BAD_REQUEST, "This email is already reserved by other user");
    };

    Object.assign(user, userData);
    await User.save();
    return user;
}


/**
 * Delete user by Id
 * @param {string} userId
 * @returns {Promise<User>}
 */

const deleteUserById = async (userId) => {
    const user = await User.findByIdAndDelete(userId); 
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    return user;
};

module.exports = {
    createUser,
    getUserByEmail,
    getUserById,
    queryUsers,
    updateUserById,
    deleteUserById
} 