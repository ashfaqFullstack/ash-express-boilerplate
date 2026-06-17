const { userService, authService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status').default;
const { tokenService } = require('../services');
const { User } = require('../models');

const register = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthTokens(user)
    res.status(httpStatus.CREATED).send({ tokens })
});

const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await authService.loginUserWithEmailandPassword(email, password);
    const tokens = await tokenService.generateAuthTokens(user);

    res.send({ tokens })
})


module.exports = {
    register,
    login
}