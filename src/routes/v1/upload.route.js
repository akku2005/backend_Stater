const express = require('express');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const FileModel = require('../../models/file.model'); // Replace with your actual file model
const router = express.Router();

// Configure AWS SDK with your credentials and region
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Create an S3 instance
const s3 = new aws.S3();

// Configure multer to use S3 for storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read', // Adjust permissions as needed
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    },
  }),
});
console.log(upload);
router.post('/s3', upload.array('files', 3), async function (req, res, next) {
  try {
    // Access file details
    const files = req.files;
    console.log(router);

    // Process and store file details in MongoDB
    const fileDetails = files.map((file) => ({
      key: file.key,
      location: file.location,
      // Add other relevant details based on your needs
    }));

    // Store file details in MongoDB
    await FileModel.create(fileDetails);

    // Respond with uploaded files
    res.json(fileDetails);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
