// src/components/integration-builder/ApiCredentialsBlock.jsx
import React, { useState } from 'react';
import PasswordField from './fields/PasswordField';

export default function ApiCredentialsBlock({ action, onSaveCredentials }) {
  const [draft, setDraft] = useState({});
  const [open, setOpen] = useState(true);

  const handleChange = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const handleBlurSave = () => {
    const nonEmpty = Object.fromEntries(Object.entries(draft).filter(([, v]) => v));
    if (Object.keys(nonEmpty).length > 0) {
      onSaveCredentials(nonEmpty);
    }
  };

  if (!action.credentials || action.credentials.length === 0) return null;

  return (
    <div className="credentials-block">
      <button type="button" className="section-header" onClick={() => setOpen((o) => !o)}>
        🔒 API Credentials
      </button>
      {open && (
        <div className="credentials-fields" onBlur={handleBlurSave}>
          {action.credentials.map((cred) => (
            <div key={cred.key} className="credential-row">
              <label>{cred.label}</label>
              <PasswordField
                field={cred}
                value={draft[cred.key] ?? (action.saved_credentials?.[cred.key] ? '' : '')}
                onChange={(v) => handleChange(cred.key, v)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}