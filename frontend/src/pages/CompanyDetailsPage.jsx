import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, Play, Code2, Copy,
  Link2, RefreshCw, Eye, EyeOff, Zap, Webhook, X
} from 'lucide-react';
import { companiesService } from '../services/companiesService';

// ─── Constants ────────────────────────────────────────────────────────────────
const METHOD_COLORS = {
  GET: { bg: '#dcfce7', text: '#166534' },
  POST: { bg: '#fef3c7', text: '#92400e' },
  WEBHOOK: { bg: '#ede9fe', text: '#5b21b6' },
  PUT: { bg: '#dbeafe', text: '#1e40af' },
  DELETE: { bg: '#fee2e2', text: '#991b1b' },
};

const CARRIER_REGISTRY = {
  ameex: { logo: '/logos/ameex.png', logoColor: '#e11d48', textColor: '#fff', initial: 'AX' },
  cathedis: { logo: '/logos/cathedis.png', logoColor: '#b91c1c', textColor: '#fff', initial: 'CA' },
  'chrono-diali': { logo: '/logos/chrono-diali.png', logoColor: '#0284c7', textColor: '#fff', initial: 'CD' },
  sendit: { logo: '/logos/sendit.png', logoColor: '#4f46e5', textColor: '#fff', initial: 'SE' },
  'ozon-express': { logo: '/logos/ozon-express.png', logoColor: '#eab308', textColor: '#000', initial: 'OE' },
};

// Backend sends `category` per action (main_action | province_city | lookup | webhook).
// This map drives sidebar section ordering + labels — single source of truth, no
// carrier-specific branching needed.
const CATEGORY_ORDER = ['main_action', 'province_city', 'lookup', 'webhook'];
const CATEGORY_LABELS = {
  main_action: 'MAIN ACTION',
  province_city: 'PROVINCE/CITY SELECTORS',
  lookup: 'OTHER LOOKUP DATA',
  webhook: 'WEBHOOK',
};

// ─── Atoms ────────────────────────────────────────────────────────────────────

function MethodBadge({ method }) {
  const c = METHOD_COLORS[method] || METHOD_COLORS.GET;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: '8px', fontWeight: '700', letterSpacing: '0.5px',
      padding: '2px 5px', borderRadius: '3px',
      backgroundColor: c.bg, color: c.text, flexShrink: 0
    }}>{method}</span>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: '40px', height: '22px', borderRadius: '11px',
        backgroundColor: checked ? '#7c3aed' : '#d1d5db',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative', transition: 'background-color 0.2s',
        flexShrink: 0, opacity: disabled ? 0.5 : 1
      }}
    >
      <span style={{
        position: 'absolute', top: '3px',
        left: checked ? '21px' : '3px',
        width: '16px', height: '16px', borderRadius: '50%',
        backgroundColor: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </button>
  );
}

