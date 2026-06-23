import { useContext, useEffect, useState, useCallback, useRef } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/axios";

// ─── constants ───────────────────────────────────────────────────────────────

const EMPTY_STATS = {
  total: 0, confirmed: 0, pending: 0, cancelled: 0, delivered: 0,
  revenue: 0, revenue_growth: 0, confirmation_rate: 0, delivery_rate: 0,
  avg_confirmation_time: null,
  products: 0, clients: 0, team_members: 0,
  abandoned_analytics: {
    abandoned_orders: 0, recovered_orders: 0, recovery_rate: 0,
    lost_revenue: 0, recovered_revenue: 0,
  },
};

const fmt = (v) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency", currency: "MAD", maximumFractionDigits: 0,
  }).format(v ?? 0);

const fmtGrowth = (v) => `${v >= 0 ? "+" : ""}${v ?? 0}%`;

const fmtTime = (minutes) => {
  if (minutes === null || minutes === undefined) return null;
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// period value → API param (null = no param, handled as "all" on backend or largest range)
const PERIOD_PILLS = [
  { label: "All time", value: "all_time" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This week", value: "last_7_days" },
];

const MORE_PRESETS = [
  { label: "Last 7 days", value: "last_7_days" },
  { label: "Last 30 days", value: "last_30_days" },
  { label: "This month", value: "this_month" },
  { label: "Last month", value: "last_month" },
  { label: "Last 90 days", value: "last_90_days" },
];

// ─── DonutChart ──────────────────────────────────────────────────────────────

// ─── DonutChart ──────────────────────────────────────────────────────────────
// Enlarged to 120×120 (r=46) for better visual weight in the metric cards

function DonutChart({ percent, color }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(Math.max(percent, 0), 100) / 100) * circ;

  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {/* Track */}
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border-color,#e8e8e8)" strokeWidth="10" />
      {/* Progress arc */}
      <circle
        cx="60" cy="60" r={r} fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{ transition: "stroke-dasharray 0.5s ease" }}
      />
    </svg>
  );
}

// ─── KpiCard ─────────────────────────────────────────────────────────────────
// Matches reference: circular icon bg, label on same row as icon (top),
// value on its own row below — left-aligned. Sub shows em-dash + text (No data style).

