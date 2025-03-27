import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import Profile from "./components/Profile";
import Home from "./components/Home";
import Quiz from "./components/Quiz";
import QuizCreator from "./components/QuizCreator";
import Analytics from "./components/Analytics";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<AuthForm type="register" />} />
        <Route path="/login" element={<AuthForm type="login" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/create-quiz" element={<QuizCreator />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Router>
  );
}

export default App;