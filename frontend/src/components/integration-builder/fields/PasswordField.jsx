import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordField({ value, onChange, disabled }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type={visible ? 'text' : 'password'}
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="-"
        style={{
          width: '100%',
          height: '30px',
          padding: '6px 36px 6px 10px',
          fontSize: '12px',
          boxSizing: 'border-box',
          backgroundColor: '#fff',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          color: 'var(--text-main)',
        }}
      />

      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        {visible
          ? <EyeOff size={14} color="var(--text-muted)" />
          : <Eye size={14} color="var(--text-muted)" />
        }
      </button>
    </div>
  );
}