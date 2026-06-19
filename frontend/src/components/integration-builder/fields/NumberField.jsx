// src/components/integration-builder/fields/NumberField.jsx
import React from 'react';

export default function NumberField({ field, value, onChange, disabled }) {
  return (
    <input
      type="number"
      className="field-input"
      placeholder="—"
      value={value ?? ''}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
    />
  );
}