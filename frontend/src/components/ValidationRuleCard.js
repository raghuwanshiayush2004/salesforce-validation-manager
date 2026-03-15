import React, { useState } from 'react';
import './ValidationRuleCard.css';

const ValidationRuleCard = ({ rule, onToggle, isPending }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rule-card ${rule.active ? 'rule-active' : 'rule-inactive'} ${isPending ? 'rule-pending' : ''}`}>
      {/* Card Header */}
      <div className="rule-card-header">
        <div className="rule-title-row">
          <div className="rule-status-dot-wrapper">
            <span className={`rule-status-dot ${rule.active ? 'dot-green' : 'dot-red'}`} />
          </div>
          <div className="rule-title-info">
            <h3 className="rule-name">{rule.name}</h3>
            {rule.fullName && (
              <span className="rule-full-name">{rule.fullName}</span>
            )}
          </div>
        </div>

        {/* Active Badge */}
        <span className={`rule-badge ${rule.active ? 'badge-active' : 'badge-inactive'}`}>
          {rule.active ? '✅ Active' : '🚫 Inactive'}
        </span>
      </div>

      {/* Description */}
      {rule.description && (
        <p className="rule-description">{rule.description}</p>
      )}

      {/* Expand / Collapse for details */}
      {(rule.errorMessage || rule.errorConditionFormula) && (
        <button className="rule-expand-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? '▲ Hide Details' : '▼ Show Details'}
        </button>
      )}

      {expanded && (
        <div className="rule-details">
          {rule.errorConditionFormula && (
            <div className="rule-detail-item">
              <span className="rule-detail-label">Formula</span>
              <code className="rule-detail-value">{rule.errorConditionFormula}</code>
            </div>
          )}
          {rule.errorMessage && (
            <div className="rule-detail-item">
              <span className="rule-detail-label">Error Message</span>
              <p className="rule-detail-value">{rule.errorMessage}</p>
            </div>
          )}
          <div className="rule-detail-item">
            <span className="rule-detail-label">Rule ID</span>
            <code className="rule-detail-value rule-id">{rule.id}</code>
          </div>
        </div>
      )}

      {/* Toggle Button - 4th requirement */}
      <div className="rule-card-footer">
        <button
          className={`rule-toggle-btn ${rule.active ? 'toggle-deactivate' : 'toggle-activate'}`}
          onClick={() => onToggle(rule.id, rule.active)}
          disabled={isPending}
        >
          {isPending ? (
            <><span className="btn-spinner-sm" /> Processing...</>
          ) : rule.active ? (
            <><span>🚫</span> Deactivate Rule</>
          ) : (
            <><span>✅</span> Activate Rule</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ValidationRuleCard;
