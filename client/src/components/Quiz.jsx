import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Quiz.css';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [questionTimes, setQuestionTimes] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [currentQuestionAnswers, setCurrentQuestionAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const quizPromise = Promise.race([
          api.get(`/quizzes/${id}`),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Quiz fetch timed out')), 10000)
          )
        ]);
        const response = await quizPromise;
        console.log("Quiz data:", response.data);
         if (!response.data || !Array.isArray(response.data.questions)) {
           throw new Error('Invalid quiz data: missing or malformed questions');
         }
        setQuiz(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching quiz:', {
          message: err.message,
          response: err.response?.data
        });
        setError('Failed to load quiz: ' + (err.response?.data?.error || err.message));
         setQuiz(null); // Reset quiz to prevent invalid state
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (quiz && !quizCompleted) {
      const startTime = Date.now();
      const timer = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      setQuestionStartTime(Date.now());
      return () => clearInterval(timer);
    }
  }, [quiz, quizCompleted]);

  const handleAnswerSelect = (answer, index) => {
    if (selectedAnswers[quiz.questions[currentQuestion]._id]) {
      return;
    }
    if (!quiz || !quiz.questions || !quiz.questions[currentQuestion]) {
       console.error('Quiz data not fully loaded or invalid');
       setAnswerFeedback({
         isCorrect: false,
         message: "Error: Quiz data not loaded",
         correctAnswer: "Unknown",
         correctIndex: -1,
         selectedIndex: index
       });
       return;
     }
     const timeOnQuestion = Math.floor((Date.now() - questionStartTime) / 1000);
     const currentQuestionObj = quiz.questions[currentQuestion];
     if (!currentQuestionObj.correctAnswer) {
       console.error(`Missing correctAnswer for question ${currentQuestionObj._id}`, currentQuestionObj);
       setAnswerFeedback({
         isCorrect: false,
         message: "Error: Question data incomplete - correctAnswer missing. Skipping question.",
         correctAnswer: null,
         correctIndex: -1,
         selectedIndex: index
       });
       return;
     }
    const sanitizedCorrectAnswer = currentQuestionObj.correctAnswer.trim().toLowerCase();
    const correctIndex = currentQuestionObj.options.findIndex(
      option => option.trim().toLowerCase() === sanitizedCorrectAnswer
    );
     if (correctIndex === -1) {
       console.error(`Invalid correctAnswer for question ${currentQuestionObj._id}: "${currentQuestionObj.correctAnswer}" not found in options`, currentQuestionObj.options);
     }
    console.log(`Question ${currentQuestion + 1}: Correct answer:`, currentQuestionObj.correctAnswer, "at index:", correctIndex);
    const isCorrect = index === correctIndex;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionObj._id]: answer
    });
    setQuestionTimes({
      ...questionTimes,
      [currentQuestionObj._id]: timeOnQuestion
    });
    if (isCorrect) {
      setAnswerFeedback({
        isCorrect: true,
        message: "Correct! Well done.",
        selectedIndex: index
      });
    } else {
      setAnswerFeedback({
        isCorrect: false,
        message: "Incorrect. Let's review this.",
        correctAnswer: correctIndex !== -1 ? currentQuestionObj.options[correctIndex] : "Data error: correct answer not found",
        correctIndex: correctIndex,
        selectedIndex: index
      });
    }
  };

  const getAnswerExplanation = () => {};

  const handleNextQuestion = () => {
    setQuestionStartTime(Date.now());
    setAnswerFeedback(null);
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleQuizSubmit();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleQuizSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Quiz Submission Preparation:', {
        quizId: id,
        totalQuestions: quiz.questions.length,
        answeredQuestions: Object.keys(selectedAnswers).length
      });
      if (Object.keys(selectedAnswers).length !== quiz.questions.length) {
        throw new Error(`Please answer all questions. ${quiz.questions.length - Object.keys(selectedAnswers).length} questions unanswered.`);
      }
      const formattedAnswers = quiz.questions.map(question => {
        const selectedAnswer = selectedAnswers[question._id];
        if (!selectedAnswer) {
          console.warn(`No answer selected for question: ${question._id}`);
          throw new Error(`Please answer all questions. Missing answer for: ${question.question.substring(0, 30)}...`);
        }
        return {
          questionId: question._id,
          selectedAnswer: selectedAnswer,
          topic: question.topic || 'general',
          timeSpent: questionTimes[question._id] || 0
        };
      });
      console.log('Submission Payload:', {
        quizId: id,
        answers: formattedAnswers.map(a => ({
          questionId: a.questionId,
          topic: a.topic
        })),
        timeSpent
      });
      const submissionPromise = Promise.race([
        api.post('/quizzes/submit', {
          quizId: id,
          answers: formattedAnswers,
          timeSpent,
          timestamp: new Date().toISOString()
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 15000)
        )
      ]);
      const { data } = await submissionPromise;
      if (!data || !data.attempt) {
        throw new Error('Invalid server response');
      }
      const processedAnswers = formattedAnswers.map((answer, index) => {
        const questionObj = quiz.questions.find(q => q._id === answer.questionId);
        const serverAnswer = data.attempt.answers?.find(a => a.questionId === answer.questionId);
        if (!questionObj) {
          console.error(`Question not found for ID: ${answer.questionId}`);
          return null;
        }
        const isCorrect = serverAnswer?.isCorrect || false;
        const finalCorrectAnswer = questionObj.correctAnswer?.trim() || "Answer not available";
        return {
          question: questionObj?.question || `Question ${index + 1}`,
          isCorrect: isCorrect,
          correctAnswer: finalCorrectAnswer,
          explanation: questionObj?.explanation || 'No additional information available',
          questionNumber: index + 1,
          options: questionObj?.options || []
        };
      });
      processedAnswers.forEach(async (answer, index) => {
        if (!answer) return;
        try {
          const questionData = quiz.questions.find(q => q._id === formattedAnswers[index].questionId);
          const response = await api.post('/quizzes/ai-explanation', {
            question: answer.question,
            userAnswer: formattedAnswers[index].selectedAnswer,
            learningMaterials: questionData?.explanation || "No additional materials available.",
            correctAnswer: answer.correctAnswer,
            isCorrect: answer.isCorrect
          });
          if (processedAnswers[index]) {
            processedAnswers[index].aiExplanation = response?.data?.explanation || null;
            setCurrentQuestionAnswers([...processedAnswers]);
          }
        } catch (error) {
          console.error(`Failed to get explanation for question ${index + 1}:`, error);
        }
      });
      setCurrentQuestionAnswers(processedAnswers);
      setResults(data.attempt);
      setQuizCompleted(true);
      setError(null);
      console.log('Quiz Submission Success:', {
        score: data.attempt.score,
        percentageScore: data.attempt.percentageScore,
        totalTime: timeSpent
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        'An unexpected error occurred during quiz submission';
      console.error('Quiz Submission Error:', {
        message: errorMessage,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const viewAnalytics = () => {
    navigate('/analytics');
  };

  const takeAnotherQuiz = () => {
    navigate('/profile');
  };

  const handleExplanationRequest = async () => {
    try {
      const loadingPromise = new Promise(resolve => {
        setLoading(true);
        resolve();
      });
      const currentQuestionData = quiz.questions[currentQuestion];
      const explanationPromise = Promise.race([
        api.post('/quizzes/ai-explanation', {
          question: currentQuestionData.question,
          userAnswer: selectedAnswers[currentQuestionData._id],
          learningMaterials: currentQuestionData.explanation
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 15000)
        )
      ]);
      await loadingPromise;
      const response = await explanationPromise;
      setAiExplanation(response?.data?.explanation || 'No explanation available');
      setShowExplanation(true);
    } catch (error) {
      console.error('Explanation request failed:', error);
      setError('Failed to generate explanation: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !quiz) {
    return <div className="loading">Loading quiz...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!quiz) {
    return <div className="error">Quiz not found</div>;
  }

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (quizCompleted && results) {
    return (
      <div className="quiz-results">
        <h1>Quiz Completed!</h1>
        <div className="results-summary">
          <div className="result-card">
            <h3>Score</h3>
            <p className="result-value">{results.percentageScore.toFixed(1)}%</p>
            <p>
              {results.score} out of {results.totalQuestions} correct
            </p>
          </div>
          <div className="result-card">
            <h3>Time Spent</h3>
            <p className="result-value">{formatTime(timeSpent)}</p>
          </div>
        </div>
        {results.topics && results.topics.length > 0 && (
          <div className="topic-results">
            <h2>Topic Performance</h2>
            <div className="topics-grid">
              {results.topics.map((topic, index) => (
                <div key={index} className="topic-card">
                  <h3>{topic.name}</h3>
                  <p className="topic-score">
                    {((topic.score / topic.totalQuestions) * 100).toFixed(1)}%
                  </p>
                  <div className="progress-bar">
                    <div
                      className="progress"
                      style={{ width: `${(topic.score / topic.totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {results.analysis && (
          <div className="analysis-results">
            <h3>Performance Analysis</h3>
            <div className="analysis-sections">
              <div className="strengths">
                <h4>Top Strengths ({results.analysis.strengths.length})</h4>
                {results.analysis.strengths.map((strength, index) => (
                  <div key={index} className="strength-item">
                    <div className="topic-header">
                      <span className="topic-name">{strength.topic}</span>
                      <span className="accuracy-badge">{strength.accuracy.toFixed(1)}%</span>
                    </div>
                    <ul className="improvement-actions">
                      {strength.actions.map((action, i) => (
                        <li key={i}>✅ {action}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="weaknesses">
                <h4>Key Improvements ({results.analysis.weaknesses.length})</h4>
                {results.analysis.weaknesses.map((weakness, index) => (
                  <div key={index} className="weakness-item">
                    <div className="topic-header">
                      <span className="topic-name">{weakness.topic}</span>
                      <span className="accuracy-badge">{weakness.accuracy.toFixed(1)}%</span>
                    </div>
                    <ul className="improvement-actions">
                      {weakness.actions.map((action, i) => (
                        <li key={i}>⚠️ {action}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="answer-validation">
              <h4>Detailed Feedback</h4>
              {currentQuestionAnswers.map((answer, index) =>
                answer && (
                  <div key={index} className={`feedback ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                    <h5>
                      Question {index + 1}:{' '}
                      {answer.isCorrect ? '✅ Correct!' : '❌ Needs Review'}
                    </h5>
                    <p>{answer.question}</p>
                    <p className="answer-explanation">
                      {answer?.aiExplanation
                        ? answer.aiExplanation
                        : answer.isCorrect
                        ? answer.explanation || `Excellent understanding of Question ${answer.questionNumber}`
                        : `Correct answer: "${answer.correctAnswer}". ${
                            answer.explanation || 'Review core concepts in this area'
                          }`}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
        <div className="results-actions">
          <button onClick={viewAnalytics} className="primary-button">
            View Detailed Analytics
          </button>
          <button onClick={takeAnotherQuiz} className="secondary-button">
            Take Another Quiz
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const isAnswered = selectedAnswers[question._id] !== undefined;
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>{quiz.title}</h1>
        <div className="quiz-progress">
          <div className="progress-text">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </div>
          <div className="question-number">Question {currentQuestion + 1}</div>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="quiz-timer">Time: {formatTime(timeSpent)}</div>
      </div>
      <div className="question-container">
        <h2 className="question-text">{question.question}</h2>
        <div className="options-container">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`option
                ${selectedAnswers[question._id] === option ? 'selected' : ''}
                ${answerFeedback && answerFeedback.selectedIndex === index && answerFeedback.isCorrect ? 'correct' : ''}
                ${answerFeedback && answerFeedback.selectedIndex === index && !answerFeedback.isCorrect ? 'incorrect' : ''}
                ${answerFeedback && !answerFeedback.isCorrect && answerFeedback.correctIndex === index ? 'correct-answer' : ''}
              `}
              onClick={() => handleAnswerSelect(option, index)}
              title={
                answerFeedback && answerFeedback.correctIndex === index && !answerFeedback.isCorrect
                  ? 'This is the correct answer'
                  : ''
              }
            >
              <div className="option-letter">{String.fromCharCode(65 + index)}</div>
              <div className="option-text">{option}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        {answerFeedback && (
          <div className={`answer-feedback ${answerFeedback.isCorrect ? 'correct' : 'incorrect'}`}>
            <h3>{answerFeedback.message}</h3>
            {answerFeedback.isCorrect || <p>Correct answer: {answerFeedback.correctAnswer}</p>}
            <p>Please continue to see detailed explanations after completing the quiz.</p>
          </div>
        )}
      </div>
      <div className="quiz-navigation">
        <button onClick={handlePrevQuestion} disabled={currentQuestion === 0} className="nav-button">
          Previous
        </button>
        <button onClick={handleNextQuestion} disabled={!isAnswered} className="nav-button primary">
          {currentQuestion < quiz.questions.length - 1 ? 'Next' : 'Submit Quiz'}
        </button>
      </div>
      {showExplanation && (
        <div className="explanation-modal">
          <div className="modal-content">
            <h3>AI Explanation</h3>
            <p>{aiExplanation}</p>
            <div className="follow-up-section">
              <textarea placeholder="Need more clarification? Ask a follow-up..." rows="3" />
              <button className="primary-button" onClick={() => console.log('Implement follow-up')}>
                Ask Follow-up
              </button>
            </div>
            <button onClick={() => setShowExplanation(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
