// src/components/integration-builder/fields/BooleanSwitch.jsx
import React from 'react';

export default function BooleanSwitch({ field, value, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!value}
      disabled={disabled}
      className={`switch ${value ? 'switch-on' : 'switch-off'}`}
      onClick={() => onChange(!value)}
    >
      <span className="switch-thumb" />
    </button>
  );
}