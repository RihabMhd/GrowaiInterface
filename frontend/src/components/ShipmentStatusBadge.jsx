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
    color: '#6b7280',
    bgColor: '#f3f4f6',
    icon: Clock,
    textColor: '#374151'
  },
  picked_up: {
    label: 'Collecté',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    icon: Truck,
    textColor: '#1e40af'
  },
  in_transit: {
    label: 'En transit',
    color: '#06b6d4',
    bgColor: '#ecf9ff',
    icon: MapPin,
    textColor: '#0c4a6e'
  },
  out_for_delivery: {
    label: 'En livraison',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    icon: Truck,
    textColor: '#92400e'
  },
  delivered: {
    label: 'Livré',
    color: '#10b981',
    bgColor: '#ecfdf5',
    icon: CheckCircle2,
    textColor: '#065f46'
  },
  returned: {
    label: 'Retourné',
    color: '#f97316',
    bgColor: '#fff7ed',
    icon: RotateCcw,
    textColor: '#7c2d12'
  },
  failed: {
    label: 'Échoué',
    color: '#ef4444',
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
