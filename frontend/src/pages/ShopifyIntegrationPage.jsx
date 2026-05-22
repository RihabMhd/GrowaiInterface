import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Download,
  Package,
  Webhook,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Unplug,
  Plug,
  BarChart3,
  Clock,
  Filter,
} from 'lucide-react';


const BASE_URL = '/api/shopify';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('auth_token'); // wherever you store it

  const res = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ connected }) {
  return connected ? (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 600, color: '#3B6D11',
      background: '#EAF3DE', padding: '3px 10px', borderRadius: 12,
      border: '1px solid #C0DD97',
    }}>
      <CheckCircle2 size={11} /> Connected
    </span>
  ) : (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
      background: 'rgba(0,0,0,0.05)', padding: '3px 10px', borderRadius: 12,
      border: '1px solid var(--border-color)',
    }}>
      <XCircle size={11} /> Not connected
    </span>
  );
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      borderRadius: 10, padding: '14px 16px', display: 'flex',
      alignItems: 'center', gap: 12, flex: 1, minWidth: 0,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={17} color={accent} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {meta.from}–{meta.to} of {meta.total}
      </span>
      <button
        disabled={meta.current_page <= 1}
        onClick={() => onPageChange(meta.current_page - 1)}
        style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: meta.current_page <= 1 ? 0.4 : 1 }}
      ><ChevronLeft size={14} /></button>
      <button
        disabled={meta.current_page >= meta.last_page}
        onClick={() => onPageChange(meta.current_page + 1)}
        style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: meta.current_page >= meta.last_page ? 0.4 : 1 }}
      ><ChevronRight size={14} /></button>
    </div>
  );
}

function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const colors = {
    success: { bg: '#EAF3DE', border: '#C0DD97', text: '#3B6D11', Icon: CheckCircle2 },
    error: { bg: '#FCEBEB', border: '#F7C1C1', text: '#A32D2D', Icon: XCircle },
    info: { bg: '#E6F1FB', border: '#B5D4F4', text: '#185FA5', Icon: AlertCircle },
  };
  const { bg, border, text, Icon } = colors[type] || colors.info;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: 10,
      background: bg, border: `1px solid ${border}`, borderRadius: 10,
      padding: '12px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      maxWidth: 340, fontSize: 13, color: text, fontWeight: 500,
      animation: 'slideIn 0.2s ease',
    }}>
      <Icon size={15} style={{ flexShrink: 0 }} />
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
const TABS = ['Overview', 'Products', 'Orders'];

