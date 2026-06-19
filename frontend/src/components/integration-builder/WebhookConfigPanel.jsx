// src/components/integration-builder/WebhookConfigPanel.jsx
import React, { useState } from 'react';

export default function WebhookConfigPanel({ action, onRegister }) {
  const [copied, setCopied] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [result, setResult] = useState(action.last_response ?? null);
  const [error, setError] = useState(action.last_error ?? null);

  const url = action.saved_prefilled?.url || `https://platform.flash-manager.com/api/webhooks/delivery/${action.key}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRegister = async () => {
    setRegistering(true);
    setError(null);
    try {
      const res = await onRegister();
      setResult(res.response ?? res);
      if (!res.ok) setError(res.error ?? 'fetch failed');
    } catch (e) {
      setError(e.message ?? 'fetch failed');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="webhook-panel">
      <div className="webhook-title">
        🔗 {action.label} <span className="badge badge-webhook">WEBHOOK</span>
      </div>

      <div className="connect-carrier-card">
        <div className="card-header">⏱ Connect your carrier</div>
        <p className="card-desc">
          Use the details your delivery company gave you. This links their system to
          GrowAI so shipment updates appear in your orders automatically.
        </p>

        <label className="field-label">📁 Registration details</label>
        <div className="url-row">
          <input type="text" readOnly value={url} className="field-input" />
          <button type="button" className="icon-btn" onClick={handleCopy}>
            {copied ? '✓' : '📋'}
          </button>
        </div>
        <p className="hint">
          Filled automatically — this URL is sent in the subscription request when you
          click Subscribe Now. Share it with the carrier if it must be whitelisted.
        </p>

        <button
          type="button"
          className="btn-primary register-btn"
          onClick={handleRegister}
          disabled={registering}
        >
          {registering ? '⏳ Registering...' : '🔄 Register with carrier'}
        </button>

        {error && <div className="status-error">● fetch failed</div>}

        {(result || error) && (
          <div className="subscribe-response">
            <div className="response-label">SUBSCRIBE RESPONSE</div>
            <pre>{JSON.stringify(error ? { error } : result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}