import React, { useState } from 'react';
import { Code2, ChevronDown, ChevronUp } from 'lucide-react';

export default function ResponsePayload({ data }) {
  const [open, setOpen] = useState(false);
  let formatted = '';
  try { formatted = JSON.stringify(typeof data === 'string' ? JSON.parse(data) : data, null, 2); }
  catch { formatted = String(data || ''); }

  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', marginTop: '12px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', border: 'none', cursor: 'pointer',
          backgroundColor: 'var(--bg-app)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Code2 size={12} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>Response Payload</span>
        </div>
        {open
          ? <ChevronUp size={13} style={{ color: 'var(--text-muted)' }} />
          : <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
        }
      </button>
      {open && (
        <pre style={{
          margin: 0, padding: '12px 14px', fontSize: '11px', lineHeight: '1.6',
          backgroundColor: '#1e1e2e', color: '#cdd6f4',
          overflow: 'auto', maxHeight: '200px', fontFamily: 'monospace'
        }}>
          {formatted || 'No response data'}
        </pre>
      )}
    </div>
  );
}