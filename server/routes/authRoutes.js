import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.post('/logout', protect, (req, res) => 
  res.status(200).json({ message: "Logged out successfully" }));

//Protected Route
router.get('/profile', protect, (req, res) => {
  res.json(req.user);
});

export default router;