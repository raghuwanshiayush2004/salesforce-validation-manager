import React, { useEffect, useState } from 'react';
import './Login.css';

const Login = () => {
  const [error, setError] = useState('');

  // Check for error in URL query params (redirect from OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) setError(decodeURIComponent(err));
  }, []);

  const handleLogin = () => {
    // Redirect to backend which handles OAuth
    window.location.href = 'http://localhost:5000/auth/login';
  };

  return (
    <div className="login-page">
      {/* Background decorations */}
      <div className="login-bg-circle login-bg-circle-1" />
      <div className="login-bg-circle login-bg-circle-2" />
      <div className="login-bg-circle login-bg-circle-3" />

      <div className="login-card">
        {/* Logo & Header */}
        <div className="login-header">
          <div className="login-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="14" fill="#00a1e0"/>
              <path d="M24 10C18.48 10 14 14.48 14 20c0 3.56 1.83 6.71 4.6 8.57L16 36h16l-2.6-7.43C32.17 26.71 34 23.56 34 20c0-5.52-4.48-10-10-10z" fill="white" opacity="0.9"/>
              <circle cx="24" cy="20" r="5" fill="#00a1e0"/>
            </svg>
          </div>
          <h1 className="login-title">SF Validation Manager</h1>
          <p className="login-subtitle">
            Manage your Salesforce Account validation rules from one place
          </p>
        </div>

        {/* Features List */}
        <div className="login-features">
          {[
            { icon: '🔍', text: 'View all Account validation rules' },
            { icon: '⚡', text: 'Toggle rules active / inactive instantly' },
            { icon: '🚀', text: 'Deploy changes directly to your Salesforce org' },
            { icon: '🔐', text: 'Secure OAuth 2.0 authentication' },
          ].map((f, i) => (
            <div key={i} className="login-feature-item">
              <span className="feature-icon">{f.icon}</span>
              <span className="feature-text">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="login-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Login Button */}
        <button className="login-btn" onClick={handleLogin}>
          <svg className="sf-icon" viewBox="0 0 24 24" width="22" height="22" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
          Login with Salesforce
        </button>

        <p className="login-note">
          You'll be redirected to Salesforce to authorize this app securely.
        </p>

        {/* Footer */}
        <div className="login-footer">
          <span>CloudVandana Assignment</span>
          <span>•</span>
          <span>ASE Assignment #1</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
