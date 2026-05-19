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

// ─── Date Range Picker Component ──────────────────────────────────────────────
function DateRangePicker({ startDate, setStartDate, endDate, setEndDate, onApply, onClear }) {
    const [displayMonth, setDisplayMonth] = useState(new Date());
    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    
    const getDates = (month) => {
        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const days = daysInMonth(month);
        const firstDay = firstDayOfMonth(month);
        const dates = [];
        for (let i = 0; i < firstDay; i++) dates.push(null);
        for (let i = 1; i <= days; i++) dates.push(new Date(year, monthIndex, i));
        return dates;
    };

    const isDateInRange = (d) => {
        if (!d || !startDate || !endDate) return false;
        return d >= startDate && d <= endDate;
    };
    const isDateStart = (d) => d && startDate && d.toDateString() === startDate.toDateString();
    const isDateEnd = (d) => d && endDate && d.toDateString() === endDate.toDateString();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const renderCalendar = (month, isEnd = false) => {
        const dates = getDates(month);
        return (
            <div style={{ minWidth: "200px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <button onClick={() => setDisplayMonth(new Date(month.getFullYear(), month.getMonth() - 1))} style={{ background: "none", border: "none", color: "var(--text-main)", cursor: "pointer", fontSize: "14px" }}>◀</button>
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>{monthNames[month.getMonth()]} {month.getFullYear()}</span>
                    <button onClick={() => setDisplayMonth(new Date(month.getFullYear(), month.getMonth() + 1))} style={{ background: "none", border: "none", color: "var(--text-main)", cursor: "pointer", fontSize: "14px" }}>▶</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "12px" }}>
                    {dayNames.map(d => <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", padding: "4px" }}>{d}</div>)}
                    {dates.map((d, i) => (
                        <button key={i} onClick={() => {
                            if (d) {
                                if (isEnd) setEndDate(d);
                                else setStartDate(d);
                            }
                        }} disabled={!d} style={{
                            padding: "6px", borderRadius: "6px", border: "1px solid transparent", fontSize: "12px",
                            background: isDateStart(d) || isDateEnd(d) ? "#7239ea" : isDateInRange(d) ? "rgba(114, 57, 234, 0.3)" : "transparent",
                            color: isDateStart(d) || isDateEnd(d) ? "white" : "var(--text-main)",
                            cursor: d ? "pointer" : "default", opacity: d ? 1 : 0.3
                        }}>{d?.getDate()}</button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div style={{ background: "#18181b", border: "1px solid rgba(114,57,234,0.4)", borderRadius: "10px", padding: "20px", minWidth: "500px", boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}>
            <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                    <button onClick={() => { const d = new Date(); setStartDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7)); setEndDate(d); }} style={{ flex: 1, padding: "8px", background: "rgba(114,57,234,0.2)", border: "1px solid #7239ea", borderRadius: "6px", color: "#c4a7ff", fontSize: "12px", cursor: "pointer" }}>Last 7 days</button>
                    <button onClick={() => { const d = new Date(); setStartDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 30)); setEndDate(d); }} style={{ flex: 1, padding: "8px", background: "rgba(114,57,234,0.2)", border: "1px solid #7239ea", borderRadius: "6px", color: "#c4a7ff", fontSize: "12px", cursor: "pointer" }}>Last 30 days</button>
                    <button onClick={() => { const d = new Date(); setStartDate(new Date(d.getFullYear(), d.getMonth(), 1)); setEndDate(d); }} style={{ flex: 1, padding: "8px", background: "rgba(114,57,234,0.2)", border: "1px solid #7239ea", borderRadius: "6px", color: "#c4a7ff", fontSize: "12px", cursor: "pointer" }}>This month</button>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => { const d = new Date(); const m = new Date(d.getFullYear(), d.getMonth() - 1, 1); setStartDate(m); setEndDate(new Date(d.getFullYear(), d.getMonth(), 0)); }} style={{ flex: 1, padding: "8px", background: "rgba(114,57,234,0.2)", border: "1px solid #7239ea", borderRadius: "6px", color: "#c4a7ff", fontSize: "12px", cursor: "pointer" }}>Last month</button>
                    <button onClick={() => { const d = new Date(); setStartDate(new Date(d.getFullYear(), d.getMonth() - 3, 1)); setEndDate(d); }} style={{ flex: 1, padding: "8px", background: "rgba(114,57,234,0.2)", border: "1px solid #7239ea", borderRadius: "6px", color: "#c4a7ff", fontSize: "12px", cursor: "pointer" }}>Last 3 months</button>
                </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "16px" }}>
                <div>
                    <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "8px", color: "var(--text-muted)" }}>FROM</div>
                    {renderCalendar(displayMonth, false)}
                </div>
                <div>
                    <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "8px", color: "var(--text-muted)" }}>TO</div>
                    {renderCalendar(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1), true)}
                </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => { onApply(startDate, endDate); }} style={{ flex: 1, padding: "10px", background: "#7239ea", border: "none", borderRadius: "6px", color: "white", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Apply</button>
                <button onClick={() => { onClear(); }} style={{ flex: 1, padding: "10px", background: "transparent", border: "1px solid #7239ea", borderRadius: "6px", color: "#c4a7ff", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Clear</button>
            </div>
        </div>
    );
}

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
    const [periodFilter, setPeriodFilter] = useState("all");
    const [agentFilter, setAgentFilter] = useState("all");
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Modals
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newOrder, setNewOrder] = useState({ notes: "", product_id: "", quantity: 1 });
    const [sidebarTab, setSidebarTab] = useState("details");

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
        if (startDate && endDate) {
            const orderDate = new Date(order.created_at);
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (orderDate < start || orderDate > end) return false;
        }
        return true;
    });

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
                                background: isMoreDropdownOpen ? "rgba(114,57,234,0.2)" : "transparent", 
                                color: isMoreDropdownOpen ? "#c4a7ff" : "var(--text-muted)", 
                                border: isMoreDropdownOpen ? "1px solid #7239ea" : "none", 
                                cursor: "pointer",
                                display: "flex", alignItems: "center", gap: "4px", transition: "all 0.2s"
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                More
                            </button>
                            {isMoreDropdownOpen && (
                                <div style={{ position: "absolute", top: "100%", right: 0, zIndex: 10000, marginTop: "8px" }}>
                                    <DateRangePicker 
                                        startDate={startDate} 
                                        setStartDate={setStartDate}
                                        endDate={endDate}
                                        setEndDate={setEndDate}
                                        onApply={(start, end) => { setIsMoreDropdownOpen(false); }}
                                        onClear={() => { setStartDate(null); setEndDate(null); setPeriodFilter("all"); setIsMoreDropdownOpen(false); }}
                                    />
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
                    { label: "TOTAL ORDERS", value: metrics.total_orders, icon: Icons.total, color: "#7239ea", sub: "0 today" },
                    { label: "CONFIRMED", value: metrics.confirmed, icon: Icons.confirmed, color: "#50cd89", sub: "0% rate" },
                    { label: "CANCELLED", value: metrics.cancelled, icon: Icons.cancelled, color: "#f1416c", sub: "100%" },
                    { label: "FAILED DELIVERY", value: "0", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a11 11 0 0 0-11 11v3H2l3 3-3 3h3v3a11 11 0 0 0 11-11v-3h3l-3-3 3-3h-3v-3a11 11 0 0 0-11-11z" /></svg>, color: "#ff9500", sub: "0% rate" },
                    { label: "DELIVERY RATE", value: metrics.confirmation_rate, icon: Icons.rate, color: "#00a3ff", sub: "0% rate" },
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

                {/* Agent Filter */}
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
                                {["ORDER", "AGENT", "TRACKING", "Client", "City", "Status", "Fulfillment", "Total", "Date"].map(h => (
                                    <th key={h} style={{ padding: "14px 16px", fontWeight: "600", color: "var(--text-muted)", fontSize: "0.72rem", letterSpacing: "0.5px", textAlign: h === "Date" ? "right" : "left" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => {
                                const statusStyle = getStatusStyle(order.status);
                                const fulfillmentStatus = order.fulfillment_status || "unfulfilled";
                                return (
                                    <tr key={order.id} onClick={() => setSelectedOrder(order)} style={{ borderBottom: "1px solid var(--border-color)", transition: "background 0.2s", cursor: "pointer" }} className="table-row-hover">
                                        <td style={{ padding: "14px 16px", fontWeight: "700" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <input type="checkbox" style={{ cursor: "pointer" }} />
                                                <span style={{ color: "var(--purple)", cursor: "pointer" }}>{order.order_number}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                            {order.assignedAgent?.name || "—"}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                            —
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <div style={{ fontWeight: "600" }}>{order.client?.name || order.customer_name || "—"}</div>
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                            {order.client?.city || "—"}
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{ display: "inline-block", padding: "5px 10px", borderRadius: "6px", background: statusStyle.bg, color: statusStyle.text, fontSize: "0.72rem", fontWeight: "700" }}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{ display: "inline-block", padding: "5px 10px", borderRadius: "6px", background: "rgba(255,193,7,0.1)", color: "#ffc107", fontSize: "0.72rem", fontWeight: "700" }}>
                                                {fulfillmentStatus.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 16px", fontWeight: "700" }}>
                                            {order.total_price} {order.currency || currencySymbol}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "right" }}>
                                            {new Date(order.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── CREATE ORDER MODAL ── */}
            {isCreateModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0, 0, 0, 0.7)", display: "flex", justifyContent: "center",
                    alignItems: "center", zIndex: 9999, padding: "20px", backdropFilter: "blur(4px)"
                }} onClick={() => setIsCreateModalOpen(false)}>
                    <div style={{
                        background: "var(--bg-card)", border: "1px solid var(--border-color)",
                        borderRadius: "12px", width: "100%", maxWidth: "460px",
                        boxShadow: "0 24px 60px rgba(0,0,0,0.8)", overflow: "hidden",
                        display: "flex", flexDirection: "column", animation: "modalAppear 0.25s ease"
                    }} onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-color)", background: "rgba(255,255,255,0.01)" }}>
                            <div>
                                <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-main)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                    Create New Order
                                </h3>
                                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "2px 0 0 0" }}>Manually insert order particulars</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>

                        {/* Body / Form */}
                        <form onSubmit={handleCreateOrder} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                            {/* Product Selection */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.5px" }}>Product *</label>
                                <select 
                                    value={newOrder.product_id} 
                                    onChange={e => setNewOrder(p => ({ ...p, product_id: e.target.value }))}
                                    required
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.82rem", outline: "none" }}
                                >
                                    <option value="">Select a product...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Quantity */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.5px" }}>Quantity</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={newOrder.quantity} 
                                    onChange={e => setNewOrder(p => ({ ...p, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.82rem", outline: "none" }}
                                />
                            </div>

                            {/* Internal Notes */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.5px" }}>Internal Notes</label>
                                <textarea 
                                    placeholder="Enter additional details or specifications..." 
                                    value={newOrder.notes} 
                                    onChange={e => setNewOrder(p => ({ ...p, notes: e.target.value }))}
                                    rows="4"
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.82rem", outline: "none", resize: "none", fontFamily: "inherit" }}
                                />
                            </div>

                            {/* Actions Footer Container */}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer" }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={isCreating} style={{ padding: "8px 18px", borderRadius: "8px", background: "var(--purple)", border: "none", color: "white", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                                    {isCreating ? (
                                        <>
                                            <div style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                                            Saving...
                                        </>
                                    ) : "Save Order"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── ORDER DETAIL SIDEBAR ── */}
            {selectedOrder && (
                <>
                    {/* Overlay */}
                    <div
                        onClick={() => setSelectedOrder(null)}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.5)",
                            zIndex: 8000,
                            animation: "fadeIn 0.2s ease"
                        }}
                    />

                    {/* Sidebar */}
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: "100%",
                            maxWidth: "500px",
                            background: "var(--bg-card)",
                            borderLeft: "1px solid var(--border-color)",
                            zIndex: 8001,
                            display: "flex",
                            flexDirection: "column",
                            animation: "slideIn 0.3s ease",
                            overflow: "hidden"
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)", background: "rgba(255,255,255,0.01)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>
                                        {selectedOrder.order_number}
                                    </h3>
                                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                                        {new Date(selectedOrder.created_at).toLocaleDateString()} {new Date(selectedOrder.created_at).toLocaleTimeString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "var(--text-muted)",
                                        cursor: "pointer",
                                        padding: "4px",
                                        display: "flex",
                                        alignItems: "center"
                                    }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            {/* Status Badge */}
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <span
                                    style={{
                                        display: "inline-block",
                                        padding: "6px 12px",
                                        borderRadius: "6px",
                                        background: getStatusStyle(selectedOrder.status).bg,
                                        color: getStatusStyle(selectedOrder.status).text,
                                        fontSize: "0.75rem",
                                        fontWeight: "700"
                                    }}
                                >
                                    ● {selectedOrder.status.toUpperCase()}
                                </span>
                                {selectedOrder.items?.some(i => !i.fulfillment_status || i.fulfillment_status === "unfulfilled") && (
                                    <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: "6px", background: "rgba(255,152,0,0.1)", color: "#ff9800", fontSize: "0.75rem", fontWeight: "700" }}>
                                        ⬤ UNFULFILLED
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", paddingX: "20px" }}>
                            {["details", "history"].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setSidebarTab(tab)}
                                    style={{
                                        flex: 1,
                                        padding: "12px",
                                        background: "none",
                                        border: "none",
                                        borderBottom: sidebarTab === tab ? "2px solid var(--purple)" : "none",
                                        color: sidebarTab === tab ? "var(--text-main)" : "var(--text-muted)",
                                        fontSize: "0.85rem",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {tab === "details" ? "Details" : "History"}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                            {sidebarTab === "details" ? (
                                <>
                                    {/* Customer Info */}
                                    <div style={{ marginBottom: "24px" }}>
                                        <h4 style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase" }}>Customer</h4>
                                        <div style={{ display: "flex", gap: "12px", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
                                            <div
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    borderRadius: "50%",
                                                    background: "var(--purple)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "white",
                                                    fontWeight: "700",
                                                    flexShrink: 0
                                                }}
                                            >
                                                {(selectedOrder.client?.name || selectedOrder.customer_name || "C")[0]?.toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: "600", color: "var(--text-main)", marginBottom: "2px" }}>
                                                    {selectedOrder.client?.name || selectedOrder.customer_name || "Unknown"}
                                                </div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                    {selectedOrder.client?.phone || selectedOrder.customer_phone || "—"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div style={{ marginBottom: "24px" }}>
                                        <h4 style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase" }}>Items ({selectedOrder.items?.length || 0})</h4>
                                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                {selectedOrder.items.map((item, idx) => (
                                                    <div key={idx} style={{ display: "flex", gap: "12px", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
                                                        <div
                                                            style={{
                                                                width: "48px",
                                                                height: "48px",
                                                                borderRadius: "6px",
                                                                background: "rgba(114,57,234,0.1)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                color: "var(--purple)",
                                                                fontSize: "1.2rem",
                                                                flexShrink: 0
                                                            }}
                                                        >
                                                            📦
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontWeight: "600", color: "var(--text-main)", marginBottom: "4px" }}>
                                                                {item.product_name || "Unknown Product"}
                                                            </div>
                                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                                                                SKU: {item.sku || "N/A"}
                                                            </div>
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)" }}>
                                                                    {item.price || 0} {selectedOrder.currency || currencySymbol}
                                                                </span>
                                                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>x{item.quantity || 1}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No items in this order</div>
                                        )}
                                    </div>

                                    {/* Pricing */}
                                    <div style={{ marginBottom: "24px", padding: "16px", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Subtotal</span>
                                            <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{selectedOrder.subtotal || 0} {selectedOrder.currency || currencySymbol}</span>
                                        </div>
                                        {selectedOrder.shipping_cost && (
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Shipping</span>
                                                <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{selectedOrder.shipping_cost} {selectedOrder.currency || currencySymbol}</span>
                                            </div>
                                        )}
                                        {selectedOrder.tax && (
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Tax</span>
                                                <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{selectedOrder.tax} {selectedOrder.currency || currencySymbol}</span>
                                            </div>
                                        )}
                                        <div style={{ borderTop: "1px solid var(--border-color)", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontWeight: "700", color: "var(--text-main)" }}>Total</span>
                                            <span style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "1.1rem" }}>{selectedOrder.total_price} {selectedOrder.currency || currencySymbol}</span>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    {selectedOrder.notes && (
                                        <div>
                                            <h4 style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>Notes</h4>
                                            <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,152,0,0.08)", borderLeft: "3px solid #ff9800" }}>
                                                <p style={{ fontSize: "0.85rem", color: "var(--text-main)", margin: 0 }}>{selectedOrder.notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {selectedOrder.histories?.length > 0 ? selectedOrder.histories.map((h, i) => (
                                        <div key={i} style={{ fontSize: "0.8rem", borderLeft: "2px solid var(--purple)", paddingLeft: "12px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: "4px" }}>
                                                <span>{h.user?.name || "System"}</span>
                                                <span>{new Date(h.created_at).toLocaleString()}</span>
                                            </div>
                                            <p style={{ color: "var(--text-main)", fontWeight: "500", margin: 0 }}>{h.description}</p>
                                        </div>
                                    )) : <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No history available</span>}
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border-color)", background: "rgba(255,255,255,0.01)", display: "flex", gap: "12px" }}>
                            <button
                                onClick={() => handleUpdateStatus(selectedOrder.id, "processing")}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "6px",
                                    background: "var(--purple)",
                                    color: "white",
                                    border: "none",
                                    fontWeight: "600",
                                    fontSize: "0.8rem",
                                    cursor: "pointer",
                                    transition: "opacity 0.2s"
                                }}
                                className="action-btn-hover"
                            >
                                Change Status
                            </button>
                            <button
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "6px",
                                    background: "rgba(255,255,255,0.05)",
                                    color: "var(--text-main)",
                                    border: "1px solid var(--border-color)",
                                    fontWeight: "600",
                                    fontSize: "0.8rem",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                                className="secondary-btn-hover"
                            >
                                Create Parcel
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Consolidate inline styles from the bottom of the component here */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes modalAppear { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes spin { to { transform: rotate(360deg); } }
                .action-btn-hover:hover { opacity: 0.9; }
                .secondary-btn-hover:hover { background: rgba(255,255,255,0.08); }
                .table-row-hover:hover { background: rgba(255,255,255,0.01); cursor: pointer; }
                .custom-select-item-hover:hover { background: rgba(114,57,234,0.15) !important; }
                .date-tab-hover:hover { background: rgba(255,255,255,0.05); }
                .dropdown-item-hover:hover { background: rgba(255,255,255,0.08); }
                .status-row-hover:hover { background: rgba(255,255,255,0.05) !important; }
                .more-option-hover:hover { background: rgba(255,255,255,0.08) !important; }
                .apply-btn-hover:hover { opacity: 0.9; }
                .clear-btn-hover:hover { background: rgba(255,255,255,0.1); }
            `}</style>
        </div>
    );
}