function TabBar({ active, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-color)', marginBottom: 20 }}>
      {TABS.map(tab => (
        <button
          key={tab}
          disabled={disabled && tab !== 'Overview'}
          onClick={() => onChange(tab)}
          style={{
            background: 'none', border: 'none', padding: '10px 16px',
            fontSize: 13, fontWeight: active === tab ? 600 : 400,
            color: active === tab ? '#65a30d' : 'var(--text-muted)',
            borderBottom: active === tab ? '2px solid #65a30d' : '2px solid transparent',
            cursor: (disabled && tab !== 'Overview') ? 'not-allowed' : 'pointer',
            opacity: (disabled && tab !== 'Overview') ? 0.4 : 1,
            transition: 'all 0.15s', marginBottom: -1,
          }}
        >{tab}</button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Products tab
// ---------------------------------------------------------------------------
function ProductsTab({ shopId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: 12, page, ...(search && { search }) });
      if (shopId) params.set('shop_id', shopId);
      const res = await apiFetch(`/products?${params}`);
      setData(res);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [page, search, shopId]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const products = data?.data ?? [];
  const meta = data?.meta ?? null;

  return (
    <div>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by title or vendor…"
            style={{
              width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              fontSize: 13, border: '1px solid var(--border-color)', borderRadius: 8,
              background: 'var(--bg-card)', color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <button type="submit" style={{
          background: '#65a30d', color: '#fff', border: 'none', borderRadius: 8,
          padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Search</button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
            style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)' }}>
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
          <div style={{ fontSize: 13 }}>Loading products…</div>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
          No products found. Try syncing your store first.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {products.map(p => (
            <div key={p.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                width: '100%', aspectRatio: '1', background: 'rgba(0,0,0,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              }}>
                {p.image ? (
                  <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Package size={28} color="var(--text-muted)" />
                )}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{p.vendor || '—'}</div>
                {p.variants?.length > 0 && (
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#3B6D11' }}>
                    from ${Math.min(...p.variants.map(v => v.price ?? 0)).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Orders tab
// ---------------------------------------------------------------------------
const STATUS_OPTIONS = ['', 'pending', 'fulfilled', 'partial', 'cancelled'];
const STATUS_COLORS = {
  pending: { bg: '#FAEEDA', color: '#633806', border: '#FAC775' },
  fulfilled: { bg: '#EAF3DE', color: '#27500A', border: '#C0DD97' },
  partial: { bg: '#E6F1FB', color: '#0C447C', border: '#B5D4F4' },
  cancelled: { bg: '#FCEBEB', color: '#791F1F', border: '#F7C1C1' },
};

function OrderStatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#F1EFE8', color: '#5F5E5A', border: '#D3D1C7' };
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      textTransform: 'capitalize',
    }}>{status || 'unknown'}</span>
  );
}

function OrdersTab({ shopId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: 15, page, ...(status && { status }), ...(search && { search }) });
      if (shopId) params.set('shop_id', shopId);
      const res = await apiFetch(`/orders?${params}`);
      setData(res);
    } catch { setData(null); }
    finally { setLoading(false); }
  }, [page, status, search, shopId]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const orders = data?.data ?? [];
  const meta = data?.meta ?? null;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search order, email, customer…"
              style={{
                width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                fontSize: 13, border: '1px solid var(--border-color)', borderRadius: 8,
                background: 'var(--bg-card)', color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <button type="submit" style={{ background: '#65a30d', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Search</button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)' }}>
              Clear
            </button>
          )}
        </form>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={13} color="var(--text-muted)" />
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            style={{
              fontSize: 12, border: '1px solid var(--border-color)', borderRadius: 8,
              padding: '8px 10px', background: 'var(--bg-card)', color: 'var(--text-main)', cursor: 'pointer',
            }}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All statuses'}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
          <div style={{ fontSize: 13 }}>Loading orders…</div>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
          No orders found.
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                {['Order', 'Customer', 'Status', 'Payment', 'Total', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.id} style={{ borderBottom: i < orders.length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>#{o.order_number}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-main)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.customer_name || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.customer_email || ''}</div>
                  </td>
                  <td style={{ padding: '10px 14px' }}><OrderStatusBadge status={o.status} /></td>
                  <td style={{ padding: '10px 14px', textTransform: 'capitalize', color: 'var(--text-muted)' }}>{o.payment_status || '—'}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                    {o.currency} {parseFloat(o.total_price || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {o.shopify_created_at ? new Date(o.shopify_created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function ShopifyIntegrationPage() {
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => setToast({ message, type });

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const data = await apiFetch('/shopify/status');
      setStatus(data);
    } catch (err) {
      setStatus({ connected: false });
      // Remove the toast here — a failed status check just means not connected
    } finally {
      setStatusLoading(false);
    }
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === '1') {
      showToast('Shopify connected successfully!', 'success');
      window.history.replaceState({}, '', '/integrations/shopify');
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await apiFetch('/sync-products', { method: 'POST' });
      showToast(res.message || 'Product sync queued!', 'success');
      // Refresh status after a short delay to reflect updated last_synced_at
      setTimeout(loadStatus, 1500);
    } catch (err) {
      showToast(err.message || 'Sync failed.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleConnect = () => {
    window.location.href = '/api/auth/shopify/redirect';
  };

  const connected = status?.connected ?? false;

  return (
    <div className="main-content" style={{ padding: '28px 32px', background: 'var(--bg-app)' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 12, backgroundColor: '#fff',
            border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', flexShrink: 0,
          }}>
            <svg width="28" height="28" viewBox="0 0 109.5 124.5" fill="#95BF47" xmlns="http://www.w3.org/2000/svg">
              <path d="M74.7,14.8c0,0-1.4,0.4-3.7,1.1c-0.4-1.3-1-2.8-1.8-4.4c-2.6-5-6.5-7.7-11.1-7.7c-0.3,0-0.6,0-1,0 c-0.1-0.2-0.3-0.3-0.4-0.5C54.9,1.2,52.6,0,49.9,0C44.6,0.2,39.4,4,35.3,11c-2.9,4.6-5.1,10.3-5.7,14.8 c-5.8,1.8-9.9,3.1-10,3.1c-2.9,0.9-3,1-3.4,3.7C16.2,34.7,5,124.5,5,124.5l81,0V14.1C83,14.3,78.7,14.8,74.7,14.8z M62.5,18.3 c-3.6,1.1-7.5,2.3-11.4,3.5c1.1-4.2,3.2-8.4,5.7-11.2C57.7,9.4,59.4,8,61.4,7.1C63.4,11.3,62.6,16.4,62.5,18.3z M58.2,3.9 c1.5,0,2.8,0.3,3.9,1.1C59.9,5.9,57.8,7,55.9,9.1c-2.7,2.9-4.8,7.5-5.9,11.9c-3.3,1-6.5,2-9.5,2.9 C42.5,16.2,49.9,4.2,58.2,3.9z M46.6,55.8c0.4,6.3,17,7.7,18,21.9c0.7,11.3-6,19-15.7,19.6c-11.6,0.7-18-6.1-18-6.1l2.5-10.5 c0,0,6.4,4.8,11.5,4.5c3.3-0.2,4.5-2.9,4.4-4.9c-0.5-8.2-14-7.7-14.9-20.7c-0.8-11.1,6.6-22.3,22.7-23.3 c6.2-0.4,9.4,1.2,9.4,1.2l-3.6,13.8c0,0-4.1-1.9-9-1.6C47.5,49.9,46.5,53.2,46.6,55.8z" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-main)' }}>Shopify</h1>
              {statusLoading
                ? <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(0,0,0,0.05)', padding: '3px 8px', borderRadius: 12 }}>Checking…</span>
                : <StatusBadge connected={connected} />
              }
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
              {connected ? `${status.domain} — Sync orders, products & inventory` : 'Sync orders, products & inventory from your Shopify store'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        {connected && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSync}
              disabled={syncing}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'none', border: '1px solid var(--border-color)', borderRadius: 8,
                padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: syncing ? 'not-allowed' : 'pointer',
                color: 'var(--text-main)', opacity: syncing ? 0.7 : 1, transition: 'all 0.15s',
              }}
            >
              <RefreshCw size={13} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
              {syncing ? 'Syncing…' : 'Sync products'}
            </button>
            <button
              onClick={loadStatus}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: '#65a30d', border: 'none', borderRadius: 8,
                padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                color: '#fff', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#4d7c0f'}
              onMouseLeave={e => e.currentTarget.style.background = '#65a30d'}
            >
              <BarChart3 size={13} /> Refresh
            </button>
          </div>
        )}
      </div>

      {/* Last synced info */}
      {connected && status?.last_synced_at && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          <Clock size={12} />
          Last synced {new Date(status.last_synced_at).toLocaleString()}
        </div>
      )}

      {/* Tabs */}
      <TabBar active={activeTab} onChange={setActiveTab} disabled={!connected} />

      {/* ---- OVERVIEW TAB ---- */}
      {activeTab === 'Overview' && (
        <div>
          {!connected ? (
            /* Connect card */
            <div className="card" style={{ padding: 0, borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f4fbf7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plug size={16} color="#65a30d" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>Connect Shopify</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>Authorize via secure OAuth</p>
                </div>
              </div>
              <div style={{ padding: 22 }}>
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20,
                  background: 'rgba(101,163,13,0.05)', border: '1px solid rgba(101,163,13,0.15)',
                  borderRadius: 8, padding: '11px 14px',
                }}>
                  <CheckCircle2 size={15} style={{ color: '#65a30d', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-main)' }}>
                    You will be redirected to Shopify to authorize your store. No API keys needed — OAuth only.
                  </p>
                </div>
                <button
                  onClick={handleConnect}
                  style={{
                    width: '100%', background: '#65a30d', color: '#fff', border: 'none',
                    borderRadius: 8, padding: '13px 20px', fontSize: 14, fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#4d7c0f'}
                  onMouseLeave={e => e.currentTarget.style.background = '#65a30d'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                    <path d="M18.86 6.13c-.34-.26-.74-.41-1.16-.43l-3.32-.14c-.11 0-.21-.04-.29-.11l-1.34-1.28c-.4-.38-.93-.6-1.48-.6H7.95c-1.1 0-2 .9-2 2v1h-.32c-.88 0-1.63.63-1.78 1.5l-1.28 7.5c-.17.98.5 1.91 1.48 2.08.1.02.2.02.3.02h.65v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2h.17c.9 0 1.66-.67 1.78-1.57l1.11-8c.11-.83-.34-1.62-1.11-1.92z" />
                  </svg>
                  Connect with Shopify
                </button>
              </div>
            </div>
          ) : (
            /* Connected stats */
            <div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <StatCard label="Active products" value={status.product_count?.toLocaleString()} icon={Package} accent="#65a30d" />
                <StatCard label="Total orders" value={status.order_count?.toLocaleString()} icon={ShoppingCart} accent="#185FA5" />
              </div>

              {/* Webhook info block */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Webhook size={15} color="#65a30d" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>Webhooks active</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Real-time events are processed via <code style={{ fontSize: 11, background: 'rgba(0,0,0,0.05)', padding: '1px 5px', borderRadius: 4 }}>POST /webhooks/shopify/{'{domain}'}</code>.
                  Topics handled: <strong>orders/create</strong>, <strong>orders/updated</strong>, <strong>orders/cancelled</strong>, <strong>orders/paid</strong>, <strong>orders/fulfilled</strong>, <strong>products/update</strong>, <strong>products/delete</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Feature tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
            {[
              { label: 'Order sync', icon: <RefreshCw size={12} /> },
              { label: 'Product import', icon: <Download size={12} /> },
              { label: 'Inventory tracking', icon: <Package size={12} /> },
              { label: 'Webhooks', icon: <Webhook size={12} /> },
            ].map(({ label, icon }) => (
              <div key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                padding: '7px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, color: 'var(--text-main)',
              }}>
                <CheckCircle2 size={12} color="#65a30d" />
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- PRODUCTS TAB ---- */}
      {activeTab === 'Products' && connected && (
        <ProductsTab shopId={status?.shop_id} />
      )}

      {/* ---- ORDERS TAB ---- */}
      {activeTab === 'Orders' && connected && (
        <OrdersTab shopId={status?.shop_id} />
      )}

      {/* Toast */}
      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}