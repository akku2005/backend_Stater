const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};







// const nodemailer = require('nodemailer');
// const config = require('../config/config');
// const logger = require('../config/logger');
// const httpStatus = require('http-status');

// const transport = nodemailer.createTransport(config.email.smtp);
// /* istanbul ignore next */
// if (config.env !== 'test') {
//   transport
//     .verify()
//     .then(() => logger.info('Connected to email server'))
//     .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
// }

// /**
//  * Send an email
//  * @param {string} to
//  * @param {string} subject
//  * @param {string} text
//  * @returns {Promise}
//  */
// const sendEmail = async (to, subject, text) => {
//   const msg = { from: config.email.from, to, subject, text };
//   await transport.sendMail(msg);
// };

// /**
//  * Send reset password email with a 6-digit code
//  * @param {string} to
//  * @param {string} verificationCode
//  * @returns {Promise}
//  */
// const sendResetPasswordEmail = async (to, verificationCode) => {
//   try {
//     const subject = 'Reset password';
//     const text = `Dear user,
// To reset your password, use the following 6-digit code: ${verificationCode}
// If you did not request any password resets, then ignore this email.`;

//     // Send the code to the user's email
//     await sendEmail(to, subject, text);
//   } catch (error) {
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to initiate password reset');
//   }
// };

// /**
//  * Send verification email
//  * @param {string} to
//  * @param {string} verificationCode
//  * @returns {Promise}
//  */
// const sendVerificationEmail = async (to, verificationCode) => {
//   try {
//     const subject = 'Email Verification';
//     const text = `Dear user,
// To verify your email, use the following 6-digit code: ${verificationCode}
// If you did not create an account, then ignore this email.`;

//     // Send the code to the user's email
//     await sendEmail(to, subject, text);
//   } catch (error) {
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send email verification');
//   }
// };

// module.exports = {
//   transport,
//   sendEmail,
//   sendResetPasswordEmail,
//   sendVerificationEmail,
// };
