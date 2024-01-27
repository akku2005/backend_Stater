const mongoose = require('mongoose');

// Create a user schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  state: String,
  country: String,
  timestamp: { type: Date, default: Date.now },
});

const UpdateUserDetails = mongoose.model('UpdateUserDetails', userSchema);

module.exports = UpdateUserDetails;
