
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import cors from "cors";
import multer from "multer";
import openai from "./config/openai.js";
import fs from "fs";
import path from "path";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Ensure `uploads/` directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Authentication Routes
app.use("/api/auth", authRoutes);
// Quiz Routes
app.use("/api/quizzes", quizRoutes);
// Analytics Routes
app.use("/api/analytics", analyticsRoutes);

// Upload Route
app.post("/api/upload", upload.single("file"), async (req, res) => {
  let filePath;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    filePath = req.file.path;

    // Read file content
    let fileContent;
    try {
      fileContent = fs.readFileSync(filePath, "utf-8");
    } catch (readError) {
      return res.status(500).json({ error: "Failed to read file" });
    }

    if (!fileContent || fileContent.trim().length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "File is empty" });
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        { role: "user", content: `Create a simple, 15-question multiple-choice quiz based on the file content. End each question with a | ${fileContent}` },
      ],
    });

    fs.unlinkSync(filePath); // Delete file after processing

    if (!response || !response.choices || response.choices.length === 0) {
      return res.status(500).json({ error: "OpenAI API did not return a response" });
    }

    res.json({ result: response.choices[0].message.content });

  } catch (error) {
    console.error("Server error:", error);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Connect to Database & Start Server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
