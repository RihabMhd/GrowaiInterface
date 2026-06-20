import React from 'react';
import PasswordField from './fields/PasswordField';
import TextField from './fields/TextField';

export default function ApiCredentialsBlock({ credentials = [], values = {}, onChange }) {
  if (credentials.length === 0) return null;

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <span style={{ fontSize: '13px' }}>🔒</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>API Credentials</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {credentials.map(cred => {
          const Input = cred.type === 'password' ? PasswordField : TextField;
          return (
            <div key={cred.key} style={{
              display: 'grid', gridTemplateColumns: '140px 1fr',
              alignItems: 'center', gap: '12px'
            }}>
              <label style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '500' }}>
                {cred.label}
                {cred.required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
              </label>
              <Input
                value={values[cred.key]}
                onChange={v => onChange({ ...values, [cred.key]: v })}
                placeholder={`Enter ${cred.label}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}