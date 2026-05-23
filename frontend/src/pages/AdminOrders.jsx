import { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/axios";

const Icons = {
  total: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>),
  confirmed: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>),
  cancelled: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>),
  pending: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
  rate: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>),
};

const getStatusStyle = (s) => {
  switch (s) {
    case "confirmed": case "delivered": return { bg: "rgba(80,205,137,0.1)",  text: "#50cd89" };
    case "cancelled":  case "returned":  return { bg: "rgba(241,65,108,0.1)",  text: "#f1416c" };
    case "processing": case "shipped":   return { bg: "rgba(0,163,255,0.1)",   text: "#00a3ff" };
    default:                             return { bg: "rgba(255,199,0,0.1)",    text: "#ffc700" };
  }
};

const inputStyle = {
  width: "100%", padding: "11px 14px", borderRadius: "8px",
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
  color: "var(--text-main)", fontSize: "0.85rem", outline: "none",
  transition: "border-color 0.2s", boxSizing: "border-box",
};

// ── Custom Dropdown ───────────────────────────────────────────────────────────
function CustomSelect({ id, value, onChange, options, placeholder, openDropdown, setOpenDropdown }) {
  const isOpen = openDropdown === id;
  const selected = options.find(o => o.value === value);
  return (
    <div className="custom-select-wrapper" style={{ position: "relative" }}>
      <div onClick={() => setOpenDropdown(isOpen ? null : id)} style={{
        display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px",
        background: "var(--bg-app)", border: isOpen ? "1px solid #7239ea" : "1px solid var(--border-color)",
        color: "var(--text-main)", fontSize: "0.8rem", cursor: "pointer", userSelect: "none",
        transition: "border-color 0.2s", minWidth: "130px"
      }}>
        {selected?.dot && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: selected.dot, flexShrink: 0 }}/>}
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected?.label || placeholder}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
      {isOpen && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, minWidth: "200px",
          background: "#18181b", border: "1px solid rgba(114,57,234,0.4)", borderRadius: "10px",
          padding: "6px", boxShadow: "0 12px 40px rgba(0,0,0,0.6)", zIndex: 9000, maxHeight: "280px", overflowY: "auto"
        }}>
          {options.map(opt => (
            <div key={opt.value} onClick={() => { onChange(opt.value); setOpenDropdown(null); }}
              style={{
                display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px", borderRadius: "7px",
                cursor: "pointer", fontSize: "0.82rem", fontWeight: opt.value === value ? "700" : "500",
                background: opt.value === value ? "rgba(114,57,234,0.25)" : "transparent",
                color: opt.value === value ? "#c4a7ff" : "var(--text-main)", transition: "background 0.15s"
              }} className="cs-item-hover">
              {opt.dot && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: opt.dot, flexShrink: 0 }}/>}
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Product Picker Popover ────────────────────────────────────────────────────
function ProductPicker({ products, onSelect, onClose }) {
  const [q, setQ] = useState("");
  const ref = useRef(null);
  const filtered = (Array.isArray(products) ? products : []).filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase())
  );
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: "absolute", top: "calc(100% + 6px)", right: 0, width: "280px",
      background: "#1c1c1f", border: "1px solid rgba(114,57,234,0.35)", borderRadius: "10px",
      padding: "10px", boxShadow: "0 16px 40px rgba(0,0,0,0.7)", zIndex: 9999
    }}>
      <input autoFocus placeholder="Search products..." value={q} onChange={e => setQ(e.target.value)}
        style={{ ...inputStyle, marginBottom: "8px", padding: "8px 12px", background: "rgba(255,255,255,0.06)" }}/>
      <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
        {filtered.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", padding: "12px" }}>No products found</p>
        ) : filtered.map(p => (
          <div key={p.id} onClick={() => onSelect(p)} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "9px 12px", borderRadius: "7px", cursor: "pointer", transition: "background 0.15s"
          }} className="cs-item-hover">
            <div>
              <div style={{ fontSize: "0.83rem", fontWeight: "600", color: "var(--text-main)" }}>{p.name}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>{p.price} MAD</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7239ea" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── New Manual Order Modal ────────────────────────────────────────────────────
