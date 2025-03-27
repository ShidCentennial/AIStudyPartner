import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { logout } from "../utils/api";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/auth/profile");
        setUser(data);
        await fetchUserQuizzes();
        await fetchRecentAttempts();
        setError(null);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const fetchUserQuizzes = async () => {
    try {
      const { data } = await api.get("/quizzes");
      setQuizzes(data);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
    }
  };

  const fetchRecentAttempts = async () => {
    try {
      const { data } = await api.get("/analytics/user");
      setRecentAttempts(data.recentAttempts || []);
    } catch (err) {
      console.error("Failed to fetch recent attempts:", err);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="profile-container">
      {user ? (
        <>
          <header className="profile-header">
            <div className="user-info">
              <h1>Welcome, {user.name}</h1>
              <p className="email">{user.email}</p>
            </div>
            <div className="profile-actions">
              <Link to="/create-quiz" className="create-quiz-btn">
                Create New Quiz
              </Link>
              <Link to="/analytics" className="analytics-btn">
                View Analytics
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Log Out
              </button>
            </div>
          </header>
          
          <div className="dashboard-grid">
            <section className="my-quizzes">
              <h2>My Quizzes</h2>
              {quizzes.length > 0 ? (
                <div className="quiz-list">
                  {quizzes.map(quiz => (
                    <div key={quiz._id} className="quiz-card">
                      <h3>{quiz.title}</h3>
                      {quiz.description && <p>{quiz.description}</p>}
                      <div className="quiz-meta">
                        <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                      </div>
                      <Link to={`/quiz/${quiz._id}`} className="take-quiz-btn">
                        Take Quiz
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>You haven't created any quizzes yet.</p>
                  <Link to="/create-quiz" className="create-first-quiz-btn">
                    Create Your First Quiz
                  </Link>
                </div>
              )}
            </section>
            
            <section className="recent-activity">
              <h2>Recent Activity</h2>
              {recentAttempts.length > 0 ? (
                <div className="attempts-list">
                  {recentAttempts.map(attempt => (
                    <div key={attempt.id} className="attempt-card">
                      <h3>{attempt.quizTitle}</h3>
                      <div className="attempt-details">
                        <div className="score">
                          <span className="label">Score:</span>
                          <span className="value">{attempt.percentageScore.toFixed(1)}%</span>
                        </div>
                        <div className="date">
                          <span className="label">Date:</span>
                          <span className="value">{new Date(attempt.completedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>You haven't taken any quizzes yet.</p>
                  {quizzes.length > 0 && (
                    <Link to={`/quiz/${quizzes[0]._id}`} className="take-first-quiz-btn">
                      Take Your First Quiz
                    </Link>
                  )}
                </div>
              )}
            </section>
            
            <section className="learning-stats">
              <h2>Learning Statistics</h2>
              <div className="stats-cards">
                <div className="stat-card">
                  <h3>Quizzes Created</h3>
                  <p className="stat-value">{quizzes.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Quizzes Taken</h3>
                  <p className="stat-value">{recentAttempts.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Average Score</h3>
                  <p className="stat-value">
                    {recentAttempts.length > 0 
                      ? (recentAttempts.reduce((sum, a) => sum + a.percentageScore, 0) / recentAttempts.length).toFixed(1) + '%'
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="view-more-stats">
                <Link to="/analytics">View Detailed Analytics</Link>
              </div>
            </section>
          </div>
        </>
      ) : (
        <div className="loading">Loading profile...</div>
      )}
    </div>
  );
};

export default Profile;