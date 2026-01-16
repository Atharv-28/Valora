import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './login.css'; // Reuse login styles

export const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create account: ' + err.message);
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    navigate('/start-interview');
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <header className="login-header">
          <h1 className="login-title">Sign up</h1>
          <p className="login-subtitle">Create your Valora account.</p>
        </header>

        <section className="login-card" aria-label="Signup form">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button type="button" onClick={handleGuestMode} className="guest-button">
              Continue as Guest
            </button>

            <p className="login-footer">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
};
