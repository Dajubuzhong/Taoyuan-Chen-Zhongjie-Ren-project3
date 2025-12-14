import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const u = username.trim();
    const em = email.trim();

    if (!agree) {
      setError("You must agree to the terms to continue.");
      return;
    }
    if (!u) {
      setError("Username is required.");
      return;
    }
    if (!em) {
      setError("Email is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register(em, u, password);
      navigate("/games");
    } catch (err) {
      console.error(err);
      setError("Registration failed. This email has already been registered.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1 className="register-title">Create Account</h1>
            <p className="register-subtitle">Join our Sudoku community today</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                className="form-input"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                className="form-input"
                placeholder="Confirm your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <div className="terms-checkbox">
              <input
                type="checkbox"
                id="terms"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
              />
              <label htmlFor="terms">
                I agree to the <span className="terms-link">Terms of Service</span> and{" "}
                <span className="terms-link">Privacy Policy</span>
              </label>
            </div>

            {error && (
              <p style={{ color: "#ff6b6b", marginBottom: "1rem", textAlign: "center" }}>
                {error}
              </p>
            )}

            <button type="submit" className="register-button" disabled={submitting}>
              {submitting ? "Creating account..." : "Create Account"}
            </button>

            <div className="form-footer">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
