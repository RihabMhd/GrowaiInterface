import React from 'react';
import { Zap } from 'lucide-react';
import BooleanSwitch from './fields/BooleanSwitch';

export default function AutoCreateToggle({ checked, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', borderRadius: '10px',
      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px',
          backgroundColor: '#f3f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Zap size={16} style={{ color: '#7c3aed' }} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>Auto-Create Parcel</p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
            Automatically create parcels when new orders are placed
          </p>
        </div>
      </div>
      <BooleanSwitch value={!!checked} onChange={onChange} />
    </div>
  );
}