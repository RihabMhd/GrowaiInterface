import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function CompanyConnectionStatus({ isConnected, webhookEnabled }) {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      {/* Connection Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isConnected ? (
          <>
            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--success)' }}>
              Connected
            </span>
          </>
        ) : (
          <>
            <XCircle size={18} style={{ color: 'var(--danger)' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--danger)' }}>
              Disconnected
            </span>
          </>
        )}
      </div>

      {/* Webhook Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {webhookEnabled ? (
          <>
            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--success)' }}>
              Webhook Enabled
            </span>
          </>
        ) : (
          <>
            <XCircle size={18} style={{ color: 'var(--danger)' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--danger)' }}>
              Webhook Disabled
            </span>
          </>
        )}
      </div>
    </div>
  );
}
