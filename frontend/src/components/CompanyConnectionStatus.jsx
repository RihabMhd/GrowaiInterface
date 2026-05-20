import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function CompanyConnectionStatus({ isConnected, webhookEnabled }) {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      {/* Connection Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isConnected ? (
          <>
            <CheckCircle2 size={18} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#065f46' }}>
              Connected
            </span>
          </>
        ) : (
          <>
            <XCircle size={18} style={{ color: '#ef4444' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#7f1d1d' }}>
              Disconnected
            </span>
          </>
        )}
      </div>

      {/* Webhook Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {webhookEnabled ? (
          <>
            <CheckCircle2 size={18} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#065f46' }}>
              Webhook Enabled
            </span>
          </>
        ) : (
          <>
            <XCircle size={18} style={{ color: '#ef4444' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#7f1d1d' }}>
              Webhook Disabled
            </span>
          </>
        )}
      </div>
    </div>
  );
}