function KpiCard({ icon, bgColor, title, value, sub, loading }) {
  return (
    <div style={{
      background: "var(--card-bg, #fff)",
      border: "1px solid var(--border-color, #f0f0f0)",
      borderRadius: "14px",
      padding: "16px 18px 18px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      minWidth: 0,
    }}>
      {/* Row 1: circular icon + uppercase label */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Circle icon — matches reference pill shape */}
        <div style={{
          width: "36px", height: "36px",
          borderRadius: "50%",
          background: bgColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: "0.67rem", fontWeight: 600, letterSpacing: "0.06em",
          textTransform: "uppercase", color: "var(--text-muted, #9ca3af)",
          lineHeight: 1.2,
        }}>
          {title}
        </span>
      </div>

      {/* Row 2: large value */}
      <div>
        {loading ? (
          <div style={{ height: "32px", width: "48px", background: "var(--border-color, #f0f0f0)", borderRadius: "6px" }} />
        ) : (
          <span style={{
            fontSize: "1.9rem", fontWeight: 700,
            color: "var(--text-main, #111827)", lineHeight: 1,
            letterSpacing: "-0.02em",
          }}>
            {value}
          </span>
        )}
        {sub && !loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "5px" }}>
            {/* Em-dash mark before "No data" — matches reference visual */}
            <span style={{
              width: "16px", height: "2px",
              background: "var(--text-muted, #9ca3af)",
              borderRadius: "2px", display: "inline-block", flexShrink: 0,
            }} />
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted, #9ca3af)" }}>
              {sub}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DonutLegend ─────────────────────────────────────────────────────────────
// Two-item legend row shown beneath each donut chart

function DonutLegend({ items }) {
  return (
    <div style={{
      display: "flex", justifyContent: "center", gap: "20px",
      marginTop: "12px", flexWrap: "wrap",
    }}>
      {items.map(({ color, label, value }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: color, flexShrink: 0, display: "inline-block",
          }} />
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted,#888)", whiteSpace: "nowrap" }}>
            {label}
          </span>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-main,#1a1a1a)" }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── CalendarPicker ──────────────────────────────────────────────────────────

function CalendarPicker({ onApply, onClose }) {
  const today = new Date();
  const [fromMonth, setFromMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [toMonth, setToMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const renderCalendar = (base, selected, onSelect) => {
    const year = base.getFullYear();
    const month = base.getMonth();
    const first = new Date(year, month, 1).getDay(); // 0=Sun
    const days = new Date(year, month + 1, 0).getDate();
    // adjust so Monday = col 0
    const offset = (first + 6) % 7;
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));

    const isSel = (d) => d && selected && d.toDateString() === selected.toDateString();
    const isToday = (d) => d && d.toDateString() === today.toDateString();

    return (
      <div style={{ width: "160px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <button onClick={() => onSelect(null, new Date(year, month - 1, 1), true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted,#888)", fontSize: "14px", padding: "2px 6px" }}>‹</button>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-main,#1a1a1a)" }}>
            {monthNames[month]} {year}
          </span>
          <button onClick={() => onSelect(null, new Date(year, month + 1, 1), true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted,#888)", fontSize: "14px", padding: "2px 6px" }}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px", textAlign: "center" }}>
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
            <div key={d} style={{ fontSize: "0.6rem", color: "var(--text-muted,#888)", padding: "2px 0", fontWeight: 600 }}>{d}</div>
          ))}
          {cells.map((d, i) => (
            <button key={i} disabled={!d}
              onClick={() => d && onSelect(d)}
              style={{
                background: isSel(d) ? "#8950fc" : "none",
                color: isSel(d) ? "#fff" : isToday(d) ? "#8950fc" : d ? "var(--text-main,#1a1a1a)" : "transparent",
                border: "none", borderRadius: "4px", cursor: d ? "pointer" : "default",
                fontSize: "0.7rem", padding: "3px 0", fontWeight: isSel(d) ? 700 : 400,
              }}
            >
              {d ? d.getDate() : ""}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleFromSelect = (d, newMonth, monthOnly) => {
    if (monthOnly) { setFromMonth(newMonth); return; }
    setFromDate(d);
  };
  const handleToSelect = (d, newMonth, monthOnly) => {
    if (monthOnly) { setToMonth(newMonth); return; }
    setToDate(d);
  };

  const fmt = (d) => d ? d.toISOString().split("T")[0] : null;

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 6px)", right: 0,
      background: "var(--card-bg,#fff)", border: "1px solid var(--border-color,#eee)",
      borderRadius: "12px", padding: "16px", zIndex: 200, minWidth: "380px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    }}>
      {/* Presets */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted,#888)", marginBottom: "6px" }}>More</div>
        {MORE_PRESETS.map(p => (
          <button key={p.value} onClick={() => { onApply(p.value); onClose(); }}
            style={{
              display: "flex", alignItems: "center", gap: "8px", width: "100%",
              padding: "7px 6px", background: "none", border: "none", cursor: "pointer",
              fontSize: "0.82rem", color: "var(--text-main,#1a1a1a)", borderRadius: "6px",
              textAlign: "left",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--hover-bg,#f5f5f5)"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted,#888)", flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {p.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border-color,#eee)", margin: "10px 0 14px" }} />

      {/* Dual calendar */}
      <div style={{ display: "flex", gap: "24px" }}>
        <div>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted,#888)", marginBottom: "8px" }}>From</div>
          {renderCalendar(fromMonth, fromDate, handleFromSelect)}
        </div>
        <div>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted,#888)", marginBottom: "8px" }}>To</div>
          {renderCalendar(toMonth, toDate, handleToSelect)}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
        <button
          onClick={() => {
            if (fromDate && toDate) onApply(`custom:${fmt(fromDate)}:${fmt(toDate)}`);
            onClose();
          }}
          disabled={!fromDate || !toDate}
          style={{
            flex: 1, padding: "9px", borderRadius: "8px",
            background: fromDate && toDate ? "#8950fc" : "#d0c0f8",
            color: "#fff", border: "none", cursor: fromDate && toDate ? "pointer" : "default",
            fontWeight: 600, fontSize: "0.82rem",
          }}
        >
          Apply
        </button>
        <button
          onClick={() => {
            setFromDate(null);
            setToDate(null);

            onApply("today");
            onClose();
          }}
          style={{
            padding: "9px 18px", borderRadius: "8px",
            background: "none", border: "1px solid var(--border-color,#eee)",
            cursor: "pointer", fontSize: "0.82rem", color: "var(--text-main,#1a1a1a)",
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();

  const [period, setPeriod] = useState("today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeShop, setActiveShop] = useState("global");
  const [global, setGlobal] = useState({ ...EMPTY_STATS });
  const [shops, setShops] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef(null);

  // close More dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setShowMore(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async (p) => {
    console.log("Selected period:", p);
    setLoading(true);
    setError(null);
    try {
      // "all_time" → omit period param so backend returns all
      const params =
        p && !p?.startsWith("custom:")
          ? { period: p }
          : {};
      console.log("Params:", params);
      // custom date range: pass start/end
      if (p?.startsWith("custom:")) {
        const [, from, to] = p.split(":");
        params.from = from;
        params.to = to;
      }
      const { data } = await api.get("/dashboard", { params });
      setGlobal({ ...EMPTY_STATS, ...data.global, abandoned_analytics: { ...EMPTY_STATS.abandoned_analytics, ...(data.global?.abandoned_analytics ?? {}) } });
      setShops((data.shops ?? []).map(s => ({ ...EMPTY_STATS, ...s, abandoned_analytics: { ...EMPTY_STATS.abandoned_analytics, ...(s.abandoned_analytics ?? {}) } })));
    } catch (err) {
      setError(err?.response?.data?.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(period); }, [period, fetchDashboard]);

  const activeStats =
    activeShop === "global"
      ? global
      : shops.find((s) => s.id === activeShop) ?? { ...EMPTY_STATS };

  // derived
  const deliveryRate = activeStats.delivery_rate ?? (activeStats.total > 0
    ? Math.round((activeStats.delivered / activeStats.total) * 100)
    : 0);

  const confirmationRate = activeStats.confirmation_rate ?? 0;

  const morePeriods = new Set(MORE_PRESETS.map(p => p.value));
  const isMoreActive =
    morePeriods.has(period) || period?.startsWith("custom:");

  // ── period label for active pill ─────────────────────────────────────────
  const activePillLabel = () => {
    if (period?.startsWith("custom:")) {
      const [, from, to] = period.split(":");
      return `${from} → ${to}`;
    }
    const preset = MORE_PRESETS.find(p => p.value === period);
    return preset ? preset.label : "More";
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "24px", flexWrap: "wrap", gap: "12px",
      }}>
        {/* Title */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#8950fc">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main,#1a1a1a)" }}>
              Dashboard
            </h2>
          </div>
          <p style={{ margin: "2px 0 0 30px", fontSize: "0.75rem", color: "var(--text-muted,#888)" }}>
            Monitor key metrics and performance
          </p>
        </div>

        {/* Controls: shop selector + period pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>

          {/* Shop dropdown */}
          {shops.length > 0 && (
            <div style={{ position: "relative" }}>
              <select
                value={activeShop}
                onChange={e => setActiveShop(e.target.value === "global" ? "global" : Number(e.target.value))}
                style={{
                  appearance: "none", padding: "5px 28px 5px 28px",
                  borderRadius: "8px", border: "1px solid var(--border-color,#ddd)",
                  background: "var(--card-bg,#fff)", fontSize: "0.78rem", fontWeight: 600,
                  color: "var(--text-main,#1a1a1a)", cursor: "pointer", minWidth: "130px",
                }}
              >
                <option value="global">All stores</option>
                {shops.map(s => (
                  <option key={s.id} value={s.id}>{s.boutique_name ?? s.name}</option>
                ))}
              </select>
              {/* Shopify bag icon */}
              <span style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#96bf48" strokeWidth="2.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </span>
              {/* Chevron */}
              <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted,#888)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </span>
            </div>
          )}

          {/* Period pills — compact sizing */}
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            {PERIOD_PILLS.map(pill => {
              const isActive = period === pill.value;
              return (
                <button key={pill.value}
                  onClick={() => { setPeriod(pill.value); setShowMore(false); }}
                  style={{
                    padding: "5px 11px", borderRadius: "7px", border: "1px solid",
                    borderColor: isActive ? "var(--text-main,#1a1a1a)" : "transparent",
                    background: isActive ? "var(--card-bg,#fff)" : "none",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.78rem",
                    color: isActive ? "var(--text-main,#1a1a1a)" : "var(--text-muted,#888)",
                    cursor: "pointer",
                  }}
                >
                  {pill.label}
                </button>
              );
            })}

            {/* More button */}
            <div ref={moreRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowMore(v => !v)}
                style={{
                  maxWidth: "220px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "5px 11px", borderRadius: "7px",
                  border: `1px solid ${isMoreActive ? "var(--text-main,#1a1a1a)" : "var(--border-color,#ddd)"}`,
                  background: "var(--card-bg,#fff)",
                  fontWeight: isMoreActive ? 700 : 500,
                  fontSize: "0.78rem",
                  color: isMoreActive ? "var(--text-main,#1a1a1a)" : "var(--text-muted,#888)",
                  cursor: "pointer",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {isMoreActive ? activePillLabel() : "More"}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showMore && (
                <CalendarPicker
                  onApply={(v) => setPeriod(v)}
                  onClose={() => setShowMore(false)}
                />
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <span style={{ fontSize: "0.72rem", color: "var(--danger,#e74c3c)", display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {error}
            </span>
          )}
        </div>
      </div>

      {/* ── KPI row ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "12px",
        marginBottom: "16px",
      }}>
        <KpiCard loading={loading}
          bgColor="#e8f0fe"
          title="Total orders"
          value={activeStats.total}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4285f4" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          }
        />
        <KpiCard loading={loading}
          bgColor="#e6f9f0"
          title="Confirmed"
          value={activeStats.confirmed}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1db954" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
        />
        <KpiCard loading={loading}
          bgColor="#fff8e6"
          title="Pending"
          value={activeStats.pending}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0a500" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <KpiCard loading={loading}
          bgColor="#fdecea"
          title="Cancelled"
          value={activeStats.cancelled}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          }
        />
        <KpiCard loading={loading}
          bgColor="#f3f3f3"
          title="Avg confirm time"
          value={fmtTime(activeStats.avg_confirmation_time) ?? "—"}
          sub={fmtTime(activeStats.avg_confirmation_time) === null ? "No data" : null}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
      </div>

      {/* ── Row 2: Revenue · Delivery Rate · Confirmation Rate ──────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px",
        marginBottom: "24px",
      }}>

        {/* Revenue */}
        <div style={{
          background: "var(--card-bg,#fff)", border: "1px solid var(--border-color,#eee)",
          borderRadius: "12px", padding: "18px 20px",
          display: "flex", flexDirection: "column",
        }}>
          {/* Header row: icon + title/subtitle + growth badge */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px", background: "#ede7f6",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8950fc" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-main,#1a1a1a)", lineHeight: 1.2 }}>Revenue</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted,#888)", marginTop: "2px" }}>From confirmed orders</div>
            </div>
            {/* Growth badge — top-right */}
            <span style={{
              fontSize: "0.72rem", fontWeight: 700, padding: "3px 8px", borderRadius: "20px",
              background: activeStats.revenue_growth >= 0 ? "#e6f9f0" : "#fdecea",
              color: activeStats.revenue_growth >= 0 ? "#1db954" : "#e53935",
              flexShrink: 0,
            }}>
              {loading ? "…" : fmtGrowth(activeStats.revenue_growth)}
            </span>
          </div>
          {/* Revenue value */}
          <div style={{ fontSize: "1.85rem", fontWeight: 700, color: "var(--text-main,#1a1a1a)", lineHeight: 1 }}>
            {loading ? (
              <div style={{ height: "32px", width: "120px", background: "var(--border-color,#eee)", borderRadius: "6px" }} />
            ) : fmt(activeStats.revenue)}
          </div>
        </div>

        {/* Delivery Rate — larger donut + legend */}
        <div style={{
          background: "var(--card-bg,#fff)", border: "1px solid var(--border-color,#eee)",
          borderRadius: "12px", padding: "18px 20px",
          display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px", background: "#e8f0fe",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4285f4" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <path d="M16 8h4l3 5v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-main,#1a1a1a)" }}>Delivery Rate</span>
          </div>
          {/* Donut */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {loading
                ? <div style={{ width: "120px", height: "120px", borderRadius: "50%", border: "10px solid var(--border-color,#eee)" }} />
                : <DonutChart percent={deliveryRate} color="#4285f4" />
              }
              {/* Centered percentage label */}
              <span style={{
                position: "absolute", fontSize: "1.1rem", fontWeight: 700,
                color: "var(--text-main,#1a1a1a)",
              }}>
                {loading ? "" : `${deliveryRate}%`}
              </span>
            </div>
          </div>
          {/* Legend: Delivered · Not Delivered */}
          {!loading && (
            <DonutLegend items={[
              { color: "#4285f4", label: "Delivered", value: activeStats.delivered },
              { color: "var(--border-color,#e0e0e0)", label: "Not Delivered", value: activeStats.total - activeStats.delivered },
            ]} />
          )}
        </div>

        {/* Confirmation Rate — larger donut + legend */}
        <div style={{
          background: "var(--card-bg,#fff)", border: "1px solid var(--border-color,#eee)",
          borderRadius: "12px", padding: "18px 20px",
          display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px", background: "#e6f9f0",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1db954" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-main,#1a1a1a)" }}>Confirmation Rate</span>
          </div>
          {/* Donut */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {loading
                ? <div style={{ width: "120px", height: "120px", borderRadius: "50%", border: "10px solid var(--border-color,#eee)" }} />
                : <DonutChart percent={confirmationRate} color="#1db954" />
              }
              {/* Centered percentage label */}
              <span style={{
                position: "absolute", fontSize: "1.1rem", fontWeight: 700,
                color: "var(--text-main,#1a1a1a)",
              }}>
                {loading ? "" : `${confirmationRate}%`}
              </span>
            </div>
          </div>
          {/* Legend: Confirmed · Other (pending + cancelled = not yet confirmed) */}
          {!loading && (
            <DonutLegend items={[
              { color: "#1db954", label: "Confirmed", value: activeStats.confirmed },
              { color: "var(--border-color,#e0e0e0)", label: "Other", value: activeStats.total - activeStats.confirmed },
            ]} />
          )}
        </div>
      </div>
    </div>
  );
}