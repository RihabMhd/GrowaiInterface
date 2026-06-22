import React, { useMemo } from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import BooleanSwitch from './fields/BooleanSwitch';

function hasValue(field, prefilled, hidden) {
  if (prefilled?.[field.key] !== undefined && prefilled?.[field.key] !== '' && prefilled?.[field.key] !== null) return true;
  if (hidden?.[field.key]) return true;
  if (field.default !== undefined && field.default !== null) return true;
  return false;
}

export default function AutoCreateReadinessCard({ fields = [], prefilled = {}, hidden = {}, autoCreate, onAutoCreateChange }) {
  const requiredFields = useMemo(() => fields.filter(f => f.required), [fields]);

  const { configuredCount, missing } = useMemo(() => {
    let count = 0;
    const miss = [];
    for (const f of requiredFields) {
      if (hasValue(f, prefilled, hidden)) {
        count++;
      } else {
        miss.push(f);
      }
    }
    return { configuredCount: count, missing: miss };
  }, [requiredFields, prefilled, hidden]);

  const total = requiredFields.length;
  const pct = total > 0 ? Math.round((configuredCount / total) * 100) : 100;
  const ready = pct === 100;
  const isOn = !!autoCreate;

  return (
    <>
      <div style={{
        borderRadius: '14px',
        border: isOn
          ? '2px solid rgba(251, 146, 60, 0.4)'
          : '1px solid #e5e7eb',
        overflow: 'hidden',
        marginBottom: '10px',
        backgroundColor: '#fff',
        boxShadow: isOn
          ? '0 0 20px rgba(251, 146, 60, 0.12), 0 1px 4px rgba(0,0,0,0.05)'
          : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease'
      }}>
        {/* Header row: icon + text + toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isOn ? '18px 20px 14px' : '16px 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Icon: gray outline when OFF, blue filled when ON */}
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              background: isOn
                ? 'linear-gradient(135deg, #60a5fa, #3b82f6)'
                : 'transparent',
              border: isOn ? 'none' : '1.5px solid #d1d5db',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Zap size={20} style={{ color: isOn ? '#fff' : '#9ca3af' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111827' }}>Auto-Create Parcel</p>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#6b7280' }}>
                Automatically create parcels when new orders are placed
              </p>
            </div>
          </div>
          <BooleanSwitch value={isOn} onChange={onAutoCreateChange} />
        </div>

        {/* Progress section: only when ON */}
        {isOn && total > 0 && (
          <div style={{ padding: '0 20px 18px' }}>
            {/* Progress bar */}
            <div style={{
              width: '100%', height: '5px', borderRadius: '3px',
              backgroundColor: '#f3f4f6', overflow: 'hidden'
            }}>
              <div style={{
                width: `${pct}%`, height: '100%', borderRadius: '3px',
                background: 'linear-gradient(90deg, #f97316, #fb923c)',
                transition: 'width 0.4s ease'
              }} />
            </div>

            {/* Percentage label */}
            <div style={{ textAlign: 'right', marginTop: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#ea580c' }}>
                {pct}%
              </span>
            </div>

            {/* Stats row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginTop: '6px', flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>
                {configuredCount}/{total} required fields auto-fillable
              </span>

              {missing.length > 0 && (
                <span style={{ fontSize: '12px', color: '#d97706', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <AlertTriangle size={12} />
                  {missing.length} field{missing.length > 1 ? 's' : ''} need{missing.length === 1 ? 's' : ''} attention
                </span>
              )}
            </div>

            {/* Missing field pills */}
            {missing.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                {missing.map(f => (
                  <span key={f.key} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                    padding: '4px 12px', borderRadius: '6px',
                    backgroundColor: '#fff7ed', border: '1px solid #fed7aa',
                    color: '#c2410c', fontSize: '11px', fontWeight: '600'
                  }}>
                    {f.label || f.key} *
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <p style={{
        margin: '0 0 18px', fontSize: '11px', color: '#9ca3af',
        fontStyle: 'italic'
      }}>
        Flow-managed action
      </p>
    </>
  );
}
