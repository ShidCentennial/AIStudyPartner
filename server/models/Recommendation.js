import mongoose from 'mongoose';

const RecommendationSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  quizAttempt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizAttempt',
    required: true
  },
  algorithmType: {
    type: String,
    enum: ['collaborative', 'content', 'hybrid'],
    required: true
  },
  userSegment: {
    type: String,
    enum: ['new', 'active', 'power'],
    required: true
  },
  interactionHistory: [{
    interactionType: 
{
      type: String,
      enum: ['view', 'click', 'dismiss']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  userPreferences: {
    learningStyle: String,
    difficultyLevel: Number
  },
  contextualData: {
    deviceType: String,
    timeOfDay: String
  },
  experimentId: {
    type: String,
    index: true
  },
  variant: {
    type: String,
    enum: ['A', 'B']
  },
  feedback: {
    rating: Number,
    feedbackText: String,
    collectedAt: Date
  },
  dataAnonymized: {
    type: Boolean,
    default: false
  },
  consentVersion: String,
  accuracyScore: Number,
  performanceMetrics: {
    clickThroughRate: Number,
    conversionRate: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
  retrainDate: Date
});

const Recommendation = mongoose.model('Recommendation', RecommendationSchema);

export default Recommendation;