import React from 'react';

export default function NumberField({ value, onChange }) {
  return (
    <input
      type="number"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder="—"
      style={{
        width: '100%', padding: '6px 8px', fontSize: '12px', boxSizing: 'border-box',
        backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)',
        borderRadius: '5px', color: 'var(--text-main)'
      }}
    />
  );
}