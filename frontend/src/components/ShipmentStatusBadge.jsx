import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  RotateCcw, 
  AlertCircle 
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'En attente',
    color: 'var(--text-muted)',
    bgColor: 'var(--bg-app)',
    icon: Clock,
    textColor: 'var(--text-main)'
  },
  picked_up: {
    label: 'Collecté',
    color: 'var(--primary)',
    bgColor: 'var(--primary-light)',
    icon: Truck,
    textColor: 'var(--primary)'
  },
  in_transit: {
    label: 'En transit',
    color: 'var(--primary)',
    bgColor: 'var(--primary-light)',
    icon: MapPin,
    textColor: 'var(--primary)'
  },
  out_for_delivery: {
    label: 'En livraison',
    color: 'var(--warning)',
    bgColor: 'var(--warning-light)',
    icon: Truck,
    textColor: 'var(--warning)'
  },
  delivered: {
    label: 'Livré',
    color: 'var(--success)',
    bgColor: 'var(--success-light)',
    icon: CheckCircle2,
    textColor: 'var(--success)'
  },
  returned: {
    label: 'Retourné',
    color: 'var(--danger)',
    bgColor: '#fff7ed',
    icon: RotateCcw,
    textColor: '#7c2d12'
  },
  failed: {
    label: 'Échoué',
    color: 'var(--danger)',
    bgColor: '#fef2f2',
    icon: AlertCircle,
    textColor: '#7f1d1d'
  }
};

export default function ShipmentStatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  
  const sizeMap = {
    sm: { fontSize: '11px', padding: '4px 8px', iconSize: 12 },
    md: { fontSize: '13px', padding: '6px 12px', iconSize: 14 },
    lg: { fontSize: '15px', padding: '8px 16px', iconSize: 18 }
  };
  
  const sizeConfig = sizeMap[size] || sizeMap.md;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: config.bgColor,
        color: config.textColor,
        padding: sizeConfig.padding,
        borderRadius: '6px',
        fontSize: sizeConfig.fontSize,
        fontWeight: '600',
        whiteSpace: 'nowrap'
      }}
    >
      <Icon size={sizeConfig.iconSize} strokeWidth={2} style={{ color: config.color }} />
      <span>{config.label}</span>
    </div>
  );
}
