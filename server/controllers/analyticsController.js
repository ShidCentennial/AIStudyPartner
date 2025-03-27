import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import openai from '../config/openai.js';

export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('quizStats badges');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const recentAttempts = await QuizAttempt.find({ user: userId })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('quiz', 'title');
    const improvementData = await calculateImprovementOverTime(userId);
    const topicAnalysis = analyzeTopicStrengths(user.quizStats.topicProgress);
    res.json({
      overallStats: {
        totalQuizzesTaken: user.quizStats.totalQuizzesTaken,
        averageScore: user.quizStats.averageScore,
        correctAnswers: user.quizStats.correctAnswers,
        totalQuestionsAnswered: user.quizStats.totalQuestionsAnswered,
        studyStreak: user.quizStats.studyStreak,
        lastQuizDate: user.quizStats.lastQuizDate
      },
      recentAttempts: recentAttempts
        ? recentAttempts.map(attempt => ({
            id: attempt._id,
            quizTitle: attempt.quiz ? attempt.quiz.title : 'Unknown Quiz',
            score: attempt.score,
            totalQuestions: attempt.totalQuestions,
            percentageScore: (attempt.score / attempt.totalQuestions) * 100,
            completedAt: attempt.completedAt
          }))
        : [],
      topicAnalysis,
      improvementData,
      badges: user.badges
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getQuizAnalytics = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user._id;
    const attempts = await QuizAttempt.find({
      user: userId,
      quiz: quizId
    }).sort({ completedAt: 1 });
    if (attempts.length === 0) {
      return res.status(404).json({ error: 'No attempts found for this quiz' });
    }
    const performanceOverTime = attempts.map(attempt => ({
      attemptId: attempt._id,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentageScore: (attempt.score / attempt.totalQuestions) * 100,
      completedAt: attempt.completedAt,
      timeSpent: attempt.timeSpent
    }));
    const latestAttempt = attempts[attempts.length - 1];
    const topicPerformance = latestAttempt.topics.map(topic => ({
      name: topic.name,
      score: topic.score,
      totalQuestions: topic.totalQuestions,
      percentageScore: (topic.score / topic.totalQuestions) * 100
    }));
    topicPerformance.sort((a, b) => b.percentageScore - a.percentageScore);
    const strengths = topicPerformance
      .filter(t => t.percentageScore >= 70)
      .slice(0, 3);
    const weaknesses = topicPerformance
      .filter(t => t.percentageScore < 70)
      .sort((a, b) => a.percentageScore - b.percentageScore)
      .slice(0, 3);
    res.json({
      topicPerformance,
      strengths,
      weaknesses,
      recommendedTopics: weaknesses.map(w => w.name)
    });
  } catch (error) {
    console.error('Error fetching topic analytics:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getTimeAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const attempts = await QuizAttempt.find({
      user: userId,
      timeSpent: { $exists: true }
    }).sort({ completedAt: 1 });
    if (attempts.length === 0) {
      return res.status(404).json({ error: 'No time data available' });
    }
    const timeTrends = attempts.map(attempt => ({
      quizId: attempt.quiz,
      attemptId: attempt._id,
      timeSpent: attempt.timeSpent,
      averageTimePerQuestion: attempt.timeSpent / attempt.totalQuestions,
      score: (attempt.score / attempt.totalQuestions) * 100,
      completedAt: attempt.completedAt
    }));
    const correlation = calculateCorrelation(
      attempts.map(a => a.timeSpent),
      attempts.map(a => (a.score / a.totalQuestions) * 100)
    );
    const optimalTimeRange = calculateOptimalTimeRange(attempts);
    res.json({
      timeTrends,
      correlation: {
        value: correlation,
        interpretation: interpretCorrelation(correlation)
      },
      optimalTimeRange,
      averageTimePerQuiz:
        attempts.reduce((sum, a) => sum + a.timeSpent, 0) / attempts.length,
      totalTimeSpent: attempts.reduce((sum, a) => sum + a.timeSpent, 0)
    });
  } catch (error) {
    console.error('Error fetching time analytics:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getEngagementAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const attempts = await QuizAttempt.find({ user: userId }).sort({
      completedAt: 1
    });
    if (attempts.length === 0) {
      return res.status(404).json({ error: 'No quiz attempts found' });
    }
    const attemptsByDay = new Map();
    attempts.forEach(attempt => {
      const date = new Date(attempt.completedAt).toISOString().split('T')[0];
      if (!attemptsByDay.has(date)) {
        attemptsByDay.set(date, []);
      }
      attemptsByDay.get(date).push(attempt);
    });
    const dailyActivity = Array.from(attemptsByDay.entries()).map(
      ([date, dayAttempts]) => ({
        date,
        quizCount: dayAttempts.length,
        questionsAnswered: dayAttempts.reduce(
          (sum, a) => sum + a.totalQuestions,
          0
        ),
        averageScore:
          dayAttempts.reduce(
            (sum, a) => sum + (a.score / a.totalQuestions) * 100,
            0
          ) / dayAttempts.length
      })
    );
    const studyPatterns = calculateStudyPatterns(attempts);
    const engagementMetrics = {
      quizzesPerWeek: calculateQuizzesPerWeek(attempts),
      studyStreak: calculateStudyStreak(attempts),
      mostActiveDay: findMostActiveDay(dailyActivity),
      completionRate: 100
    };
    res.json({
      dailyActivity,
      studyPatterns,
      engagementMetrics
    });
  } catch (error) {
    console.error('Error fetching engagement analytics:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('quizStats');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const attempts = await QuizAttempt.find({ user: userId });
    const weakTopics = user.quizStats.topicProgress
      .filter(topic => (topic.correctAnswers / topic.totalAttempts) * 100 < 70)
      .map(topic => ({
        name: topic.name,
        accuracy: (topic.correctAnswers / topic.totalAttempts) * 100
      }));
    const strongTopics = user.quizStats.topicProgress
      .filter(topic => (topic.correctAnswers / topic.totalAttempts) * 100 >= 70)
      .map(topic => ({
        name: topic.name,
        accuracy: (topic.correctAnswers / topic.totalAttempts) * 100
      }));
    let personalizedRecommendations = [];
    if (weakTopics.length > 0) {
      try {
        personalizedRecommendations = await generatePersonalizedRecommendations(
          weakTopics
        );
      } catch (error) {
        console.error('Error generating personalized recommendations:', error);
        personalizedRecommendations = weakTopics.map(topic => ({
          topic: topic.name,
          recommendations: [
            `Focus on improving your understanding of ${topic.name}`,
            `Review core concepts in ${topic.name}`,
            `Practice more questions related to ${topic.name}`
          ]
        }));
      }
    }
    const positiveFeedback = strongTopics.map(topic => ({
      topic: topic.name,
      feedback: `You're doing great on ${topic.name}! Keep up the good work.`,
      accuracy: topic.accuracy.toFixed(1) + '%'
    }));
    const recommendations = {
      topicsToFocus: personalizedRecommendations,
      strengths: positiveFeedback,
      studyHabitSuggestions: generateStudyHabitSuggestions(attempts),
      performanceInsights: generatePerformanceInsights(user, attempts),
      nextSteps: generateNextSteps(
        user,
        attempts,
        weakTopics.map(t => t.name)
      )
    };
    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const calculateImprovementOverTime = async userId => {
  const weeklyData = await QuizAttempt.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: {
          year: { $year: '$completedAt' },
          week: { $week: '$completedAt' }
        },
        totalScore: { $sum: '$score' },
        totalQuestions: { $sum: '$totalQuestions' },
        count: { $sum: 1 },
        firstAttemptDate: { $min: '$completedAt' }
      }
    },
    { $sort: { firstAttemptDate: 1 } },
    {
      $project: {
        weekStart: '$firstAttemptDate',
        averageScore: {
          $multiply: [{ $divide: ['$totalScore', '$totalQuestions'] }, 100]
        },
        quizCount: '$count'
      }
    }
  ]);
  return weeklyData;
};

