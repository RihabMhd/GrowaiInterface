import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, Play, Code2, Copy,
  Link2, RefreshCw, Eye, EyeOff, Zap, Webhook
} from 'lucide-react';
import { companiesService } from '../services/companiesService';

// ─── Constants ───────────────────────────────────────────────────────────────
const METHOD_COLORS = {
  GET:     { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  POST:    { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  WEBHOOK: { bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe' },
  PUT:     { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  DELETE:  { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
};

const CARRIER_REGISTRY = {
  ameex:         { logoColor: '#e11d48', textColor: '#fff', initial: 'AX' },
  cathedis:      { logoColor: '#b91c1c', textColor: '#fff', initial: 'CA' },
  'chrono-diali':{ logoColor: '#0284c7', textColor: '#fff', initial: 'CD' },
  sendit:        { logoColor: '#4f46e5', textColor: '#fff', initial: 'SE' },
  'ozon-express':{ logoColor: '#eab308', textColor: '#000', initial: 'OE' },
};

// ─── Reusable UI Atoms ────────────────────────────────────────────────────────

function MethodBadge({ method }) {
  const colors = METHOD_COLORS[method] || METHOD_COLORS.GET;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: '9px', fontWeight: '700', letterSpacing: '0.5px',
      padding: '2px 6px', borderRadius: '4px',
      backgroundColor: colors.bg, color: colors.text,
      border: `1px solid ${colors.border}`,
      flexShrink: 0
    }}>
      {method}
    </span>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: '36px', height: '20px', borderRadius: '10px',
        backgroundColor: checked ? '#7c3aed' : '#d1d5db',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative', transition: 'background-color 0.2s',
        flexShrink: 0, opacity: disabled ? 0.5 : 1
      }}
    >
      <span style={{
        position: 'absolute', top: '2px',
        left: checked ? '18px' : '2px',
        width: '16px', height: '16px', borderRadius: '50%',
        backgroundColor: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </button>
  );
}

function SectionCard({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      border: '1px solid var(--border-color)', borderRadius: '10px',
      overflow: 'hidden', marginBottom: '12px'
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: 'var(--bg-card)', border: 'none',
          cursor: 'pointer', borderBottom: open ? '1px solid var(--border-color)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {Icon && <Icon size={13} style={{ color: '#7c3aed' }} />}
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </span>
        </div>
        {open ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
               : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
      </button>
      {open && (
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-card)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Credential Section ───────────────────────────────────────────────────────

function CredentialSection({ credentials = [], values = {}, onChange }) {
  const [revealed, setRevealed] = useState({});

  if (credentials.length === 0) return null;

  return (
    <SectionCard title="API Credentials" icon={Link2}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {credentials.map(cred => {
          const isSecret = cred.type === 'password';
          const isRevealed = revealed[cred.key];
          return (
            <div key={cred.key}>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                {cred.label}
                {cred.required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={isSecret && !isRevealed ? 'password' : 'text'}
                  value={values[cred.key] || ''}
                  onChange={e => onChange({ ...values, [cred.key]: e.target.value })}
                  placeholder={cred.placeholder || `Enter ${cred.label.toLowerCase()}`}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: isSecret ? '8px 36px 8px 12px' : '8px 12px',
                    fontSize: '13px', color: 'var(--text-main)',
                    backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
                    borderRadius: '7px', outline: 'none',
                    fontFamily: isSecret && !isRevealed ? 'monospace' : 'inherit'
                  }}
                />
                {isSecret && (
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
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// ─── Field Mapping Table ──────────────────────────────────────────────────────

function FieldCell({ field, value, onChange }) {
  if (field.type === 'boolean') {
    return <Toggle checked={!!value} onChange={v => onChange(v)} />;
  }
  if (field.type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '5px 8px', fontSize: '12px',
          backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
          borderRadius: '5px', color: 'var(--text-main)', cursor: 'pointer'
        }}
      >
        <option value="">—</option>
        {(field.options || []).map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }
  return (
    <input
      type={field.type === 'number' ? 'number' : 'text'}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder="—"
      style={{
        width: '100%', padding: '5px 8px', fontSize: '12px',
        backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
        borderRadius: '5px', color: 'var(--text-main)', boxSizing: 'border-box'
      }}
    />
  );
}

function FieldMappingTable({ fields = [], values = {}, hiddenFields = {}, onChangeValues, onChangeHidden }) {
  if (fields.length === 0) {
    return (
      <SectionCard title="Pre-filled Values" icon={Code2} defaultOpen={false}>
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
          <CheckCircle2 size={20} style={{ color: '#10b981', marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
          No configurable fields for this method
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Pre-filled Values" icon={Code2}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button
          onClick={() => { onChangeValues({}); onChangeHidden({}); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '11px', color: 'var(--text-muted)', padding: '2px 6px'
          }}
        >
          <RefreshCw size={11} /> Reset
        </button>
      </div>
      <div style={{ border: '1px solid var(--border-color)', borderRadius: '7px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1.4fr 60px',
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
              display: 'grid', gridTemplateColumns: '1fr 1.4fr 60px',
              alignItems: 'center', padding: '8px 12px',
              borderBottom: idx < fields.length - 1 ? '1px solid var(--border-color)' : 'none',
              backgroundColor: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-app)'
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '500' }}>
                {field.label}
              </span>
              {field.required && <span style={{ color: '#ef4444', fontSize: '12px', marginLeft: '2px' }}>*</span>}
            </div>
            <div style={{ paddingRight: '12px' }}>
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
                  : <Eye size={13} style={{ color: 'var(--text-muted)' }} />
                }
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ─── Response Viewer ──────────────────────────────────────────────────────────

function ResponseViewer({ response }) {
  const [open, setOpen] = useState(false);
  if (!response) return null;

  const isSuccess = response.success;
  let formatted = '';
  try {
    formatted = JSON.stringify(typeof response.data === 'string' ? JSON.parse(response.data) : response.data, null, 2);
  } catch {
    formatted = String(response.data || '');
  }

  return (
    <div style={{
      border: `1px solid ${isSuccess ? '#d1fae5' : '#fee2e2'}`,
      borderRadius: '8px', overflow: 'hidden', marginTop: '8px'
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', border: 'none', cursor: 'pointer',
          backgroundColor: isSuccess ? '#f0fdf4' : '#fef2f2'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Code2 size={13} style={{ color: isSuccess ? '#10b981' : '#ef4444' }} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: isSuccess ? '#065f46' : '#991b1b' }}>
            Response Payload
          </span>
        </div>
        {open ? <ChevronUp size={13} style={{ color: 'var(--text-muted)' }} />
               : <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />}
      </button>
      {open && (
        <pre style={{
          margin: 0, padding: '14px', fontSize: '11px', lineHeight: '1.6',
          backgroundColor: '#1e1e2e', color: '#cdd6f4',
          overflow: 'auto', maxHeight: '280px', fontFamily: 'monospace'
        }}>
          {formatted || 'No response data'}
        </pre>
      )}
    </div>
  );
}

// ─── Test Panel ───────────────────────────────────────────────────────────────

function TestPanel({ carrierId, actionKey, onResult }) {
  const [state, setState] = useState('idle'); // idle | loading | passed | failed
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

  const stateConfig = {
    idle:    { color: 'var(--text-muted)', label: 'Pending test' },
    loading: { color: '#f59e0b',           label: 'Testing…' },
    passed:  { color: '#10b981',           label: 'Test passed' },
    failed:  { color: '#ef4444',           label: 'Test failed' },
  }[state];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        {/* State indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          {state === 'loading' && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite', color: '#f59e0b' }} />}
          {state === 'passed'  && <CheckCircle2 size={13} style={{ color: '#10b981' }} />}
          {state === 'failed'  && <AlertCircle size={13} style={{ color: '#ef4444' }} />}
          {state === 'idle'    && <span style={{ width: '13px', height: '13px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'inline-block' }} />}
          <span style={{ fontSize: '12px', fontWeight: '500', color: stateConfig.color }}>
            {stateConfig.label}
          </span>
        </div>
        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {response && (
            <button
              onClick={() => setShowResponse(s => !s)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '7px 12px', borderRadius: '7px',
                backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
                fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', cursor: 'pointer'
              }}
            >
              <Code2 size={12} /> Response
            </button>
          )}
          <button
            onClick={handleTest}
            disabled={state === 'loading'}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 14px', borderRadius: '7px',
              background: state === 'loading' ? '#ede9fe' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border: 'none', color: '#fff', fontSize: '12px',
              fontWeight: '600', cursor: state === 'loading' ? 'not-allowed' : 'pointer'
            }}
          >
            {state === 'loading'
              ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
              : <Play size={12} fill="currentColor" />
            }
            Test
          </button>
        </div>
      </div>
      {showResponse && <ResponseViewer response={response} />}
    </div>
  );
}

// ─── Webhook Section ──────────────────────────────────────────────────────────

function WebhookSection({ carrierId, webhookUrl, webhookStatus, onRegister }) {
  const [registering, setRegistering] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await companiesService.registerWebhook(carrierId);
      onRegister?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register webhook');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div>
      {/* Connect description */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '12px 14px', borderRadius: '8px',
        backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
        marginBottom: '16px'
      }}>
        <Webhook size={16} style={{ color: '#7c3aed', flexShrink: 0, marginTop: '1px' }} />
        <div>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
            Connect your carrier
          </p>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Use the details your delivery company gave you. This links their system to GrowAI
            so shipment updates appear in your orders automatically.
          </p>
        </div>
      </div>

      {/* Registration details */}
      <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' }}>
        Registration details
      </p>
      {webhookStatus && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
          backgroundColor: webhookStatus === 'ok' ? '#ecfdf5' : '#fef2f2',
          color: webhookStatus === 'ok' ? '#065f46' : '#991b1b',
          marginBottom: '8px'
        }}>
          {webhookStatus}
        </span>
      )}
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
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 8px', borderRadius: '5px',
            backgroundColor: copied ? '#ecfdf5' : 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            fontSize: '11px', color: copied ? '#059669' : 'var(--text-main)', cursor: 'pointer'
          }}
        >
          <Copy size={10} />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p style={{ margin: '0 0 16px', fontSize: '11px', color: 'var(--text-muted)' }}>
        Filled automatically — this URL is sent in the subscription request when you click Register. Share it with the carrier if they must whitelist your endpoint.
      </p>

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
    </div>
  );
}

// ─── Action Config Panel ──────────────────────────────────────────────────────

function ActionConfigPanel({ carrierId, action, config, onConfigChange }) {
  const creds   = config.credentials    || {};
  const values  = config.prefilled      || {};
  const hidden  = config.hidden         || {};

  const handleTestResult = useCallback(({ state }) => {
    onConfigChange({ ...config, test_state: state });
  }, [config, onConfigChange]);

  if (action.method === 'WEBHOOK') {
    return (
      <div>
        {/* Action header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Webhook size={16} style={{ color: '#7c3aed' }} />
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
            {action.label}
          </span>
          <MethodBadge method="WEBHOOK" />
        </div>
        <WebhookSection
          carrierId={carrierId}
          webhookUrl={action.webhook_url || `https://yourdomain.com/api/webhooks/delivery/${carrierId}`}
          webhookStatus={action.webhook_status}
          onRegister={() => {}}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Auto-create parcel toggle (only for createParcel action) */}
      {action.is_auto_create && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderRadius: '10px',
          backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              backgroundColor: '#f3f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={15} style={{ color: '#7c3aed' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                Auto-Create Parcel
              </p>
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

      {/* Credentials */}
      <CredentialSection
        credentials={action.credentials || []}
        values={creds}
        onChange={v => onConfigChange({ ...config, credentials: v })}
      />

      {/* Field mapping */}
      <FieldMappingTable
        fields={action.fields || []}
        values={values}
        hiddenFields={hidden}
        onChangeValues={v => onConfigChange({ ...config, prefilled: v })}
        onChangeHidden={v => onConfigChange({ ...config, hidden: v })}
      />

      {/* Test panel */}
      <SectionCard title="Action Testing" icon={Play} defaultOpen={true}>
        <TestPanel
          carrierId={carrierId}
          actionKey={action.key}
          onResult={handleTestResult}
        />
      </SectionCard>
    </div>
  );
}

// ─── Action Sidebar ───────────────────────────────────────────────────────────

function ActionSidebar({ groups, selectedKey, onSelect }) {
  return (
    <div style={{
      width: '220px', flexShrink: 0,
      borderRight: '1px solid var(--border-color)',
      overflowY: 'auto', height: '100%'
    }}>
      {groups.map(group => (
        <div key={group.label} style={{ marginBottom: '4px' }}>
          <p style={{
            fontSize: '9px', fontWeight: '700', color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.7px',
            padding: '10px 14px 4px', margin: 0
          }}>
            {group.label}
          </p>
          {group.actions.map(action => {
            const isSelected = selectedKey === action.key;
            const configIcon = action.config_state === 'configured'
              ? <CheckCircle2 size={10} style={{ color: '#10b981' }} />
              : action.config_state === 'error'
              ? <AlertCircle size={10} style={{ color: '#ef4444' }} />
              : <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#d1d5db', display: 'inline-block' }} />;
            return (
              <button
                key={action.key}
                onClick={() => onSelect(action.key)}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 14px',
                  border: 'none', cursor: 'pointer', display: 'block',
                  backgroundColor: isSelected ? '#f3f0ff' : 'transparent',
                  borderLeft: isSelected ? '2px solid #7c3aed' : '2px solid transparent',
                  transition: 'background-color 0.1s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <MethodBadge method={action.method} />
                  <span style={{
                    fontSize: '12px', fontWeight: isSelected ? '700' : '600',
                    color: isSelected ? '#7c3aed' : 'var(--text-main)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {action.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {action.key}
                  </span>
                  {configIcon}
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CompanyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany]     = useState(null);
  const [actions, setActions]     = useState([]);
  const [configs, setConfigs]     = useState({});   // { [actionKey]: { credentials, prefilled, hidden, auto_create, test_state } }
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const [compData, actionsData] = await Promise.all([
        companiesService.getCompany(id),
        companiesService.getCarrierActions(id),
      ]);
      const c = compData.company || compData;
      setCompany(c);
      const acts = actionsData.actions || actionsData || [];
      setActions(acts);

      // Seed configs from server data
      const initialConfigs = {};
      acts.forEach(a => {
        initialConfigs[a.key] = {
          credentials:  a.saved_credentials  || {},
          prefilled:    a.saved_prefilled    || {},
          hidden:       a.saved_hidden       || {},
          auto_create:  a.auto_create_enabled ?? false,
          test_state:   a.test_state          || 'pending',
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
          companiesService.saveActionConfig(id, actionKey, config)
        )
      );
      // Show brief success feedback inline
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // Group actions for sidebar
  const groups = React.useMemo(() => {
    const groupMap = {};
    actions.forEach(a => {
      const g = a.group || 'OTHER';
      if (!groupMap[g]) groupMap[g] = [];
      groupMap[g].push(a);
    });
    return Object.entries(groupMap).map(([label, acts]) => ({ label, actions: acts }));
  }, [actions]);

  const selectedAction = actions.find(a => a.key === selectedKey);

  const reg = CARRIER_REGISTRY[id] || { logoColor: '#6b7280', textColor: '#fff', initial: (id || 'XX').slice(0, 2).toUpperCase() };

  // ── Loading ──
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-app)', overflow: 'hidden' }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/companies')}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '12px', color: 'var(--text-muted)', padding: '4px 6px',
              borderRadius: '5px'
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span style={{ color: 'var(--border-color)' }}>|</span>
          <div style={{
            width: '32px', height: '32px', borderRadius: '7px',
            backgroundColor: reg.logoColor, color: reg.textColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '700'
          }}>
            {reg.initial}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
              Configure {company?.name || id.toUpperCase()}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
              Set credentials, pre-filled values and field visibility
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {error && (
            <span style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <AlertCircle size={13} /> {error}
            </span>
          )}
          <button
            onClick={() => navigate('/companies')}
            style={{
              padding: '8px 16px', borderRadius: '7px',
              backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
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
              padding: '8px 20px', borderRadius: '7px',
              background: saving ? '#ede9fe' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border: 'none', color: '#fff', fontSize: '13px',
              fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving
              ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
              : <Save size={13} />
            }
            Save Configuration
          </button>
        </div>
      </div>

      {/* ── Body: sidebar + main ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        {groups.length > 0 && (
          <ActionSidebar
            groups={groups}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
          />
        )}

        {/* Main panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {selectedAction ? (
            <ActionConfigPanel
              carrierId={id}
              action={selectedAction}
              config={configs[selectedKey] || {}}
              onConfigChange={cfg => setConfigs(prev => ({ ...prev, [selectedKey]: cfg }))}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              Select an action from the sidebar to configure it
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}