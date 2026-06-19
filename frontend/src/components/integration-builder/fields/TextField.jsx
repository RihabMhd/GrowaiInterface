// src/components/integration-builder/fields/TextField.jsx
import React from 'react';

export default function TextField({ field, value, onChange, disabled }) {
  return (
    <input
      type="text"
      className="field-input"
      placeholder="—"
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}