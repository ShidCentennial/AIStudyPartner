const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Save to 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Use a timestamp as filename
  }
});

const upload = multer({ storage });

// Route for file upload
router.post('/upload', upload.single('learningMaterial'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.status(200).json({ message: 'File uploaded successfully', file: req.file });
});

module.exports = router;
