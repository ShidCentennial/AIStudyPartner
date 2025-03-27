import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedAnswer: { type: String, required: true },
  topic: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  timeSpent: { type: Number } // Time spent on this question in seconds
});

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [answerSchema],
  score: { type: Number, required: true }, // Total score
  totalQuestions: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
  timeSpent: { type: Number }, // Total time spent in seconds
  topics: [{
    name: { type: String },
    score: { type: Number }, // Score for this topic
    totalQuestions: { type: Number } // Total questions for this topic
  }]
});

// Virtual for calculating percentage score
quizAttemptSchema.virtual('percentageScore').get(function() {
  return (this.score / this.totalQuestions) * 100;
});

quizAttemptSchema.index({ user: 1, quiz: 1, completedAt: -1 });

quizAttemptSchema.methods.calculateTopicAccuracy = function() {
  const topicStats = this.answers.reduce((acc, answer) => {
    const { topic } = answer;
    if (!acc[topic]) {
      acc[topic] = { correct: 0, total: 0 };
    }
    acc[topic].total++;
    if (answer.isCorrect) acc[topic].correct++;
    return acc;
  }, {});

  return Object.entries(topicStats).map(([topic, stats]) => ({
    topic,
    accuracy: (stats.correct / stats.total) * 100,
    correct: stats.correct,
    total: stats.total
  }));
};

quizAttemptSchema.methods.getPerformanceAnalysis = function() {
  const topicAccuracies = this.calculateTopicAccuracy();
  
  const strengths = topicAccuracies
    .filter(t => t.accuracy >= 80)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 3);

  const weaknesses = topicAccuracies
    .filter(t => t.accuracy <= 50)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  return {
    strengths: strengths.map(t => ({
      topic: t.topic,
      accuracy: t.accuracy,
      actions: [`Weekly practice target: 2 focused exercises in ${t.topic}`,
               `Recommended resource: ${t.topic} mastery guide`]
    })),
    weaknesses: weaknesses.map(t => ({
      topic: t.topic,
      accuracy: t.accuracy,
      actions: [`Daily drill: 5 ${t.topic} questions with explanations`,
               `Review: Core ${t.topic} concepts handbook`,
               `Video tutorials: ${t.topic} fundamentals playlist`]
    })),
    overallAccuracy: this.percentageScore
  };
};

export default mongoose.model('QuizAttempt', quizAttemptSchema);