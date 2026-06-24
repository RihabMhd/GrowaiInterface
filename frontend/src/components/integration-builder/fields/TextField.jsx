import React from 'react';

export default function TextField({ value, onChange }) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder="-"
      style={{
        width: '100%', height: '30px', padding: '6px 10px', fontSize: '12px', boxSizing: 'border-box',
        backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: '8px', color: 'var(--text-main)'
      }}
    />
  );
}