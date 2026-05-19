import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/axios";

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
    total: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    confirmed: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    cancelled: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
    pending: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    rate: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    )
};

const getStatusStyle = (s) => {
    switch (s) {
        case "confirmed": case "delivered": return { bg: "rgba(80,205,137,0.1)", text: "#50cd89" };
        case "cancelled": case "returned": return { bg: "rgba(241,65,108,0.1)", text: "#f1416c" };
        case "processing": case "shipped": return { bg: "rgba(0,163,255,0.1)", text: "#00a3ff" };
        default: return { bg: "rgba(255,199,0,0.1)", text: "#ffc700" };
    }
};

// ─── Custom Dropdown ──────────────────────────────────────────────────────────
function CustomSelect({ id, value, onChange, options, placeholder, openDropdown, setOpenDropdown }) {
    const isOpen = openDropdown === id;
    const selected = options.find(o => o.value === value);
    return (
        <div className="custom-select-wrapper" style={{ position: "relative" }}>
            <div
                onClick={() => setOpenDropdown(isOpen ? null : id)}
                style={{
                    display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px",
                    borderRadius: "8px", background: "var(--bg-app)",
                    border: isOpen ? "1px solid #7239ea" : "1px solid var(--border-color)",
                    color: "var(--text-main)", fontSize: "0.8rem", cursor: "pointer",
                    userSelect: "none", transition: "border-color 0.2s", minWidth: "130px"
                }}
            >
                {selected?.icon && <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{selected.icon}</span>}
                {selected?.dot && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: selected.dot, flexShrink: 0 }} />}
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected?.label || placeholder}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>
            {isOpen && (
                <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, minWidth: "200px",
                    background: "#18181b", border: "1px solid rgba(114,57,234,0.4)", borderRadius: "10px",
                    padding: "6px", boxShadow: "0 12px 40px rgba(0,0,0,0.6)", zIndex: 9000,
                    maxHeight: "280px", overflowY: "auto"
                }}>
                    {options.map(opt => (
                        <div key={opt.value} onClick={() => { onChange(opt.value); setOpenDropdown(null); }}
                            style={{
                                display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px",
                                borderRadius: "7px", cursor: "pointer", fontSize: "0.82rem",
                                fontWeight: opt.value === value ? "700" : "500",
                                background: opt.value === value ? "rgba(114,57,234,0.25)" : "transparent",
                                color: opt.value === value ? "#c4a7ff" : "var(--text-main)", transition: "background 0.15s"
                            }}
                            className="custom-select-item-hover"
                        >
                            {opt.icon && <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{opt.icon}</span>}
                            {opt.dot && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: opt.dot, flexShrink: 0 }} />}
                            <span>{opt.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminOrders() {
    const { user } = useContext(AuthContext);
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    const isAbandonedPage = location.pathname.includes("abandonnees");
    const currencySymbol = "DA";

    // ── State ──────────────────────────────────────────────────────────────────
    const [orders, setOrders] = useState([]);
    const [metrics, setMetrics] = useState({ total_orders: 0, confirmed: 0, cancelled: 0, pending: 0, confirmation_rate: "0%" });
    const [activeAgents, setActiveAgents] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [productFilter, setProductFilter] = useState("all");
    const [sourceFilter, setSourceFilter] = useState("all");
    const [fulfillmentFilter, setFulfillmentFilter] = useState("all");
    const [agentFilter, setAgentFilter] = useState("all");
    const [periodFilter, setPeriodFilter] = useState("all");
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);

    // Modals
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newOrder, setNewOrder] = useState({ notes: "", product_id: "", quantity: 1 });

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
            const ordersData = res.data?.orders;
            const metricsData = res.data?.metrics;
            const agentsData = res.data?.active_agents;
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setMetrics(metricsData && typeof metricsData === "object" ? metricsData : { total_orders: 0, confirmed: 0, cancelled: 0, pending: 0, confirmation_rate: "0%" });
            setActiveAgents(Array.isArray(agentsData) ? agentsData : []);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");

            console.log("Products API response:", res.data);

            let list = [];

            if (Array.isArray(res.data)) {
                list = res.data;
            } else if (Array.isArray(res.data.products)) {
                list = res.data.products;
            } else if (Array.isArray(res.data.data)) {
                list = res.data.data;
            }

            setProducts(list);

        } catch (err) {
            console.error("Error fetching products:", err);
            setProducts([]);
        }
    };

    useEffect(() => { fetchOrders(); }, [location.pathname, search, statusFilter]);
    useEffect(() => { fetchProducts(); }, []);

    useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest(".custom-select-wrapper")) setOpenDropdown(null);
            if (!e.target.closest(".more-dropdown-wrapper")) setIsMoreDropdownOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Actions ────────────────────────────────────────────────────────────────
    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (!newOrder.product_id) { alert("Veuillez choisir un produit."); return; }
        try {
            setIsCreating(true);
            const res = await api.post("/orders", {
                notes: newOrder.notes || null,
                is_abandoned: isAbandonedPage,
                items: [{ product_id: parseInt(newOrder.product_id), quantity: parseInt(newOrder.quantity) }]
            });
            showToast(res.data.message, "success");
            setIsCreateModalOpen(false);
            setNewOrder({ notes: "", product_id: "", quantity: 1 });
            fetchOrders();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la création de la commande.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleAssignAgent = async (orderId, agentId) => {
        try {
            const value = agentId === "" ? null : parseInt(agentId);
            const res = await api.post(`/orders/${orderId}/assign`, { assigned_to: value });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, assigned_to: value, assignedAgent: res.data.order.assignedAgent } : o));
            if (selectedOrder?.id === orderId) setSelectedOrder(res.data.order);
            fetchOrders();
        } catch (err) {
            console.error(err);
            alert("Erreur d'attribution.");
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const res = await api.put(`/orders/${orderId}`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder?.id === orderId) setSelectedOrder(res.data.order);
            fetchOrders();
        } catch (err) {
            console.error(err);
            alert("Erreur de mise à jour du statut.");
        }
    };

    const showToast = (text, type = "success") => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 5000);
    };

    // ── Frontend filtering ─────────────────────────────────────────────────────
    const filteredOrders = orders.filter(order => {
        if (productFilter !== "all" && !order.items?.some(i => i.product_id === parseInt(productFilter))) return false;
        if (agentFilter !== "all" && String(order.assigned_to) !== agentFilter) return false;
        if (sourceFilter !== "all") {
            const shopName = (order.shop?.name || "").toLowerCase();
            if (!shopName.includes(sourceFilter.toLowerCase())) return false;
        }
        if (periodFilter !== "all") {
            const orderDate = new Date(order.created_at);
            const today = new Date();
            if (periodFilter === "today") return orderDate.toDateString() === today.toDateString();
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
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        {isAbandonedPage ? "Abandoned Orders" : "Orders"}
                        <span style={{ fontSize: "0.65rem", padding: "2px 8px", background: "rgba(137,80,252,0.1)", color: "var(--purple)", borderRadius: "4px", fontWeight: "700" }}>• just now</span>
                    </h2>
                    <p className="page-subtitle">Manage, assign, and track all orders</p>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
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
                        <div className="more-dropdown-wrapper" style={{ position: "relative" }}>
                            <button onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)} style={{
                                padding: "6px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600",
                                background: "transparent", color: "var(--text-muted)", border: "none", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: "4px"
                            }}>
                                More <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                            </button>
                            {isMoreDropdownOpen && (
                                <div style={{
                                    position: "absolute", top: "100%", right: 0, backgroundColor: "#18181b",
                                    border: "1px solid var(--border-color)", borderRadius: "8px", padding: "4px",
                                    minWidth: "160px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", zIndex: 1000
                                }}>
                                    <button onClick={() => { setPeriodFilter("all"); setIsMoreDropdownOpen(false); }} style={{ padding: "8px 12px", background: "none", border: "none", color: "var(--text-main)", fontSize: "0.75rem", textAlign: "left", cursor: "pointer", borderRadius: "6px", width: "100%" }} className="dropdown-item-hover">Clear Filter</button>
                                    <button onClick={() => { navigate(isAbandonedPage ? "/commandes/toutes" : "/commandes/abandonnees"); setIsMoreDropdownOpen(false); }} style={{ padding: "8px 12px", background: "none", border: "none", color: "var(--text-main)", fontSize: "0.75rem", textAlign: "left", cursor: "pointer", borderRadius: "6px", width: "100%" }} className="dropdown-item-hover">
                                        {isAbandonedPage ? "All Orders" : "Abandoned Orders"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* New Order Button */}
                    <button onClick={() => setIsCreateModalOpen(true)} style={{
                        display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px",
                        background: "var(--purple)", color: "white", borderRadius: "8px",
                        fontSize: "0.85rem", fontWeight: "700", border: "none", cursor: "pointer"
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        New Order
                    </button>
                </div>
            </div>

            {/* ── Metrics Cards ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "TOTAL ORDERS", value: metrics.total_orders, icon: Icons.total, color: "#7239ea", sub: `${metrics.total_orders > 0 ? metrics.total_orders : 0} today` },
                    { label: "CONFIRMED", value: metrics.confirmed, icon: Icons.confirmed, color: "#50cd89", sub: `${metrics.total_orders > 0 ? Math.round((metrics.confirmed / metrics.total_orders) * 100) : 0}% rate` },
                    { label: "CANCELLED", value: metrics.cancelled, icon: Icons.cancelled, color: "#f1416c", sub: `${metrics.total_orders > 0 ? Math.round((metrics.cancelled / metrics.total_orders) * 100) : 0}% rate` },
                    { label: "PENDING", value: metrics.pending, icon: Icons.pending, color: "#ffc700", sub: "awaiting action" },
                    { label: "CONFIRMATION RATE", value: metrics.confirmation_rate, icon: Icons.rate, color: "#00a3ff", sub: "overall rate" },
                ].map((card, i) => (
                    <div key={i} style={{
                        background: "var(--bg-card)", border: "1px solid var(--border-color)",
                        borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "8px"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.5px" }}>{card.label}</span>
                            <span style={{ color: card.color }}>{card.icon}</span>
                        </div>
                        <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-main)" }}>{card.value}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{card.sub}</div>
                    </div>
                ))}
            </div>

            {/* ── Filter Bar ── */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
                        style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.8rem", outline: "none" }} />
                </div>

                {/* Source */}
                <CustomSelect id="source" value={sourceFilter} onChange={setSourceFilter} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} placeholder="All Sources"
                    options={[
                        { value: "all", label: "All Sources", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#7239ea"><circle cx="12" cy="12" r="10" /></svg> },
                        { value: "shopify", label: "Shopify", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#95bf47"><path d="M15.7 4.5s-.1-.5-.5-.5h-1.1c0-.1-.5-1.4-2-1.4-.1 0-.2 0-.3.1-.4-.5-.9-.8-1.4-.8-3.5 0-5.2 4.4-5.7 6.6L3 9.3l3.5 1.1 1.1-3.5c.3-.1.5-.2.8-.2.6 0 1 .4 1.3 1v.1L8.5 12l1.8.6 1.8-5.5L14 9l1.7-4.5z" /></svg> },
                        { value: "sheets", label: "Google Sheets", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#0f9d58"><rect x="3" y="3" width="18" height="18" rx="2" /></svg> },
                    ]}
                />

                {/* Status */}
                <CustomSelect id="status" value={statusFilter} onChange={setStatusFilter} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} placeholder="All Status"
                    options={[
                        { value: "all", label: "All Status", dot: "#7239ea" },
                        { value: "pending", label: "Pending", dot: "#ffc700" },
                        { value: "confirmed", label: "Confirmed", dot: "#50cd89" },
                        { value: "processing", label: "Processing", dot: "#00a3ff" },
                        { value: "shipped", label: "Shipped", dot: "#00a3ff" },
                        { value: "delivered", label: "Delivered", dot: "#50cd89" },
                        { value: "cancelled", label: "Cancelled", dot: "#f1416c" },
                        { value: "returned", label: "Returned", dot: "#f1416c" },
                    ]}
                />

                {/* Agent Filter (Admin exclusive) */}
                <CustomSelect id="agent" value={agentFilter} onChange={setAgentFilter} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} placeholder="Tous les agents"
                    options={[
                        { value: "all", label: "Tous les agents", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7239ea" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg> },
                        ...(Array.isArray(activeAgents) ? activeAgents : []).map(a => ({ value: String(a.id), label: a.name, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7239ea" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> }))
                    ]}
                />

                {/* Products */}
                <CustomSelect id="product" value={productFilter} onChange={setProductFilter} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} placeholder="Tous les produits"
                    options={[
                        { value: "all", label: "Tous les produits", icon: "📦" },
                        ...(Array.isArray(products) ? products : []).map(p => ({ value: String(p.id), label: p.name, icon: "🛍️" }))
                    ]}
                />
            </div>

            {/* ── Orders Table ── */}
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                    <div style={{ border: "3px solid var(--border-color)", borderTop: "3px solid var(--purple)", borderRadius: "50%", width: "32px", height: "32px", animation: "spin 1s linear infinite" }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", textAlign: "center" }}>
                    <svg style={{ width: "64px", height: "64px", marginBottom: "20px", opacity: 0.15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                    <p style={{ color: "var(--text-muted)", fontSize: "1rem", fontWeight: "500" }}>No orders found — create a new order to start</p>
                </div>
            ) : (
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(255,255,255,0.02)" }}>
                                {["ORDER", "CLIENT", "ARTICLES", "TOTAL", "STATUS", "AGENT", "TRACKING", "DATE", "ACTION"].map(h => (
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
                                        <style>{`.table-row-hover:hover { background: rgba(255,255,255,0.01); } .custom-select-item-hover:hover { background: rgba(114,57,234,0.15) !important; }`}</style>

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
                                                    {item.product_name} <span style={{ color: "var(--purple)", fontWeight: "700" }}>x{item.quantity}</span>
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

                                        {/* Agent — Admin can assign inline */}
                                        <td style={{ padding: "14px 18px" }}>
                                            <select value={order.assigned_to || ""} onChange={e => handleAssignAgent(order.id, e.target.value)}
                                                style={{ padding: "6px 10px", borderRadius: "6px", background: "var(--bg-app)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.78rem", outline: "none", cursor: "pointer" }}>
                                                <option value="">Non assigné</option>
                                                {(Array.isArray(activeAgents) ? activeAgents : []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            </select>
                                        </td>

                                        {/* Tracking */}
                                        <td style={{ padding: "14px 18px", color: "var(--text-muted)", fontSize: "0.78rem" }}>—</td>

                                        {/* Date */}
                                        <td style={{ padding: "14px 18px", color: "var(--text-muted)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                                            {new Date(order.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                                        </td>

                                        {/* Actions */}
                                        <td style={{ padding: "14px 18px" }}>
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                <button onClick={() => setSelectedOrder(order)} style={{ padding: "5px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "600", background: "rgba(255,255,255,0.05)", color: "var(--text-main)", border: "1px solid var(--border-color)", cursor: "pointer" }}>View</button>
                                                {order.status === "pending" && (
                                                    <button onClick={() => handleUpdateStatus(order.id, "confirmed")} style={{ padding: "5px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700", background: "rgba(80,205,137,0.1)", color: "#50cd89", border: "none", cursor: "pointer" }}>Confirm</button>
                                                )}
                                                {order.status === "confirmed" && (
                                                    <button onClick={() => handleUpdateStatus(order.id, "delivered")} style={{ padding: "5px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700", background: "rgba(0,163,255,0.1)", color: "#00a3ff", border: "none", cursor: "pointer" }}>Deliver</button>
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

            {/* ── Create Order Modal ── */}
            {isCreateModalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "20px" }}>
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", width: "100%", maxWidth: "480px", padding: "24px", boxShadow: "0 12px 40px rgba(0,0,0,0.5)", animation: "modalIn 0.2s ease-out" }}>
                        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Créer une Nouvelle Commande</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ background: "transparent", color: "var(--text-muted)", fontSize: "1.2rem", border: "none", cursor: "pointer" }}>✕</button>
                        </div>
                        <form onSubmit={handleCreateOrder} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <div style={{ flex: 2 }}>
                                    <label className="form-label">Produit commandé</label>
                                    <select required className="form-input" value={newOrder.product_id} onChange={e => setNewOrder({ ...newOrder, product_id: e.target.value })}>
                                        <option value="">Choisir un produit...</option>
                                        {(Array.isArray(products) ? products : []).map(p => <option key={p.id} value={p.id}>{p.name} ({p.price} {currencySymbol})</option>)}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Quantité</label>
                                    <input type="number" min="1" required className="form-input" value={newOrder.quantity} onChange={e => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Notes</label>
                                <textarea className="form-input" placeholder="Notes complémentaires..." value={newOrder.notes} onChange={e => setNewOrder({ ...newOrder, notes: e.target.value })} style={{ height: "80px", resize: "none" }} />
                            </div>
                            <button type="submit" disabled={isCreating} className="btn btn-primary" style={{ background: "var(--purple)", marginTop: "6px" }}>
                                {isCreating ? "Création..." : "Enregistrer la commande"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Order Detail Modal ── */}
            {selectedOrder && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "20px" }}>
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", width: "100%", maxWidth: "620px", padding: "28px", boxShadow: "0 12px 40px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
                            <h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>Order Details — <span style={{ color: "var(--purple)" }}>{selectedOrder.order_number}</span></h3>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: "transparent", color: "var(--text-muted)", fontSize: "1.2rem", border: "none", cursor: "pointer" }}>✕</button>
                        </div>

                        {/* Info grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
                            <div>
                                <strong style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Client</strong>
                                <p style={{ fontWeight: "700", marginTop: "4px" }}>{selectedOrder.client?.name || selectedOrder.customer_name}</p>
                                <p style={{ color: "var(--text-muted)", marginTop: "2px", fontSize: "0.82rem" }}>{selectedOrder.client?.phone || selectedOrder.customer_phone || "Aucun téléphone"}</p>
                            </div>
                            <div>
                                <strong style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Shop</strong>
                                <p style={{ fontWeight: "600", marginTop: "4px" }}>{selectedOrder.shop?.name || "—"}</p>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "2px" }}>{selectedOrder.shop?.url || ""}</p>
                            </div>
                        </div>

                        {/* Items */}
                        <div style={{ marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
                            <strong style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>Articles</strong>
                            {selectedOrder.items?.map((item, idx) => (
                                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.83rem", marginBottom: "8px", background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: "8px" }}>
                                    <div>
                                        <strong>{item.product_name}</strong>
                                        <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "2px" }}>Unit: {item.unit_price} {selectedOrder.currency || currencySymbol}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontWeight: "700" }}>×{item.quantity}</div>
                                        <div style={{ color: "var(--purple)", fontWeight: "600", marginTop: "2px" }}>{item.total_price} {selectedOrder.currency || currencySymbol}</div>
                                    </div>
                                </div>
                            ))}
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "0.88rem", fontWeight: "700" }}>
                                <span>Total (incl. shipping):</span>
                                <span style={{ color: "var(--success)" }}>{selectedOrder.total_price} {selectedOrder.currency || currencySymbol}</span>
                            </div>
                        </div>

                        {/* Admin controls */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
                            <div>
                                <strong style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Assign Agent</strong>
                                <select value={selectedOrder.assigned_to || ""} onChange={e => handleAssignAgent(selectedOrder.id, e.target.value)}
                                    style={{ padding: "8px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.8rem", outline: "none", width: "100%" }}>
                                    <option value="">Non assigné</option>
                                    {(Array.isArray(activeAgents) ? activeAgents : []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <strong style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Order Status</strong>
                                <select value={selectedOrder.status} onChange={e => handleUpdateStatus(selectedOrder.id, e.target.value)}
                                    style={{ padding: "8px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.8rem", outline: "none", width: "100%" }}>
                                    {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"].map(s => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* History */}
                        <div>
                            <strong style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>Action History</strong>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "160px", overflowY: "auto" }}>
                                {selectedOrder.histories?.length > 0 ? selectedOrder.histories.map((h, i) => (
                                    <div key={i} style={{ fontSize: "0.73rem", borderLeft: "2px solid var(--purple)", paddingLeft: "10px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: "2px" }}>
                                            <span>{h.user?.name || "System"}</span>
                                            <span>{new Date(h.created_at).toLocaleString()}</span>
                                        </div>
                                        <p style={{ color: "var(--text-main)", fontWeight: "500" }}>{h.description}</p>
                                    </div>
                                )) : <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.78rem" }}>Aucun historique.</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}