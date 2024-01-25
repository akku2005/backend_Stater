// // const express = require('express');
// // const aws = require('@babel/core');
// // const multer = require('multer');
// // const multerS3 = require('multer-s3');
// // const FileModel = require('../../models/file.model'); // Replace with your actual file model
// // const dotenv = require('dotenv');
// // const s3 = require('../../config/s3');
// // const FileGenerater = require("../../config/s3");
// // const router = express.Router();


// // // Configure multer to use S3 for storage
// // const upload = multer({
// //   storage: multerS3({
// //     s3: s3,
// //     bucket: process.env.S3_BUCKET_NAME,
// //     acl: 'public-read', // Adjust permissions as needed
// //     key: function (req, file, cb) {
// //       cb(null, Date.now().toString() + '-' + file.originalname);
// //     },
// //   }),
// // });
// // // console.log(upload);
// // router.post('/s3', upload.array('files', 3), async function (req, res, next) {
// //   try {
// //     // Access file details
// //     const files = req.files;
// //     // console.log(router);

// //     // Process and store file details in MongoDB
// //     const fileDetails = files.map((file) => ({
// //       key: file.key,
// //       location: file.location,
// //       // Add other relevant details based on your needs
// //     }));

// //     // Store file details in MongoDB
// //     await FileModel.create(fileDetails);

// //     // Respond with uploaded files
// //     res.json(fileDetails);
// //   } catch (error) {
// //     next(error);
// //   }
// // });

// // module.exports = router;


// const express = require('express');
// const multer = require('multer');
// const multerS3 = require('multer-s3');
// const PDFDocument = require('pdfkit');
// const fs = require('fs');
// const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
// const FileModel = require('../../models/file.model'); 
// const dotenv = require('dotenv');

// dotenv.config();

// const router = express.Router();

// // Initialize S3 client
// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// // Configure multer to use S3 for storage
// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.S3_BUCKET_NAME,
//     acl: 'public-read',
//     key: function (req, file, cb) {
//       cb(null, Date.now().toString() + '-' + file.originalname);
//     },
//   }),
// });

// router.post('/s3', upload.array('files', 3), async function (req, res, next) {
//   try {
//     const files = req.files;

//     // Convert files to PDF using pdfkit
//     const pdfPath = 'converted.pdf';
//     const doc = new PDFDocument();
    
//     files.forEach((file, index) => {
//       doc.text(`File ${index + 1}: ${file.originalname}`);
//       doc.moveDown();
//     });

//     doc.pipe(fs.createWriteStream(pdfPath));
//     doc.end();

//     // Upload the PDF to S3
//     const params = {
//       Bucket: process.env.S3_BUCKET_NAME,
//       Key: pdfPath,
//       Body: fs.createReadStream(pdfPath),
//       ContentType: 'application/pdf',
//     };

//     const command = new PutObjectCommand(params);
//     const uploadResult = await s3.send(command);

//     console.log('PDF uploaded successfully:', uploadResult);

//     // Process and store file details in MongoDB
//     const fileDetails = files.map((file) => ({
//       key: file.key,
//       location: file.location,
//       // Add other relevant details based on your needs
//     }));

//     // Store file details in MongoDB
//     await FileModel.create(fileDetails);

//     // Respond with uploaded files
//     res.json(fileDetails);

//     // Cleanup: Delete the local PDF file after uploading to S3
//     fs.unlinkSync(pdfPath);
//   } catch (error) {
//     console.error('Error during upload:', error);
//     next(error);
//   }
// });

// module.exports = router;


const express = require('express');
<<<<<<< HEAD
const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const FileModel = require('../../models/file.model');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const router = express.Router();

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

=======
const aws = require('@babel/core');
const multer = require('multer');
const multerS3 = require('multer-s3');
const FileModel = require('../../models/file.model'); // Replace with your actual file model
const dotenv = require('dotenv');
const s3 = require('../../config/s3');
const router = express.Router();





>>>>>>> 5f3a9387075bd86bf78773fa9faeec9be0170973
// Configure multer to use S3 for storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      // Generate a unique key for each upload
      const uniqueKey = Date.now().toString() + '-' + file.originalname + '.pdf';
      cb(null, uniqueKey);
    },
  }),
});
<<<<<<< HEAD

=======
// console.log(upload);
>>>>>>> 5f3a9387075bd86bf78773fa9faeec9be0170973
router.post('/s3', upload.array('files', 3), async function (req, res, next) {
  try {
    const files = req.files;

    // Creating a unique PDF for each request
    const pdfPath = `converted_${Date.now()}.pdf`;
    const pdfStream = fs.createWriteStream(pdfPath);

    // Creating a PDF using pdfkit
    const doc = new (require('pdfkit'))();

    // Iterate through files and append their content to the PDF
    for (const file of files) {
      if (file.path) {
        doc.text(`File: ${file.originalname}`);
        doc.moveDown();

        // Read file content more safely
        const content = fs.readFileSync(file.path, 'utf-8');

        doc.text(content);
        doc.moveDown();
      } else {
        console.error('File path is undefined:', file);
      }
    }

    doc.pipe(pdfStream);
    doc.end();

    pdfStream.on('finish', async () => {
      // Upload the unique PDF to S3
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: pdfPath,
        Body: fs.createReadStream(pdfPath),
        ContentType: 'application/pdf',
      };

      const command = new PutObjectCommand(params);
      const uploadResult = await s3.send(command);

      console.log('PDF uploaded successfully:', uploadResult);

      // Cleanup: Delete the local PDF file after uploading to S3
      fs.unlinkSync(pdfPath);

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
    });
  } catch (error) {
    console.error('Error during upload:', error);
    next(error);
  }
});

module.exports = router;



