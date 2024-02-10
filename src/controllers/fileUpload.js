const multer = require('multer');
const multerS3 = require('@vickos/multer-s3-transforms-v3');
const { S3Client } = require('@aws-sdk/client-s3');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { nanoid } = require('nanoid');

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
      cb(null, `docuvault/${nanoid()}.pdf`);
    },
    transform: function (req, file, cb) {
      const filePath = file.path;
      const pdfDoc = new PDFDocument();
      const pdfPath = filePath.replace(/\.[^/.]+$/, '.pdf');
      const pdfStream = fs.createWriteStream(pdfPath);

      pdfDoc.pipe(pdfStream);
      pdfDoc.text(`Title: ${req.body.title}`);
      pdfDoc.text(`Description: ${req.body.description}`);
      pdfDoc.end();

      pdfStream.on('finish', function () {
        fs.unlinkSync(filePath);
        file.path = pdfPath;
        cb(null, file);
      });
    },
  }),
});

module.exports = fileUpload;
