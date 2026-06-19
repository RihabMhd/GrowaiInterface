// src/components/integration-builder/fields/SelectField.jsx
import React from 'react';

export default function SelectField({ field, value, onChange, disabled }) {
  return (
    <select
      className="field-select"
      value={value ?? field.default ?? ''}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {field.options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}