import React, { useState } from 'react';
import { Copy, RefreshCw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import MethodBadge from './MethodBadge';
import { companiesService } from '../../services/companiesService';

export default function WebhookConfigPanel({ carrierId, action, config, onConfigChange }) {
  const [registering, setRegistering] = useState(false);
  const [registerStatus, setRegisterStatus] = useState(null);
  const [registerResponse, setRegisterResponse] = useState(null);
  const [copied, setCopied] = useState(false);

  const savedPrefilled = config?.prefilled || {};
  const webhookUrl = savedPrefilled.url || '';

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
    <div style={{ padding: '0 0 4px' }}>
      {/* ── Header ───────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
        <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>
          {action.label || action.key}
        </span>
        <MethodBadge method="WEBHOOK" />
      </div>

      {/* ── Connect your carrier card ────────────────── */}
      <div style={{
        border: '1px solid var(--border-color)', borderRadius: '8px',
        padding: '14px 16px', marginBottom: '18px', backgroundColor: 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <span style={{ fontSize: '18px', lineHeight: 1 }}>&#x1f517;</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>Connect your carrier</span>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Use the details your delivery company gave you. This links their system to GrowAI so shipment updates appear in your orders automatically.
        </p>
      </div>

      {/* ── Registration details ─────────────────────── */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 10px' }}>
          <p style={{
            fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)',
            margin: 0
          }}>
            Registration details
          </p>
          {(registerStatus === 'ok' || savedPrefilled.registered) && (
            <>
              <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />
              <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '600' }}>ok</span>
            </>
          )}
        </div>

        {/* URL input row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '0 0 0 12px', borderRadius: '8px',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-app)', marginBottom: '10px'
        }}>
          <input
            type="text"
            readOnly
            value={webhookUrl}
            style={{
              flex: 1, border: 'none', outline: 'none', padding: '10px 0',
              fontSize: '12px', fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
              color: 'var(--text-main)', backgroundColor: 'transparent',
              cursor: 'default'
            }}
          />
          <button
            onClick={handleCopy}
            title="Copy webhook URL"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '34px', height: '34px', marginRight: '4px', borderRadius: '6px',
              backgroundColor: copied ? 'var(--success-light)' : 'transparent',
              border: copied ? '1px solid #a7f3d0' : '1px solid transparent',
              cursor: 'pointer', color: copied ? '#059669' : 'var(--text-muted)',
              flexShrink: 0, transition: 'all 0.15s'
            }}
          >
            <Copy size={13} />
          </button>
        </div>

        {/* Instruction text */}
        <p style={{
          margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6
        }}>
          Filled automatically — this URL is sent in the subscription request when you click Register with carrier. Share it with the carrier if they must whitelist your endpoint.
        </p>
      </div>

      {/* ── Register button ── */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <button
            onClick={handleRegister}
            disabled={registering}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 18px', borderRadius: '8px',
              background: registering ? '#ede9fe' : 'linear-gradient(135deg, var(--purple), #6d28d9)',
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
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--success)', fontWeight: '600' }}>
              <CheckCircle2 size={13} /> registered
            </span>
          )}
          {registerStatus === 'failed' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--danger)', fontWeight: '600' }}>
              <AlertCircle size={13} /> fetch failed
            </span>
          )}
        </div>

        {registerResponse && (
          <div>
            <p style={{
              fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 8px'
            }}>
              Subscribe Response
            </p>
            <pre style={{
              margin: 0, padding: '12px 14px', fontSize: '11px', lineHeight: '1.6',
              backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
              borderRadius: '7px', overflow: 'auto', fontFamily: 'monospace',
              color: 'var(--text-main)'
            }}>
              {JSON.stringify(registerResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
