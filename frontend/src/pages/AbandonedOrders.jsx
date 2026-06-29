import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  MessageCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShoppingCart,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import api from "../api/axios";
import OrderDetails from "./OrderDetails";
import { ABANDONED_ORDER_STATUSES, ABANDONED_ORDER_STATUS_META } from "../config/orderStatuses";

const PERIODS = [
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

const LANGUAGES = [
  { value: "fr", label: "French (fr)" },
  { value: "en", label: "English (en)" },
  { value: "ar", label: "Arabic (ar)" },
];

const DEFAULT_STAGE = {
  id: null,
  name: "Stage",
  enabled: false,
  delay_minutes: 60,
  language: "fr",
  template_name: "abandoned_recovery_v1",
  body_params: ["{{customer_name}}", "{{recovery_url}}"],
  url_suffix: "",
};

const currency = (value, code = "MAD") =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: code || "MAD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const dateTime = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

function KpiCard({ icon, title, value, sub, tone }) {
  return (
    <div className="ab-kpi">
      <div className="ab-kpi-head">
        <div className={`ab-kpi-icon ${tone}`}>{icon}</div>
        <span>{title}</span>
      </div>
      <div className="ab-kpi-value">{value}</div>
      <div className="ab-kpi-sub">{sub}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const item = ABANDONED_ORDER_STATUS_META[status] || ABANDONED_ORDER_STATUS_META.open;
  return <span className={`ab-status ${item.cls}`}>{item.label}</span>;
}

export default function AbandonedOrders() {
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [kpis, setKpis] = useState({});
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 });
  const [loading, setLoading] = useState(true);
  const [recoveringId, setRecoveringId] = useState(null);
  const [detailsOrder, setDetailsOrder] = useState(null);
  const [toast, setToast] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesSaving, setRulesSaving] = useState(false);
  const [stages, setStages] = useState([]);

  const period = params.get("period") || "30d";
  const status = params.get("status") || "all";
  const hasPhone = params.get("has_phone") === "1";
  const search = params.get("search") || "";
  const page = Number(params.get("page") || 1);
  const perPage = Number(params.get("per_page") || 15);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => setSearchInput(search), [search]);

  const updateParams = useCallback((patch, resetPage = true) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "" || value === false) next.delete(key);
        else next.set(key, String(value));
      });
      if (resetPage) next.set("page", "1");
      if (!next.get("period")) next.set("period", "30d");
      if (!next.get("status")) next.set("status", "all");
      return next;
    });
  }, [setParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) updateParams({ search: searchInput.trim() || null });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, search, updateParams]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/abandoned-orders", {
        params: {
          period,
          status,
          has_phone: hasPhone ? 1 : undefined,
          search: search || undefined,
          page,
          per_page: perPage,
        },
      });
      setOrders(data.data || []);
      setKpis(data.kpis || {});
      setMeta(data.meta || { current_page: 1, last_page: 1, per_page: perPage, total: 0 });
    } catch (error) {
      console.error(error);
      showToast("Failed to load abandoned orders", "error");
    } finally {
      setLoading(false);
    }
  }, [period, status, hasPhone, search, page, perPage]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRules = useCallback(async () => {
    setRulesLoading(true);
    try {
      const { data } = await api.get("/recovery-rules");
      setStages(data.data || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load recovery rules", "error");
    } finally {
      setRulesLoading(false);
    }
  }, []);

  const openRules = async () => {
    setShowRules(true);
    await fetchRules();
  };

  const updateStage = (index, patch) => {
    setStages((current) => current.map((stage, i) => i === index ? { ...stage, ...patch } : stage));
  };

  const addStage = () => {
    setStages((current) => [
      ...current,
      {
        ...DEFAULT_STAGE,
        name: `Stage ${current.length + 1}`,
        delay_minutes: 60,
      },
    ]);
  };

  const removeStage = (index) => {
    setStages((current) => current.filter((_, i) => i !== index).map((stage, i) => ({ ...stage, name: `Stage ${i + 1}` })));
  };

  const updateParam = (stageIndex, paramIndex, value) => {
    setStages((current) => current.map((stage, i) => {
      if (i !== stageIndex) return stage;
      const params = [...(stage.body_params || [])];
      params[paramIndex] = value;
      return { ...stage, body_params: params };
    }));
  };

  const addParam = (stageIndex) => {
    setStages((current) => current.map((stage, i) => i === stageIndex
      ? { ...stage, body_params: [...(stage.body_params || []), ""] }
      : stage));
  };

  const removeParam = (stageIndex, paramIndex) => {
    setStages((current) => current.map((stage, i) => i === stageIndex
      ? { ...stage, body_params: (stage.body_params || []).filter((_, p) => p !== paramIndex) }
      : stage));
  };

  const saveRules = async () => {
    setRulesSaving(true);
    try {
      await api.post("/recovery-rules", { stages });
      showToast("Recovery rules saved");
      setShowRules(false);
      await fetchOrders();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Failed to save recovery rules", "error");
    } finally {
      setRulesSaving(false);
    }
  };

  const syncNow = async () => {
    setSyncing(true);
    try {
      const { data } = await api.post("/orders/sync-abandoned");
      showToast(data.message || "Sync complete");
      await fetchOrders();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Sync failed", "error");
    } finally {
      setSyncing(false);
    }
  };

  const recoverOrder = async (order) => {
    setRecoveringId(order.id);
    try {
      await api.post(`/orders/${order.id}/recover`);
      showToast("Order recovered");
      await fetchOrders();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "Unable to recover order", "error");
    } finally {
      setRecoveringId(null);
    }
  };

  const viewDetails = async (order) => {
    try {
      const { data } = await api.get(`/orders/${order.id}`);
      setDetailsOrder(data.data || data);
    } catch (error) {
      console.error(error);
      showToast("Unable to load order details", "error");
    }
  };

  const totalAttempts = Number(kpis.total_attempts || 0);
  const recoveredCount = Number(kpis.recovered_count || 0);
  const visibleRange = useMemo(() => {
    if (!meta.total) return "0";
    const start = (meta.current_page - 1) * meta.per_page + 1;
    const end = Math.min(meta.current_page * meta.per_page, meta.total);
    return `${start}-${end}`;
  }, [meta]);

  return (
    <div className="ab-page">
      <style>{`
        .ab-page { color: var(--text-main); padding-bottom: 40px; }
        .ab-top { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:18px; }
        .ab-actions-top { display:flex; align-items:center; gap:8px; }
        .ab-title { display:flex; align-items:center; gap:10px; }
        .ab-title h2 { margin:0; font-size:1.25rem; font-weight:800; letter-spacing:0; color:var(--text-main); }
        .ab-title span { color:var(--text-muted); font-size:.78rem; font-weight:600; }
        .ab-refresh { display:inline-flex; align-items:center; gap:8px; border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); border-radius:8px; padding:8px 13px; font-size:.8rem; font-weight:700; cursor:pointer; transition:background 0.15s; }
        .ab-refresh:hover { background:var(--hover-bg); }
        .ab-sync { display:inline-flex; align-items:center; gap:8px; border:none; background:var(--purple); color:#fff; border-radius:8px; padding:9px 14px; font-size:.8rem; font-weight:800; cursor:pointer; transition:background 0.15s; }
        .ab-sync:hover { background:#7239ea; }
        .ab-kpis { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin-bottom:18px; }
        .ab-kpi { background:var(--bg-card); border:1px solid var(--border-color); border-radius:14px; padding:16px 18px 18px; min-width:0; }
        .ab-kpi-head { display:flex; align-items:center; gap:10px; color:var(--text-muted); font-size:.67rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; }
        .ab-kpi-icon { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .ab-kpi-icon.orange { background:var(--warning-light); color:var(--warning); }
        .ab-kpi-icon.green  { background:var(--success-light); color:var(--success); }
        .ab-kpi-icon.purple { background:var(--purple-light);  color:var(--purple); }
        .ab-kpi-icon.blue   { background:var(--primary-light); color:var(--primary); }
        .ab-kpi-value { font-size:1.85rem; font-weight:800; line-height:1; margin-top:14px; color:var(--text-main); }
        .ab-kpi-sub { color:var(--text-muted); font-size:.76rem; margin-top:7px; }
        .ab-filters { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:14px; }
        .ab-select, .ab-search { height:36px; border:1px solid var(--border-color); background:var(--bg-card); color:var(--text-main); border-radius:8px; font-size:.8rem; font-weight:600; outline:none; }
        .ab-select { padding:0 30px 0 10px; }
        .ab-search-wrap { flex:1; min-width:230px; position:relative; }
        .ab-search-wrap svg { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--text-muted); }
        .ab-search { width:100%; padding:0 12px 0 32px; box-sizing:border-box; }
        .ab-search::placeholder { color:var(--text-muted); }
        .ab-phone { display:flex; align-items:center; gap:7px; height:36px; padding:0 10px; border:1px solid var(--border-color); border-radius:8px; background:var(--bg-card); font-size:.8rem; font-weight:700; color:var(--text-main); }
        .ab-phone input { accent-color:var(--purple); }
        .ab-table-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:14px; overflow:hidden; box-shadow:0 1px 4px rgba(15,23,42,.04); }
        .ab-table { width:100%; border-collapse:collapse; font-size:.82rem; }
        .ab-table th { padding:12px 16px; text-align:left; background:var(--bg-app); border-bottom:1px solid var(--border-color); color:var(--text-muted); font-size:.67rem; font-weight:800; letter-spacing:.06em; }
        .ab-table td { padding:14px 16px; border-bottom:1px solid var(--border-color); vertical-align:middle; }
        .ab-row:hover { background:var(--hover-bg); }
        .ab-main { font-weight:800; color:var(--text-main); }
        .ab-muted { color:var(--text-muted); font-size:.74rem; margin-top:3px; }
        .ab-status { display:inline-flex; padding:4px 10px; border-radius:999px; font-size:.72rem; font-weight:800; white-space:nowrap; }
        .ab-status.open      { background:var(--warning-light); color:var(--warning); }
        .ab-status.recovered { background:var(--success-light); color:var(--success); }
        .ab-status.sent      { background:var(--primary-light); color:var(--primary); }
        .ab-actions { display:flex; align-items:center; gap:7px; }
        .ab-btn { display:inline-flex; align-items:center; gap:6px; border:none; border-radius:7px; padding:7px 10px; font-size:.72rem; font-weight:800; cursor:pointer; white-space:nowrap; transition:all 0.15s; }
        .ab-btn.primary   { background:var(--purple); color:#fff; }
        .ab-btn.primary:hover:not(:disabled) { background:#7239ea; }
        .ab-btn.secondary { background:var(--bg-app); color:var(--text-main); border:1px solid var(--border-color); }
        .ab-btn.secondary:hover:not(:disabled) { background:var(--hover-bg); border-color:var(--text-muted); }
        .ab-btn:disabled { opacity:.6; cursor:not-allowed; }
        .ab-empty { padding:64px 20px; text-align:center; color:var(--text-muted); font-weight:600; }
        .ab-footer { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; color:var(--text-muted); font-size:.78rem; border-top:1px solid var(--border-color); }
        .ab-pager { display:flex; gap:8px; }
        .ab-toast { position:fixed; top:20px; right:20px; z-index:10002; color:white; padding:11px 18px; border-radius:8px; font-size:.84rem; font-weight:800; box-shadow:0 8px 20px rgba(15,23,42,.16); }
        .ab-toast.success { background:var(--success); }
        .ab-toast.error   { background:var(--danger); }
        .rules-backdrop { position:fixed; inset:0; z-index:10000; background:rgba(0,0,0,.42); backdrop-filter:blur(2px); }
        .rules-drawer { position:fixed; top:0; right:0; bottom:0; z-index:10001; width:min(510px,100vw); background:var(--bg-card); border-left:1px solid var(--border-color); display:flex; flex-direction:column; box-shadow:-14px 0 40px rgba(15,23,42,.22); }
        .rules-head { padding:22px 28px 12px; display:flex; align-items:flex-start; justify-content:space-between; gap:16px; border-bottom:1px solid var(--border-color); }
        .rules-title { display:flex; align-items:center; gap:9px; font-size:1rem; font-weight:800; color:var(--text-main); }
        .rules-desc { margin:14px 0 0; color:var(--text-muted); font-size:.78rem; line-height:1.7; }
        .rules-close { width:24px; height:24px; border-radius:50%; border:1px solid var(--border-color); background:var(--bg-app); color:var(--text-muted); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:all 0.15s; }
        .rules-close:hover { background:var(--border-color); color:var(--text-main); }
        .rules-body { flex:1; overflow-y:auto; padding:0 28px 18px; }
        .stage-card { border:1px solid var(--border-color); border-radius:8px; padding:13px 13px 14px; margin:14px 0; background:var(--bg-app); }
        .stage-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px; }
        .stage-name { display:flex; align-items:center; gap:7px; color:var(--text-main); font-size:.84rem; font-weight:800; }
        .stage-remove { display:flex; align-items:center; gap:5px; border:none; background:transparent; color:var(--text-muted); font-size:.72rem; font-weight:700; cursor:pointer; }
        .stage-remove:hover { color:var(--danger); }
        .stage-grid { display:grid; grid-template-columns:1fr 1fr; gap:9px; }
        .stage-field { margin-bottom:12px; }
        .stage-field label, .params-label { display:block; color:var(--text-muted); font-size:.68rem; font-weight:600; margin-bottom:6px; }
        .stage-input, .stage-select { width:100%; height:30px; border:1px solid var(--border-color); border-radius:5px; padding:0 10px; box-sizing:border-box; font-size:.78rem; color:var(--text-main); outline:none; background:var(--bg-card); }
        .stage-input:focus, .stage-select:focus { border-color:var(--purple); box-shadow:0 0 0 2px rgba(137,80,252,.12); }
        .params-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:7px; }
        .param-add { border:none; background:transparent; color:var(--purple); font-size:.7rem; font-weight:800; cursor:pointer; }
        .param-row { display:grid; grid-template-columns:36px 1fr 18px; align-items:center; gap:7px; margin-bottom:7px; }
        .param-index { color:var(--text-muted); font-size:.72rem; font-weight:700; }
        .param-remove { border:none; background:transparent; color:var(--text-muted); cursor:pointer; padding:0; display:flex; }
        .param-remove:hover { color:var(--danger); }
        .add-stage { width:100%; height:39px; border:1px dashed var(--border-color); background:var(--bg-card); border-radius:6px; color:var(--text-muted); font-size:.8rem; font-weight:700; display:flex; align-items:center; justify-content:center; gap:7px; cursor:pointer; transition:all 0.15s; }
        .add-stage:hover { border-color:var(--purple); color:var(--purple); }
        .placeholders { margin-top:13px; background:var(--bg-app); border:1px solid var(--border-color); border-radius:6px; padding:12px 10px; color:var(--text-muted); font-size:.7rem; font-family:monospace; }
        .rules-footer { border-top:1px solid var(--border-color); padding:15px 28px 18px; display:flex; justify-content:flex-end; gap:8px; background:var(--bg-card); }
        .rules-cancel { height:34px; padding:0 14px; border:1px solid var(--border-color); background:var(--bg-app); color:var(--text-main); border-radius:5px; font-size:.8rem; cursor:pointer; transition:all 0.15s; }
        .rules-cancel:hover { background:var(--hover-bg); }
        .rules-save { height:34px; padding:0 15px; border:none; background:var(--purple); color:#fff; border-radius:5px; font-size:.8rem; font-weight:800; display:flex; align-items:center; gap:7px; cursor:pointer; transition:background 0.15s; }
        .rules-save:hover { background:#7239ea; }
        .spin { animation: ab-spin 1s linear infinite; }
        @keyframes ab-spin { to { transform: rotate(360deg); } }
        @media (max-width: 1100px) { .ab-kpis { grid-template-columns:repeat(2,minmax(0,1fr)); } .ab-table-card { overflow-x:auto; } .ab-table { min-width:980px; } }
        @media (max-width: 640px) { .ab-kpis { grid-template-columns:1fr; } .ab-top { align-items:flex-start; flex-direction:column; } }
      `}</style>

      {toast && <div className={`ab-toast ${toast.type}`}>{toast.text}</div>}

      <div className="ab-top">
        <div className="ab-title">
          <div className="products-title-icon">
            <ShoppingCart size={16} style={{ color: 'var(--text-main)' }} />
          </div>
          <h2>Abandoned Orders</h2>
          <span>{meta.total || 0} records</span>
        </div>
        <div className="ab-actions-top">
          <button className="ab-refresh" onClick={openRules}>
            <Settings size={14} /> Recovery rules
          </button>
          <button className="ab-sync" onClick={syncNow} disabled={syncing}>
            <RefreshCw size={14} className={syncing ? "spin" : ""} /> {syncing ? "Syncing" : "Sync now"}
          </button>
        </div>
      </div>

      <div className="ab-kpis">
        <KpiCard tone="orange" icon={<ShoppingCart size={18} />} title="Open (Last 30D)" value={kpis.open_count || 0} sub={currency(kpis.open_revenue)} />
        <KpiCard tone="green" icon={<CheckCircle2 size={18} />} title="Recovered" value={kpis.recovered_count || 0} sub={currency(kpis.recovered_revenue)} />
        <KpiCard tone="purple" icon={<TrendingUp size={18} />} title="Recovery Rate" value={`${kpis.recovery_rate || 0}%`} sub={`${recoveredCount} / ${totalAttempts} attempts`} />
        <KpiCard tone="blue" icon={<MessageCircle size={18} />} title="Recovery Sent" value={kpis.recovery_sent_count || 0} sub="WhatsApp messages" />
      </div>

      <div className="ab-filters">
        <select className="ab-select" value={period} onChange={(e) => updateParams({ period: e.target.value })}>
          {PERIODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select className="ab-select" value={status} onChange={(e) => updateParams({ status: e.target.value })}>
          {ABANDONED_ORDER_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <label className="ab-phone">
          <input type="checkbox" checked={hasPhone} onChange={(e) => updateParams({ has_phone: e.target.checked ? 1 : null })} />
          Has phone
        </label>
        <div className="ab-search-wrap">
          <Search size={14} />
          <input className="ab-search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search customer, email, phone..." />
        </div>
      </div>

      <div className="ab-table-card">
        <table className="ab-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Abandoned</th>
              <th>Recovery</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="ab-empty">Loading abandoned orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="ab-empty">No abandoned checkouts match these filters.</td></tr>
            ) : orders.map((order) => (
              <tr className="ab-row" key={order.id}>
                <td>
                  <div className="ab-main">{order.customer?.name || "-"}</div>
                  <div className="ab-muted">{order.customer?.email || "-"}</div>
                  <div className="ab-muted">{order.customer?.phone || "-"}</div>
                </td>
                <td>
                  <div className="ab-main">{order.items_count} product{order.items_count === 1 ? "" : "s"}</div>
                  <div className="ab-muted">{order.item_summary || "No item summary"}</div>
                </td>
                <td className="ab-main">{currency(order.total_price, order.currency)}</td>
                <td>
                  <div className="ab-main">{dateTime(order.abandoned_at)}</div>
                  <div className="ab-muted">Order #{order.order_number}</div>
                </td>
                <td>
                  <div className="ab-main">{order.recovery_message_count} message{order.recovery_message_count === 1 ? "" : "s"}</div>
                  <div className="ab-muted">{order.last_recovery_attempt_at ? dateTime(order.last_recovery_attempt_at) : "No attempts"}</div>
                </td>
                <td><StatusBadge status={order.status} /></td>
                <td>
                  <div className="ab-actions">
                    <button className="ab-btn primary" disabled={order.raw_status !== "abandoned" || recoveringId === order.id} onClick={() => recoverOrder(order)}>
                      <RotateCcw size={13} /> {recoveringId === order.id ? "Recovering" : "Recover Order"}
                    </button>
                    <button className="ab-btn secondary" onClick={() => viewDetails(order)}>
                      <Eye size={13} /> View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ab-footer">
          <span>Showing {visibleRange} of {meta.total || 0}</span>
          <div className="ab-pager">
            <button className="ab-btn secondary" disabled={meta.current_page <= 1 || loading} onClick={() => updateParams({ page: meta.current_page - 1 }, false)}>Previous</button>
            <button className="ab-btn secondary" disabled={meta.current_page >= meta.last_page || loading} onClick={() => updateParams({ page: meta.current_page + 1 }, false)}>Next</button>
          </div>
        </div>
      </div>

      {showRules && (
        <>
          <div className="rules-backdrop" onClick={() => setShowRules(false)} />
          <aside className="rules-drawer">
            <div className="rules-head">
              <div>
                <div className="rules-title">
                  <Settings size={17} />
                  Auto-recovery rules
                </div>
                <p className="rules-desc">
                  Each enabled stage sends one WhatsApp message after the configured delay.
                  <br />
                  The cron runs every 10 minutes.
                </p>
              </div>
              <button className="rules-close" onClick={() => setShowRules(false)}>
                <X size={12} />
              </button>
            </div>

            <div className="rules-body">
              {rulesLoading ? (
                <div className="ab-empty">Loading recovery rules...</div>
              ) : (
                <>
                  {stages.map((stage, stageIndex) => (
                    <div className="stage-card" key={`${stage.id || "new"}-${stageIndex}`}>
                      <div className="stage-head">
                        <label className="stage-name">
                          <input
                            type="checkbox"
                            checked={!!stage.enabled}
                            onChange={(event) => updateStage(stageIndex, { enabled: event.target.checked })}
                          />
                          {stage.name || `Stage ${stageIndex + 1}`}
                        </label>
                        <button className="stage-remove" onClick={() => removeStage(stageIndex)}>
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>

                      <div className="stage-grid">
                        <div className="stage-field">
                          <label>Delay (minutes)</label>
                          <input
                            className="stage-input"
                            type="number"
                            min="1"
                            value={stage.delay_minutes}
                            onChange={(event) => updateStage(stageIndex, { delay_minutes: Number(event.target.value) || 1 })}
                          />
                        </div>
                        <div className="stage-field">
                          <label>Language</label>
                          <select
                            className="stage-select"
                            value={stage.language || "fr"}
                            onChange={(event) => updateStage(stageIndex, { language: event.target.value })}
                          >
                            {LANGUAGES.map((language) => (
                              <option key={language.value} value={language.value}>{language.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="stage-field">
                        <label>Template name (must be approved in Meta)</label>
                        <input
                          className="stage-input"
                          value={stage.template_name || ""}
                          placeholder="e.g. abandoned_recovery_v1"
                          onChange={(event) => updateStage(stageIndex, { template_name: event.target.value })}
                        />
                      </div>

                      <div className="params-head">
                        <span className="params-label">Body parameters (&#123;&#123;1&#125;&#125;, &#123;&#123;2&#125;&#125; ...)</span>
                        <button className="param-add" onClick={() => addParam(stageIndex)}>+ add</button>
                      </div>
                      {(stage.body_params || []).map((param, paramIndex) => (
                        <div className="param-row" key={paramIndex}>
                          <span className="param-index">&#123;&#123;{paramIndex + 1}&#125;&#125;</span>
                          <input
                            className="stage-input"
                            value={param}
                            onChange={(event) => updateParam(stageIndex, paramIndex, event.target.value)}
                          />
                          <button className="param-remove" onClick={() => removeParam(stageIndex, paramIndex)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}

                      <div className="stage-field">
                        <label>URL button dynamic suffix (optional)</label>
                        <input
                          className="stage-input"
                          value={stage.url_suffix || ""}
                          placeholder="e.g. checkouts/{{recovery_url}}"
                          onChange={(event) => updateStage(stageIndex, { url_suffix: event.target.value })}
                        />
                      </div>
                    </div>
                  ))}

                  <button className="add-stage" onClick={addStage}>
                    <Plus size={13} /> Add stage
                  </button>

                  <div className="placeholders">
                    Placeholders: {"{{customer_name}}, {{recovery_url}}, {{total}}, {{currency}}, {{shop_name}}"}
                  </div>
                </>
              )}
            </div>

            <div className="rules-footer">
              <button className="rules-cancel" onClick={() => setShowRules(false)}>Cancel</button>
              <button className="rules-save" onClick={saveRules} disabled={rulesSaving}>
                <Save size={13} /> {rulesSaving ? "Saving..." : "Save rules"}
              </button>
            </div>
          </aside>
        </>
      )}

      {detailsOrder && (
        <OrderDetails
          order={detailsOrder}
          onClose={() => setDetailsOrder(null)}
          onOrderUpdated={() => { setDetailsOrder(null); fetchOrders(); }}
        />
      )}
    </div>
  );
}
