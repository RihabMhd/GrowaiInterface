import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { companiesService } from '../services/companiesService';

export default function ConnectCompanyModal({ company, onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      api_key: '',
      api_secret: '',
      username: '',
      password: ''
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTestConnection = async (credentials) => {
    setIsTesting(true);
    setTestResult(null);
    try {
      await companiesService.testConnection(company.id);
      setTestResult({ success: true, message: 'Connection successful' });
    } catch (err) {
      setTestResult({ 
        success: false, 
        message: err.response?.data?.message || 'Connection failed' 
      });
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const credentials = {
        api_key: data.api_key,
        ...(data.api_secret && { api_secret: data.api_secret }),
        ...(data.username && { username: data.username }),
        ...(data.password && { password: data.password })
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
        maxWidth: '500px',
        padding: '32px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--border-color)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
              Connect {company.name}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Enter your carrier API credentials
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* API Key (Required) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '6px',
              color: 'var(--text-main)'
            }}>
              API Key <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="password"
              placeholder="Enter your carrier API key"
              {...register('api_key', { required: 'API Key is required' })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '13px',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)',
                boxSizing: 'border-box',
                borderColor: errors.api_key ? '#ef4444' : 'var(--border-color)'
              }}
            />
            {errors.api_key && (
              <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                {errors.api_key.message}
              </p>
            )}
          </div>

          {/* API Secret (Optional) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '6px',
              color: 'var(--text-main)'
            }}>
              API Secret (Optional)
            </label>
            <input
              type="password"
              placeholder="Enter API secret (if applicable)"
              {...register('api_secret')}
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

          {/* Username (Optional) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '6px',
              color: 'var(--text-main)'
            }}>
              Username (Optional)
            </label>
            <input
              type="text"
              placeholder="Carrier dashboard username"
              {...register('username')}
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

          {/* Password (Optional) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '6px',
              color: 'var(--text-main)'
            }}>
              Password (Optional)
            </label>
            <input
              type="password"
              placeholder="Carrier dashboard password"
              {...register('password')}
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

          {/* Test Result */}
          {testResult && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: testResult.success ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${testResult.success ? '#d1fae5' : '#fee2e2'}`,
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start'
            }}>
              {testResult.success ? (
                <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
              )}
              <span style={{
                fontSize: '13px',
                color: testResult.success ? '#065f46' : '#7f1d1d'
              }}>
                {testResult.message}
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '13px', color: '#7f1d1d' }}>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => handleSubmit(() => handleTestConnection({}))({})}
              disabled={isTesting || isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: isTesting || isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: isTesting || isLoading ? 0.6 : 1
              }}
            >
              {isTesting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              Test Connection
            </button>

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
                cursor: 'pointer'
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
                backgroundColor: '#18181b',
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
                opacity: isLoading ? 0.8 : 1
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
