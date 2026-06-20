import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { companiesService } from '../services/companiesService';

// Carrier logo registry
const CARRIER_REGISTRY = {
  ameex:         { logo: '../assets/images/ameex.png' },
  cathedis:      { logo: '../assets/images/CATHEDIS.png' },
  'chrono-diali':{ logo: '../assets/images/chrono.png' },
  sendit:        { logo: '../assets/images/Sendit.png' },
  'ozon-express':{ logo: '../assets/images/ozon.png' }
};

function CarrierLogo({ company, size = 32 }) {
  const reg = CARRIER_REGISTRY[company.id] || {};
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
          backgroundColor: '#fff',
          border: '1px solid var(--border-color)'
        }}
      />
    );
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '6px',
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: '700',
      border: '1px solid var(--border-color)'
    }}>
      {company.name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function ConnectCompanyModal({ company, onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      c_api_id: '',
      c_api_key: '',
      secret_key: ''
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const credentials = {
        c_api_id: data.c_api_id,
        c_api_key: data.c_api_key,
        ...(data.secret_key && { secret_key: data.secret_key })
      };

      await companiesService.connectCompany(company.id, credentials);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect company');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CarrierLogo company={company} size={32} />
            <h2 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-main)',
              margin: 0
            }}>
              Connect to {company.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              padding: 0
            }}
          >
            <X size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ padding: '20px' }}>
            {/* C Api Id (Required) */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '5px',
                color: 'var(--text-main)'
              }}>
                C Api Id <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter C Api Id"
                {...register('c_api_id', { required: 'C Api Id is required' })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${errors.c_api_id ? '#ef4444' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  boxSizing: 'border-box'
                }}
              />
              {errors.c_api_id && (
                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                  {errors.c_api_id.message}
                </p>
              )}
            </div>

            {/* C Api Key (Required) */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '5px',
                color: 'var(--text-main)'
              }}>
                C Api Key <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="password"
                placeholder="Enter C Api Key"
                {...register('c_api_key', { required: 'C Api Key is required' })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${errors.c_api_key ? '#ef4444' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  boxSizing: 'border-box'
                }}
              />
              {errors.c_api_key && (
                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                  {errors.c_api_key.message}
                </p>
              )}
            </div>

            {/* Secret Key / Token (Optional) */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '5px',
                color: 'var(--text-main)'
              }}>
                Secret Key / Token <span style={{ color: 'var(--text-muted)' }}>(Optional)</span>
              </label>
              <input
                type="password"
                placeholder="Enter Secret Key / Token"
                {...register('secret_key')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                marginBottom: '14px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start'
              }}>
                <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '12px', color: '#7f1d1d' }}>{error}</span>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div style={{
            display: 'flex',
            gap: '10px',
            padding: '16px 20px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-app)'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 14px',
                backgroundColor: 'transparent',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                height: '40px'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: isLoading ? 0.8 : 1,
                height: '40px'
              }}
            >
              {isLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              Connect
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
