const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { PDFDocument, rgb } = require('pdf-lib');
const sharp = require('sharp');
const FileModel = require('../../models/file.model'); // Assuming you have a Mongoose model for file documents
const path = require('path');
const mammoth = require('mammoth');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');

const router = express.Router();
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const upload = multer({
    storage: multer.memoryStorage(),
});

router.post('/s3', upload.array('files', 3), async function (req, res, next) {
    try {
        const files = req.files;
        const uploadedFiles = [];

        for (const file of files) {
            let pdfPath;
            if (file.mimetype === 'application/pdf') {
                pdfPath = await processPdf(file.buffer);
            } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                pdfPath = await convertDocxToPdf(file.buffer, file.originalname);
            } else if (file.mimetype.startsWith('image/')) {
                pdfPath = await convertImageToPdf(file.buffer, file.originalname);
            } else {
                throw new Error('Unsupported file type');
            }

            const { uuid, qrCode } = await addUuidAndQrCodeToPdf(pdfPath); // Get UUID and QR code
            const uploadedFile = await uploadToS3(pdfPath);
            uploadedFiles.push({ ...uploadedFile, uuid, qrCode }); // Add UUID and QR code to uploaded file info
            await fs.unlink(pdfPath); // Delete the PDF file after uploading to S3
        }

        console.log('Files uploaded successfully:', uploadedFiles);
        res.json(uploadedFiles);
    } catch (error) {
        console.error('Error during upload:', error);
        next(error);
    }
});

async function addUuidAndQrCodeToPdf(pdfPath) {
    const pdfDoc = await PDFDocument.load(await fs.readFile(pdfPath));
    const pages = pdfDoc.getPages();
    const uuid = uuidv4();
    const qrCode = await QRCode.toDataURL(uuid);
    for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(`UUID: ${uuid}`, {
            x: 50,
            y: height - 50,
            size: 12,
            color: rgb(0, 0, 0), // Black color
        });
        const qrImage = await pdfDoc.embedPng(await QRCode.toBuffer(uuid));
        page.drawImage(qrImage, {
            x: 50,
            y: height - 100, // Adjust position as needed
            width: 50, // Adjust size as needed
            height: 50, // Adjust size as needed
        });
    }
    const modifiedPdfBytes = await pdfDoc.save();
    await fs.writeFile(pdfPath, modifiedPdfBytes);

    // Generate a unique key for the file
    const key = `file_${uuidv4()}`;

    // Save UUID, QR code, key, and location to MongoDB
    await FileModel.create({ uuid, qrCode, key, location: pdfPath });

    return { uuid, qrCode };
}


async function processPdf(buffer) {
    try {
        const pdfDoc = await PDFDocument.load(buffer);

        // Add UUID text and QR code to each page
        const pages = pdfDoc.getPages();
        for (const page of pages) {
            const { width, height } = page.getSize();
            const uuid = uuidv4();
            const text = `UUID: ${uuid}`;
            page.drawText(text, {
                x: 50,
                y: height - 50,
                size: 12,
                color: rgb(0, 0, 0), // Black color
            });
            const qrCode = await QRCode.toBuffer(uuid);
            const qrImage = await pdfDoc.embedPng(qrCode);
            page.drawImage(qrImage, {
                x: 50,
                y: height - 120, // Adjust position as needed
                width: 50, // Adjust size as needed
                height: 50, // Adjust size as needed
            });
        }

        const modifiedPdfPath = `modified_${uuidv4()}.pdf`;
        const modifiedPdfBytes = await pdfDoc.save();
        await fs.writeFile(modifiedPdfPath, modifiedPdfBytes);

        return modifiedPdfPath;
    } catch (error) {
        console.error(`Error processing PDF: ${error.message}`);
        throw error;
    }
}

async function convertImageToPdf(buffer, originalname) {
    try {
        console.log('Converting image to PDF...');
        const imageBuffer = await sharp(buffer).toFormat('png').toBuffer();
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const image = await pdfDoc.embedPng(imageBuffer);
        const { width, height } = image.scale(0.5); // Adjust scale as needed
        page.drawImage(image, {
            x: 5,
            y: 5,
            width,
            height,
        });

        // Add UUID as text and QR code to each page
        const pdfPages = pdfDoc.getPages();
        for (const pdfPage of pdfPages) {
            const { width, height } = pdfPage.getSize();
            const uuid = uuidv4();
            const text = `UUID: ${uuid}`;
            pdfPage.drawText(text, {
                x: 50,
                y: height - 50,
                size: 12,
                color: rgb(0, 0, 0), // Black color
            });
            const qrCode = await QRCode.toBuffer(uuid);
            const qrImage = await pdfDoc.embedPng(qrCode);
            pdfPage.drawImage(qrImage, {
                x: 50,
                y: height - 100, // Adjust position as needed
                width: 50, // Adjust size as needed
                height: 50, // Adjust size as needed
            });
        }

        const pdfBytes = await pdfDoc.save();
        const pdfPath = `converted_${uuidv4()}.pdf`;
        await fs.writeFile(pdfPath, pdfBytes);
        return pdfPath;
    } catch (error) {
        console.error(`Error during conversion to PDF: ${error.message}`);
        throw error;
    }
}

async function convertDocxToPdf(buffer, originalname) {
    try {
        console.log('Converting DOCX to PDF...');
        
        // Convert DOCX to HTML
        const { value } = await mammoth.convertToHtml({ buffer });
        const htmlContent = value;
        
        // Write HTML content to a temporary file (optional)
        const htmlPath = `temp_${uuidv4()}.html`;
        await fs.writeFile(htmlPath, htmlContent);

        // Use Puppeteer to convert HTML to PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf();
        await browser.close();

        // Delete temporary HTML file (optional)
        await fs.unlink(htmlPath);

        // Create PDF document from buffer
        const pdfDoc = await PDFDocument.load(pdfBuffer);

        // Add UUID text and QR code to each page
        const pages = pdfDoc.getPages();
        for (const page of pages) {
            const { width, height } = page.getSize();
            const uuid = uuidv4();
            const text = `UUID: ${uuid}`;
            page.drawText(text, {
                x: 50,
                y: height - 50,
                size: 12,
                color: rgb(0, 0, 0), // Black color
            });
            const qrCode = await QRCode.toBuffer(uuid);
            const qrImage = await pdfDoc.embedPng(qrCode);
            page.drawImage(qrImage, {
                x: 50,
                y: height - 100, // Adjust position as needed
                width: 50, // Adjust size as needed
                height: 50, // Adjust size as needed
            });
        }

        // Save modified PDF buffer to file
        const modifiedPdfPath = `modified_${uuidv4()}.pdf`;
        const modifiedPdfBytes = await pdfDoc.save();
        await fs.writeFile(modifiedPdfPath, modifiedPdfBytes);

        return modifiedPdfPath;
    } catch (error) {
        console.error(`Error during conversion from DOCX to PDF: ${error.message}`);
        throw error;
    }
}

async function uploadToS3(pdfPath) {
    try {
        const pdfStream = await fs.readFile(pdfPath);
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: path.basename(pdfPath), // Extract file name from path
            Body: pdfStream,
            ContentType: 'application/pdf',
        };

        const command = new PutObjectCommand(params);
        const uploadResult = await s3.send(command);

        console.log('PDF uploaded successfully:', uploadResult);

        return { key: pdfPath, location: uploadResult.Location };
    } catch (error) {
        console.error(`Error uploading PDF to S3: ${error.message}`);
        throw error;
    }
}

module.exports = router;
