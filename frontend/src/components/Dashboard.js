import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ValidationRuleCard from './ValidationRuleCard';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [togglingAll, setTogglingAll] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(new Set());
  const [deployLog, setDeployLog] = useState(null);

  // ── Fetch all validation rules ─────────────────────────────────────
  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/rules');
      setRules(res.data.rules);
      setHasFetched(true);
      toast.success(`Fetched ${res.data.rules.length} validation rules`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch validation rules';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Toggle single rule ──────────────────────────────────────────────
  const handleToggleRule = async (ruleId, currentActive) => {
    setPendingChanges(prev => new Set([...prev, ruleId]));
    try {
      const res = await axios.post(`/api/rules/${ruleId}/toggle`);
      setRules(prev =>
        prev.map(r => r.id === ruleId ? { ...r, active: res.data.newState } : r)
      );
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to toggle rule');
    } finally {
      setPendingChanges(prev => { const next = new Set(prev); next.delete(ruleId); return next; });
    }
  };

  // ── Enable all rules ───────────────────────────────────────────────
  const handleEnableAll = async () => {
    setTogglingAll(true);
    try {
      const res = await axios.post('/api/rules/toggle-all', { active: true });
      setRules(prev => prev.map(r => ({ ...r, active: true })));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to enable all rules');
    } finally {
      setTogglingAll(false);
    }
  };

  // ── Disable all rules ──────────────────────────────────────────────
  const handleDisableAll = async () => {
    setTogglingAll(true);
    try {
      const res = await axios.post('/api/rules/toggle-all', { active: false });
      setRules(prev => prev.map(r => ({ ...r, active: false })));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to disable all rules');
    } finally {
      setTogglingAll(false);
    }
  };

  // ── Deploy changes ─────────────────────────────────────────────────
  const handleDeploy = async () => {
    setDeploying(true);
    setDeployLog(null);
    try {
      const res = await axios.post('/api/deploy');
      setDeployLog(res.data);
      setRules(prev =>
        prev.map(r => {
          const updated = res.data.rules.find(d => d.id === r.id);
          return updated ? { ...r, active: updated.active } : r;
        })
      );
      toast.success('✅ ' + res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Deploy failed');
    } finally {
      setDeploying(false);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await onLogout();
  };

  const activeCount = rules.filter(r => r.active).length;
  const inactiveCount = rules.length - activeCount;

  return (
    <div className="dashboard">
      {/* ─── Header ─── */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="header-logo">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.2"/>
              <path d="M24 10C18.48 10 14 14.48 14 20c0 3.56 1.83 6.71 4.6 8.57L16 36h16l-2.6-7.43C32.17 26.71 34 23.56 34 20c0-5.52-4.48-10-10-10z" fill="white"/>
              <circle cx="24" cy="20" r="4" fill="#00a1e0"/>
            </svg>
          </div>
          <div>
            <h1 className="header-title">SF Validation Manager</h1>
            <p className="header-org">
              🌐 <a href={user?.instanceUrl} target="_blank" rel="noreferrer">{user?.instanceUrl}</a>
            </p>
          </div>
        </div>
        <div className="header-right">
          <div className="user-badge">
            <div className="user-avatar">{user?.displayName?.[0]?.toUpperCase() || 'U'}</div>
            <div className="user-info">
              <span className="user-name">{user?.displayName}</span>
              <span className="user-email">{user?.username}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="dashboard-main">

        {/* Stats Cards */}
        {hasFetched && (
          <div className="stats-row">
            <div className="stat-card stat-total">
              <span className="stat-num">{rules.length}</span>
              <span className="stat-label">Total Rules</span>
            </div>
            <div className="stat-card stat-active">
              <span className="stat-num">{activeCount}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-card stat-inactive">
              <span className="stat-num">{inactiveCount}</span>
              <span className="stat-label">Inactive</span>
            </div>
            <div className="stat-card stat-object">
              <span className="stat-num">Account</span>
              <span className="stat-label">Object</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="actions-panel">
          <div className="actions-left">
            {/* 1. Fetch Rules */}
            <button className="btn btn-primary" onClick={fetchRules} disabled={loading}>
              {loading ? (
                <><span className="btn-spinner" /> Fetching...</>
              ) : (
                <><span>📋</span> {hasFetched ? 'Refresh Rules' : 'Get Validation Rules'}</>
              )}
            </button>

            {/* 4. Enable All / Disable All */}
            {hasFetched && rules.length > 0 && (
              <>
                <button
                  className="btn btn-success"
                  onClick={handleEnableAll}
                  disabled={togglingAll || loading}
                >
                  {togglingAll ? <span className="btn-spinner" /> : '✅'} Enable All
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDisableAll}
                  disabled={togglingAll || loading}
                >
                  {togglingAll ? <span className="btn-spinner" /> : '🚫'} Disable All
                </button>
              </>
            )}
          </div>

          {/* 5. Deploy Button */}
          {hasFetched && (
            <button
              className="btn btn-deploy"
              onClick={handleDeploy}
              disabled={deploying || loading}
            >
              {deploying ? (
                <><span className="btn-spinner" /> Deploying...</>
              ) : (
                <><span>🚀</span> Deploy to Salesforce</>
              )}
            </button>
          )}
        </div>

        {/* Deploy Log */}
        {deployLog && (
          <div className="deploy-log">
            <div className="deploy-log-header">
              <span>🚀 Deployment Confirmation</span>
              <span className="deploy-timestamp">{new Date(deployLog.timestamp).toLocaleString()}</span>
            </div>
            <p className="deploy-message">{deployLog.message}</p>
            <div className="deploy-rules-grid">
              {deployLog.rules.map(r => (
                <div key={r.id} className="deploy-rule-item">
                  <span className={`deploy-dot ${r.active ? 'dot-active' : 'dot-inactive'}`} />
                  <span className="deploy-rule-name">{r.name}</span>
                  <span className={`deploy-badge ${r.active ? 'badge-active' : 'badge-inactive'}`}>
                    {r.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty / Loading State */}
        {!hasFetched && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No rules loaded yet</h3>
            <p>Click "Get Validation Rules" to fetch all Account validation rules from your Salesforce org.</p>
          </div>
        )}

        {loading && (
          <div className="empty-state">
            <div className="loading-spinner-lg" />
            <p>Fetching validation rules from Salesforce...</p>
          </div>
        )}

        {/* 3. Validation Rules List */}
        {hasFetched && !loading && (
          <div className="rules-section">
            <div className="rules-header">
              <h2>Account Validation Rules</h2>
              <span className="rules-count">{rules.length} rules</span>
            </div>

            {rules.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No validation rules found</h3>
                <p>No validation rules are configured on the Account object in your Salesforce org.</p>
              </div>
            ) : (
              <div className="rules-grid">
                {rules.map(rule => (
                  <ValidationRuleCard
                    key={rule.id}
                    rule={rule}
                    onToggle={handleToggleRule}
                    isPending={pendingChanges.has(rule.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
