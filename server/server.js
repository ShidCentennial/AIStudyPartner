// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});