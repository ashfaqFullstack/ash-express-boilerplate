const express = require('express');
const cors = require('cors')
const xss = require('xss-clean');
const helmet = require('helmet');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utlis/ApiError');
const httpStatus = require('http-status')
const routes = require('./routes/v1')

const app = express();
// secure headers and prevents header attacks */ Memory leaks
app.use(helmet());

// parse json request body 
app.use(express.json());


// to get clean xss requests from trusted sources❤️
app.use(xss());

// cors origin security
app.use(cors());
app.use('*', cors());


// Api routes 👥
app.use('/v1', routes)


// error handling middleware */ will be under the routes always 👍

// 404 Not Found Api error for not existing Api route 🚫
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, "Not found 🚫"))
})

// if not api error then convert it to a error state shape 🔁
app.use(errorConverter());

// global error handler middleware
app.use(errorHandler());

module.exports = app