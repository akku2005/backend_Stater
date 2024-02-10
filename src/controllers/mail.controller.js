const nodemailer = require('nodemailer');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  /* Add your nodemailer configuration here (e.g., host, port, auth) */
});

// Controller function for sending an email
const sendMail = async (req, res, next) => {
  try {
    const { from, to, subject, message, attachments } = req.body;

    // Construct email options
    const mailOptions = {
      from,
      to,
      subject,
      text: message,
      attachments // Optional: Attachments
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(httpStatus.OK).send('Email sent successfully');
  } catch (error) {
    next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send email'));
  }
};

module.exports = {
  sendMail
};
