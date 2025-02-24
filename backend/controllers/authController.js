const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register a new user
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists by email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const user = new User({
      username,
      email,
      password,
    });

    // Save the user to the database
    await user.save();

    // Create a JWT token for the new user
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',  // Token expires in 1 hour
    });

    // Send the token back to the client
    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);  // Log the error for debugging
    res.status(500).json({ message: 'Server error' });
  }
};

// Login the user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token for the logged-in user
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Send the token back to the client
    res.json({ token });
  } catch (err) {
    console.error(err.message);  // Log the error for debugging
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerUser, loginUser };
