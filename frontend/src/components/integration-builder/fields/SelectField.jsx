import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordField({ value, onChange, placeholder }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={revealed ? 'text' : 'password'}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || '—'}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '8px 36px 8px 12px',
          fontSize: '13px', color: 'var(--text-main)',
          backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
          borderRadius: '7px', outline: 'none'
        }}
      />
      <button
        onClick={() => setRevealed(r => !r)}
        style={{
          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px'
        }}
      >
        {revealed
          ? <EyeOff size={13} style={{ color: 'var(--text-muted)' }} />
          : <Eye size={13} style={{ color: 'var(--text-muted)' }} />
        }
      </button>
    </div>
  );
}