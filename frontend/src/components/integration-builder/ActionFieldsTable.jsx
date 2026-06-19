// src/components/integration-builder/ActionFieldsTable.jsx
import React from 'react';
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

export default function ActionFieldsTable({ fields, values, hidden, onValueChange, onToggleHidden }) {
  if (!fields || fields.length === 0) {
    return (
      <div className="empty-state">
        <span className="check-icon">✓</span>
        <p>No configurable fields for this method</p>
      </div>
    );
  }

  return (
    <table className="fields-table">
      <thead>
        <tr>
          <th>Field</th>
          <th>Default Value</th>
          <th>Hidden</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((field) => {
          const Input = FIELD_COMPONENTS[field.type] ?? TextField;
          const isHidden = !!hidden?.[field.key];
          return (
            <tr key={field.key}>
              <td>{field.label}{field.required ? ' *' : ''}</td>
              <td>
                <Input
                  field={field}
                  value={values?.[field.key] ?? field.default}
                  onChange={(val) => onValueChange(field.key, val)}
                />
              </td>
              <td>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => onToggleHidden(field.key)}
                  title={isHidden ? 'Hidden from order form' : 'Visible on order form'}
                >
                  {isHidden ? '🚫' : '👁'}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}