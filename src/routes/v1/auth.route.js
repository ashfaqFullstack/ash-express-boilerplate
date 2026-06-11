const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/auth.validation');
const authController = require('../../controllers');
const { authValidation } = require('../../validations');

const router = express.Router();

router.post('/register', validate(authValidation.createUser), authController.register);


module.exports = router;