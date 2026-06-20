import React from 'react';
import { CheckCircle2, ClipboardList, Eye, EyeOff, RefreshCw } from 'lucide-react';
import TextField from './fields/TextField';
import NumberField from './fields/NumberField';
import BooleanSwitch from './fields/BooleanSwitch';
import SelectField from './fields/SelectField';
import PasswordField from './fields/PasswordField';

const FIELD_COMPONENTS = {
  text: TextField,
  number: NumberField,
  boolean: BooleanSwitch,
  select: SelectField,
  password: PasswordField,
};

function FieldCell({ field, value, onChange }) {
  const Input = FIELD_COMPONENTS[field.type] || TextField;
  return <Input field={field} value={value} onChange={onChange} />;
}

export default function ActionFieldsTable({ fields = [], values = {}, hiddenFields = {}, onChangeValues, onChangeHidden }) {
  if (fields.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
        <CheckCircle2 size={24} style={{ color: '#10b981', display: 'block', margin: '0 auto 8px' }} />
        No configurable fields for this method
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ClipboardList size={13} style={{ color: '#a855f7' }} />
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>Pre-filled Values</span>
        </div>
        <button
          onClick={() => { onChangeValues({}); onChangeHidden({}); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '11px', color: 'var(--text-muted)', padding: '2px 6px'
          }}
        >
          <RefreshCw size={10} /> Reset
        </button>
      </div>

      <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1.55fr 54px',
          backgroundColor: 'var(--bg-app)', padding: '9px 12px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {['Field', 'Default Value', 'Hidden'].map(h => (
            <span key={h} style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {h}
            </span>
          ))}
        </div>
        {/* Rows */}
        {fields.map((field, idx) => (
          <div
            key={field.key}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1.55fr 54px',
              alignItems: 'center', padding: '8px 12px',
              borderBottom: idx < fields.length - 1 ? '1px solid var(--border-color)' : 'none',
              backgroundColor: 'var(--bg-card)'
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: '500' }}>{field.label}</span>
              {field.required && <span style={{ color: '#ef4444', fontSize: '12px', marginLeft: '2px' }}>*</span>}
            </div>
            <div style={{ paddingRight: '8px' }}>
              <FieldCell
                field={field}
                value={values[field.key]}
                onChange={v => onChangeValues({ ...values, [field.key]: v })}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => onChangeHidden({ ...hiddenFields, [field.key]: !hiddenFields[field.key] })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                {hiddenFields[field.key]
                  ? <EyeOff size={13} style={{ color: '#7c3aed' }} />
                  : <Eye size={13} style={{ color: '#d1d5db' }} />
                }
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
