import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/axios";

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  total: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  confirmed: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  cancelled: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  pending: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  rate: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )
};

const getStatusStyle = (s) => {
  switch (s) {
    case "confirmed": case "delivered": return { bg: "rgba(80,205,137,0.1)",  text: "#50cd89" };
    case "cancelled": case "returned":  return { bg: "rgba(241,65,108,0.1)",  text: "#f1416c" };
    case "processing": case "shipped":  return { bg: "rgba(0,163,255,0.1)",   text: "#00a3ff" };
    default:                            return { bg: "rgba(255,199,0,0.1)",    text: "#ffc700" };
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgentOrders() {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const location = useLocation();

  const isAbandonedPage = location.pathname.includes("abandonnees");
  const currencySymbol = "DA";

  // Agent's assigned products (from user context, set by admin)
  const agentProducts = user?.products || [];

  // ── State ──────────────────────────────────────────────────────────────────
  const [orders, setOrders]       = useState([]);
  const [metrics, setMetrics]     = useState({ total_orders: 0, confirmed: 0, cancelled: 0, pending: 0, confirmation_rate: "0%" });
  const [loading, setLoading]     = useState(true);
  const [message, setMessage]     = useState(null);

  // Filters
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [periodFilter, setPeriodFilter]   = useState("all");

  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        type: isAbandonedPage ? "abandoned" : "all",
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined
      };
      const res = await api.get("/orders", { params });
      setOrders(res.data.orders || []);
      setMetrics(res.data.metrics || { total_orders: 0, confirmed: 0, cancelled: 0, pending: 0, confirmation_rate: "0%" });
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [location.pathname, search, statusFilter]);

  // ── Actions ─────────────────────────────────────────────────────────────── 
  // Agents can only update status (confirm / cancel), not assign
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(res.data.order);
      fetchOrders();
      showToast("Statut mis à jour avec succès.");
    } catch (err) {
      console.error(err);
      alert("Erreur de mise à jour du statut.");
    }
  };

  const showToast = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // ── Frontend filtering ─────────────────────────────────────────────────────
  const filteredOrders = orders.filter(order => {
    // Only show orders containing at least one of the agent's assigned products
    if (agentProducts.length > 0) {
      const hasProduct = order.items?.some(item => agentProducts.some(p => p.id === item.product_id));
      if (!hasProduct) return false;
    }

    if (productFilter !== "all" && !order.items?.some(i => i.product_id === parseInt(productFilter))) return false;

    if (periodFilter !== "all") {
      const orderDate = new Date(order.created_at);
      const today = new Date();
      if (periodFilter === "today")     return orderDate.toDateString() === today.toDateString();
      if (periodFilter === "yesterday") { const y = new Date(); y.setDate(today.getDate() - 1); return orderDate.toDateString() === y.toDateString(); }
      if (periodFilter === "this_week") { const w = new Date(); w.setDate(today.getDate() - 7); return orderDate >= w; }
    }
    return true;
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ color: "var(--text-main)", minHeight: "100%", paddingBottom: "40px" }}>

      {/* Toast */}
      {message && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 10000,
          background: message.type === "success" ? "var(--success)" : "var(--danger)",
          color: "white", padding: "12px 24px", borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)", fontWeight: "600"
        }}>{message.text}</div>
      )}

      {/* ── Page Header ── */}
      <div className="page-header" style={{ marginBottom: "20px" }}>
        <div>
          <h2 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg style={{ width: "24px", height: "24px", color: "var(--purple)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {isAbandonedPage ? "Abandoned Orders" : "Orders"}
            <span style={{ fontSize: "0.65rem", padding: "2px 8px", background: "rgba(137,80,252,0.1)", color: "var(--purple)", borderRadius: "4px", fontWeight: "700" }}>• just now</span>
          </h2>
          <p className="page-subtitle">
            {agentProducts.length > 0
              ? `Showing orders for: ${agentProducts.map(p => p.name).join(", ")}`
              : "Showing all assigned orders"}
          </p>
        </div>

        {/* Period Tabs */}
        <div style={{ display: "flex", background: "var(--border-color)", padding: "2px", borderRadius: "8px", gap: "2px" }}>
          {["all", "today", "yesterday", "this_week"].map(period => {
            const labels = { all: "All", today: "Today", yesterday: "Yesterday", this_week: "This week" };
            const isActive = periodFilter === period;
            return (
              <button key={period} onClick={() => setPeriodFilter(period)} style={{
                padding: "6px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600",
                background: isActive ? "var(--bg-card)" : "transparent",
                color: isActive ? "var(--text-main)" : "var(--text-muted)",
                border: "none", cursor: "pointer", transition: "all 0.2s"
              }} className={isActive ? "" : "date-tab-hover"}>{labels[period]}</button>
            );
          })}
        </div>
      </div>

      {/* ── Metrics Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px", marginBottom: "22px" }}>
        {[
          { label: "TOTAL ORDERS",      value: metrics.total_orders,      icon: Icons.total,     color: "#7239ea" },
          { label: "CONFIRMED",         value: metrics.confirmed,         icon: Icons.confirmed, color: "#50cd89" },
          { label: "CANCELLED",         value: metrics.cancelled,         icon: Icons.cancelled, color: "#f1416c" },
          { label: "PENDING",           value: metrics.pending,           icon: Icons.pending,   color: "#ffc700" },
          { label: "CONFIRMATION RATE", value: metrics.confirmation_rate, icon: Icons.rate,      color: "#00a3ff" },
        ].map((card, i) => (
          <div key={i} style={{
            background: "var(--bg-card)", border: "1px solid var(--border-color)",
            borderRadius: "12px", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "8px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: "0.62rem", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.5px" }}>{card.label}</span>
              <span style={{ color: card.color }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)" }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar (simplified — no agent/source filters for staff) ── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "18px", flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
            style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.8rem", outline: "none" }} />
        </div>

        {/* Status filter */}
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { value: "all",       label: "All",       color: "#7239ea" },
            { value: "pending",   label: "Pending",   color: "#ffc700" },
            { value: "confirmed", label: "Confirmed", color: "#50cd89" },
            { value: "cancelled", label: "Cancelled", color: "#f1416c" },
          ].map(s => (
            <button key={s.value} onClick={() => setStatusFilter(s.value)} style={{
              padding: "7px 14px", borderRadius: "7px", fontSize: "0.77rem", fontWeight: "600",
              background: statusFilter === s.value ? `${s.color}20` : "var(--bg-app)",
              color: statusFilter === s.value ? s.color : "var(--text-muted)",
              border: statusFilter === s.value ? `1px solid ${s.color}40` : "1px solid var(--border-color)",
              cursor: "pointer", transition: "all 0.2s"
            }}>{s.label}</button>
          ))}
        </div>

        {/* Product filter — only show agent's assigned products */}
        {agentProducts.length > 0 && (
          <select value={productFilter} onChange={e => setProductFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.8rem", outline: "none", cursor: "pointer" }}>
            <option value="all">Tous les produits</option>
            {agentProducts.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
          </select>
        )}
      </div>

      {/* ── Orders Table ── */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div style={{ border: "3px solid var(--border-color)", borderTop: "3px solid var(--purple)", borderRadius: "50%", width: "32px", height: "32px", animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", textAlign: "center" }}>
          <svg style={{ width: "56px", height: "56px", marginBottom: "16px", opacity: 0.12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
          </svg>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", fontWeight: "500" }}>
            {agentProducts.length > 0
              ? "No orders found for your assigned products."
              : "No store connected — connect your Shopify store to start managing orders"}
          </p>
        </div>
      ) : (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(255,255,255,0.02)" }}>
                {["ORDER", "CLIENT", "ARTICLES", "TOTAL", "STATUS", "DATE", "ACTION"].map(h => (
                  <th key={h} style={{ padding: "14px 18px", fontWeight: "600", color: "var(--text-muted)", fontSize: "0.72rem", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const statusStyle = getStatusStyle(order.status);
                const isPaid = order.financial_status === "paid";
                return (
                  <tr key={order.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "background 0.2s" }} className="table-row-hover">
                    <style>{`.table-row-hover:hover { background: rgba(255,255,255,0.01); }`}</style>

                    {/* Order # */}
                    <td style={{ padding: "14px 18px", fontWeight: "700" }}>
                      <span onClick={() => setSelectedOrder(order)} style={{ color: "var(--purple)", cursor: "pointer", textDecoration: "underline" }}>{order.order_number}</span>
                    </td>

                    {/* Client */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "600" }}>{order.client?.name || order.customer_name || "—"}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "2px" }}>{order.client?.phone || order.customer_phone || "—"}</div>
                    </td>

                    {/* Items */}
                    <td style={{ padding: "14px 18px" }}>
                      {order.items?.length > 0 ? order.items.map((item, idx) => (
                        <div key={idx} style={{ fontSize: "0.78rem", marginBottom: "3px" }}>
                          {item.product_name} <span style={{ color: "var(--purple)", fontWeight: "700" }}>×{item.quantity}</span>
                        </div>
                      )) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>

                    {/* Total */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "700" }}>{order.total_price} {order.currency || currencySymbol}</div>
                      <span style={{ display: "inline-block", fontSize: "0.62rem", padding: "1px 6px", borderRadius: "4px", background: isPaid ? "rgba(27,197,189,0.1)" : "rgba(246,78,96,0.1)", color: isPaid ? "var(--success)" : "var(--danger)", marginTop: "3px", fontWeight: "700" }}>
                        {(order.financial_status || "UNPAID").toUpperCase()}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ display: "inline-block", padding: "5px 10px", borderRadius: "6px", background: statusStyle.bg, color: statusStyle.text, fontSize: "0.72rem", fontWeight: "700" }}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ padding: "14px 18px", color: "var(--text-muted)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                      {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>

                    {/* Actions — agents can only confirm/cancel/view, NO assign */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => setSelectedOrder(order)} style={{ padding: "5px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "600", background: "rgba(255,255,255,0.05)", color: "var(--text-main)", border: "1px solid var(--border-color)", cursor: "pointer" }}>View</button>
                        {order.status === "pending" && (
                          <button onClick={() => handleUpdateStatus(order.id, "confirmed")} style={{ padding: "5px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700", background: "rgba(80,205,137,0.1)", color: "#50cd89", border: "none", cursor: "pointer" }}>Confirm</button>
                        )}
                        {order.status === "pending" && (
                          <button onClick={() => handleUpdateStatus(order.id, "cancelled")} style={{ padding: "5px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700", background: "rgba(241,65,108,0.1)", color: "#f1416c", border: "none", cursor: "pointer" }}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Order Detail Modal (read-only for agent — no assign, limited status) ── */}
      {selectedOrder && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "20px" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", width: "100%", maxWidth: "580px", padding: "26px", boxShadow: "0 12px 40px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Order — <span style={{ color: "var(--purple)" }}>{selectedOrder.order_number}</span></h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: "transparent", color: "var(--text-muted)", fontSize: "1.2rem", border: "none", cursor: "pointer" }}>✕</button>
            </div>

            {/* Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
              <div>
                <strong style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Client</strong>
                <p style={{ fontWeight: "700", marginTop: "4px" }}>{selectedOrder.client?.name || selectedOrder.customer_name}</p>
                <p style={{ color: "var(--text-muted)", marginTop: "2px", fontSize: "0.8rem" }}>{selectedOrder.client?.phone || selectedOrder.customer_phone || "—"}</p>
              </div>
              <div>
                <strong style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Assigned Agent</strong>
                {/* Agent sees their own name, read-only */}
                <p style={{ fontWeight: "600", marginTop: "4px" }}>{selectedOrder.assignedAgent?.name || "Non assigné"}</p>
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: "18px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
              <strong style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>Articles</strong>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "8px", background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: "8px" }}>
                  <div>
                    <strong>{item.product_name}</strong>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "2px" }}>Unit: {item.unit_price} {selectedOrder.currency || currencySymbol}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "700" }}>×{item.quantity}</div>
                    <div style={{ color: "var(--purple)", fontWeight: "600", marginTop: "2px" }}>{item.total_price} {selectedOrder.currency || currencySymbol}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "0.88rem", fontWeight: "700" }}>
                <span>Total:</span>
                <span style={{ color: "var(--success)" }}>{selectedOrder.total_price} {selectedOrder.currency || currencySymbol}</span>
              </div>
            </div>

            {/* Status update — agents can only confirm/cancel pending orders */}
            <div style={{ marginBottom: "18px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
              <strong style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>Update Status</strong>
              {selectedOrder.status === "pending" ? (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => { handleUpdateStatus(selectedOrder.id, "confirmed"); }} style={{
                    flex: 1, padding: "10px", borderRadius: "8px", fontWeight: "700", fontSize: "0.85rem",
                    background: "rgba(80,205,137,0.1)", color: "#50cd89", border: "1px solid rgba(80,205,137,0.2)", cursor: "pointer"
                  }}>✓ Confirm Order</button>
                  <button onClick={() => { handleUpdateStatus(selectedOrder.id, "cancelled"); }} style={{
                    flex: 1, padding: "10px", borderRadius: "8px", fontWeight: "700", fontSize: "0.85rem",
                    background: "rgba(241,65,108,0.1)", color: "#f1416c", border: "1px solid rgba(241,65,108,0.2)", cursor: "pointer"
                  }}>✕ Cancel Order</button>
                </div>
              ) : (
                <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    Current status: <strong style={{ color: getStatusStyle(selectedOrder.status).text }}>{selectedOrder.status.toUpperCase()}</strong>
                    {" "} — only pending orders can be updated.
                  </span>
                </div>
              )}
            </div>

            {/* History — read-only */}
            <div>
              <strong style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>Action History</strong>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "140px", overflowY: "auto" }}>
                {selectedOrder.histories?.length > 0 ? selectedOrder.histories.map((h, i) => (
                  <div key={i} style={{ fontSize: "0.72rem", borderLeft: "2px solid var(--purple)", paddingLeft: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: "2px" }}>
                      <span>{h.user?.name || "System"}</span>
                      <span>{new Date(h.created_at).toLocaleString()}</span>
                    </div>
                    <p style={{ color: "var(--text-main)", fontWeight: "500" }}>{h.description}</p>
                  </div>
                )) : <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.77rem" }}>Aucun historique.</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}