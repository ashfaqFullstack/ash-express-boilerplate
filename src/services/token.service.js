const config = require('../config/config');
const jwt = require('jsonwebtoken');
const { Token } = require('../models');
const { tokenTypes } = require('../config/tokens');
const moment = require('moment');

/**
 * @param {string} userId 
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */

const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
    const payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expires.unix(),
        type
    };
    return jwt.sign(payload, secret)
}

/**
 * save token in db
 * @param {string} token
 * @param {string} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>} 
 */

const saveToken = async (token, userId, expires, type, blacklisted = false) => {
    const tokenDoc = await Token.create({
        token,
        user: userId,
        expires: expires.toDate(),
        type,
        blacklisted
    });
    return tokenDoc;
};

/**
 * @param {Object} User
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
    const accessTokenExp = moment().add(config.jwt.accessExpirationMinutes, "minutes");
    const accessToken = generateToken(user.id, accessTokenExp, tokenTypes.ACCESS);

    const refreshTokenExp = moment().add(config.jwt.refreshExpirationDays, 'days');
    const refreshToken = generateToken(user.id, refreshTokenExp, tokenTypes.REFRESH);
    await saveToken(refreshToken, user.id, refreshTokenExp, tokenTypes.REFRESH)

    return {
        access: {
            token: accessToken,
            expires: accessTokenExp.toDate()
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExp.toDate()
        }
    };
};

module.exports = {
    generateToken,
    saveToken,
    generateAuthTokens
}