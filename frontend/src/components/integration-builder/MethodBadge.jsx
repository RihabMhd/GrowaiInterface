import React from 'react';

const METHOD_COLORS = {
  GET: { bg: '#dcfce7', text: '#166534' },
  POST: { bg: '#fef3c7', text: '#92400e' },
  WEBHOOK: { bg: '#ede9fe', text: '#5b21b6' },
  PUT: { bg: '#dbeafe', text: '#1e40af' },
  DELETE: { bg: '#fee2e2', text: '#991b1b' },
};

export default function MethodBadge({ method }) {
  const c = METHOD_COLORS[method] || METHOD_COLORS.GET;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: '8px', fontWeight: '700', letterSpacing: '0.5px',
      padding: '2px 5px', borderRadius: '3px',
      backgroundColor: c.bg, color: c.text, flexShrink: 0
    }}>{method}</span>
  );
}