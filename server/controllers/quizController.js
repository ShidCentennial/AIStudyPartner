import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import openai from '../config/openai.js';
import { generateExplanation } from '../config/openai.js';

// Create a new quiz from uploaded content
export const createQuiz = async (req, res) => {
  const { title, description, content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'No content provided' });
  }

  const MAX_CONTENT_LENGTH = 4000; // Limit content to approximately 8000 tokens
  const truncatedContent = content.length > MAX_CONTENT_LENGTH ? content.substring(0, MAX_CONTENT_LENGTH) + '...' : content;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [{
        role: "user",
        content: `Create a 15-question multiple-choice quiz based on the following content. Format each question as JSON: question, options (array of 4 choices), correctAnswer (the full text of the correct answer option), and topic (the subject area of the question). Return the result as a JSON array of these question objects. Content: ${truncatedContent}`
      }]
    });

    const questionsText = response.choices[0].message.content;
    const jsonMatch = questionsText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    const questions = JSON.parse(jsonMatch[0]);
    console.log("Questions from OpenAI:", questions);
    questions.forEach(question => {
      const correctAnswerIndex = question.options.indexOf(question.correctAnswer);
      if (correctAnswerIndex === -1) {
        throw new Error(`Correct answer not found in options for question: ${question.question}`);
      }

      // Fisher-Yates shuffle algorithm
      for (let i = question.options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [question.options[i], question.options[j]] = [question.options[j], question.options[i]];
      }

      // DO NOT update correctAnswer here. Keep the original text.
    });

    const validationErrors = questions.map((q, index) => {
      if (!q.question || typeof q.question !== 'string' ||
          !Array.isArray(q.options) || q.options.length !== 4 ||
          !q.options.every(opt => typeof opt === 'string') ||
          !q.correctAnswer || typeof q.correctAnswer !== 'string' ||
          !q.topic || typeof q.topic !== 'string') {
        return `Question ${index + 1} invalid structure`;
      }
      return null;
    }).filter(error => error !== null);

    if (validationErrors.length > 0) {
      throw new Error(`Invalid question format from AI generator: ${validationErrors.join(', ')}`);
    }
    console.log("Questions before saving:", questions);
    const quiz = new Quiz({ title, description, questions, creator: req.user._id });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Additional controller methods here

// Handle explanation requests
export const handleExplanationRequest = async (req, res) => {
  const { question, userAnswer, learningMaterials, correctAnswer, isCorrect } = req.body;

  try {
    console.log('Explanation request:', {
      question,
      userAnswer,
      correctAnswer,
      isCorrect
    });
    
    const explanation = await generateExplanation({
      question,
      userAnswer,
      materials: learningMaterials || 'No additional materials available.',
      correctAnswer,
      isCorrect
    });
    
    res.status(200).json({ explanation });
  } catch (error) {
    console.error('Failed to generate explanation:', error);
    res.status(500).json({ 
      error: 'Failed to generate explanation',
      details: error.message
    });
  }
};

// Get quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('creator', 'username email')
      .lean();

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Include correct answers in response

    console.log("Quiz data before sending to client:", quiz);
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

// Other controller methods...
// Get all quizzes
export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('creator', 'username');
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

// Submit a quiz attempt
export const submitQuizAttempt = async (req, res) => {
  const { quizId, answers, timeSpent } = req.body;

  try {
    // Enhanced logging for debugging
    console.log('Quiz Submission Request:', {
      quizId,
      answersReceived: answers?.length,
      userId: req.user?._id,
      timeSpent
    });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      console.warn(`Quiz not found: ${quizId}`);
      return res.status(404).json({ 
        error: 'Quiz not found', 
        details: { quizId }
      });
    }

    // Comprehensive validation
    if (!answers || !Array.isArray(answers)) {
      console.warn('Invalid answers format', { answers });
      return res.status(400).json({ 
        error: 'Invalid answers format', 
        details: 'Answers must be a non-empty array' 
      });
    }

    if (answers.length !== quiz.questions.length) {
      console.warn('Incomplete quiz submission', { 
        expectedQuestions: quiz.questions.length, 
        receivedAnswers: answers.length 
      });
      return res.status(400).json({ 
        error: 'Incomplete quiz submission', 
        details: `Expected ${quiz.questions.length} answers, received ${answers.length}` 
      });
    }

    // Validate each answer
    const validationErrors = answers.map((answer, index) => {
      if (!answer || typeof answer !== 'object') {
        return `Invalid answer format for question ${index + 1}`;
      }
      if (!answer.questionId || !answer.selectedAnswer) {
        return `Missing questionId or selectedAnswer for question ${index + 1}`;
      }
      return null;
    }).filter(error => error !== null);

    if (validationErrors.length > 0) {
      console.warn('Answer validation failed', { errors: validationErrors });
      return res.status(400).json({ 
        error: 'Answer validation failed', 
        details: validationErrors 
      });
    }

    // Process each answer and determine correctness
    let correctCount = 0;
    const processedAnswers = [];
    
    for (const answer of answers) {
      // Find the corresponding question
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
      
      if (!question) {
        console.warn(`Question not found: ${answer.questionId}`);
        continue;
      }
      
      // Check if the answer is correct
      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctCount++;
      }
      
      // Add to processed answers
      processedAnswers.push({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        topic: answer.topic || question.topic || 'general',
        isCorrect: isCorrect,
        timeSpent: answer.timeSpent || 0
      });
    }

    // Calculate topic-based performance
    const topicStats = {};
    processedAnswers.forEach(answer => {
      if (!topicStats[answer.topic]) {
        topicStats[answer.topic] = { correct: 0, total: 0 };
      }
      topicStats[answer.topic].total++;
      if (answer.isCorrect) {
        topicStats[answer.topic].correct++;
      }
    });
    
    // Format topics for the response
    const formattedTopics = Object.entries(topicStats).map(([name, stats]) => ({
      name,
      score: stats.correct,
      totalQuestions: stats.total
    }));

    // Create a new QuizAttempt
    const attempt = new QuizAttempt({
      quiz: quizId,
      user: req.user._id,
      answers: processedAnswers,
      score: correctCount,
      totalQuestions: quiz.questions.length,
      timeSpent: timeSpent || 0,
      topics: formattedTopics
    });
    
    await attempt.save();

    // Update user's quiz attempts
    await User.findByIdAndUpdate(req.user._id, { 
      $push: { quizAttempts: attempt._id }
    });

    // Generate performance analysis
    const analysis = attempt.getPerformanceAnalysis();
    
    console.log('Quiz Submission Successful', {
      attemptId: attempt._id,
      score: correctCount,
      totalQuestions: quiz.questions.length,
      userId: req.user._id
    });

    // Send a well-structured response
    res.status(201).json({ 
      message: 'Quiz attempt submitted successfully', 
      attempt: {
        id: attempt._id,
        score: correctCount,
        totalQuestions: quiz.questions.length,
        percentageScore: (correctCount / quiz.questions.length) * 100,
        timeSpent: timeSpent,
        topics: formattedTopics,
        analysis: analysis,
        answers: processedAnswers.map(answer => ({
          questionId: answer.questionId,
          isCorrect: answer.isCorrect
        }))
      }
    });
  } catch (error) {
    console.error('Comprehensive Error in Quiz Submission:', {
      message: error.message,
      stack: error.stack,
      requestBody: {
        quizId: req.body.quizId,
        answersCount: req.body.answers?.length
      }
    });
    
    res.status(500).json({ 
      error: 'Failed to submit quiz attempt',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
