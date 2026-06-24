import React from 'react';
import { Lock } from 'lucide-react';
import PasswordField from './fields/PasswordField';

export default function ApiCredentialsBlock({ credentials = [], values = {}, onChange }) {
  if (credentials.length === 0) return null;

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <Lock size={13} color="var(--text-muted)" />
        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>API Credentials</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {credentials.map(cred => (
          <div key={cred.key} style={{
            display: 'grid', gridTemplateColumns: '140px 1fr',
            alignItems: 'center', gap: '12px'
          }}>
            <label style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '500' }}>
              {cred.label}
              {cred.required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}
            </label>
            <PasswordField
              value={values[cred.key]}
              onChange={v => onChange({ ...values, [cred.key]: v })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}