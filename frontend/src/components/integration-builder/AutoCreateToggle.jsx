// src/components/integration-builder/AutoCreateToggle.jsx
import React from 'react';
import BooleanSwitch from './fields/BooleanSwitch';

export default function AutoCreateToggle({ action, onChange }) {
  if (!action || action.auto_create_enabled === null || action.auto_create_enabled === undefined) {
    return null;
  }

  return (
    <div className="auto-create-toggle">
      <div>
        <div className="toggle-title">⚡ Auto-Create Parcel</div>
        <div className="toggle-subtitle">Automatically create parcels when new orders are placed</div>
      </div>
      <BooleanSwitch
        field={{ key: 'auto_create_enabled' }}
        value={action.auto_create_enabled}
        onChange={(v) => onChange(v)}
      />
    </div>
  );
}