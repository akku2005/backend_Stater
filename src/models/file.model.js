const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  uuid: {
    type: String,
    required: true,
  },
  qrCode: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const FileModel = mongoose.model('File', fileSchema);

module.exports = FileModel;
