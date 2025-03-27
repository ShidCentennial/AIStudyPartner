import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import './Analytics.css';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState({
    overallStats: null,
    recentAttempts: [],
    topicAnalysis: { strengths: [], weaknesses: [] },
    improvementData: [],
    badges: []
  });
  const [quizAnalytics, setQuizAnalytics] = useState(null);
  const [topicAnalytics, setTopicAnalytics] = useState(null);
  const [timeAnalytics, setTimeAnalytics] = useState(null);
  const [engagementAnalytics, setEngagementAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  const fetchUserAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/analytics/user');
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizAnalytics = async (quizId) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/analytics/quiz/${quizId}`);
      setQuizAnalytics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load quiz analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/analytics/time');
      setTimeAnalytics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load time analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEngagementAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/analytics/engagement');
      setEngagementAnalytics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load engagement analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/analytics/recommendations');
      setRecommendations(data);
      setError(null);
    } catch (err) {
      setError('Failed to load recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'time':
        if (!timeAnalytics) fetchTimeAnalytics();
        break;
      case 'engagement':
        if (!engagementAnalytics) fetchEngagementAnalytics();
        break;
      case 'recommendations':
        if (!recommendations) fetchRecommendations();
        break;
      default:
        break;
    }
  };

  // const fetchTopicAnalytics = async () => {
  //   try {
  //     setLoading(true);
  //     const { data } = await api.get('/analytics/topics');
  //     setTopicAnalytics({
  //       ...data,
  //       topicPerformance: data.topicPerformance || [],
  //       recommendedTopics: data.recommendedTopics || []
  //     });
  //     setError(null);
  //   } catch (err) {
  //     setError('Failed to load topic analytics');
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleQuizSelect = (quizId) => {
    fetchQuizAnalytics(quizId);
    setActiveTab('quiz');
  };

  if (loading && !analytics.overallStats) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <nav aria-label="User navigation">
          <Link to="/profile" className="profile-link" aria-label="User profile">
            <span className="profile-link-text">My Profile</span>
            <svg aria-hidden="true" className="profile-icon" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </Link>
        </nav>
        <h1>Learning Analytics Dashboard</h1>
      </div>
      <div className="analytics-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        {/* <button
          className={activeTab === 'topics' ? 'active' : ''}
          onClick={() => handleTabChange('topics')}
        >
          Topics
        </button>
 */}
        <button
          className={activeTab === 'time' ? 'active' : ''}
          onClick={() => handleTabChange('time')}
        >
          Time Analysis
        </button>
        <button
          className={activeTab === 'engagement' ? 'active' : ''}
          onClick={() => handleTabChange('engagement')}
        >
          Engagement
        </button>
        <button
          className={activeTab === 'recommendations' ? 'active' : ''}
          onClick={() => handleTabChange('recommendations')}
        >
          Recommendations
        </button>
        {activeTab === 'quiz' && (
          <button
            className="back-button"
            onClick={() => setActiveTab('overview')}
          >
            Back to Overview
          </button>
        )}
      </div>
      <div className="analytics-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-summary">
              <h2>Your Learning Summary</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Quizzes Taken</h3>
                  <p className="stat-value">{analytics.overallStats?.totalQuizzesTaken || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Average Score</h3>
                  <p className="stat-value">{(analytics.overallStats?.averageScore || 0).toFixed(1)}%</p>
                </div>
                <div className="stat-card">
                  <h3>Questions Answered</h3>
                  <p className="stat-value">{analytics.overallStats?.totalQuestionsAnswered || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Study Streak</h3>
                  <p className="stat-value">{analytics.overallStats?.studyStreak || 0} days</p>
                </div>
              </div>
            </div>
            <div className="recent-quizzes">
              <h2>Recent Quiz Attempts</h2>
              {analytics.recentAttempts.length > 0 ? (
                <div className="quiz-list">
                  {analytics.recentAttempts.map(attempt => (
                    <div
                      key={attempt.id}
                      className="quiz-item"
                      onClick={() => handleQuizSelect(attempt.id)}
                    >
                      <h3>{attempt.quizTitle}</h3>
                      <div className="quiz-details">
                        <p>Score: {attempt.percentageScore.toFixed(1)}%</p>
                        <p>Date: {new Date(attempt.completedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No quiz attempts yet. Take a quiz to see your progress!</p>
              )}
            </div>
            <div className="topic-analysis">
              <h2>Topic Analysis</h2>
              <div className="topics-grid">
                <div className="topic-column">
                  <h3>Strengths</h3>
                  {analytics.topicAnalysis.strengths.length > 0 ? (
                    <ul className="topic-list">
                      {analytics.topicAnalysis.strengths.map((topic, index) => (
                        <li key={index} className="strength-item">
                          <span>{topic.name}</span>
                          <span className="topic-score">{topic.score.toFixed(1)}%</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Take more quizzes to identify your strengths</p>
                  )}
                </div>
                <div className="topic-column">
                  <h3>Areas to Improve</h3>
                  {analytics.topicAnalysis.weaknesses.length > 0 ? (
                    <ul className="topic-list">
                      {analytics.topicAnalysis.weaknesses.map((topic, index) => (
                        <li key={index} className="weakness-item">
                          <span>{topic.name}</span>
                          <span className="topic-score">{topic.score.toFixed(1)}%</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Take more quizzes to identify areas for improvement</p>
                  )}
                </div>
              </div>
            </div>
            <div className="badges-section">
              <h2>Your Achievements</h2>
              {analytics.badges.length > 0 ? (
                <div className="badges-grid">
                  {analytics.badges.map((badge, index) => (
                    <div key={index} className="badge-item">
                      <div className="badge-icon">🏆</div>
                      <div className="badge-details">
                        <h3>{badge.name}</h3>
                        <p>{badge.description}</p>
                        <p className="badge-date">Earned on {new Date(badge.earnedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Complete quizzes to earn badges and track your achievements!</p>
              )}
            </div>
            <div className="progress-chart">
              <h2>Progress Over Time</h2>
              {analytics.improvementData.length > 0 ? (
                <div className="chart-placeholder">
                  <p>Progress visualization would appear here</p>
                  <div className="mock-chart">
                    {analytics.improvementData.map((data, index) => (
                      <div
                        key={index}
                        className="chart-bar"
                        style={{
                          height: `${data.averageScore}px`,
                          maxHeight: '100px'
                        }}
                      >
                        <span className="tooltip">{data.averageScore.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>Take more quizzes to see your progress over time</p>
              )}
            </div>
          </div>
        )}
        {activeTab === 'quiz' && quizAnalytics && (
          <div className="quiz-analytics">
            <h2>Quiz Performance Analysis</h2>
            <div className="quiz-stats">
              <div className="stat-card">
                <h3>Attempts</h3>
                <p>{quizAnalytics.totalAttempts}</p>
              </div>
              <div className="stat-card">
                <h3>Best Score</h3>
                <p>{quizAnalytics.bestScore.toFixed(1)}%</p>
              </div>
              {quizAnalytics.improvement && (
                <div className="stat-card">
                  <h3>Improvement</h3>
                  <p className={quizAnalytics.improvement.improvementPercentage >= 0 ? 'positive' : 'negative'}>
                    {quizAnalytics.improvement.improvementPercentage.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
            <div className="performance-chart">
              <h3>Performance Over Time</h3>
              <div className="chart-placeholder">
                <p>Performance chart would appear here</p>
              </div>
            </div>
            <div className="topic-performance">
              <h3>Topic Performance</h3>
              <div className="topics-grid">
                {quizAnalytics && Array.isArray(quizAnalytics.topicPerformance) ? (
                  quizAnalytics.topicPerformance.map((topic, index) => (
                    <div key={index} className="topic-card">
                      <h4>{topic.name}</h4>
                      <p className="topic-score">
                        {typeof topic.percentageScore === 'number' ? topic.percentageScore.toFixed(1) : 'N/A'}%
                      </p>
                      <div className="progress-bar">
                        <div
                          className="progress"
                          style={{ width: `${topic.percentageScore || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Loading quiz analytics data...</p>
                )}
              </div>
            </div>
            {quizAnalytics.timeAnalysis && (
              <div className="time-analysis">
                <h3>Time Analysis</h3>
                <p>Average time per question: {quizAnalytics.timeAnalysis.averageTimePerQuestion.toFixed(1)} seconds</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'topics' ? (
          topicAnalytics ? (
            <div className="topic-analytics">
              <h2>Topic Performance Analysis</h2>
              <div className="topic-performance-grid">
                {(topicAnalytics?.topicPerformance || []).map((topic, index) => (
                  <div key={index} className="topic-performance-card">
                    <h3>{topic.name}</h3>
                    <div className="topic-stats">
                      <p>Score: {typeof topic.percentageScore === 'number' ? topic.percentageScore.toFixed(1) : 'N/A'}%</p>
                      <p>Questions: {topic.totalQuestions || 0}</p>
                      <p>Attempts: {topic.attempts || 0}</p>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress"
                        style={{ width: `${topic.percentageScore || 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="topic-recommendations">
                <h3>Recommended Focus Areas</h3>
                <p className="recommendation-subheader">
                  Based on your recent performance in these areas:
                </p>
                {(topicAnalytics?.recommendedTopics?.length ?? 0) > 0 ? (
                  <ul className="recommended-topics">
                    {topicAnalytics.recommendedTopics.map((rec, index) => (
                      <li key={index}>
                        <div className="focus-topic-card">
                          <h4 className="focus-area-header">Priority-  {index + 1}: {rec.name}</h4>
                          
                          <div className="performance-insights">
                            <h5>Performance Insights</h5>
                            <ul>
                              {rec.insights?.map((insight, i) => (
                                <li key={i}>{insight}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="actionable-steps">
                            <h5>Recommended Actions</h5>
                            <ul>
                              {rec.actions?.map((action, i) => (
                                <li key={i}>{action}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="progress-metrics">
                            <h5>Success Metrics</h5>
                            <p>{rec.metrics}</p>
                          </div>

                          <div className="proficiency-section">
                            <div className="proficiency-bar">
                              <div 
                                className="proficiency-fill" 
                                style={{ width: `${rec.score || 0}%` }}
                              ></div>
                              <span className="proficiency-text">{typeof rec.score === 'number' ? rec.score.toFixed(1) + '%' : 'N/A'}</span>
                            </div>
                          </div>
                          <div className="action-steps">
                            <h5>Recommended Actions:</h5>
 
                           <p>{rec.recommendation}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Great job! You're performing well across all topics.</p>
                )}
              </div>
            </div>
          ) : (
            <p>Loading topic analytics data...</p>
          )
        ) : null}
        {activeTab === 'time' && timeAnalytics && (
          <div className="time-analytics">
            <h2>Time Analysis</h2>
            <div className="time-stats">
              <div className="stat-card">
                <h3>Average Time per Quiz</h3>
                <p>{(timeAnalytics.averageTimePerQuiz / 60).toFixed(1)} minutes</p>
              </div>
              <div className="stat-card">
                <h3>Total Study Time</h3>
                <p>{(timeAnalytics.totalTimeSpent / 60).toFixed(1)} minutes</p>
              </div>
              {timeAnalytics.optimalTimeRange && (
                <div className="stat-card">
                  <h3>Optimal Study Duration</h3>
                  <p>{timeAnalytics.optimalTimeRange.range}</p>
                </div>
              )}
            </div>
            <div className="time-correlation">
              <h3>Time vs. Performance</h3>
              <p>{timeAnalytics.correlation.interpretation}</p>
            </div>
            <div className="time-trends">
              <h3>Time Trends</h3>
              <div className="chart-placeholder">
                <p>Time trends visualization would appear here</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'engagement' && engagementAnalytics && (
          <div className="engagement-analytics">
            <h2>Engagement Analysis</h2>
            <div className="engagement-stats">
              <div className="stat-card">
                <h3>Quizzes per Week</h3>
                <p>{engagementAnalytics.engagementMetrics.quizzesPerWeek.toFixed(1)}</p>
              </div>
              <div className="stat-card">
                <h3>Study Streak</h3>
                <p>{engagementAnalytics.engagementMetrics.studyStreak} days</p>
              </div>
              <div className="stat-card">
                <h3>Completion Rate</h3>
                <p>{engagementAnalytics.engagementMetrics.completionRate}%</p>
              </div>
              {engagementAnalytics.engagementMetrics.mostActiveDay && (
                <div className="stat-card">
                  <h3>Most Active Day</h3>
                  <p>{new Date(engagementAnalytics.engagementMetrics.mostActiveDay.date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            <div className="study-patterns">
              <h3>Study Patterns</h3>
              <div className="patterns-grid">
                <div className="pattern-card">
                  <h4>Peak Study Hours</h4>
                  {engagementAnalytics.studyPatterns.peakStudyHours.length > 0 ? (
                    <ul>
                      {engagementAnalytics.studyPatterns.peakStudyHours.map((hour, index) => (
                        <li key={index}>{hour}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Not enough data yet</p>
                  )}
                </div>
                <div className="pattern-card">
                  <h4>Most Active Days</h4>
                  {engagementAnalytics.studyPatterns.mostActiveDays.length > 0 ? (
                    <ul>
                      {engagementAnalytics.studyPatterns.mostActiveDays.map((day, index) => (
                        <li key={index}>{day}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Not enough data yet</p>
                  )}
                </div>
              </div>
            </div>
            <div className="activity-heatmap">
              <h3>Activity Heatmap</h3>
              <div className="chart-placeholder">
                <p>Activity heatmap would appear here</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'recommendations' && recommendations && (
          <div className="recommendations">
            <h2>Personalized Recommendations</h2>
            <div className="recommendation-section">
              <h3>Topics to Focus On</h3>
              {recommendations.topicsToFocus.length > 0 ? (
                <div className="focus-topics-list">
                  {recommendations.topicsToFocus.map((topic, index) => (
                    <div key={index} className="topic-recommendation-card">
                      <h4>{topic.topic}</h4>
                      <ul className="recommendation-list">
                        {topic.recommendations.map((rec, recIndex) => (
                          <li key={recIndex}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Great job! You're performing well across all topics.</p>
              )}
            </div>
            {recommendations.strengths && recommendations.strengths.length > 0 && (
              <div className="recommendation-section">
                <h3>Your Strengths</h3>
                <div className="strengths-list">
                  {recommendations.strengths.map((strength, index) => (
                    <div key={index} className="strength-card">
                      <h4>{strength.topic}</h4>
                      <p className="accuracy-badge">{strength.accuracy}</p>
                      <p className="positive-feedback">{strength.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="recommendation-section">
              <h3>Study Habit Suggestions</h3>
              <ul className="habit-suggestions">
                {recommendations.studyHabitSuggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
            <div className="recommendation-section">
              <h3>Performance Insights</h3>
              <ul className="performance-insights">
                {recommendations.performanceInsights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
            <div className="recommendation-section">
              <h3>Next Steps</h3>
              <ul className="next-steps">
                {recommendations.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
