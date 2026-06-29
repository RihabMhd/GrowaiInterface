import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  RotateCcw, 
  AlertCircle 
} from 'lucide-react';
import { getShipmentStatusMeta } from '../config/orderStatuses';

const ICON_MAP = {
  Clock,
  Truck,
  MapPin,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
};

export default function ShipmentStatusBadge({ status, size = 'md' }) {
  const meta = getShipmentStatusMeta(status);
  const Icon = ICON_MAP[meta.icon] || Clock;
  
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
        backgroundColor: meta.bgColor,
        color: meta.textColor,
        padding: sizeConfig.padding,
        borderRadius: '6px',
        fontSize: sizeConfig.fontSize,
        fontWeight: '600',
        whiteSpace: 'nowrap'
      }}
    >
      <Icon size={sizeConfig.iconSize} strokeWidth={2} style={{ color: meta.color }} />
      <span>{meta.label}</span>
    </div>
  );
}
