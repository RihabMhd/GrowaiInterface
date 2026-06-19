// src/components/integration-builder/ActionSidebar.jsx
import React from 'react';

const CATEGORY_ORDER = ['main_action', 'province_city', 'lookup', 'webhook'];
const CATEGORY_LABELS = {
  main_action: 'MAIN ACTION',
  province_city: 'PROVINCE/CITY SELECTORS',
  lookup: 'OTHER LOOKUP DATA',
  webhook: 'WEBHOOK',
};

function statusIcon(action) {
  if (action.category === 'webhook') {
    return action.saved_prefilled?.registered ? '✅' : '⚪';
  }
  if (action.test_status === 'passed') return '✅';
  if (action.test_status === 'failed') return '🔴';
  return '⚪';
}

export default function ActionSidebar({ actions, selectedKey, onSelect }) {
  const grouped = CATEGORY_ORDER
    .map((cat) => ({
      cat,
      label: CATEGORY_LABELS[cat],
      items: actions.filter((a) => a.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="action-sidebar">
      {grouped.map((g) => (
        <div key={g.cat} className="sidebar-group">
          <div className="sidebar-group-label">{g.label}</div>
          {g.items.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`sidebar-row ${a.key === selectedKey ? 'sidebar-row-selected' : ''}`}
              onClick={() => onSelect(a.key)}
            >
              <span className={`method-badge method-${a.method.toLowerCase()}`}>{a.method}</span>
              <span className="sidebar-row-label">{a.label}</span>
              <span className="status-icon">{statusIcon(a)}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}