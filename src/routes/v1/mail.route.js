const express = require('express');
const validate = require('../../middlewares/validate');
const mailValidation = require('../../validations/auth.validation');
const mailController = require('../../controllers/mail.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

// Route for sending an email
router.post('/mail', validate(mailValidation.sendMail), mailController.sendMail);

module.exports = router;
