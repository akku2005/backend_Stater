const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    key: String,
    location: String,
    // Add other relevant fields based on your needs
});

const FileModel = mongoose.model('File', fileSchema);

module.exports = FileModel;
