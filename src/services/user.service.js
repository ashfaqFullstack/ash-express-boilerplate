const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status').default;
const dns = require('dns').promises;

/**
 * Create a user (also validates email domain via DNS MX lookup)
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
    if (await User.isEmailTaken(userBody.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }

    const domain = userBody.email.split('@')[1];
    let mxRecords;
    try {
        mxRecords = await dns.resolveMx(domain);
    } catch (error) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'The email domain does not exist or is invalid');
    }

    if (!mxRecords || mxRecords.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'The provided email domain cannot receive emails');
    }

    return User.create(userBody);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
    return User.findOne({ where: { email } });
};

/**
 * Get user by UUID
 * @param {string} userId
 * @returns {Promise<User>}
 */
const getUserById = async (userId) => {
    return User.findByPk(userId);
};

/**
 * Paginated query for admin user listing
 * @param {Object} filter - where clause fields
 * @param {Object} options - { sortBy, limit, page }
 * @returns {Promise<PaginatedResult>}
 */
const queryUsers = async (filter, options) => {
    return User.paginate(filter, options);
};

/**
 * Update user by UUID
 * @param {string} userId
 * @param {Object} userData
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, userData) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User with associated id not found');
    }
    if (userData.email && (await User.isEmailTaken(userData.email, userId))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'This email is already reserved by another user');
    }
    await user.update(userData);
    return user;
};

/**
 * Delete user by UUID
 * @param {string} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    await user.destroy();
    return user;
};

module.exports = {
    createUser,
    getUserByEmail,
    getUserById,
    queryUsers,
    updateUserById,
    deleteUserById,
};
