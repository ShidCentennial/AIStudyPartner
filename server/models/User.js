import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const topicProgressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalAttempts: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  lastAttemptDate: { type: Date }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  quizStats: {
    totalQuizzesTaken: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    totalQuestionsAnswered: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    topicProgress: [topicProgressSchema],
    studyStreak: { type: Number, default: 0 },
    lastQuizDate: { type: Date }
  },
  badges: [{
    name: { type: String, required: true },
    description: { type: String },
    earnedAt: { type: Date, default: Date.now }
  }],
  preferences: {
    studyReminders: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: false }
  }
});

//Hashing password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model('User', userSchema);