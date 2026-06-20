import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Copy, RefreshCw, Loader2 } from 'lucide-react';
import MethodBadge from './MethodBadge';
import { companiesService } from '../../services/companiesService';

// NOTE: backend DTO does not return `action.webhook_url` / `action.webhook_status`
// directly — those live inside the action's persisted field_mapping_json, exposed
// via `saved_prefilled`. Read from `config.prefilled`, not top-level `action` keys.
export default function WebhookConfigPanel({ carrierId, action, config, onConfigChange }) {
  const [registering, setRegistering] = useState(false);
  const [registerStatus, setRegisterStatus] = useState(null); // null | 'ok' | 'failed'
  const [registerResponse, setRegisterResponse] = useState(null);
  const [copied, setCopied] = useState(false);

  const savedPrefilled = config?.prefilled || {};
  const webhookUrl = savedPrefilled.url || `https://platform.flash-manager.com/api/webhooks/delivery/${carrierId}`;
  const webhookStatus = savedPrefilled.registered ? 'ok' : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRegister = async () => {
    setRegistering(true);
    setRegisterStatus(null);
    try {
      const result = await companiesService.registerWebhook(carrierId);
      const ok = result?.ok !== false;
      setRegisterStatus(ok ? 'ok' : 'failed');
      setRegisterResponse(result?.response ?? result);
      onConfigChange?.({
        ...config,
        prefilled: { ...savedPrefilled, url: result?.url || webhookUrl, registered: ok },
      });
    } catch (err) {
      setRegisterStatus('failed');
      setRegisterResponse(err.response?.data || { error: 'Fetch failed' });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '16px' }}>🔗</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{action.label || action.key}</span>
        <MethodBadge method="WEBHOOK" />
      </div>

      {/* Connect description card */}
      <div style={{
        borderRadius: '8px', border: '1px solid var(--border-color)',
        padding: '16px', marginBottom: '16px', backgroundColor: 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <span style={{ fontSize: '14px' }}>🔗</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>Connect your carrier</span>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Use the details your delivery company gave you. This links their system to GrowAI so shipment updates appear in your orders automatically.
        </p>
      </div>

      {/* Registration details */}
      <div style={{ marginBottom: '12px' }}>
        <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' }}>
          Registration details
        </p>

        {/* Status badge */}
        {webhookStatus && (
          <div style={{ marginBottom: '8px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
              backgroundColor: webhookStatus === 'ok' ? '#ecfdf5' : '#fef2f2',
              color: webhookStatus === 'ok' ? '#065f46' : '#991b1b'
            }}>
              {webhookStatus}
            </span>
          </div>
        )}

        {/* URL row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 12px', borderRadius: '7px',
          backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
          marginBottom: '6px'
        }}>
          <span style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-main)', wordBreak: 'break-all' }}>
            {webhookUrl}
          </span>
          <button
            onClick={handleCopy}
            style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', borderRadius: '6px',
              backgroundColor: copied ? '#ecfdf5' : 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer', color: copied ? '#059669' : 'var(--text-muted)'
            }}
          >
            <Copy size={12} />
          </button>
        </div>

        <p style={{ margin: '0 0 14px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Filled automatically — this URL is sent in the subscription request when you click Subscribe Now. Share it with the carrier if they must whitelist your endpoint.
        </p>
      </div>

      {/* Register button + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <button
          onClick={handleRegister}
          disabled={registering}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 18px', borderRadius: '8px',
            background: registering ? '#ede9fe' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            border: 'none', color: '#fff', fontSize: '13px', fontWeight: '600',
            cursor: registering ? 'not-allowed' : 'pointer'
          }}
        >
          {registering
            ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
            : <RefreshCw size={13} />
          }
          Register with carrier
        </button>
        {registerStatus === 'ok' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
            <CheckCircle2 size={13} /> registered
          </span>
        )}
        {registerStatus === 'failed' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>
            <AlertCircle size={13} /> fetch failed
          </span>
        )}
      </div>

      {/* Subscribe response */}
      {registerResponse && (
        <div>
          <p style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>
            Subscribe Response
          </p>
          <pre style={{
            margin: 0, padding: '12px 14px', fontSize: '11px', lineHeight: '1.6',
            backgroundColor: '#f9fafb', border: '1px solid var(--border-color)',
            borderRadius: '7px', overflow: 'auto', fontFamily: 'monospace',
            color: 'var(--text-main)'
          }}>
            {JSON.stringify(registerResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}