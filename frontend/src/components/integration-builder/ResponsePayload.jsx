import React, { useState } from 'react';
import { Code2, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

function isCityList(data) {
  if (!Array.isArray(data) || data.length === 0) return false;
  const first = data[0];
  return (
    typeof first === 'object' &&
    first !== null &&
    ('name' in first || 'ref' in first) &&
    ('id' in first || 'ref' in first)
  );
}

function CityTable({ data }) {
  const [showRaw, setShowRaw] = useState(false);
  let formatted = '';
  try { formatted = JSON.stringify(data, null, 2); }
  catch { formatted = String(data); }

  return (
    <div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={13} style={{ color: 'var(--success)' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
              Cities Loaded
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '2px' }}>
              ({data.length})
            </span>
          </div>
          <button
            onClick={() => setShowRaw(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 10px', borderRadius: '6px',
              backgroundColor: showRaw ? 'var(--bg-app)' : 'transparent',
              border: '1px solid var(--border-color)',
              fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <Code2 size={10} />
            {showRaw ? 'Table' : 'JSON'}
          </button>
        </div>

        {showRaw ? (
          <pre style={{
            margin: 0, padding: '10px 12px', fontSize: '11px', lineHeight: '1.5',
            backgroundColor: 'var(--bg-card)', color: 'var(--text-main)',
            overflow: 'auto', maxHeight: '250px', fontFamily: 'monospace', borderRadius: '6px'
          }}>
            {formatted}
          </pre>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse', fontSize: '11px'
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ref</th>
                  <th style={{ textAlign: 'left', padding: '6px 10px', fontWeight: '600', color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                </tr>
              </thead>
              <tbody>
                {data.map((city, i) => (
                  <tr key={city.id ?? i} style={{ borderBottom: '1px solid var(--bg-app)' }}>
                    <td style={{ padding: '5px 10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{city.id}</td>
                    <td style={{ padding: '5px 10px', fontFamily: 'monospace', color: 'var(--purple)', fontWeight: '500' }}>{city.ref}</td>
                    <td style={{ padding: '5px 10px', color: 'var(--text-main)', fontWeight: '500' }}>{city.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResponsePayload({ data }) {
  const [open, setOpen] = useState(true);

  const showCityList = isCityList(data);

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
        showCityList
          ? <CityTable data={data} />
          : (
            <pre style={{
              margin: 0, padding: '12px 14px', fontSize: '11px', lineHeight: '1.6',
              backgroundColor: 'var(--bg-card)', color: 'var(--text-main)',
              overflow: 'auto', maxHeight: '300px', fontFamily: 'monospace'
            }}>
              {(() => { try { return JSON.stringify(typeof data === 'string' ? JSON.parse(data) : data, null, 2); } catch { return String(data || 'No response data'); } })()}
            </pre>
          )
      )}
    </div>
  );
}
