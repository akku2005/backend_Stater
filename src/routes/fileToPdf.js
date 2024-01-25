// const multer = require('multer');
// const AWS = require('aws-sdk');
// const PDFDocument = require('pdfkit');
// const fs = require('fs');


// // Configure AWS
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// // Create an S3 instance
// const s3 = new AWS.S3();

// // Multer configuration for handling file uploads
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// router.post('/upload', upload.single('file'), async (req, res) => {
//   try {
//     // Create a PDF using pdfkit
//     const pdfBuffer = await createPDF(req.file.buffer);

//     // Upload the PDF to S3
//     const pdfKey = `pdfs/${Date.now()}_converted.pdf`; // Adjust the S3 key as needed
//     await uploadToS3(pdfBuffer, pdfKey);

//     // Respond with success message or other data
//     res.status(200).json({ message: 'File uploaded and converted to PDF successfully!' });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Function to create a PDF using pdfkit
// function createPDF(buffer) {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument();

//     // Pipe the PDF content into a buffer
//     const chunks = [];
//     doc.on('data', (chunk) => chunks.push(chunk));
//     doc.on('end', () => resolve(Buffer.concat(chunks)));
//     doc.on('error', (error) => reject(error));

//     // Embed the file content in the PDF
//     doc.image(buffer, { fit: [250, 300] }); // Adjust the dimensions as needed
//     doc.end();
//   });
// }



// // Function to upload to S3
// function uploadToS3(buffer, key) {
//   return s3
//     .upload({
//       Bucket: 'YOUR_S3_BUCKET',
//       Key: key,
//       Body: buffer,
//     })
//     .promise();
// }

