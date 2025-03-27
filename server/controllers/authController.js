import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({ _id: user._id, name: user.name, email: user.email, token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      console.log("Login attempt for email:", email);
  
      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found");
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      console.log("Stored password hash:", user.password);
      console.log("Input password:", password);
  
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match result:", isMatch);
  
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
  
      res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
    } catch (err) {
      console.error("Login error:", err); 
      res.status(500).json({ error: "Server error" });
    }
  };