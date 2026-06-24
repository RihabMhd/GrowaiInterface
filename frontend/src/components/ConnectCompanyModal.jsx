import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { companiesService } from '../services/companiesService';

// ─── Carrier logo registry (keyed by company.id / slug) ──────────────────────
const CARRIER_REGISTRY = {
  ameex: { logo: '../assets/images/ameex.png' },
  cathedis: { logo: '../assets/images/CATHEDIS.png' },
  'chrono_diali': { logo: '../assets/images/chrono.png' },
  sendit: { logo: '../assets/images/Sendit.png' },
  'ozon': { logo: '../assets/images/ozon.png' },
};

// ─── Carrier credential field definitions ────────────────────────────────────
// key        → form field name + payload key sent to backend
// label      → displayed label
// type       → 'text' | 'password'
// required   → drives validation
const CARRIER_FIELDS = {
  ameex: [
    { key: 'api_id', label: 'C Api Id', type: 'text', required: true },
    { key: 'api_key', label: 'C Api Key', type: 'password', required: true },
    { key: 'secret_key', label: 'Secret Key / Token', type: 'password', required: false },
  ],
  cathedis: [
    { key: 'username', label: 'Username', type: 'text', required: true },
    { key: 'password', label: 'Password', type: 'password', required: true },
  ],
  'chrono_diali': [
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  'ozon': [
    { key: 'partner_id', label: 'Partner ID', type: 'text', required: true },
    { key: 'api_key', label: 'API Key', type: 'password', required: true },
  ],
  sendit: [
    { key: 'public_key', label: 'Public Key', type: 'text', required: true },
    { key: 'secret_key', label: 'Secret Key', type: 'password', required: true },
  ],
};

// Fallback: single generic api_key field for unknown carriers
const FALLBACK_FIELDS = [
  { key: 'api_key', label: 'API Key', type: 'password', required: true },
];

// ─── Logo component ───────────────────────────────────────────────────────────
function CarrierLogo({ company, size = 32 }) {
  const reg = CARRIER_REGISTRY[company.slug] || {};
  const [imgErr, setImgErr] = useState(false);

  if (reg.logo && !imgErr) {
    return (
      <img
        src={reg.logo}
        alt={company.name}
        onError={() => setImgErr(true)}
        style={{
          width: size,
          height: size,
          borderRadius: '6px',
          objectFit: 'contain',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      />
    );
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '6px',
      backgroundColor: 'var(--bg-app)',
      color: 'var(--text-muted)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: '700',
      border: '1px solid var(--border-color)',
    }}>
      {company.name.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function ConnectCompanyModal({ company, onClose, onSuccess }) {
  const fields = CARRIER_FIELDS[company.slug] ?? FALLBACK_FIELDS;

  const defaultValues = Object.fromEntries(
    fields.map(f => [f.key, ''])
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ defaultValues });

  useEffect(() => {
    reset(
      Object.fromEntries(
        fields.map(f => [f.key, ''])
      )
    );
  }, [company.slug, reset]);



  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    console.log('STEP 1 - SUBMIT START', data);

    setIsLoading(true);
    setError(null);

    try {
      const credentials = {};

      for (const f of fields) {
        if (f.required || data[f.key]) {
          credentials[f.key] = data[f.key];
        }
      }

      console.log('STEP 2 - CREDENTIALS', credentials);
      console.log('STEP 3 - BEFORE API CALL');

      const result = await companiesService.connectCompany(
        company.id,
        credentials
      );

      console.log('STEP 4 - API SUCCESS', result);

      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error('STEP 5 - ERROR OBJECT', err);
      console.error('STEP 5 - RESPONSE', err?.response);
      console.log(
        'VALIDATION ERRORS',
        JSON.stringify(err?.response?.data, null, 2)
      );
      console.error('STEP 5 - MESSAGE', err?.message);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to connect company'
      );
      setError(
        JSON.stringify(err.response?.data?.errors ?? err.response?.data)
      );
    } finally {
      console.log('STEP 6 - FINALLY');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CarrierLogo company={company} size={32} />
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
              Connect to {company.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid var(--border-color)',
              borderRadius: '50%', width: '32px', height: '32px',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, padding: 0,
            }}
          >
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ padding: '20px' }}>
            {/* Dynamic fields */}

            {fields.map(field => (
              <div key={field.key} style={{ marginBottom: '14px' }}>
                <label style={{
                  display: 'block', fontSize: '13px', fontWeight: '600',
                  marginBottom: '5px', color: 'var(--text-main)',
                }}>
                  {field.label}{' '}
                  {field.required
                    ? <span style={{ color: 'var(--danger)' }}>*</span>
                    : <span style={{ color: 'var(--text-muted)' }}>(Optional)</span>
                  }
                </label>
                <input
                  type={field.type}
                  placeholder={`Enter ${field.label}`}
                  {...register(field.key, field.required ? { required: `${field.label} is required` } : {})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${errors[field.key] ? 'var(--danger)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    fontSize: '13px',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    boxSizing: 'border-box',
                  }}
                />
                {errors[field.key] && (
                  <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>
                    {errors[field.key].message}
                  </p>
                )}
              </div>
            ))}

            {/* Error banner */}
            {error && (
              <div style={{
                marginBottom: '14px', padding: '10px 12px', borderRadius: '8px',
                backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger-light)',
                display: 'flex', gap: '8px', alignItems: 'flex-start',
              }}>
                <AlertCircle size={14} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', gap: '10px', padding: '16px 20px',
            borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '10px 14px', backgroundColor: 'transparent',
                color: 'var(--text-main)', border: '1px solid var(--border-color)',
                borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                cursor: 'pointer', height: '40px',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1, padding: '10px 14px',
                background: 'linear-gradient(135deg, var(--purple), #6d28d9)',
                color: '#fff', border: 'none', borderRadius: '8px',
                fontSize: '13px', fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '6px', opacity: isLoading ? 0.8 : 1, height: '40px',
              }}
            >
              {isLoading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              Connect
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}