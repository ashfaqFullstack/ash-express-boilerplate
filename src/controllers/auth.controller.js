const { userService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status').default;

const register = catchAsync((req, res) => {
    const user = userService.createUser(req.body);
    res.status(httpStatus.CREATED).send({ user })
});


module.exports = {
    register
}