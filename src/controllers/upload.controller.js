const multer = require('multer');
const multerS3 = require('@vickos/multer-s3-transforms-v3');
const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Load environment variables from .env file

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  },
});

const fileUpload = multer({
  storage: multerS3({
    s3: s3,
    acl: 'public-read-write',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    bucket: 'finteck-general',
    serverSideEncryption: 'AES256',
    metadata: function (req, file, cb) {
      cb(null, { fieldname: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, "docuvault" + '/' + Date.now() + file.originalname);
    },
  }),
});

module.exports = fileUpload;