const analyzeTopicStrengths = topicProgress => {
  if (!topicProgress || topicProgress.length === 0) {
    return { strengths: [], weaknesses: [] };
  }
  const topicScores = topicProgress.map(topic => ({
    name: topic.name,
    score: (topic.correctAnswers / topic.totalAttempts) * 100
  }));
  topicScores.sort((a, b) => b.score - a.score);
  return {
    strengths: topicScores.filter(t => t.score >= 70).slice(0, 3),
    weaknesses: topicScores
      .filter(t => t.score < 70)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
  };
};

const calculateCorrelation = (xValues, yValues) => {
  if (xValues.length !== yValues.length || xValues.length === 0) {
    return 0;
  }
  const n = xValues.length;
  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
  const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;
  let numerator = 0;
  let xDenominator = 0;
  let yDenominator = 0;
  for (let i = 0; i < n; i++) {
    const xDiff = xValues[i] - xMean;
    const yDiff = yValues[i] - yMean;
    numerator += xDiff * yDiff;
    xDenominator += xDiff * xDiff;
    yDenominator += yDiff * yDiff;
  }
  if (xDenominator === 0 || yDenominator === 0) {
    return 0;
  }
  return numerator / Math.sqrt(xDenominator * yDenominator);
};

const interpretCorrelation = correlation => {
  const absCorrelation = Math.abs(correlation);
  if (absCorrelation < 0.3) {
    return 'Weak or no relationship between time spent and score';
  } else if (absCorrelation < 0.7) {
    return correlation > 0
      ? 'Moderate positive relationship: Spending more time tends to improve scores'
      : 'Moderate negative relationship: Spending more time is associated with lower scores';
  } else {
    return correlation > 0
      ? 'Strong positive relationship: Spending more time significantly improves scores'
      : 'Strong negative relationship: Spending more time is strongly associated with lower scores';
  }
};