function NewOrderModal({ products, activeAgents, isAbandonedPage, onClose, onSuccess }) {
  const CURRENCY = "MAD";
  const empty = { customer_name: "", customer_phone: "", customer_email: "", source: "", province: "", city: "", street: "", notes: "", shipping_price: 0, items: [] };
  const [form, setForm] = useState(empty);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addProduct = (product) => {
    setForm(p => {
      const ex = p.items.find(i => i.product_id === product.id);
      if (ex) return { ...p, items: p.items.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
      return { ...p, items: [...p.items, { product_id: product.id, product_name: product.name, price: parseFloat(product.price) || 0, quantity: 1 }] };
    });
    setShowPicker(false);
  };
  const removeItem = (pid) => setForm(p => ({ ...p, items: p.items.filter(i => i.product_id !== pid) }));
  const updateQty  = (pid, qty) => { const q = Math.max(1, parseInt(qty) || 1); setForm(p => ({ ...p, items: p.items.map(i => i.product_id === pid ? { ...i, quantity: q } : i) })); };
  const subtotal = form.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total    = subtotal + parseFloat(form.shipping_price || 0);

  const handleSubmit = async () => {
    if (!form.customer_name.trim())  { alert("Le nom du client est requis."); return; }
    if (!form.customer_phone.trim()) { alert("Le téléphone est requis.");     return; }
    if (form.items.length === 0)     { alert("Ajoutez au moins un produit."); return; }
    try {
      setSaving(true);
      const res = await api.post("/orders", {
        customer_name: form.customer_name, customer_phone: form.customer_phone,
        customer_email: form.customer_email || null, source: form.source || null,
        province: form.province || null, city: form.city || null, street: form.street || null,
        notes: form.notes || null, shipping_price: parseFloat(form.shipping_price) || 0,
        is_abandoned: isAbandonedPage,
        items: form.items.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
      });
      onSuccess(res.data.message || "Commande créée avec succès !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création de la commande.");
    } finally {
      setSaving(false);
    }
  };

  const lbl = { fontSize: "0.67rem", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: "8px" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "20px" }}>
      <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", width: "100%", maxWidth: "900px", maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 60px rgba(0,0,0,0.7)", animation: "modalIn 0.2s ease-out", overflow: "hidden" }}>
        <style>{`
          @keyframes modalIn { from { opacity:0; transform:scale(0.97) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
          .cs-item-hover:hover { background: rgba(114,57,234,0.15) !important; }
          .modal-input:focus { border-color: rgba(114,57,234,0.6) !important; }
          .rm-btn:hover { background: rgba(241,65,108,0.12) !important; color: #f1416c !important; }
          .qty-btn:hover { background: rgba(255,255,255,0.1) !important; }
        `}</style>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", background: "rgba(114,57,234,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7239ea" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            </div>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-main)" }}>New Manual Order</h3>
          </div>
          <button onClick={onClose} style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>×</button>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* LEFT: Customer / Address */}
          <div style={{ flex: 1, padding: "24px", overflowY: "auto", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

            {/* Delivery Company */}
            <div style={{ marginBottom: "22px" }}>
              <label style={lbl}>Delivery Company <span style={{ color: "#f1416c" }}>*</span></label>
              <div style={{ padding: "12px 14px", borderRadius: "8px", border: "1.5px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8l4 1 3 3v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>No delivery companies connected</span>
              </div>
            </div>

            {/* Customer */}
            <div style={{ marginBottom: "22px" }}>
              <label style={lbl}>Customer</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input className="modal-input" placeholder="Full Name *" value={form.customer_name} onChange={e => set("customer_name", e.target.value)} style={inputStyle}/>
                <input className="modal-input" placeholder="Phone *" value={form.customer_phone} onChange={e => set("customer_phone", e.target.value)} style={inputStyle}/>
                <input className="modal-input" placeholder="Email (optional)" value={form.customer_email} onChange={e => set("customer_email", e.target.value)} style={inputStyle}/>
              </div>
            </div>

            {/* Order Source */}
            <div style={{ marginBottom: "22px" }}>
              <label style={lbl}>Order Source <span style={{ color: "#f1416c" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", pointerEvents: "none" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                </span>
                <select className="modal-input" value={form.source} onChange={e => set("source", e.target.value)}
                  style={{ ...inputStyle, paddingLeft: "38px", paddingRight: "32px", appearance: "none", cursor: "pointer" }}>
                  <option value="">Select source...</option>
                  <option value="shopify">Shopify</option>
                  <option value="google_sheets">Google Sheets</option>
                  <option value="manual">Manual</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>

            {/* Delivery Address */}
            <div style={{ marginBottom: "22px" }}>
              <label style={lbl}>Delivery Address</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <input className="modal-input" placeholder="Province..." value={form.province} onChange={e => set("province", e.target.value)} style={inputStyle}/>
                <input className="modal-input" placeholder="City..." value={form.city} onChange={e => set("city", e.target.value)} style={inputStyle}/>
                <input className="modal-input" placeholder="Street address (optional)" value={form.street} onChange={e => set("street", e.target.value)} style={inputStyle}/>
              </div>
            </div>

            {/* Note */}
            <div>
              <label style={lbl}>Note (optional)</label>
              <textarea className="modal-input" placeholder="Any notes about this order..." value={form.notes} onChange={e => set("notes", e.target.value)}
                style={{ ...inputStyle, height: "90px", resize: "none", lineHeight: "1.5" }}/>
            </div>
          </div>

          {/* RIGHT: Products + Totals */}
          <div style={{ width: "340px", padding: "24px", display: "flex", flexDirection: "column", flexShrink: 0 }}>

            {/* Products header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <label style={{ ...lbl, marginBottom: 0 }}>Products <span style={{ color: "#f1416c" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowPicker(v => !v)} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "6px", background: "rgba(114,57,234,0.12)", border: "1px solid rgba(114,57,234,0.25)", color: "#9b6dff", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add product
                </button>
                {showPicker && <ProductPicker products={products} onSelect={addProduct} onClose={() => setShowPicker(false)}/>}
              </div>
            </div>

            {/* Product list or empty state */}
            <div style={{ flex: 1, border: "1.5px dashed rgba(255,255,255,0.1)", borderRadius: "10px", background: "rgba(255,255,255,0.02)", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: "200px" }}>
              {form.items.length === 0 ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", padding: "20px" }}>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  <button onClick={() => setShowPicker(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "8px", background: "#7239ea", color: "white", fontSize: "0.8rem", fontWeight: "700", border: "none", cursor: "pointer" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add product
                  </button>
                </div>
              ) : (
                <div style={{ overflowY: "auto", flex: 1 }}>
                  {form.items.map(item => (
                    <div key={item.product_id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {/* Icon */}
                      <div style={{ width: "30px", height: "30px", borderRadius: "7px", background: "rgba(114,57,234,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9b6dff" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                      </div>
                      {/* Name + price */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.78rem", fontWeight: "600", color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.product_name}</div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "1px" }}>{item.price} MAD</div>
                      </div>
                      {/* Qty stepper */}
                      <div style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
                        <button className="qty-btn" onClick={() => updateQty(item.product_id, item.quantity - 1)} style={{ width: "20px", height: "20px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-main)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>−</button>
                        <span style={{ width: "22px", textAlign: "center", fontSize: "0.8rem", fontWeight: "700" }}>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.product_id, item.quantity + 1)} style={{ width: "20px", height: "20px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-main)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}>+</button>
                      </div>
                      {/* Line total */}
                      <div style={{ fontSize: "0.78rem", fontWeight: "700", minWidth: "46px", textAlign: "right", flexShrink: 0 }}>
                        {(item.price * item.quantity).toFixed(2)}
                      </div>
                      {/* Remove */}
                      <button className="rm-btn" onClick={() => removeItem(item.product_id)} style={{ width: "20px", height: "20px", borderRadius: "4px", background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping + Total */}
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8l4 1 3 3v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  Shipping
                </div>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", overflow: "hidden" }}>
                  <input type="number" min="0" step="0.01" value={form.shipping_price} onChange={e => set("shipping_price", e.target.value)}
                    style={{ width: "70px", padding: "6px 10px", background: "rgba(255,255,255,0.04)", border: "none", color: "var(--text-main)", fontSize: "0.82rem", outline: "none", textAlign: "right" }}/>
                  <span style={{ padding: "6px 10px", background: "rgba(255,255,255,0.06)", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>{CURRENCY}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>Total</span>
                <span style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--text-main)" }}>{total.toFixed(2)} {CURRENCY}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: "10px", padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-main)", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{ flex: 2, padding: "11px", borderRadius: "8px", background: "#7239ea", border: "none", color: "white", fontSize: "0.85rem", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            {saving ? "Creating..." : "Create Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminOrders() {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isAbandonedPage = location.pathname.includes("abandonnees");
  const currencySymbol = "DA";

  const [orders, setOrders]             = useState([]);
  const [metrics, setMetrics]           = useState({ total_orders: 0, confirmed: 0, cancelled: 0, pending: 0, confirmation_rate: "0%" });
  const [activeAgents, setActiveAgents] = useState([]);
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [message, setMessage]           = useState(null);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [agentFilter, setAgentFilter]   = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMoreOpen, setIsMoreOpen]     = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { type: isAbandonedPage ? "abandoned" : "all", search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined };
      const res = await api.get("/orders", { params });
      setOrders(Array.isArray(res.data?.orders) ? res.data.orders : []);
      setMetrics(res.data?.metrics || { total_orders: 0, confirmed: 0, cancelled: 0, pending: 0, confirmation_rate: "0%" });
      setActiveAgents(Array.isArray(res.data?.active_agents) ? res.data.active_agents : []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      const raw = res.data;
      setProducts(Array.isArray(raw) ? raw : Array.isArray(raw?.products) ? raw.products : Array.isArray(raw?.data) ? raw.data : []);
    } catch (err) { console.error(err); setProducts([]); }
  };

  useEffect(() => { fetchOrders(); }, [location.pathname, search, statusFilter]);
  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => {
    const h = (e) => {
      if (!e.target.closest(".custom-select-wrapper")) setOpenDropdown(null);
      if (!e.target.closest(".more-dd")) setIsMoreOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleAssignAgent = async (orderId, agentId) => {
    try {
      const value = agentId === "" ? null : parseInt(agentId);
      const res = await api.post(`/orders/${orderId}/assign`, { assigned_to: value });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, assigned_to: value, assignedAgent: res.data.order.assignedAgent } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(res.data.order);
    } catch (err) { console.error(err); alert("Erreur d'attribution."); }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(res.data.order);
    } catch (err) { console.error(err); alert("Erreur de mise à jour."); }
  };

  const showToast = (text, type = "success") => { setMessage({ text, type }); setTimeout(() => setMessage(null), 5000); };

  const filteredOrders = orders.filter(order => {
    if (productFilter !== "all" && !order.items?.some(i => i.product_id === parseInt(productFilter))) return false;
    if (agentFilter !== "all" && String(order.assigned_to) !== agentFilter) return false;
    if (sourceFilter !== "all" && !(order.shop?.name || "").toLowerCase().includes(sourceFilter.toLowerCase())) return false;
    if (periodFilter !== "all") {
      const d = new Date(order.created_at), today = new Date();
      if (periodFilter === "today")     return d.toDateString() === today.toDateString();
      if (periodFilter === "yesterday") { const y = new Date(); y.setDate(today.getDate()-1); return d.toDateString() === y.toDateString(); }
      if (periodFilter === "this_week") { const w = new Date(); w.setDate(today.getDate()-7); return d >= w; }
    }
    return true;
  });

  return (
    <div style={{ color: "var(--text-main)", minHeight: "100%", paddingBottom: "40px" }}>
      <style>{`.cs-item-hover:hover{background:rgba(114,57,234,0.15)!important} .trow:hover{background:rgba(255,255,255,0.01)} .ddi:hover{background:rgba(255,255,255,0.05)!important}`}</style>

      {/* Toast */}
      {message && (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 10001, background: message.type === "success" ? "#50cd89" : "#f1416c", color: "white", padding: "12px 24px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", fontWeight: "600" }}>{message.text}</div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: "12px" }}>
        <div>
          <h2 className="page-title" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem" }}>
            <svg style={{ width: "20px", height: "20px", color: "var(--purple)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            {isAbandonedPage ? "Abandoned Orders" : "Orders"}
          </h2>
          <p className="page-subtitle">Manage, assign, and track all orders</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Period tabs */}
          <div style={{ display: "flex", background: "var(--border-color)", padding: "2px", borderRadius: "6px", gap: "1px" }}>
            {[["all","All"],["today","Today"],["yesterday","Yesterday"],["this_week","This week"]].map(([v,l]) => (
              <button key={v} onClick={() => setPeriodFilter(v)} style={{ padding: "5px 10px", borderRadius: "5px", fontSize: "0.7rem", fontWeight: "700", background: periodFilter===v ? "var(--bg-card)" : "transparent", color: periodFilter===v ? "var(--text-main)" : "var(--text-muted)", border: "none", cursor: "pointer" }}>{l}</button>
            ))}
            <div className="more-dd" style={{ position: "relative" }}>
              <button onClick={() => setIsMoreOpen(v => !v)} style={{ padding: "5px 10px", borderRadius: "5px", fontSize: "0.7rem", fontWeight: "700", background: "transparent", color: "var(--text-muted)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px" }}>
                More <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {isMoreOpen && (
                <div style={{ position: "absolute", top: "100%", right: 0, background: "#18181b", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "4px", minWidth: "160px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", zIndex: 1000 }}>
                  <button className="ddi" onClick={() => { setPeriodFilter("all"); setIsMoreOpen(false); }} style={{ padding: "8px 12px", background: "none", border: "none", color: "var(--text-main)", fontSize: "0.75rem", textAlign: "left", cursor: "pointer", borderRadius: "6px", width: "100%" }}>Clear Filter</button>
                  <button className="ddi" onClick={() => { navigate(isAbandonedPage ? "/commandes/toutes" : "/commandes/abandonnees"); setIsMoreOpen(false); }} style={{ padding: "8px 12px", background: "none", border: "none", color: "var(--text-main)", fontSize: "0.75rem", textAlign: "left", cursor: "pointer", borderRadius: "6px", width: "100%" }}>{isAbandonedPage ? "All Orders" : "Abandoned Orders"}</button>
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "var(--purple)", color: "white", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700", border: "none", cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Order
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "10px", marginBottom: "12px" }}>
        {[
          { label: "TOTAL ORDERS",      value: metrics.total_orders,      icon: Icons.total,     color: "#7239ea", sub: `${metrics.total_orders} today` },
          { label: "CONFIRMED",         value: metrics.confirmed,         icon: Icons.confirmed, color: "#50cd89", sub: `${metrics.total_orders > 0 ? Math.round((metrics.confirmed/metrics.total_orders)*100) : 0}% rate` },
          { label: "CANCELLED",         value: metrics.cancelled,         icon: Icons.cancelled, color: "#f1416c", sub: `${metrics.total_orders > 0 ? Math.round((metrics.cancelled/metrics.total_orders)*100) : 0}% rate` },
          { label: "PENDING",           value: metrics.pending,           icon: Icons.pending,   color: "#ffc700", sub: "awaiting action" },
          { label: "CONFIRMATION RATE", value: metrics.confirmation_rate, icon: Icons.rate,      color: "#00a3ff", sub: "overall rate" },
        ].map((c, i) => (
          <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.3px" }}>{c.label}</span>
              <span style={{ color: c.color, width: "16px", height: "16px", display: "flex", alignItems: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width: "100%", height: "100%"}}>{c.icon}</svg>
              </span>
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: "800" }}>{c.value}</div>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "3px" }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." style={{ width: "100%", padding: "7px 10px 7px 32px", borderRadius: "6px", background: "var(--bg-app)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.75rem", outline: "none" }}/>
        </div>
        <CustomSelect id="source" value={sourceFilter} onChange={setSourceFilter} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} placeholder="All Sources"
          options={[{value:"all",label:"All Sources"},{value:"shopify",label:"Shopify"},{value:"sheets",label:"Google Sheets"}]}/>
        <CustomSelect id="status" value={statusFilter} onChange={setStatusFilter} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} placeholder="All Status"
          options={[{value:"all",label:"All Status",dot:"#7239ea"},{value:"pending",label:"Pending",dot:"#ffc700"},{value:"confirmed",label:"Confirmed",dot:"#50cd89"},{value:"processing",label:"Processing",dot:"#00a3ff"},{value:"shipped",label:"Shipped",dot:"#00a3ff"},{value:"delivered",label:"Delivered",dot:"#50cd89"},{value:"cancelled",label:"Cancelled",dot:"#f1416c"},{value:"returned",label:"Returned",dot:"#f1416c"}]}/>
        <CustomSelect id="agent" value={agentFilter} onChange={setAgentFilter} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} placeholder="Tous les agents"
          options={[{value:"all",label:"Tous les agents"},...activeAgents.map(a=>({value:String(a.id),label:a.name}))]}/>
        <CustomSelect id="product" value={productFilter} onChange={setProductFilter} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} placeholder="Tous les produits"
          options={[{value:"all",label:"Tous les produits"},...products.map(p=>({value:String(p.id),label:p.name}))]}/>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div style={{ border: "3px solid var(--border-color)", borderTop: "3px solid var(--purple)", borderRadius: "50%", width: "32px", height: "32px", animation: "spin 1s linear infinite" }}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px" }}>
          <svg style={{ width: "56px", height: "56px", marginBottom: "16px", opacity: 0.12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
          <p style={{ color: "var(--text-muted)", fontWeight: "500" }}>No orders found — create a new order to start</p>
        </div>
      ) : (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(255,255,255,0.02)" }}>
                {["ORDER","CLIENT","ARTICLES","TOTAL","STATUS","AGENT","TRACKING","DATE","ACTION"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", fontWeight: "700", color: "var(--text-muted)", fontSize: "0.65rem", letterSpacing: "0.3px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const ss = getStatusStyle(order.status);
                const isPaid = order.financial_status === "paid";
                return (
                  <tr key={order.id} className="trow" style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: "700" }}>
                      <span onClick={() => setSelectedOrder(order)} style={{ color: "var(--purple)", cursor: "pointer", textDecoration: "underline" }}>{order.order_number}</span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: "700", fontSize: "0.8rem" }}>{order.client?.name || order.customer_name || "—"}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>{order.client?.phone || order.customer_phone || "—"}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ fontSize: "0.75rem", marginBottom: "2px" }}>{item.product_name} <span style={{ color: "var(--purple)", fontWeight: "700" }}>×{item.quantity}</span></div>
                      )) || <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: "700" }}>{order.total_price} {order.currency || currencySymbol}</div>
                      <span style={{ display: "inline-block", fontSize: "0.62rem", padding: "1px 6px", borderRadius: "4px", background: isPaid ? "rgba(27,197,189,0.1)" : "rgba(246,78,96,0.1)", color: isPaid ? "#50cd89" : "#f1416c", marginTop: "3px", fontWeight: "700" }}>{(order.financial_status||"UNPAID").toUpperCase()}</span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ display: "inline-block", padding: "5px 10px", borderRadius: "6px", background: ss.bg, color: ss.text, fontSize: "0.72rem", fontWeight: "700" }}>{order.status.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <select value={order.assigned_to||""} onChange={e => handleAssignAgent(order.id, e.target.value)}
                        style={{ padding: "6px 10px", borderRadius: "6px", background: "var(--bg-app)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.78rem", outline: "none", cursor: "pointer" }}>
                        <option value="">Non assigné</option>
                        {activeAgents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--text-muted)", fontSize: "0.78rem" }}>—</td>
                    <td style={{ padding: "14px 18px", color: "var(--text-muted)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                      {new Date(order.created_at).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => setSelectedOrder(order)} style={{ padding: "5px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "600", background: "rgba(255,255,255,0.05)", color: "var(--text-main)", border: "1px solid var(--border-color)", cursor: "pointer" }}>View</button>
                        {order.status === "pending" && <button onClick={() => handleUpdateStatus(order.id,"confirmed")} style={{ padding: "5px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700", background: "rgba(80,205,137,0.1)", color: "#50cd89", border: "none", cursor: "pointer" }}>Confirm</button>}
                        {order.status === "confirmed" && <button onClick={() => handleUpdateStatus(order.id,"delivered")} style={{ padding: "5px 10px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700", background: "rgba(0,163,255,0.1)", color: "#00a3ff", border: "none", cursor: "pointer" }}>Deliver</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New Manual Order Modal */}
      {isCreateModalOpen && (
        <NewOrderModal
          products={products}
          activeAgents={activeAgents}
          isAbandonedPage={isAbandonedPage}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(msg) => { showToast(msg); setIsCreateModalOpen(false); fetchOrders(); }}
        />
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "20px" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", width: "100%", maxWidth: "620px", padding: "28px", boxShadow: "0 12px 40px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>Order — <span style={{ color: "var(--purple)" }}>{selectedOrder.order_number}</span></h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: "transparent", color: "var(--text-muted)", fontSize: "1.2rem", border: "none", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
              <div>
                <strong style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Client</strong>
                <p style={{ fontWeight: "700", marginTop: "4px" }}>{selectedOrder.client?.name || selectedOrder.customer_name || "—"}</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "2px" }}>{selectedOrder.client?.phone || selectedOrder.customer_phone || "—"}</p>
              </div>
              <div>
                <strong style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Shop</strong>
                <p style={{ fontWeight: "600", marginTop: "4px" }}>{selectedOrder.shop?.name || "—"}</p>
              </div>
            </div>
            <div style={{ marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
              <strong style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>Articles</strong>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.83rem", marginBottom: "8px", background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: "8px" }}>
                  <div><strong>{item.product_name}</strong><div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "2px" }}>Unit: {item.unit_price} {selectedOrder.currency || currencySymbol}</div></div>
                  <div style={{ textAlign: "right" }}><div style={{ fontWeight: "700" }}>×{item.quantity}</div><div style={{ color: "var(--purple)", fontWeight: "600", marginTop: "2px" }}>{item.total_price} {selectedOrder.currency || currencySymbol}</div></div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "0.88rem", fontWeight: "700" }}>
                <span>Total:</span><span style={{ color: "#50cd89" }}>{selectedOrder.total_price} {selectedOrder.currency || currencySymbol}</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
              <div>
                <strong style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Assign Agent</strong>
                <select value={selectedOrder.assigned_to||""} onChange={e => handleAssignAgent(selectedOrder.id, e.target.value)}
                  style={{ padding: "8px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.8rem", outline: "none", width: "100%" }}>
                  <option value="">Non assigné</option>
                  {activeAgents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <strong style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Order Status</strong>
                <select value={selectedOrder.status} onChange={e => handleUpdateStatus(selectedOrder.id, e.target.value)}
                  style={{ padding: "8px", borderRadius: "8px", background: "var(--bg-app)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.8rem", outline: "none", width: "100%" }}>
                  {["pending","confirmed","processing","shipped","delivered","cancelled","returned"].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <strong style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "10px" }}>Action History</strong>
              <div style={{ maxHeight: "160px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                {selectedOrder.histories?.length > 0 ? selectedOrder.histories.map((h, i) => (
                  <div key={i} style={{ fontSize: "0.73rem", borderLeft: "2px solid var(--purple)", paddingLeft: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: "2px" }}>
                      <span>{h.user?.name||"System"}</span><span>{new Date(h.created_at).toLocaleString()}</span>
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
