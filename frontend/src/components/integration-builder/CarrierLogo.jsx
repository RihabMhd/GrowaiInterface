import React, { useState } from 'react';

const CARRIER_REGISTRY = {
  ameex: { logo: '/logos/ameex.png', logoColor: '#e11d48', textColor: '#fff', initial: 'AX' },
  cathedis: { logo: '/logos/cathedis.png', logoColor: '#b91c1c', textColor: '#fff', initial: 'CA' },
  'chrono-diali': { logo: '/logos/chrono-diali.png', logoColor: '#0284c7', textColor: '#fff', initial: 'CD' },
  sendit: { logo: '/logos/sendit.png', logoColor: '#4f46e5', textColor: '#fff', initial: 'SE' },
  'ozon-express': { logo: '/logos/ozon-express.png', logoColor: '#eab308', textColor: '#000', initial: 'OE' },
};

export default function CarrierLogo({ carrierId, size = 40, radius = 8 }) {
  const reg = CARRIER_REGISTRY[carrierId] || { logoColor: '#6b7280', textColor: '#fff', initial: (carrierId || 'XX').slice(0, 2).toUpperCase() };
  const [imgErr, setImgErr] = useState(false);

  if (reg.logo && !imgErr) {
    return (
      <img
        src={reg.logo}
        alt={carrierId}
        onError={() => setImgErr(true)}
        style={{ width: size, height: size, borderRadius: radius, objectFit: 'contain', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      backgroundColor: reg.logoColor, color: reg.textColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: '700', flexShrink: 0
    }}>{reg.initial}</div>
  );
}