const calculateOptimalTimeRange = attempts => {
  if (attempts.length < 5) {
    return null;
  }
  const timeRanges = [
    { min: 0, max: 300, scores: [] },
    { min: 300, max: 600, scores: [] },
    { min: 600, max: 900, scores: [] },
    { min: 900, max: 1200, scores: [] },
    { min: 1200, max: Infinity, scores: [] }
  ];
  attempts.forEach(attempt => {
    const score = (attempt.score / attempt.totalQuestions) * 100;
    const range = timeRanges.find(
      r => attempt.timeSpent >= r.min && attempt.timeSpent < r.max
    );
    if (range) {
      range.scores.push(score);
    }
  });
  const rangeScores = timeRanges.filter(r => r.scores.length > 0).map(r => ({
    range: `${r.min / 60}-${
      r.max === Infinity ? '∞' : r.max / 60
    } minutes`,
    averageScore: r.scores.reduce((sum, s) => sum + s, 0) / r.scores.length,
    attemptCount: r.scores.length
  }));
  const optimalRange = rangeScores.reduce(
    (best, current) =>
      current.averageScore > best.averageScore ? current : best,
    { averageScore: 0 }
  );
  return optimalRange;
};

const calculateStudyPatterns = attempts => {
  const hourCounts = new Array(24).fill(0);
  attempts.forEach(attempt => {
    const hour = new Date(attempt.completedAt).getHours();
    hourCounts[hour]++;
  });
  const peakHours = [];
  let maxCount = 0;
  hourCounts.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      peakHours.length = 0;
      peakHours.push(hour);
    } else if (count === maxCount && count > 0) {
      peakHours.push(hour);
    }
  });
  const dayCounts = new Array(7).fill(0);
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  attempts.forEach(attempt => {
    const day = new Date(attempt.completedAt).getDay();
    dayCounts[day]++;
  });
  const mostActiveDays = [];
  maxCount = 0;
  dayCounts.forEach((count, day) => {
    if (count > maxCount) {
      maxCount = count;
      mostActiveDays.length = 0;
      mostActiveDays.push(dayNames[day]);
    } else if (count === maxCount && count > 0) {
      mostActiveDays.push(dayNames[day]);
    }
  });
  return {
    hourlyDistribution: hourCounts.map((count, hour) => ({ hour, count })),
    peakStudyHours: peakHours.map(hour => `${hour}:00-${hour + 1}:00`),
    dailyDistribution: dayCounts.map((count, day) => ({
      day: dayNames[day],
      count
    })),
    mostActiveDays
  };
};

const calculateQuizzesPerWeek = attempts => {
  if (attempts.length < 2) {
    return attempts.length;
  }
  const firstDate = new Date(attempts[0].completedAt);
  const lastDate = new Date(attempts[attempts.length - 1].completedAt);
  const weeksDiff = (lastDate - firstDate) / (7 * 24 * 60 * 60 * 1000);
  return weeksDiff <= 0 ? attempts.length : attempts.length / weeksDiff;
};

