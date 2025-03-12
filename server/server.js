import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';
import multer from 'multer';
import { OpenAI } from 'openai'; 
import fs from 'fs';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use('/api/auth', authRoutes);

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    
    let fileContent;
    try {
      fileContent = fs.readFileSync(filePath, 'utf-8');
    } catch (readError) {
      return res.status(500).json({ error: "Failed to read file" });
    }

    if (!fileContent || fileContent.trim().length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "File is empty" });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: `Create a simple, 15 question multiple choice quiz based on the file content, end each question with a | ${fileContent}` },
      ],
    });

    fs.unlinkSync(filePath);
    
    res.json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error("Server error:", error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});