// models/Mail.js

const mongoose = require('mongoose');

const mailSchema = new mongoose.Schema({
  from: String,
  to: String,
  subject: String,
  message: String,
  attachments: [{
    filename: String,
    path: String
  }]
});

const Mail = mongoose.model('Mail', mailSchema);

module.exports = Mail;
