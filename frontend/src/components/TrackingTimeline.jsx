import React from 'react';
import { CheckCircle2, Clock, Truck, MapPin, RotateCcw, AlertCircle, Zap } from 'lucide-react';
import { getShipmentStatusMeta } from '../config/orderStatuses';

const ICON_MAP = {
  Clock,
  Truck,
  MapPin,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Zap,
};

const RAW_COLORS = {
  unfulfilled:        '#6B7280',
  label_created:      '#9CA3AF',
  label_purchased:    '#818CF8',
  label_printed:      '#6366F1',
  confirmed:          '#22C55E',
  in_transit:         '#3B82F6',
  out_for_delivery:   '#F59E0B',
  delivered:          '#10B981',
  attempted_delivery: '#F97316',
  delivery_failed:    '#EF4444',
  delayed:            '#F97316',
  returned:           '#8B5CF6',
  partial:            '#EAB308',
  fulfilled:          '#059669',
};

export default function TrackingTimeline({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-app)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          No tracking events yet
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Timeline line */}
      <div style={{
        position: 'absolute',
        left: '12px',
        top: '40px',
        bottom: 0,
        width: '2px',
        backgroundColor: 'var(--border-color)'
      }} />

      {/* Timeline events */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {events.map((event, index) => {
          const meta = getShipmentStatusMeta(event.status);
          const Icon = ICON_MAP[meta.icon] || Clock;
          const color = RAW_COLORS[event.status] || '#6b7280';
          const date = new Date(event.timestamp || event.created_at);
          const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div key={index} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
              {/* Icon */}
              <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '50%',
                flexShrink: 0
              }}>
                <Icon size={16} style={{ color }} />
              </div>

              {/* Content */}
              <div style={{ paddingTop: '2px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px'
                }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-main)',
                    margin: 0
                  }}>
                    {meta.label || 'Update'}
                  </p>
                  {event.provider_status && (
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      fontFamily: 'monospace',
                      backgroundColor: 'var(--bg-app)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      Provider: {event.provider_status}
                    </span>
                  )}
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                  }}>
                    {formattedDate} at {formattedTime}
                  </span>
                </div>

                {event.notes && (
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    margin: '0',
                    lineHeight: '1.4'
                  }}>
                    {event.notes}
                  </p>
                )}

                {event.location && (
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    margin: '4px 0 0 0'
                  }}>
                    📍 {event.location}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
