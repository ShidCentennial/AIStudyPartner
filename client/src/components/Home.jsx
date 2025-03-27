import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      <header className="hero">
        <h1>AI Study Partner</h1>
        <p className="tagline">Personalized learning analytics to boost your study efficiency</p>
        <div className="cta-buttons">
          <Link to="/register" className="cta-button primary">Get Started</Link>
          <Link to="/login" className="cta-button secondary">Sign In</Link>
        </div>
      </header>
      
      <section className="features">
        <h2>Supercharge Your Learning</h2>
        
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Comprehensive Analytics</h3>
            <p>Track your progress with detailed performance metrics and visualizations</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Personalized Insights</h3>
            <p>Receive AI-powered recommendations based on your learning patterns</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Custom Quizzes</h3>
            <p>Create quizzes from your own study materials with AI assistance</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Achievement System</h3>
            <p>Stay motivated with badges and rewards for consistent learning</p>
          </div>
        </div>
      </section>
      
      <section className="analytics-showcase">
        <div className="showcase-content">
          <h2>Advanced Learning Analytics</h2>
          <ul className="analytics-features">
            <li>Track quiz scores and accuracy rates over time</li>
            <li>Identify strengths and weaknesses by topic</li>
            <li>Analyze study habits and optimal learning times</li>
            <li>Visualize progress with interactive charts</li>
            <li>Receive personalized study recommendations</li>
          </ul>
          <Link to="/register" className="showcase-cta">Start Tracking Your Progress</Link>
        </div>
        <div className="showcase-image">
          {/* Placeholder for analytics dashboard image */}
          <div className="image-placeholder">Analytics Dashboard Preview</div>
        </div>
      </section>
      
      <footer className="home-footer">
        <p>&copy; {new Date().getFullYear()} AI Study Partner. All rights reserved.</p>
        <p>Powered by OpenAI</p>
      </footer>
    </div>
  );
};

export default Home;