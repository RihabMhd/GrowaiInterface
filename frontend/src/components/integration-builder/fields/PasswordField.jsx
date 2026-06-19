// src/components/integration-builder/fields/PasswordField.jsx
import React, { useState } from 'react';

export default function PasswordField({ field, value, onChange, disabled }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-field">
      <input
        type={visible ? 'text' : 'password'}
        className="field-input"
        placeholder="—"
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="button" className="icon-btn" onClick={() => setVisible(v => !v)}>
        {visible ? '🙈' : '👁'}
      </button>
    </div>
  );
}