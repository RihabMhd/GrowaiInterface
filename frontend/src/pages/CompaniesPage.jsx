import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Plus,
  Settings,
  Zap,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Unplug,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConnectCompanyModal from '../components/ConnectCompanyModal';
import { companiesService } from '../services/companiesService';

// ─── Static carrier registry (logos/colors) ────────────────────────────────
const CARRIER_REGISTRY = {
  ameex:        { logoColor: '#e11d48', textColor: '#fff', initial: 'AX' },
  cathedis:     { logoColor: '#b91c1c', textColor: '#fff', initial: 'CA' },
  'chrono-diali':{ logoColor: '#0284c7', textColor: '#fff', initial: 'CD' },
  sendit:       { logoColor: '#4f46e5', textColor: '#fff', initial: 'SE' },
  'ozon-express':{ logoColor: '#eab308', textColor: '#000', initial: 'OE' },
};

// ─── Sub-components ────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color = 'var(--text-main)' }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      minWidth: 0,
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px',
        backgroundColor: 'var(--bg-app)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--text-main)', lineHeight: 1 }}>
          {value}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '3px 0 0', fontWeight: '500' }}>
          {label}
        </p>
      </div>
    </div>
  );
}

function StatusDot({ active, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        backgroundColor: active ? '#10b981' : '#d1d5db',
        flexShrink: 0
      }} />
      {label}
    </span>
  );
}

