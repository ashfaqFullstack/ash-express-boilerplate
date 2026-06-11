const { userService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status')

const register = catchAsnc((req, res) => {
    const user = await userService.createUser(req.body);
    res.status(httpStatus.CREATED).send({ user })
});


module.exports = {
    register
}