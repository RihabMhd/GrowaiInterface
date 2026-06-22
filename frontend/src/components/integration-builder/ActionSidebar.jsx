import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import MethodBadge from './MethodBadge';

export default function ActionSidebar({ groups, selectedKey, configs, onSelect }) {
  return (
    <div style={{
      width: '190px', flexShrink: 0,
      borderRight: '1px solid var(--border-color)',
      overflowY: 'auto', backgroundColor: 'var(--bg-card)'
    }}>
      {groups.map(group => (
        <div key={group.label}>
          <p style={{
            fontSize: '9px', fontWeight: '700', color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.7px',
            padding: '12px 14px 4px', margin: 0
          }}>
            {group.label}
          </p>
          {group.actions.map(action => {
            const isSelected = selectedKey === action.key;
            const isMainAction = action.category === 'main_action';

            let stateIcon;
            if (action.category !== 'main_action') {
              const testState = configs[action.key]?.test_state;
              stateIcon = testState === 'passed'
                ? <CheckCircle2 size={11} style={{ color: '#10b981', flexShrink: 0 }} />
                : testState === 'failed'
                  ? <AlertCircle size={11} style={{ color: '#ef4444', flexShrink: 0 }} />
                  : <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'inline-block', flexShrink: 0 }} />;
            }

            return (
              <button
                key={action.key}
                onClick={() => onSelect(action.key)}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 14px',
                  border: isSelected ? '2px solid var(--border-color)' : '2px solid transparent',
                  cursor: 'pointer', display: 'block',
                  backgroundColor: isSelected ? '#f9fafb' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <MethodBadge method={action.method} />
                  <span style={{
                    fontSize: '12px', fontWeight: isSelected ? '700' : '500',
                    color: isSelected ? '#7c3aed' : 'var(--text-main)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1
                  }}>
                    {action.label}
                  </span>
                  {stateIcon}
                </div>
                <div style={{ paddingLeft: '1px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {action.key}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
