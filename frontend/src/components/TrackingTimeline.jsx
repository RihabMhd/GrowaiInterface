import React from 'react';
import { CheckCircle2, Clock, Truck, MapPin, RotateCcw, AlertCircle, Zap } from 'lucide-react';

const getStatusIcon = (status) => {
  switch (status) {
    case 'delivered':
      return CheckCircle2;
    case 'picked_up':
      return Truck;
    case 'in_transit':
      return MapPin;
    case 'out_for_delivery':
      return Zap;
    case 'returned':
      return RotateCcw;
    case 'failed':
      return AlertCircle;
    default:
      return Clock;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'delivered':
      return '#10b981';
    case 'picked_up':
      return '#3b82f6';
    case 'in_transit':
      return '#06b6d4';
    case 'out_for_delivery':
      return '#f59e0b';
    case 'returned':
      return '#f97316';
    case 'failed':
      return '#ef4444';
    default:
      return '#6b7280';
  }
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
          const Icon = getStatusIcon(event.status);
          const color = getStatusColor(event.status);
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
                    {event.status ? event.status.replace(/_/g, ' ').toUpperCase() : 'Update'}
                  </p>
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
