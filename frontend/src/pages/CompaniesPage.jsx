import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Settings,
  Loader2,
  Unplug,
  PlugZap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConnectCompanyModal from '../components/ConnectCompanyModal';
import { companiesService } from '../services/companiesService';
console.log(companiesService);
// ─── Carrier logo map (use real logo images; fallback to colored initials) ───
const CARRIER_REGISTRY = {
  ameex:         { logo: '../assets/images/ameex.png',        logoColor: '#fff',    textColor: '#e11d48', initial: 'AX' },
  cathedis:      { logo: '../assets/images/CATHEDIS.png',     logoColor: '#fff',    textColor: '#b91c1c', initial: 'CA' },
  'chrono-diali':{ logo: '../assets/images/chrono.png', logoColor: '#fff',    textColor: '#0284c7', initial: 'CD' },
  sendit:        { logo: '../assets/images/Sendit.png',        logoColor: '#fff',    textColor: '#4f46e5', initial: 'SE' },
  'ozon-express':{ logo: '../assets/images/ozon.png', logoColor: '#eab308', textColor: '#000',    initial: 'OE' },
};

// ─── Logo component ──────────────────────────────────────────────────────────
function CarrierLogo({ carrier, size = 72, radius = 14 }) {
  const reg = CARRIER_REGISTRY[carrier.id] || { logoColor: '#f3f4f6', textColor: '#6b7280', initial: carrier.name.slice(0, 2).toUpperCase() };
  const [imgErr, setImgErr] = useState(false);

  if (reg.logo && !imgErr) {
    return (
      <img
        src={reg.logo}
        alt={carrier.name}
        onError={() => setImgErr(true)}
        style={{
          width: size, height: size, borderRadius: radius,
          objectFit: 'contain', backgroundColor: '#fff',
          border: '1px solid var(--border-color)',
          display: 'block'
        }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      backgroundColor: reg.logoColor, color: reg.textColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.25, fontWeight: '700',
      border: '1px solid var(--border-color)',
      flexShrink: 0
    }}>
      {reg.initial}
    </div>
  );
}

// ─── Section pill header ─────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label, count, dotColor }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
      padding: '5px 12px', borderRadius: '20px',
      fontSize: '12px', fontWeight: '600', color: 'var(--text-main)',
      marginBottom: '16px'
    }}>
      {dotColor
        ? <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 }} />
        : <Icon size={12} style={{ color: 'var(--text-muted)' }} />
      }
      {label}
      <span style={{
        fontSize: '11px', color: 'var(--text-muted)', marginLeft: '2px'
      }}>{count}</span>
    </div>
  );
}

// ─── Available card (no connection) ──────────────────────────────────────────
function AvailableCard({ carrier, onConnect }) {
  return (
    <div className="product-card" style={{
      padding: '28px 20px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      borderRadius: '12px', textAlign: 'center',
      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)'
    }}>
      <CarrierLogo carrier={carrier} size={80} radius={16} />
      <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', margin: '14px 0 16px' }}>
        {carrier.name}
      </h3>
      <button
        onClick={() => onConnect(carrier)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '7px',
          backgroundColor: '#18181b', color: '#fff',
          border: 'none', borderRadius: '8px',
          padding: '10px 14px', fontSize: '12px', fontWeight: '600',
          cursor: 'pointer', transition: 'background-color 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#27272a'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#18181b'}
      >
        <PlugZap size={13} strokeWidth={2.5} />
        Connect
      </button>
    </div>
  );
}

// ─── Connected card ───────────────────────────────────────────────────────────
function ConnectedCard({ carrier, onConfigure, onDisconnect }) {
  return (
    <div className="product-card" style={{
      padding: '20px', borderRadius: '12px',
      position: 'relative', overflow: 'hidden',
      backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)'
    }}>
      {/* ACTIVE badge */}
      <div style={{
        position: 'absolute', top: '12px', right: '12px',
        display: 'flex', alignItems: 'center', gap: '5px',
        backgroundColor: '#ecfdf5', border: '1px solid #d1fae5',
        borderRadius: '6px', padding: '3px 8px',
        fontSize: '10px', fontWeight: '700', color: '#059669', letterSpacing: '0.5px'
      }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981' }} />
        ACTIVE
      </div>

      {/* Logo + Name — centered column layout */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
        <CarrierLogo carrier={carrier} size={64} radius={12} />
        <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', margin: '12px 0 0', textAlign: 'center' }}>
          {carrier.name}
        </p>
      </div>

      {/* Actions row */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => onConfigure(carrier)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '5px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: '#fff', border: 'none', borderRadius: '8px',
            padding: '9px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          <Settings size={12} strokeWidth={2.5} />
          Config
        </button>
        <button
          onClick={() => onDisconnect(carrier)}
          title="Disconnect"
          style={{
            width: '36px', height: '36px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', backgroundColor: '#ef4444',
            border: 'none', borderRadius: '8px',
            cursor: 'pointer', flexShrink: 0
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}
        >
          <Unplug size={13} style={{ color: '#fff' }} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CompaniesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectTarget, setConnectTarget] = useState(null);

  useEffect(() => { loadCarriers(); }, []);

  const loadCarriers = async () => {
    try {
      setLoading(true);
      const data = await companiesService.getCompanies();
      const list = Array.isArray(data) ? data
        : Array.isArray(data.data) ? data.data
        : Array.isArray(data.companies) ? data.companies
        : [];
      setCarriers(list.map(c => ({ ...c, is_connected: Boolean(c.is_connected ?? c.credentials) })));
    } catch {
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

  const filtered = carriers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const connected = filtered.filter(c => c.is_connected);
  const available  = filtered.filter(c => !c.is_connected);

  return (
    <div className="main-content" style={{ padding: '28px 32px', background: 'var(--bg-app)' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div className="products-title-icon" style={{ width: '32px', height: '32px' }}>
              <Building2 size={16} style={{ color: 'var(--text-main)' }} />
            </div>
            <h1 className="products-title" style={{ margin: 0 }}>Delivery Companies</h1>
          </div>
          <p className="products-subtitle" style={{ margin: 0 }}>
            Connect your delivery partners to start shipping
          </p>
          <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
            Showing carriers for your market: Morocco (change country under Settings → Business)
          </p>
        </div>

        {/* Search — top right */}
        <div className="search-input-wrapper" style={{ width: '240px', flexShrink: 0 }}>
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
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
        </div>
      ) : (
        <>
          {/* Connected section */}
          {connected.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <SectionHeader
                icon={Building2}
                label="Connected"
                count={`${connected.length} company(s)`}
                dotColor="#10b981"
              />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
                maxWidth: '900px'
              }}>
                {connected.map(carrier => (
                  <ConnectedCard
                    key={carrier.id}
                    carrier={carrier}
                    onConfigure={c => navigate(`/companies/${c.id}`)}
                    onDisconnect={handleDisconnect}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Available section */}
          {available.length > 0 && (
            <div>
              <SectionHeader
                icon={Building2}
                label="Available"
                count={`${available.length} companies`}
              />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {available.map(carrier => (
                  <AvailableCard
                    key={carrier.id}
                    carrier={carrier}
                    onConnect={c => setConnectTarget(c)}
                  />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              No carriers match "{searchTerm}"
            </div>
          )}
        </>
      )}

      {connectTarget && (
        <ConnectCompanyModal
          company={connectTarget}
          onClose={() => setConnectTarget(null)}
          onSuccess={loadCarriers}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}