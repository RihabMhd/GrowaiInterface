import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  Download, 
  Package, 
  Webhook 
} from 'lucide-react';

export default function ShopifyIntegrationPage() {
  return (
    <div className="main-content" style={{ padding: '28px 32px', background: 'var(--bg-app)' }}>
      
      {/* Platform Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        {/* Shopify Green Vector Icon Container */}
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          flexShrink: 0
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#95BF47">
            <path d="M18.86 6.13c-.34-.26-.74-.41-1.16-.43l-3.32-.14c-.11 0-.21-.04-.29-.11l-1.34-1.28c-.4-.38-.93-.6-1.48-.6H7.95c-1.1 0-2 .9-2 2v1h-.32c-.88 0-1.63.63-1.78 1.5l-1.28 7.5c-.17.98.5 1.91 1.48 2.08.1.02.2.02.3.02h.65v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2h.17c.9 0 1.66-.67 1.78-1.57l1.11-8c.11-.83-.34-1.62-1.11-1.92z"/>
          </svg>
        </div>

        {/* Title, Connection State Pill, and Feature Summary Text */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 className="products-title" style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>Shopify</h1>
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              color: 'var(--text-muted)',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              padding: '3px 8px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              letterSpacing: '0.2px'
            }}>
              Not connected
            </span>
          </div>
          <p className="products-subtitle" style={{ margin: 0, color: 'var(--text-muted)' }}>
            Sync orders, products & inventory from your Shopify store
          </p>
        </div>
      </div>

      {/* Main Connection Setup Wrapper Card */}
      <div className="card" style={{ padding: '0px', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
        
        {/* Step Header Block */}
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#f4fbf7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#95BF47">
              <path d="M18.86 6.13c-.34-.26-.74-.41-1.16-.43l-3.32-.14c-.11 0-.21-.04-.29-.11l-1.34-1.28c-.4-.38-.93-.6-1.48-.6H7.95c-1.1 0-2 .9-2 2v1h-.32c-.88 0-1.63.63-1.78 1.5l-1.28 7.5c-.17.98.5 1.91 1.48 2.08.1.02.2.02.3.02h.65v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2h.17c.9 0 1.66-.67 1.78-1.57l1.11-8c.11-.83-.34-1.62-1.11-1.92z"/>
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Connect Shopify</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Authorize via secure OAuth</p>
          </div>
        </div>

        {/* Informative Guidance Info Alert Banner */}
        <div style={{ padding: '24px 24px 0 24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(101, 163, 13, 0.05)',
            border: '1px solid rgba(101, 163, 13, 0.15)',
            borderRadius: '8px',
            padding: '12px 16px'
          }}>
            <CheckCircle2 size={16} style={{ color: '#65a30d', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>
              You will be redirected to Shopify to log in and authorize your store. No API keys needed.
            </p>
          </div>
        </div>

        {/* Standard Green Action Call Button Box */}
        <div style={{ padding: '24px' }}>
          <button
            style={{
              width: '100%',
              backgroundColor: '#65a30d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 20px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4d7c0f'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#65a30d'}
          >
            {/* Embedded Mini Shopify Logo vector graphics inside action row */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#ffffff" style={{ marginRight: '2px' }}>
              <path d="M18.86 6.13c-.34-.26-.74-.41-1.16-.43l-3.32-.14c-.11 0-.21-.04-.29-.11l-1.34-1.28c-.4-.38-.93-.6-1.48-.6H7.95c-1.1 0-2 .9-2 2v1h-.32c-.88 0-1.63.63-1.78 1.5l-1.28 7.5c-.17.98.5 1.91 1.48 2.08.1.02.2.02.3.02h.65v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2h.17c.9 0 1.66-.67 1.78-1.57l1.11-8c.11-.83-.34-1.62-1.11-1.92z"/>
            </svg>
            Connect with Shopify
          </button>
        </div>

      </div>

      {/* Capabilities Feature Tags Grid Layout */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '12px' 
      }}>
        {[
          { label: 'Order Sync', icon: <RefreshCw size={13} /> },
          { label: 'Product Import', icon: <Download size={13} /> },
          { label: 'Inventory Tracking', icon: <Package size={13} /> },
          { label: 'Webhooks', icon: <Webhook size={13} /> }
        ].map((feature, idx) => (
          <div
            key={idx}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              color: 'var(--text-main)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.01)'
            }}
          >
            <CheckCircle2 size={13} style={{ color: '#65a30d' }} />
            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
              {feature.icon}
            </span>
            <span style={{ letterSpacing: '0.1px' }}>{feature.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}