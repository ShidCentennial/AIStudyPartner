const mongoose = require('mongoose');

const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/313';

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Error: Could not connect to MongoDB', err.message);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
