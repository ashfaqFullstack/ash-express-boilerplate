const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/auth.validation');
const userController = require('../../controllers');

const router = express.Router();

router
    .route('/')
    .post(validate(userValidation.createUser), userController.createUser);
module.exports = router;