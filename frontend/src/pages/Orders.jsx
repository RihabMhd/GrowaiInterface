import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
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

  // Fetch products (for dropdown filter & order creation choice)
  const fetchProducts = async () => {
    try {
      const response = await api.get("/auth/team");
      setProducts(response.data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, [location.pathname, search, statusFilter]);

  useEffect(() => {
    fetchProducts();
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

  // Apply frontend products filtering if selected
  const filteredOrders = orders.filter(order => {
    if (productFilter === "all") return true;
    return order.items.some(item => item.product_id === parseInt(productFilter));
  });

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
            {isAbandonedPage ? "Commandes abandonnées" : "Commandes"}
            <span style={{
              fontSize: "0.65rem", padding: "2px 8px", background: "rgba(137,80,252,0.1)", 
              color: "var(--purple)", borderRadius: "4px", fontWeight: "700"
            }}>
              • just now
            </span>
          </h2>
          <p className="page-subtitle">Suivre, assigner et analyser les commandes de vos boutiques</p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ display: "flex", background: "var(--border-color)", padding: "2px", borderRadius: "8px" }}>
            <button 
              onClick={() => setStatusFilter("all")}
              style={{
                padding: "6px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600",
                background: statusFilter === "all" ? "var(--bg-card)" : "transparent",
                color: statusFilter === "all" ? "var(--text-main)" : "var(--text-muted)",
                transition: "all 0.2s"
              }}
            >
              All
            </button>
            <button 
              onClick={() => setStatusFilter("pending")}
              style={{
                padding: "6px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600",
                background: statusFilter === "pending" ? "var(--bg-card)" : "transparent",
                color: statusFilter === "pending" ? "var(--text-main)" : "var(--text-muted)",
                transition: "all 0.2s"
              }}
            >
              Today
            </button>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => setIsCreateModalOpen(true)}
            style={{ 
              background: "var(--purple)", width: "auto", padding: "8px 16px", borderRadius: "8px", 
              fontSize: "0.75rem", fontWeight: "600" 
            }}
          >
            + New Order
          </button>
        </div>
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

      {/* Filter bar exactly matching reference layout */}
      <div style={{
        display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: "12px", 
        marginBottom: "20px", background: "var(--bg-card)", padding: "12px", 
        borderRadius: "12px", border: "1px solid var(--border-color)"
      }}>
        
        {/* Search */}
        <div style={{ position: "relative" }}>
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px 8px 32px", borderRadius: "8px", 
              background: "var(--bg-app)", border: "1px solid var(--border-color)",
              color: "var(--text-main)", fontSize: "0.8rem", outline: "none"
            }}
          />
          <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "var(--text-muted)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>

        {/* Dropdown 1: All Sources */}
        <select style={{
          padding: "8px 12px", borderRadius: "8px", background: "var(--bg-app)", 
          border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.8rem", outline: "none"
        }}>
          <option>All Sources</option>
          <option>Shopify</option>
          <option>Manual</option>
        </select>

        {/* Dropdown 2: All Status */}
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "8px 12px", borderRadius: "8px", background: "var(--bg-app)", 
            border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.8rem", outline: "none"
          }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
        </select>

        {/* Dropdown 3: All Fulfillment */}
        <select style={{
          padding: "8px 12px", borderRadius: "8px", background: "var(--bg-app)", 
          border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.8rem", outline: "none"
        }}>
          <option>All Fulfillment</option>
          <option>Unfulfilled</option>
          <option>Fulfilled</option>
        </select>

        {/* Dropdown 4: Tous les produits */}
        <select 
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          style={{
            padding: "8px 12px", borderRadius: "8px", background: "var(--bg-app)", 
            border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.8rem", outline: "none"
          }}
        >
          <option value="all">Tous les produits</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

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
