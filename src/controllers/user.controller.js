const catchAsync = require('../utils/catchAsync')
const { userService } = require('../services')
const httpStatus = require('http-status')

const createUser = catchAsync(async (req, res) => {
    const user = await userSerivce.createUser(req.body);
    res.status(httpStatus.CREATED).send(user)
})


module.exports = {
    createUser
}