const calculateStudyStreak = attempts => {
  if (attempts.length === 0) {
    return 0;
  }
  const dates = attempts.map(a =>
    new Date(a.completedAt).toISOString().split('T')[0]
  );
  const uniqueDates = [...new Set(dates)].sort();
  let currentStreak = 1;
  let maxStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    const diffTime = Math.abs(currDate - prevDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  return maxStreak;
};

const findMostActiveDay = dailyActivity => {
  if (dailyActivity.length === 0) {
    return null;
  }
  return dailyActivity.reduce(
    (most, current) => (current.quizCount > most.quizCount ? current : most),
    dailyActivity[0]
  );
};

const generateStudyHabitSuggestions = attempts => {
  if (attempts.length < 5) {
    return [
      'Take more quizzes to get personalized study habit suggestions',
      'Try studying at different times of day to find your optimal time',
      'Aim for consistency by taking at least one quiz every day'
    ];
  }
  const suggestions = [];
  const studyPatterns = calculateStudyPatterns(attempts);
  if (studyPatterns.peakStudyHours.length > 0) {
    suggestions.push(
      `Your most productive study times appear to be around ${studyPatterns.peakStudyHours.join(
        ', '
      )}. Consider scheduling more study sessions during these hours.`
    );
  }
  if (studyPatterns.mostActiveDays.length > 0) {
    suggestions.push(
      `You tend to study most on ${studyPatterns.mostActiveDays.join(
        ', '
      )}. Consider maintaining this schedule or adding more days for better retention.`
    );
  }
  const streak = calculateStudyStreak(attempts);
  if (streak < 3) {
    suggestions.push(
      'Try to study more consistently. Daily practice, even for short periods, can significantly improve retention.'
    );
  } else if (streak >= 7) {
    suggestions.push(
      'Great job maintaining a study streak! Consider increasing the difficulty or breadth of your study materials.'
    );
  }
  return suggestions;
};

const generatePerformanceInsights = (user, attempts) => {
  if (attempts.length === 0) {
    return ['Take quizzes to get personalized performance insights'];
  }
  const insights = [];
  if (user.quizStats.averageScore >= 80) {
    insights.push(
      "You're performing very well overall. Consider challenging yourself with more advanced material."
    );
  } else if (user.quizStats.averageScore >= 60) {
    insights.push(
      "You're showing good understanding but there's room for improvement. Focus on reviewing topics where you score lower."
    );
  } else {
    insights.push(
      'You may benefit from more foundational review. Consider spending more time on basic concepts before advancing.'
    );
  }
  const topicAnalysis = analyzeTopicStrengths(user.quizStats.topicProgress);
  if (topicAnalysis.strengths.length > 0) {
    insights.push(
      `You're showing strength in: ${topicAnalysis.strengths
        .map(t => t.name)
        .join(', ')}. Consider using these as foundations for related topics.`
    );
  }
  if (topicAnalysis.weaknesses.length > 0) {
    insights.push(
      `You may want to focus more on: ${topicAnalysis.weaknesses
        .map(t => t.name)
        .join(', ')}. These areas show the most room for improvement.`
    );
  }
  const attemptsWithTime = attempts.filter(a => a.timeSpent);
  if (attemptsWithTime.length >= 5) {
    const correlation = calculateCorrelation(
      attemptsWithTime.map(a => a.timeSpent),
      attemptsWithTime.map(a => (a.score / a.totalQuestions) * 100)
    );
    if (correlation > 0.3) {
      insights.push(
        'You tend to perform better when spending more time on quizzes. Consider allocating more time for study sessions.'
      );
    } else if (correlation < -0.3) {
      insights.push(
        'You often perform better on quizzes you complete more quickly. This might indicate that you second-guess yourself when you spend too much time on questions.'
      );
    }
  }
  return insights;
};

const generateNextSteps = (user, attempts, weakTopics) => {
  const nextSteps = [];
  if (weakTopics.length > 0) {
    nextSteps.push(
      `Focus on improving your understanding of: ${weakTopics.join(', ')}`
    );
  }
  if (attempts.length < 10) {
    nextSteps.push('Take more quizzes to build a stronger knowledge foundation');
  } else {
    const quizzesPerWeek = calculateQuizzesPerWeek(attempts);
    if (quizzesPerWeek < 3) {
      nextSteps.push(
        'Increase your quiz frequency to at least 3 per week for better retention'
      );
    }
  }
  if (user.quizStats.studyStreak < 3) {
    nextSteps.push('Try to study daily to build a consistent learning habit');
  }
  nextSteps.push(
    'Review your performance analytics regularly to track your progress and adjust your study strategy'
  );
  return nextSteps;
};

const generatePersonalizedRecommendations = async weakTopics => {
  if (weakTopics.length === 0) {
    return [];
  }
  const topicsString = weakTopics
    .map(
      t => `${t.name} (current accuracy: ${t.accuracy.toFixed(1)}%)`
    )
    .join(', ');
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an educational assistant providing personalized learning recommendations.'
        },
        {
          role: 'user',
          content: `Generate specific, actionable learning recommendations for a student who needs improvement in the following topics: ${topicsString}. For each topic, provide 3 specific recommendations that would help them improve their understanding. Format your response as a JSON array where each object has 'topic' and 'recommendations' (array of strings) properties.`
        }
      ]
    });
    const content = response.choices[0].message.content;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      return weakTopics.map(topic => ({
        topic: topic.name,
        recommendations: [
          `Review core concepts in ${topic.name}`,
          `Practice with additional exercises focusing on ${topic.name}`,
          `Consider finding a study group or tutor for ${topic.name}`
        ]
      }));
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};