// ─── Carrier Logo (image → fallback initial) ──────────────────────────────────
function CarrierLogo({ carrierId, size = 40, radius = 8 }) {
  const reg = CARRIER_REGISTRY[carrierId] || { logoColor: '#6b7280', textColor: '#fff', initial: (carrierId || 'XX').slice(0, 2).toUpperCase() };
  const [imgErr, setImgErr] = useState(false);

  if (reg.logo && !imgErr) {
    return (
      <img
        src={reg.logo}
        alt={carrierId}
        onError={() => setImgErr(true)}
        style={{ width: size, height: size, borderRadius: radius, objectFit: 'contain', backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      backgroundColor: reg.logoColor, color: reg.textColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: '700', flexShrink: 0
    }}>{reg.initial}</div>
  );
}

// ─── Credential Section ───────────────────────────────────────────────────────
function CredentialSection({ credentials = [], values = {}, onChange }) {
  const [revealed, setRevealed] = useState({});
  if (credentials.length === 0) return null;

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <span style={{ fontSize: '13px' }}>🔒</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>API Credentials</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {credentials.map(cred => {
          const isSecret = cred.type === 'password';
          const isRevealed = revealed[cred.key];
          return (
            <div key={cred.key} style={{
              display: 'grid', gridTemplateColumns: '140px 1fr',
              alignItems: 'center', gap: '12px'
            }}>
              <label style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '500' }}>
                {cred.label}
                {cred.required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={isSecret && !isRevealed ? 'password' : 'text'}
                  value={values[cred.key] || ''}
                  onChange={e => onChange({ ...values, [cred.key]: e.target.value })}
                  placeholder={`Enter ${cred.label}`}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '8px 36px 8px 12px',
                    fontSize: '13px', color: 'var(--text-main)',
                    backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
                    borderRadius: '7px', outline: 'none'
                  }}
                />
                <button
                  onClick={() => setRevealed(r => ({ ...r, [cred.key]: !r[cred.key] }))}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px'
                  }}
                >
                  {isRevealed
                    ? <EyeOff size={13} style={{ color: 'var(--text-muted)' }} />
                    : <Eye size={13} style={{ color: 'var(--text-muted)' }} />
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Field Cell ───────────────────────────────────────────────────────────────
function FieldCell({ field, value, onChange }) {
  if (field.type === 'boolean') {
    return <Toggle checked={!!value} onChange={onChange} />;
  }
  if (field.type === 'select') {
    return (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: '6px 28px 6px 8px', fontSize: '12px',
            backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
            borderRadius: '5px', color: 'var(--text-main)', cursor: 'pointer',
            appearance: 'none'
          }}
        >
          <option value="">—</option>
          {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {value && (
          <button
            onClick={() => onChange('')}
            style={{ position: 'absolute', right: '22px', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', fontSize: '11px', color: 'var(--text-muted)' }}
          >✕</button>
        )}
        <ChevronDown size={12} style={{ position: 'absolute', right: '6px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
      </div>
    );
  }
  return (
    <input
      type={field.type === 'number' ? 'number' : 'text'}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder="—"
      style={{
        width: '100%', padding: '6px 8px', fontSize: '12px', boxSizing: 'border-box',
        backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
        borderRadius: '5px', color: 'var(--text-main)'
      }}
    />
  );
}

// ─── Field Mapping Table ──────────────────────────────────────────────────────
function FieldMappingTable({ fields = [], values = {}, hiddenFields = {}, onChangeValues, onChangeHidden }) {
  if (fields.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
        <CheckCircle2 size={24} style={{ color: '#10b981', display: 'block', margin: '0 auto 8px' }} />
        No configurable fields for this method
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px' }}>📋</span>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>Pre-filled Values</span>
        </div>
        <button
          onClick={() => { onChangeValues({}); onChangeHidden({}); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '11px', color: 'var(--text-muted)', padding: '2px 6px'
          }}
        >
          <RefreshCw size={10} /> Reset
        </button>
      </div>

      <div style={{ border: '1px solid var(--border-color)', borderRadius: '7px', overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1.4fr 52px',
          backgroundColor: 'var(--bg-app)', padding: '7px 12px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {['Field', 'Default Value', 'Hidden'].map(h => (
            <span key={h} style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {h}
            </span>
          ))}
        </div>
        {/* Rows */}
        {fields.map((field, idx) => (
          <div
            key={field.key}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1.4fr 52px',
              alignItems: 'center', padding: '8px 12px',
              borderBottom: idx < fields.length - 1 ? '1px solid var(--border-color)' : 'none',
              backgroundColor: 'var(--bg-card)'
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '500' }}>{field.label}</span>
              {field.required && <span style={{ color: '#ef4444', fontSize: '12px', marginLeft: '2px' }}>*</span>}
            </div>
            <div style={{ paddingRight: '8px' }}>
              <FieldCell
                field={field}
                value={values[field.key]}
                onChange={v => onChangeValues({ ...values, [field.key]: v })}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => onChangeHidden({ ...hiddenFields, [field.key]: !hiddenFields[field.key] })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                {hiddenFields[field.key]
                  ? <EyeOff size={13} style={{ color: '#7c3aed' }} />
                  : <Eye size={13} style={{ color: '#d1d5db' }} />
                }
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Response Payload Collapsible ─────────────────────────────────────────────
function ResponsePayload({ data }) {
  const [open, setOpen] = useState(false);
  let formatted = '';
  try { formatted = JSON.stringify(typeof data === 'string' ? JSON.parse(data) : data, null, 2); }
  catch { formatted = String(data || ''); }

  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', marginTop: '12px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', border: 'none', cursor: 'pointer',
          backgroundColor: 'var(--bg-app)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Code2 size={12} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>Response Payload</span>
        </div>
        {open
          ? <ChevronUp size={13} style={{ color: 'var(--text-muted)' }} />
          : <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
        }
      </button>
      {open && (
        <pre style={{
          margin: 0, padding: '12px 14px', fontSize: '11px', lineHeight: '1.6',
          backgroundColor: '#1e1e2e', color: '#cdd6f4',
          overflow: 'auto', maxHeight: '200px', fontFamily: 'monospace'
        }}>
          {formatted || 'No response data'}
        </pre>
      )}
    </div>
  );
}

// ─── Test Panel (inline row: status + Response btn + Test btn) ─────────────────
function TestPanel({ carrierId, actionKey, initialState, onResult }) {
  const [state, setState] = useState(initialState || 'idle'); // idle | loading | passed | failed
  const [response, setResponse] = useState(null);
  const [showResponse, setShowResponse] = useState(false);

  const handleTest = async () => {
    setState('loading');
    try {
      const result = await companiesService.testAction(carrierId, actionKey);
      setState('passed');
      setResponse({ success: true, data: result });
      onResult?.({ state: 'passed' });
    } catch (err) {
      setState('failed');
      setResponse({ success: false, data: err.response?.data || { message: 'Test failed' } });
      onResult?.({ state: 'failed' });
    }
  };

  const stateMap = {
    idle: { color: 'var(--text-muted)', label: 'Pending test', icon: <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'inline-block' }} /> },
    loading: { color: '#f59e0b', label: 'Testing…', icon: <Loader2 size={12} style={{ animation: 'spin 1s linear infinite', color: '#f59e0b' }} /> },
    passed: { color: '#10b981', label: 'Test passed', icon: <CheckCircle2 size={12} style={{ color: '#10b981' }} /> },
    failed: { color: '#ef4444', label: 'Test failed', icon: <AlertCircle size={12} style={{ color: '#ef4444' }} /> },
  };
  const s = stateMap[state] || stateMap.idle;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {s.icon}
          <span style={{ fontSize: '12px', fontWeight: '500', color: s.color }}>{s.label}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {response && (
            <button
              onClick={() => setShowResponse(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', borderRadius: '7px',
                backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
                fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', cursor: 'pointer'
              }}
            >
              <Code2 size={11} /> Response
            </button>
          )}
          <button
            onClick={handleTest}
            disabled={state === 'loading'}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 14px', borderRadius: '7px',
              background: state === 'loading' ? '#ede9fe' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border: 'none', color: '#fff', fontSize: '12px',
              fontWeight: '600', cursor: state === 'loading' ? 'not-allowed' : 'pointer'
            }}
          >
            {state === 'loading'
              ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
              : <Play size={11} fill="currentColor" />
            }
            Test
          </button>
        </div>
      </div>
      {showResponse && response && <ResponsePayload data={response.data} />}
    </div>
  );
}

// ─── Webhook Panel ────────────────────────────────────────────────────────────
// NOTE: backend DTO does not return `action.webhook_url` / `action.webhook_status`
// directly — those live inside the action's persisted field_mapping_json, exposed
// via `saved_prefilled`. Read from there instead of nonexistent top-level keys.
function WebhookPanel({ carrierId, action, config, onConfigChange }) {
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

// ─── Action Config Panel ──────────────────────────────────────────────────────
function ActionConfigPanel({ carrierId, action, config, onConfigChange }) {
  const creds = config.credentials || {};
  const values = config.prefilled || {};
  const hidden = config.hidden || {};

  const handleTestResult = useCallback(({ state }) => {
    onConfigChange({ ...config, test_state: state });
  }, [config, onConfigChange]);

  // WEBHOOK action — own dedicated panel
  if (action.category === 'webhook' || action.method === 'WEBHOOK') {
    return (
      <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
        <WebhookPanel
          carrierId={carrierId}
          action={action}
          config={config}
          onConfigChange={onConfigChange}
        />
      </div>
    );
  }

  const hasFields = (action.fields || []).length > 0;
  // Backend marks createParcel-style actions via auto_create_enabled !== null (DTO contract).
  const supportsAutoCreate = action.auto_create_enabled !== null && action.auto_create_enabled !== undefined;

  return (
    <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>

      {/* Auto-create parcel toggle */}
      {supportsAutoCreate && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderRadius: '10px',
          backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: '#f3f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={16} style={{ color: '#7c3aed' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>Auto-Create Parcel</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                Automatically create parcels when new orders are placed
              </p>
            </div>
          </div>
          <Toggle
            checked={!!config.auto_create}
            onChange={v => onConfigChange({ ...config, auto_create: v })}
          />
        </div>
      )}

      {/* Flow-managed note for non-auto-create actions */}
      {!supportsAutoCreate && (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 14px', fontStyle: 'italic' }}>
          Flow-managed action
        </p>
      )}

      {/* Credentials */}
      <CredentialSection
        credentials={action.credentials || []}
        values={creds}
        onChange={v => onConfigChange({ ...config, credentials: v })}
      />

      {/* Test row (shown above pre-filled if already tested) */}
      {(config.test_state === 'passed' || config.test_state === 'failed') && (
        <div style={{ marginBottom: '16px' }}>
          <TestPanel
            carrierId={carrierId}
            actionKey={action.key}
            initialState={config.test_state}
            onResult={handleTestResult}
          />
        </div>
      )}

      {/* Pre-filled table */}
      <FieldMappingTable
        fields={action.fields || []}
        values={values}
        hiddenFields={hidden}
        onChangeValues={v => onConfigChange({ ...config, prefilled: v })}
        onChangeHidden={v => onConfigChange({ ...config, hidden: v })}
      />

      {/* Test panel (always shown at bottom if not yet tested) */}
      {config.test_state !== 'passed' && config.test_state !== 'failed' && (
        <div style={{ marginTop: '4px' }}>
          <TestPanel
            carrierId={carrierId}
            actionKey={action.key}
            initialState={config.test_state}
            onResult={handleTestResult}
          />
        </div>
      )}

      {/* Response Payload collapsible (always present) */}
      <ResponsePayload data={null} />
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function ActionSidebar({ groups, selectedKey, configs, onSelect }) {
  return (
    <div style={{
      width: '190px', flexShrink: 0,
      borderRight: '1px solid var(--border-color)',
      overflowY: 'auto', backgroundColor: 'var(--bg-card)'
    }}>
      {groups.map(group => (
        <div key={group.label}>
          <p style={{
            fontSize: '9px', fontWeight: '700', color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.7px',
            padding: '12px 14px 4px', margin: 0
          }}>
            {group.label}
          </p>
          {group.actions.map(action => {
            const isSelected = selectedKey === action.key;
            const testState = configs[action.key]?.test_state;
            const stateIcon = testState === 'passed'
              ? <CheckCircle2 size={11} style={{ color: '#10b981', flexShrink: 0 }} />
              : testState === 'failed'
                ? <AlertCircle size={11} style={{ color: '#ef4444', flexShrink: 0 }} />
                : <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'inline-block', flexShrink: 0 }} />;

            return (
              <button
                key={action.key}
                onClick={() => onSelect(action.key)}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 14px',
                  border: 'none', cursor: 'pointer', display: 'block',
                  backgroundColor: isSelected ? '#f3f0ff' : 'transparent',
                  borderLeft: isSelected ? '2px solid #7c3aed' : '2px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <MethodBadge method={action.method} />
                  <span style={{
                    fontSize: '12px', fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? '#7c3aed' : 'var(--text-main)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1
                  }}>
                    {action.label}
                  </span>
                  {stateIcon}
                </div>
                <div style={{ paddingLeft: '1px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {action.key}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function CompanyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [actions, setActions] = useState([]);
  const [configs, setConfigs] = useState({});
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const compData = await companiesService.getCompany(id);
      const actionsData = await companiesService.getCarrierActions(id);

      const c = compData.company || compData;
      const acts = Array.isArray(actionsData) ? actionsData
        : Array.isArray(actionsData?.actions) ? actionsData.actions
        : Array.isArray(actionsData?.data) ? actionsData.data
        : [];

      setCompany(c);
      setActions(acts);

      const initialConfigs = {};
      acts.forEach(a => {
        initialConfigs[a.key] = {
          credentials: a.saved_credentials || {},
          prefilled: a.saved_prefilled || {},
          hidden: a.saved_hidden || {},
          auto_create: a.auto_create_enabled ?? false,
          test_state: a.test_status === 'passed' ? 'passed'
            : a.test_status === 'failed' ? 'failed'
            : 'idle',
        };
      });
      setConfigs(initialConfigs);
      if (acts.length > 0) setSelectedKey(acts[0].key);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load carrier configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(configs).map(([actionKey, config]) =>
          companiesService.saveActionConfig(id, actionKey, {
            credentials: config.credentials,
            prefilled: config.prefilled,
            hidden: config.hidden,
            auto_create_enabled: config.auto_create,
          })
        )
      );
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // Group by backend-provided `category`, in fixed display order — no carrier-
  // specific logic here; new carriers just need their actions to carry a valid category.
  const groups = React.useMemo(() => {
    return CATEGORY_ORDER
      .map(cat => ({
        label: CATEGORY_LABELS[cat],
        actions: actions.filter(a => a.category === cat),
      }))
      .filter(g => g.actions.length > 0);
  }, [actions]);

  const selectedAction = actions.find(a => a.key === selectedKey);

  return (
    // Overlay backdrop
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }}>
      {/* Modal shell */}
      <div style={{
        width: '100%', maxWidth: '780px', height: '90vh', maxHeight: '600px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '14px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.3)'
      }}>

        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CarrierLogo carrierId={id} size={40} radius={8} />
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                Configure {company?.name || id.toUpperCase()}
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                Set credentials, pre-filled values and field visibility
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/companies')}
            style={{
              width: '28px', height: '28px', borderRadius: '50%',
              backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0
            }}
          >
            <X size={13} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Sidebar */}
            {groups.length > 0 && (
              <ActionSidebar
                groups={groups}
                selectedKey={selectedKey}
                configs={configs}
                onSelect={setSelectedKey}
              />
            )}

            {/* Main content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {selectedAction ? (
                <ActionConfigPanel
                  carrierId={id}
                  action={selectedAction}
                  config={configs[selectedKey] || {}}
                  onConfigChange={cfg => setConfigs(prev => ({ ...prev, [selectedKey]: cfg }))}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Select an action from the sidebar
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)', flexShrink: 0
        }}>
          <div>
            {error && (
              <span style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertCircle size={13} /> {error}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/companies')}
              style={{
                padding: '9px 20px', borderRadius: '8px',
                backgroundColor: 'transparent', border: '1px solid var(--border-color)',
                fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 24px', borderRadius: '8px',
                background: saving ? '#ede9fe' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                border: 'none', color: '#fff', fontSize: '13px',
                fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving
                ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                : <span style={{ fontSize: '14px' }}>💾</span>
              }
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}