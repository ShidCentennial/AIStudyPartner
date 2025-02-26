import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./AuthForm.css";

const AuthForm = ({ type }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = type === "register" ? "/auth/register" : "/auth/login";
      const { data } = await api.post(endpoint, formData);
      
      // Save token and redirect
      localStorage.setItem("token", data.token);
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{type === "register" ? "Create Account" : "Welcome Back"}</h2>
      <form onSubmit={handleSubmit}>
        {type === "register" && (
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            minLength="6"
            required
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : type === "register" ? "Sign Up" : "Sign In"}
        </button>
      </form>

      <p className="toggle-text">
        {type === "register"
          ? "Already have an account? "
          : "Don’t have an account? "}
        <Link to={type === "register" ? "/login" : "/register"}>
          {type === "register" ? "Sign In" : "Sign Up"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;