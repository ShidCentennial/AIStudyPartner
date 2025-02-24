const path = require('path');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // File details can be accessed via `req.file`
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    const fileName = req.file.filename;
    const userId = req.user.id;  // Assuming the user is authenticated and has a user ID

    // Optionally, save file details (e.g., fileName, path, userId) to the database
    // const newFile = new File({ fileName, filePath, userId });
    // await newFile.save();

    res.status(200).json({
      message: 'File uploaded successfully!',
      file: {
        fileName,
        filePath
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during file upload.' });
  }
};

module.exports = { uploadFile };
