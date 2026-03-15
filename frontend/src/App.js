import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Set axios base URL and enable cookies
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true;

function App() {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    loading: true,
    user: null
  });

  // Check session on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await axios.get('/auth/status');
      setAuthState({
        isLoggedIn: res.data.isLoggedIn,
        loading: false,
        user: res.data.isLoggedIn ? {
          username: res.data.username,
          displayName: res.data.displayName,
          instanceUrl: res.data.instanceUrl
        } : null
      });
    } catch {
      setAuthState({ isLoggedIn: false, loading: false, user: null });
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch {}
    setAuthState({ isLoggedIn: false, loading: false, user: null });
  };

  if (authState.loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'linear-gradient(135deg, #00a1e0 0%, #0070d2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div className="spinner" style={{
            width: 48, height: 48, border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
          }} />
          <p style={{ fontSize: 16, fontWeight: 500 }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            authState.isLoggedIn
              ? <Navigate to="/dashboard" replace />
              : <Login />
          }
        />
        <Route
          path="/dashboard"
          element={
            authState.isLoggedIn
              ? <Dashboard user={authState.user} onLogout={handleLogout} />
              : <Navigate to="/" replace />
          }
        />
        {/* Catch any unknown route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;
