const { ValidationError, UniqueConstraintError, DatabaseError } = require('sequelize');
const httpStatus = require('http-status').default;
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

const errorConverter = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        let statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
        let message = error.message || httpStatus[statusCode];

        // Handle Sequelize-specific errors
        if (error instanceof UniqueConstraintError) {
            statusCode = httpStatus.BAD_REQUEST;
            const field = Object.keys(error.fields)[0];
            message = `${field} already exists`;
        } else if (error instanceof ValidationError) {
            statusCode = httpStatus.BAD_REQUEST;
            message = error.errors.map((e) => e.message).join(', ');
        } else if (error instanceof DatabaseError) {
            statusCode = httpStatus.INTERNAL_SERVER_ERROR;
            message = 'Database error';
        }

        error = new ApiError(statusCode, message, false, err.stack);
    }

    next(error);
};

const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    if (!statusCode) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    }

    if (config.env === 'production' && !err.isOperational) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = httpStatus[statusCode];
    }

    res.locals.errorMessage = err.message;

    const response = {
        code: statusCode,
        message,
        ...(config.env === 'development' && { stack: err.stack }),
    };

    if (config.env === 'development') {
        logger.error(err);
    }

    res.status(statusCode).send(response);
};

module.exports = {
    errorConverter,
    errorHandler,
};
