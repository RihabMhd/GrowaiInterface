import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/axios";

// Icons matching the screenshot
const Icons = {
  total: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  confirmed: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  cancelled: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  pending: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  rate: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
};

export default function Orders() {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if viewing abandoned orders based on URL path
  const isAbandonedPage = location.pathname.includes("abandonnees");

  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({
    total_orders: 0,
    confirmed: 0,
    cancelled: 0,
    pending: 0,
    confirmation_rate: "0%"
  });

  const [activeAgents, setActiveAgents] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);

  // Dropdown open states for custom selects
  const [openDropdown, setOpenDropdown] = useState(null); // 'source'|'status'|'fulfillment'|'product'

  // Selection for Order Details Popup
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Modals for Testing
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customer_name: "",
    customer_phone: "",
    notes: "",
    product_id: "",
    quantity: 1
  });

  const [message, setMessage] = useState(null);

  // Fetch all orders & metrics
  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      const params = {
        type: isAbandonedPage ? "abandoned" : "all",
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined
      };
      
      const response = await api.get("/orders", { params });
      setOrders(response.data.orders || []);
      setMetrics(response.data.metrics || {
        total_orders: 0,
        confirmed: 0,
        cancelled: 0,
        pending: 0,
        confirmation_rate: "0%"
      });
      setActiveAgents(response.data.active_agents || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products (for admin order creation choice — agents use their assigned products from user context)
  const fetchProducts = async () => {
    try {
      const response = await api.get("/auth/team");
      setProducts(response.data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // For agent: use their assigned products (from user.products); if none, fall back to all team products
  const isAgent = user?.role === 'staff';
  const agentProducts = user?.products || [];
  // The products shown in the product filter dropdown
  const filterableProducts = isAgent && agentProducts.length > 0 ? agentProducts : products;
  // The products shown in the create order modal
  const creatableProducts = isAgent && agentProducts.length > 0 ? agentProducts : products;

  useEffect(() => {
    fetchOrdersData();
  }, [location.pathname, search, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.custom-select-wrapper')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Handle Quick Order Creation (triggers Auto-Dispatch Round-Robin)
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.customer_name || !newOrder.product_id) {
      alert("Veuillez remplir le nom et choisir un produit.");
      return;
    }
    
    try {
      setIsCreating(true);
      const postData = {
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone || null,
        notes: newOrder.notes || null,
        is_abandoned: isAbandonedPage,
        items: [
          {
            product_id: parseInt(newOrder.product_id),
            quantity: parseInt(newOrder.quantity)
          }
        ]
      };

      const response = await api.post("/orders", postData);
      setMessage({ type: "success", text: response.data.message });
      setIsCreateModalOpen(false);
      setNewOrder({ customer_name: "", customer_phone: "", notes: "", product_id: "", quantity: 1 });
      fetchOrdersData();
      
      // Auto-hide message toast
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création de la commande.");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle manual agent assignment by Admin
  const handleAssignAgent = async (orderId, agentId) => {
    try {
      const value = agentId === "" ? null : parseInt(agentId);
      const response = await api.post(`/orders/${orderId}/assign`, { assigned_to: value });
      
      // Update local orders state
      setOrders(orders.map(o => o.id === orderId ? { ...o, assigned_to: value, assigned_agent: response.data.order.assigned_agent } : o));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(response.data.order);
      }
      
      fetchOrdersData(); // reload metrics
    } catch (err) {
      console.error(err);
      alert("Erreur d'attribution.");
    }
  };

  // Handle order status update (e.g. from pending to confirmed or delivered, which pays commission)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/orders/${orderId}`, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(response.data.order);
      }
      
      fetchOrdersData(); // refresh metrics & balances
    } catch (err) {
      console.error(err);
      alert("Erreur de mise à jour de statut.");
    }
  };

  // Apply frontend products, period & source filtering
  const filteredOrders = orders.filter(order => {
    // 1. Product Filter
    if (productFilter !== "all" && !order.items.some(item => item.product_id === parseInt(productFilter))) {
      return false;
    }
    
    // 2. Source Filter (based on order shop/source)
    if (sourceFilter !== "all") {
      const shopName = (order.shop?.name || "").toLowerCase();
      if (!shopName.includes(sourceFilter.toLowerCase())) return false;
    }
    
    // 3. Period Filter
    if (periodFilter !== "all") {
      const orderDate = new Date(order.created_at);
      const today = new Date();
      
      if (periodFilter === "today") {
        return orderDate.toDateString() === today.toDateString();
      } else if (periodFilter === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        return orderDate.toDateString() === yesterday.toDateString();
      } else if (periodFilter === "this_week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        return orderDate >= oneWeekAgo;
      }
    }
    
    return true;
  });

  // ─── Custom Dropdown Component ─────────────────────────────────────────────
  const CustomSelect = ({ id, value, onChange, options, placeholder }) => {
    const isOpen = openDropdown === id;
    const selected = options.find(o => o.value === value);

    return (
      <div
        className="custom-select-wrapper"
        style={{ position: "relative" }}
      >
        {/* Trigger */}
        <div
          onClick={() => setOpenDropdown(isOpen ? null : id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "var(--bg-app)",
            border: isOpen ? "1px solid #7239ea" : "1px solid var(--border-color)",
            color: "var(--text-main)",
            fontSize: "0.8rem",
            cursor: "pointer",
            userSelect: "none",
            transition: "border-color 0.2s",
            minWidth: "130px"
          }}
        >
          {selected?.icon && <span style={{ display:"flex", alignItems:"center", flexShrink:0 }}>{selected.icon}</span>}
          {selected?.dot && (
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: selected.dot, flexShrink: 0 }} />
          )}
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selected?.label || placeholder}
          </span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>

        {/* Dropdown panel */}
        {isOpen && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            minWidth: "200px",
            background: "#18181b",
            border: "1px solid rgba(114,57,234,0.4)",
            borderRadius: "10px",
            padding: "6px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
            zIndex: 9000,
            maxHeight: "280px",
            overflowY: "auto"
          }}>
            {options.map(opt => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpenDropdown(null); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "7px",
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  fontWeight: opt.value === value ? "700" : "500",
                  background: opt.value === value ? "rgba(114,57,234,0.25)" : "transparent",
                  color: opt.value === value ? "#c4a7ff" : "var(--text-main)",
                  transition: "background 0.15s"
                }}
                className="custom-select-item-hover"
              >
                {opt.icon && <span style={{ display:"flex", alignItems:"center", flexShrink:0 }}>{opt.icon}</span>}
                {opt.dot && (
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: opt.dot, flexShrink: 0 }} />
                )}
                <span>{opt.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const isAdmin = user?.role === "admin";
  const currencySymbol = "DA";

  return (
    <div style={{ color: "var(--text-main)", minHeight: "100%", paddingBottom: "40px" }}>
      
      {/* Toast Notification */}
      {message && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", background: "var(--success)", 
          color: "white", padding: "12px 24px", borderRadius: "8px", zIndex: 10000,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", fontWeight: "600", transition: "all 0.3s"
        }}>
          {message.text}
        </div>
      )}

      {/* Header bar matches dark design style */}
      <div className="page-header" style={{ marginBottom: "20px" }}>
        <div>
          <h2 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg style={{ width: "24px", height: "24px", color: "var(--purple)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {isAbandonedPage ? "Abandoned Orders" : "Orders"}
            <span style={{
              fontSize: "0.65rem", padding: "2px 8px", background: "rgba(137,80,252,0.1)", 
              color: "var(--purple)", borderRadius: "4px", fontWeight: "700"
            }}>
              • just now
            </span>
          </h2>
          <p className="page-subtitle">Track, assign, and analyze your orders</p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Period Filter Tabs */}
          <div style={{ display: "flex", background: "var(--border-color)", padding: "2px", borderRadius: "8px", gap: "2px" }}>
            {["all", "today", "yesterday", "this_week"].map((period) => {
              const labelMap = {
                all: "All",
                today: "Today",
                yesterday: "Yesterday",
                this_week: "This week"
              };
              const isActive = periodFilter === period;
              return (
                <button
                  key={period}
                  onClick={() => setPeriodFilter(period)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    background: isActive ? "var(--bg-card)" : "transparent",
                    color: isActive ? "var(--text-main)" : "var(--text-muted)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  className={isActive ? "" : "date-tab-hover"}
                >
                  {labelMap[period]}
                </button>
              );
            })}
            
            {/* More dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  background: "transparent",
                  color: "var(--text-muted)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                More <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {isMoreDropdownOpen && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  backgroundColor: "#18181b",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "4px",
                  minWidth: "140px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  zIndex: 1000,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px"
                }}>
                  <button 
                    onClick={() => { setPeriodFilter("all"); setIsMoreDropdownOpen(false); }}
                    style={{ padding: "8px 12px", background: "none", border: "none", color: "var(--text-main)", fontSize: "0.75rem", textAlign: "left", cursor: "pointer", borderRadius: "6px" }}
                    className="dropdown-item-hover"
                  >
                    Clear Filter
                  </button>
                  <button 
                    onClick={() => { navigate(isAbandonedPage ? "/commandes/toutes" : "/commandes/abandonnees"); setIsMoreDropdownOpen(false); }}
                    style={{ padding: "8px 12px", background: "none", border: "none", color: "var(--text-main)", fontSize: "0.75rem", textAlign: "left", cursor: "pointer", borderRadius: "6px" }}
                    className="dropdown-item-hover"
                  >
                    {isAbandonedPage ? "Toutes les commandes" : "Commandes abandonnées"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* New Order Button styled exactly like the screenshot */}
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            style={{ 
              background: "rgba(114, 57, 234, 0.08)",
              border: "1px solid #7239ea",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "8px", 
              fontSize: "0.75rem",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            className="btn-new-order-hover"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7239ea" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Order
          </button>
        </div>
      </div>

      {/* Elegant sub-navigation tab bar on the page */}
      <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid var(--border-color)", marginBottom: "20px", paddingBottom: "2px" }}>
        <button 
          onClick={() => navigate("/commandes/toutes")}
          style={{
            background: "none", border: "none", padding: "10px 0", cursor: "pointer", fontSize: "0.85rem", fontWeight: "700",
            color: !isAbandonedPage ? "var(--purple)" : "var(--text-muted)",
            borderBottom: !isAbandonedPage ? "2px solid var(--purple)" : "2px solid transparent",
            transition: "all 0.2s"
          }}
        >
          Toutes les commandes
        </button>
        <button 
          onClick={() => navigate("/commandes/abandonnees")}
          style={{
            background: "none", border: "none", padding: "10px 0", cursor: "pointer", fontSize: "0.85rem", fontWeight: "700",
            color: isAbandonedPage ? "var(--purple)" : "var(--text-muted)",
            borderBottom: isAbandonedPage ? "2px solid var(--purple)" : "2px solid transparent",
            transition: "all 0.2s"
          }}
        >
          Commandes abandonnées
        </button>
      </div>

      {/* Metrics Row (5 Cards exactly matching references) */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "20px" }}>
        
        {/* Metric 1: Total Orders */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: "16px", border: "1px solid var(--border-color)", borderRadius: "12px" }}>
          <div className="card-header" style={{ marginBottom: "8px" }}>
            <div className="card-icon" style={{ backgroundColor: "rgba(0, 163, 255, 0.1)", color: "#00a3ff", width: "32px", height: "32px" }}>
              {Icons.total}
            </div>
            <div className="card-title" style={{ fontSize: "0.65rem", fontWeight: "700" }}>TOTAL ORDERS</div>
          </div>
          <div className="card-value" style={{ fontSize: "1.8rem", fontWeight: "700" }}>{metrics.total_orders}</div>
        </div>

        {/* Metric 2: Confirmed */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: "16px", border: "1px solid var(--border-color)", borderRadius: "12px" }}>
          <div className="card-header" style={{ marginBottom: "8px" }}>
            <div className="card-icon" style={{ backgroundColor: "rgba(80, 205, 137, 0.1)", color: "#50cd89", width: "32px", height: "32px" }}>
              {Icons.confirmed}
            </div>
            <div className="card-title" style={{ fontSize: "0.65rem", fontWeight: "700" }}>CONFIRMED</div>
          </div>
          <div className="card-value" style={{ fontSize: "1.8rem", fontWeight: "700" }}>{metrics.confirmed}</div>
        </div>

        {/* Metric 3: Cancelled */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: "16px", border: "1px solid var(--border-color)", borderRadius: "12px" }}>
          <div className="card-header" style={{ marginBottom: "8px" }}>
            <div className="card-icon" style={{ backgroundColor: "rgba(241, 65, 108, 0.1)", color: "#f1416c", width: "32px", height: "32px" }}>
              {Icons.cancelled}
            </div>
            <div className="card-title" style={{ fontSize: "0.65rem", fontWeight: "700" }}>CANCELLED</div>
          </div>
          <div className="card-value" style={{ fontSize: "1.8rem", fontWeight: "700" }}>{metrics.cancelled}</div>
        </div>

        {/* Metric 4: Pending */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: "16px", border: "1px solid var(--border-color)", borderRadius: "12px" }}>
          <div className="card-header" style={{ marginBottom: "8px" }}>
            <div className="card-icon" style={{ backgroundColor: "rgba(255, 199, 0, 0.1)", color: "#ffc700", width: "32px", height: "32px" }}>
              {Icons.pending}
            </div>
            <div className="card-title" style={{ fontSize: "0.65rem", fontWeight: "700" }}>PENDING</div>
          </div>
          <div className="card-value" style={{ fontSize: "1.8rem", fontWeight: "700" }}>{metrics.pending}</div>
        </div>

        {/* Metric 5: Confirmation Rate */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: "16px", border: "1px solid var(--border-color)", borderRadius: "12px" }}>
          <div className="card-header" style={{ marginBottom: "8px" }}>
            <div className="card-icon" style={{ backgroundColor: "rgba(114, 57, 234, 0.1)", color: "#7239ea", width: "32px", height: "32px" }}>
              {Icons.rate}
            </div>
            <div className="card-title" style={{ fontSize: "0.65rem", fontWeight: "700" }}>CONFIRMATION RATE</div>
          </div>
          <div className="card-value" style={{ fontSize: "1.8rem", fontWeight: "700" }}>{metrics.confirmation_rate}</div>
        </div>

      </div>

      {/* ── Premium Filter Bar ─────────────────────────────────────── */}
      <style>{`
        .custom-select-item-hover:hover { background: rgba(114,57,234,0.12) !important; }
        .custom-select-wrapper ::-webkit-scrollbar { width: 5px; }
        .custom-select-wrapper ::-webkit-scrollbar-track { background: transparent; }
        .custom-select-wrapper ::-webkit-scrollbar-thumb { background: rgba(114,57,234,0.4); border-radius: 10px; }
        .btn-new-order-hover:hover { background: rgba(114,57,234,0.2) !important; }
        .date-tab-hover:hover { color: var(--text-main) !important; }
        .dropdown-item-hover:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>
      <div style={{
        display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: "10px",
        marginBottom: "20px", background: "var(--bg-card)", padding: "12px",
        borderRadius: "12px", border: "1px solid var(--border-color)"
      }}>

        {/* ── Search ── */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px 8px 34px", borderRadius: "8px",
              background: "var(--bg-app)", border: "1px solid var(--border-color)",
              color: "var(--text-main)", fontSize: "0.8rem", outline: "none",
              boxSizing: "border-box"
            }}
          />
          <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "var(--text-muted)", pointerEvents: "none" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>

        {/* ── Sources ── */}
        <CustomSelect
          id="source"
          value={sourceFilter}
          onChange={setSourceFilter}
          placeholder="All Sources"
          options={[
            { value: "all",           label: "All Sources",    icon: "🎧" },
            { value: "shopify",       label: "Shopify",        icon: "🛍️" },
            { value: "facebook",      label: "Facebook",       icon: "🔵" },
            { value: "instagram",     label: "Instagram",      icon: "📸" },
            { value: "tiktok",        label: "TikTok",         icon: "🎵" },
            { value: "snapchat",      label: "Snapchat",       icon: "👻" },
            { value: "whatsapp",      label: "WhatsApp",       icon: "💬" },
            { value: "google_sheets", label: "Google Sheets",  icon: "📊" },
          ]}
        />

        {/* ── Status ── */}
        <CustomSelect
          id="status"
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All Status"
          options={[
            { value: "all",        label: "All Status",      icon: "🎧" },
            { value: "pending",    label: "Nouveau",         dot: "#3b82f6" },
            { value: "confirmed",  label: "Confirmé",        dot: "#22c55e" },
            { value: "no_answer",  label: "Pas de réponse",  dot: "#f59e0b" },
            { value: "callback",   label: "Rappel",          dot: "#a855f7" },
            { value: "cancelled",  label: "Annulé",          dot: "#ef4444" },
            { value: "duplicate",  label: "Doublon",         dot: "#94a3b8" },
            { value: "wrong_num",  label: "Mauvais numéro",  dot: "#f97316" },
          ]}
        />

        {/* ── Fulfillment ── */}
        <CustomSelect
          id="fulfillment"
          value={fulfillmentFilter}
          onChange={setFulfillmentFilter}
          placeholder="All Fulfillment"
          options={[
            { value: "all",               label: "All Fulfillment",    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#7239ea"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 3H8L6 7h12z" opacity=".6"/></svg> },
            { value: "unfulfilled",        label: "Unfulfilled",        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" opacity=".9"/></svg> },
            { value: "label_created",      label: "Label Created",      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#a855f7"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5" fill="#fff"/></svg> },
            { value: "label_purchased",    label: "Label Purchased",    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#8b5cf6"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5" fill="#fff"/></svg> },
            { value: "label_printed",      label: "Label Printed",      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#6d28d9"><path d="M17 17H7v-7h10v7z"/><path d="M17 3H7v4h10V3z" opacity=".7"/><path d="M18 8H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1v2h10v-2h1a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z"/></svg> },
            { value: "confirmed",          label: "Confirmed",          icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#22c55e"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
            { value: "in_transit",         label: "In Transit",         icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#3b82f6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
            { value: "out_for_delivery",   label: "Out for Delivery",   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#06b6d4"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8l4 1 3 3v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5" fill="#06b6d4" stroke="#fff" strokeWidth="1"/><circle cx="18.5" cy="18.5" r="2.5" fill="#06b6d4" stroke="#fff" strokeWidth="1"/></svg> },
            { value: "delivered",          label: "Delivered",          icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#22c55e"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
            { value: "attempted_delivery", label: "Attempted Delivery", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#f97316"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg> },
            { value: "delivery_failed",    label: "Delivery Failed",    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#ef4444"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg> },
            { value: "delayed",            label: "Delayed",            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
            { value: "carrier_picked_up",  label: "Carrier Picked Up",  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#14b8a6"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z" opacity=".8"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" opacity=".9"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" opacity=".9"/></svg> },
            { value: "fulfilled",          label: "Fulfilled",          icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#22c55e"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="3" width="18" height="18" rx="2" fill="#22c55e" opacity=".15"/><polyline points="9 11 12 14 22 4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
            { value: "partial",            label: "Partial",            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="#64748b"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="12" x2="15" y2="12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="15" x2="12" y2="15" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg> },
          ]}
        />

        {/* ── Products (agent sees only their assigned products, or all if none assigned) ── */}
        <CustomSelect
          id="product"
          value={productFilter}
          onChange={setProductFilter}
          placeholder="Tous les produits"
          options={[
            { value: "all", label: "Tous les produits", icon: "📦" },
            ...filterableProducts.map(p => ({
              value: String(p.id),
              label: p.name,
              icon: "🛍️"
            }))
          ]}
        />

      </div>

      {/* Orders List / Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
          <div style={{
            border: "3px solid var(--border-color)", borderTop: "3px solid var(--purple)",
            borderRadius: "50%", width: "32px", height: "32px", animation: "spin 1s linear infinite"
          }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filteredOrders.length === 0 ? (
        // Empty State matches screenshot
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px 20px", background: "var(--bg-card)", border: "1px solid var(--border-color)",
          borderRadius: "12px", textAlign: "center"
        }}>
          <svg style={{ width: "64px", height: "64px", marginBottom: "20px", opacity: 0.15 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", fontWeight: "500" }}>
            No orders found — create a new order to start managing orders
          </p>
        </div>
      ) : (
        // Beautiful Dark Table
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border-color)",
          borderRadius: "12px", overflow: "hidden"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(255, 255, 255, 0.02)" }}>
                <th style={{ padding: "16px 20px", fontWeight: "600", color: "var(--text-muted)" }}>RÉFÉRENCE</th>
                <th style={{ padding: "16px 20px", fontWeight: "600", color: "var(--text-muted)" }}>CLIENT</th>
                <th style={{ padding: "16px 20px", fontWeight: "600", color: "var(--text-muted)" }}>ARTICLES</th>
                <th style={{ padding: "16px 20px", fontWeight: "600", color: "var(--text-muted)" }}>TOTAL</th>
                <th style={{ padding: "16px 20px", fontWeight: "600", color: "var(--text-muted)" }}>STATUT</th>
                <th style={{ padding: "16px 20px", fontWeight: "600", color: "var(--text-muted)" }}>PORTFOLIO AGENT</th>
                <th style={{ padding: "16px 20px", fontWeight: "600", color: "var(--text-muted)" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const isPaid = order.financial_status === "paid";
                
                // Color badges for order status
                const getStatusStyle = (s) => {
                  switch (s) {
                    case "confirmed":
                    case "delivered":
                      return { bg: "rgba(80, 205, 137, 0.1)", text: "#50cd89" };
                    case "cancelled":
                    case "returned":
                      return { bg: "rgba(241, 65, 108, 0.1)", text: "#f1416c" };
                    case "processing":
                    case "shipped":
                      return { bg: "rgba(0, 163, 255, 0.1)", text: "#00a3ff" };
                    default:
                      return { bg: "rgba(255, 199, 0, 0.1)", text: "#ffc700" };
                  }
                };
                
                const statusStyle = getStatusStyle(order.status);

                return (
                  <tr key={order.id} style={{ borderBottom: "1px solid var(--border-color)", transition: "all 0.2s" }} className="table-row-hover">
                    <style>{`.table-row-hover:hover { background-color: rgba(255, 255, 255, 0.01); }`}</style>
                    
                    {/* Order Reference */}
                    <td style={{ padding: "16px 20px", fontWeight: "700" }}>
                      <span 
                        onClick={() => setSelectedOrder(order)}
                        style={{ color: "var(--purple)", cursor: "pointer", textDecoration: "underline" }}
                      >
                        {order.order_number}
                      </span>
                    </td>
                    
                    {/* Customer Info */}
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: "600" }}>{order.customer_name}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "2px" }}>{order.customer_phone || "—"}</div>
                    </td>

                    {/* Products details */}
                    <td style={{ padding: "16px 20px" }}>
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: "0.8rem", marginBottom: "4px" }}>
                            {item.product_name} <span style={{ color: "var(--purple)", fontWeight: "700" }}>x{item.quantity}</span>
                          </div>
                        ))
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>

                    {/* Financial details */}
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: "700" }}>{order.total_price} {order.currency || currencySymbol}</div>
                      <span style={{
                        display: "inline-block", fontSize: "0.65rem", padding: "1px 6px", borderRadius: "4px",
                        background: isPaid ? "rgba(27,197,189,0.1)" : "rgba(246,78,96,0.1)",
                        color: isPaid ? "var(--success)" : "var(--danger)",
                        marginTop: "4px", fontWeight: "700"
                      }}>
                        {order.financial_status ? order.financial_status.toUpperCase() : "UNPAID"}
                      </span>
                    </td>

                    {/* Order Status Badge */}
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{
                        display: "inline-block", padding: "6px 12px", borderRadius: "6px",
                        background: statusStyle.bg, color: statusStyle.text,
                        fontSize: "0.75rem", fontWeight: "700"
                      }}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Assigned Agent display / Manual dropdown if Admin */}
                    <td style={{ padding: "16px 20px" }}>
                      {isAdmin ? (
                        <select 
                          value={order.assigned_to || ""}
                          onChange={(e) => handleAssignAgent(order.id, e.target.value)}
                          style={{
                            padding: "6px 10px", borderRadius: "6px", background: "var(--bg-app)",
                            border: "1px solid var(--border-color)", color: "var(--text-main)",
                            fontSize: "0.8rem", outline: "none", cursor: "pointer"
                          }}
                        >
                          <option value="">Non assigné</option>
                          {activeAgents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                          ))}
                        </select>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {order.assigned_agent ? (
                            <>
                              <img 
                                src={order.assigned_agent.avatar || `https://api.dicebear.com/7.x/lorelei/svg?seed=${order.assigned_agent.name}`} 
                                alt={order.assigned_agent.name}
                                style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
                              />
                              <span style={{ fontWeight: "500" }}>{order.assigned_agent.name}</span>
                            </>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Non assigné</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Action buttons (status modifiers) */}
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            padding: "6px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600",
                            background: "rgba(255,255,255,0.05)", color: "var(--text-main)"
                          }}
                        >
                          Voir
                        </button>
                        
                        {order.status === "pending" && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, "confirmed")}
                            style={{
                              padding: "6px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700",
                              background: "rgba(80, 205, 137, 0.1)", color: "#50cd89"
                            }}
                          >
                            Confirmer
                          </button>
                        )}

                        {order.status === "confirmed" && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, "delivered")}
                            style={{
                              padding: "6px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700",
                              background: "rgba(0, 163, 255, 0.1)", color: "#00a3ff"
                            }}
                          >
                            Livrer
                          </button>
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

      {/* QUICK ORDER CREATION MODAL */}
      {isCreateModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 10000, padding: "20px"
        }}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-color)",
            borderRadius: "12px", width: "100%", maxWidth: "500px", padding: "24px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)", animation: "modalIn 0.2s ease-out"
          }}>
            <style>{`@keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Créer une Nouvelle Commande</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: "transparent", color: "var(--text-muted)", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div>
                <label className="form-label">Nom du Client</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: John Doe"
                  className="form-input"
                  value={newOrder.customer_name}
                  onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Numéro de Téléphone</label>
                <input 
                  type="text" 
                  placeholder="Ex: +213 555 12 34 56"
                  className="form-input"
                  value={newOrder.customer_phone}
                  onChange={(e) => setNewOrder({ ...newOrder, customer_phone: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 2 }}>
                  <label className="form-label">Produit commandé</label>
                  <select 
                    required
                    className="form-input"
                    value={newOrder.product_id}
                    onChange={(e) => setNewOrder({ ...newOrder, product_id: e.target.value })}
                  >
                    <option value="">Choisir un produit...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.price} {currencySymbol})</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Quantité</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    className="form-input"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Notes (Boutique, remarques)</label>
                <textarea 
                  className="form-input"
                  placeholder="Notes complémentaires..."
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  style={{ height: "80px", resize: "none" }}
                />
              </div>

              <button 
                type="submit" 
                disabled={isCreating}
                className="btn btn-primary"
                style={{ background: "var(--purple)", marginTop: "10px" }}
              >
                {isCreating ? "Création..." : "Enregistrer la commande"}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* DETAILED ORDER DETAILS & HISTORY POPUP */}
      {selectedOrder && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 10000, padding: "20px"
        }}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border-color)",
            borderRadius: "12px", width: "100%", maxWidth: "600px", padding: "24px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto"
          }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>
                Détails Commande : <span style={{ color: "var(--purple)" }}>{selectedOrder.order_number}</span>
              </h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ background: "transparent", color: "var(--text-muted)", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            {/* Customer & Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
              <div>
                <strong style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Client</strong>
                <p style={{ fontWeight: "700", marginTop: "4px", fontSize: "0.95rem" }}>{selectedOrder.customer_name}</p>
                <p style={{ color: "var(--text-muted)", marginTop: "2px" }}>{selectedOrder.customer_phone || "Aucun téléphone"}</p>
              </div>
              <div>
                <strong style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Boutique & Origine</strong>
                <p style={{ fontWeight: "600", marginTop: "4px" }}>{selectedOrder.shop ? selectedOrder.shop.name : "Shopify Store"}</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "2px" }}>{selectedOrder.shop ? selectedOrder.shop.url : ""}</p>
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
              <strong style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Articles commandés</strong>
              {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "8px", background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "8px" }}>
                  <div>
                    <strong>{item.product_name}</strong>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "2px" }}>Prix unitaire: {item.unit_price} {selectedOrder.currency || currencySymbol}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "700" }}>x{item.quantity}</div>
                    <div style={{ color: "var(--purple)", fontWeight: "600", marginTop: "2px" }}>{item.total_price} {selectedOrder.currency || currencySymbol}</div>
                  </div>
                </div>
              ))}
              
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "0.9rem", fontWeight: "700" }}>
                <span>Total Facturé (Livraison incluse):</span>
                <span style={{ color: "var(--success)" }}>{selectedOrder.total_price} {selectedOrder.currency || currencySymbol}</span>
              </div>
            </div>

            {/* Assignment & Status Controls */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
              <div>
                <strong style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Agent Affecté</strong>
                {isAdmin ? (
                  <select 
                    value={selectedOrder.assigned_to || ""}
                    onChange={(e) => handleAssignAgent(selectedOrder.id, e.target.value)}
                    style={{
                      padding: "8px", borderRadius: "8px", background: "var(--bg-app)",
                      border: "1px solid var(--border-color)", color: "var(--text-main)",
                      fontSize: "0.8rem", outline: "none", width: "100%"
                    }}
                  >
                    <option value="">Non assigné</option>
                    {activeAgents.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                ) : (
                  <p style={{ fontWeight: "600" }}>{selectedOrder.assigned_agent ? selectedOrder.assigned_agent.name : "Non assigné"}</p>
                )}
              </div>
              <div>
                <strong style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Statut Commande</strong>
                <select 
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                  style={{
                    padding: "8px", borderRadius: "8px", background: "var(--bg-app)",
                    border: "1px solid var(--border-color)", color: "var(--text-main)",
                    fontSize: "0.8rem", outline: "none", width: "100%"
                  }}
                >
                  <option value="pending">En attente (Pending)</option>
                  <option value="confirmed">Confirmée (Confirmed)</option>
                  <option value="processing">Traitement (Processing)</option>
                  <option value="shipped">Expédiée (Shipped)</option>
                  <option value="delivered">Livrée (Delivered)</option>
                  <option value="cancelled">Annulée (Cancelled)</option>
                  <option value="returned">Retournée (Returned)</option>
                </select>
              </div>
            </div>

            {/* Order Action History Log */}
            <div>
              <strong style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>Historique des Actions & Commissions</strong>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "150px", overflowY: "auto", paddingRight: "6px" }}>
                {selectedOrder.histories && selectedOrder.histories.length > 0 ? (
                  selectedOrder.histories.map((h, index) => (
                    <div key={index} style={{ fontSize: "0.75rem", borderLeft: "2px solid var(--purple)", paddingLeft: "10px", marginBottom: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: "2px" }}>
                        <span>Auteur: {h.user ? h.user.name : "Système"}</span>
                        <span>{new Date(h.created_at).toLocaleString()}</span>
                      </div>
                      <p style={{ color: "var(--text-main)", fontWeight: "500" }}>{h.description}</p>
                    </div>
                  ))
                ) : (
                  <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.8rem" }}>Aucun historique enregistré pour le moment.</span>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}