import express from "express";
import multer from "multer";
 import fs from 'fs/promises';
 import path from 'path';
 import pdfParse from 'pdf-parse';
 import docxParser from 'docx-parser';

const router = express.Router();

 // Ensure the uploads directory exists
 const uploadDir = path.join(__dirname, '../uploads/');
 fs.mkdir(uploadDir, { recursive: true }).catch(err => {
    console.error('Failed to create uploads directory:', err);
    //  Consider exiting the process if the directory cannot be created
 });

// Configure Multer (file storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files to 'uploads/' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

const MAX_CONTENT_LENGTH = 10000;

 async function extractTextFromFile(filePath, mimetype) {
   try {
     const data = await fs.readFile(filePath);
     let text = '';

     if (mimetype === 'application/pdf') {
       const pdfData = await pdfParse(data);
       text = pdfData.text;
     } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
       text = await new Promise((resolve, reject) => {
         docxParser.parseDocx(filePath, (data) => {
           if (data) {
             resolve(data);
           } else {
             reject('Failed to parse DOCX');
           }
         });
       });
     } else if (mimetype === 'text/plain') {
       text = data.toString();
     } else {
       throw new Error('Unsupported file type');
     }

     return text;
   } catch (error) {
     console.error('Error extracting text from file:', error);
     throw error; // Re-throw the error to be caught by the caller
   }
 }

 // Upload Route
 router.post("/upload", upload.single("file"), (req, res) => {
   if (!req.file) {
     return res.status(400).json({ error: "No file uploaded" });
   }

   extractTextFromFile(req.file.path, req.file.mimetype)
     .then(text => {
       const truncatedText = text.length > MAX_CONTENT_LENGTH ? text.substring(0, MAX_CONTENT_LENGTH) + '...' : text;
       res.json({ result: truncatedText });
     })
     .catch(error => {
       res.status(500).json({ error: 'Failed to process uploaded file: ' + error.message });
     });
});

export default router;
