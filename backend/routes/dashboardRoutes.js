const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../controllers/dashboardController');  // New controller
const authMiddleware = require('../middleware/authMiddleware');  // Optional: Authentication middleware

const router = express.Router();

// Set up multer for file uploads (define storage configuration)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');  // Specify directory to save files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);  // Use timestamp + original name
  }
});
const upload = multer({ storage: storage });

// Upload file route (protected with authMiddleware, if needed)
router.post('/upload', authMiddleware, upload.single('file'), uploadFile);

module.exports = router;