function CarrierCard({ carrier, onConnect, onConfigure, onDisconnect, onTest }) {
  const reg = CARRIER_REGISTRY[carrier.id] || { logoColor: '#6b7280', textColor: '#fff', initial: carrier.name.slice(0, 2) };
  const [testLoading, setTestLoading] = useState(false);

  const handleTest = async (e) => {
    e.stopPropagation();
    setTestLoading(true);
    await onTest?.(carrier);
    setTestLoading(false);
  };

  if (!carrier.is_connected) {
    // Available card
    return (
      <div className="product-card" style={{
        padding: '24px 20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        borderRadius: '12px', textAlign: 'center'
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '14px',
          backgroundColor: reg.logoColor, color: reg.textColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: '700', marginBottom: '14px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.08)', letterSpacing: '0.5px'
        }}>
          {reg.initial}
        </div>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 16px' }}>
          {carrier.name}
        </h3>
        <button
          onClick={() => onConnect(carrier)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px',
            backgroundColor: '#18181b', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '9px 14px', fontSize: '12px', fontWeight: '600',
            cursor: 'pointer', transition: 'background-color 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#27272a'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#18181b'}
        >
          <Plus size={13} strokeWidth={2.5} />
          Connect
        </button>
      </div>
    );
  }

  // Connected card
  return (
    <div className="product-card" style={{
      padding: '20px', borderRadius: '12px',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Active indicator */}
      <div style={{
        position: 'absolute', top: '12px', right: '12px',
        display: 'flex', alignItems: 'center', gap: '5px',
        backgroundColor: '#ecfdf5', border: '1px solid #d1fae5',
        borderRadius: '6px', padding: '3px 8px',
        fontSize: '10px', fontWeight: '600', color: '#059669'
      }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }} />
        ACTIVE
      </div>

      {/* Logo + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '10px',
          backgroundColor: reg.logoColor, color: reg.textColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: '700', flexShrink: 0
        }}>
          {reg.initial}
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            {carrier.name}
          </p>
          {carrier.last_sync && (
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Synced {new Date(carrier.last_sync).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Status indicators */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' }}>
        <StatusDot active={carrier.webhook_enabled} label="Webhook" />
        <StatusDot active={carrier.auto_create_parcel} label="Auto-create parcel" />
        <StatusDot active={carrier.config_health !== 'error'} label={
          carrier.config_health === 'error' ? 'Config error' :
          carrier.config_health === 'partial' ? 'Partially configured' : 'Configured'
        } />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => onConfigure(carrier)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '5px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: '#fff', border: 'none', borderRadius: '7px',
            padding: '8px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          <Settings size={12} strokeWidth={2.5} />
          Config
        </button>
        <button
          onClick={handleTest}
          disabled={testLoading}
          title="Test connection"
          style={{
            width: '32px', height: '32px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-color)', borderRadius: '7px',
            cursor: 'pointer', flexShrink: 0
          }}
        >
          {testLoading
            ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
            : <Activity size={12} style={{ color: 'var(--text-muted)' }} />
          }
        </button>
        <button
          onClick={() => onDisconnect(carrier)}
          title="Disconnect"
          style={{
            width: '32px', height: '32px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2', borderRadius: '7px',
            cursor: 'pointer', flexShrink: 0
          }}
        >
          <Unplug size={12} style={{ color: '#ef4444' }} />
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, label, count }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
      padding: '5px 11px', borderRadius: '7px',
      fontSize: '12px', fontWeight: '600', color: 'var(--text-main)',
      marginBottom: '16px'
    }}>
      <Icon size={12} style={{ color: 'var(--text-muted)' }} />
      {label}
      <span style={{
        fontSize: '10px', color: 'var(--text-muted)',
        backgroundColor: 'var(--bg-app)', padding: '1px 6px', borderRadius: '4px', marginLeft: '2px'
      }}>{count}</span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectTarget, setConnectTarget] = useState(null);

  useEffect(() => {
    loadCarriers();
  }, []);

  const loadCarriers = async () => {
    try {
      setLoading(true);
      const data = await companiesService.getCompanies();
      setCarriers(data);
    } catch {
      // Fallback to static list if API fails
      setCarriers([
        { id: 'ameex',         name: 'AMEEX',        is_connected: false },
        { id: 'cathedis',      name: 'CATHEDIS',     is_connected: false },
        { id: 'chrono-diali',  name: 'CHRONO DIALI', is_connected: false },
        { id: 'sendit',        name: 'SENDIT',       is_connected: false },
        { id: 'ozon-express',  name: 'OZON EXPRESS', is_connected: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (carrier) => {
    if (!window.confirm(`Disconnect ${carrier.name}?`)) return;
    try {
      await companiesService.disconnectCompany(carrier.id);
      setCarriers(prev => prev.map(c => c.id === carrier.id ? { ...c, is_connected: false } : c));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to disconnect');
    }
  };

  const handleTest = async (carrier) => {
    try {
      await companiesService.testConnection(carrier.id);
    } catch {
      // error handled per card
    }
  };

  const handleConnectSuccess = () => {
    loadCarriers();
  };

  const filtered = carriers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const connected = filtered.filter(c => c.is_connected);
  const available = filtered.filter(c => !c.is_connected);

  // Stats
  const allConnected    = carriers.filter(c => c.is_connected);
  const webhookCount    = allConnected.filter(c => c.webhook_enabled).length;
  const autoParcelCount = allConnected.filter(c => c.auto_create_parcel).length;
  const failedCount     = allConnected.filter(c => c.config_health === 'error').length;

  return (
    <div className="main-content" style={{ padding: '28px 32px', background: 'var(--bg-app)' }}>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div className="products-title-icon" style={{ width: '32px', height: '32px' }}>
            <Building2 size={16} style={{ color: 'var(--text-main)' }} />
          </div>
          <h1 className="products-title" style={{ margin: 0 }}>Delivery Companies</h1>
        </div>
        <p className="products-subtitle" style={{ margin: 0 }}>
          Connect and configure your delivery carrier integrations
        </p>
        <p className="products-subtitle" style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
          Showing carriers for your market: Morocco (change under Settings → Business)
        </p>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '28px'
      }}>
        <StatCard icon={CheckCircle2} label="Connected Carriers"     value={allConnected.length}  color="#10b981" />
        <StatCard icon={Wifi}         label="Active Webhooks"         value={webhookCount}          color="#6366f1" />
        <StatCard icon={Zap}          label="Auto-Create Parcel"      value={autoParcelCount}       color="#f59e0b" />
        <StatCard icon={AlertTriangle} label="Failed Connections"     value={failedCount}           color="#ef4444" />
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <div className="search-input-wrapper" style={{ width: '260px', flex: 'none' }}>
          <Search className="search-icon" size={14} style={{ left: '12px' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '34px', height: '34px', borderRadius: '8px' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
        </div>
      ) : (
        <>
          {/* Connected section */}
          {connected.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <SectionHeader icon={CheckCircle2} label="Connected" count={`${connected.length} company`} />
              <div className="products-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px'
              }}>
                {connected.map(carrier => (
                  <CarrierCard
                    key={carrier.id}
                    carrier={carrier}
                    onConnect={c => setConnectTarget(c)}
                    onConfigure={c => navigate(`/companies/${c.id}`)}
                    onDisconnect={handleDisconnect}
                    onTest={handleTest}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Available section */}
          {available.length > 0 && (
            <div>
              <SectionHeader icon={Building2} label="Available" count={`${available.length} companies`} />
              <div className="products-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px'
              }}>
                {available.map(carrier => (
                  <CarrierCard
                    key={carrier.id}
                    carrier={carrier}
                    onConnect={c => setConnectTarget(c)}
                    onConfigure={c => navigate(`/companies/${c.id}`)}
                    onDisconnect={handleDisconnect}
                    onTest={handleTest}
                  />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              No carriers match "{searchTerm}"
            </div>
          )}
        </>
      )}

      {connectTarget && (
        <ConnectCompanyModal
          company={connectTarget}
          onClose={() => setConnectTarget(null)}
          onSuccess={handleConnectSuccess}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}