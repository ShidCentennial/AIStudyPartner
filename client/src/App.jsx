import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import Profile from "./components/Profile";
import Home from "./components/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<AuthForm type="register" />} />
        <Route path="/login" element={<AuthForm type="login" />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;