import React, { useState, useEffect, useMemo } from 'react';
import '../OrderDetails.css';
import api from "../api/axios";
import { useShop } from '../context/ShopContext';

// ── Utility ──────────────────────────────────────────────────────────────────

const SourceIcon = ({ source }) => {
    const map = {
        shopify: { label: 'S', color: '#95bf47' },
        facebook: { label: 'f', color: '#1877f2' },
        tiktok: { label: 'T', color: '#010101' },
        instagram: { label: 'ig', color: '#e1306c' },
        whatsapp: { label: 'W', color: '#25d366' },
        manual: { label: 'M', color: 'var(--purple)' },
    };
    const s = map[source?.toLowerCase()] || map.manual;
    return (
        <span style={{
            background: s.color, color: '#fff', width: 20, height: 20,
            borderRadius: 4, display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0,
        }}>
            {s.label}
        </span>
    );
};

const FinancialBadge = ({ status }) => {
    const map = {
        unpaid: { label: 'Unpaid', cls: 'financial-unpaid' },
        pending: { label: 'Pending', cls: 'financial-pending' },
        paid: { label: 'Paid', cls: 'financial-paid' },
        refunded: { label: 'Refunded', cls: 'financial-refunded' },
    };
    const s = map[status?.toLowerCase()] || map.unpaid;
    return <span className={`financial-badge ${s.cls}`}>{s.label}</span>;
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";

    return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

const formatDateShort = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString([], {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const ORDER_STATUSES_OD = [
    { value: 'nouveau', label: 'Nouveau', color: 'var(--purple)' },
    { value: 'confirmed', label: 'Confirmé', color: 'var(--success)' },
    { value: 'no_response', label: 'Pas de réponse', color: '#00a3ff' },
    { value: 'rappel', label: 'Rappel', color: '#9b6dff' },
    { value: 'cancelled', label: 'Annulé', color: 'var(--danger)' },
    { value: 'doublon', label: 'Doublon', color: 'var(--warning)' },
    { value: 'wrong_number', label: 'Mauvais numéro', color: '#fd7e14' },
];

// ── Main Component ────────────────────────────────────────────────────────────

const OrderDetails = ({
    order,
    onClose,
    onStatusChange,
    onCreateParcel,
    onOrderUpdated,
}) => {
    const { activeShopId } = useShop();
    const [status, setStatus] = useState(order?.status || 'nouveau');
    useEffect(() => {
        setStatus(order?.status || 'nouveau');
    }, [order?.status]);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    // ── FIX: Only declare isEditingPrice once ──
    const [isEditingPrice, setIsEditingPrice] = useState(false);

    // ── FIX: Use computed values instead of stored state ──
    // Use different variable names to avoid conflicts with shipping object below
    const [shippingCost, setShippingCost] = useState(Number(order?.shipping_price) || 0);
    const [discountAmount, setDiscountAmount] = useState(Number(order?.discount) || 0);

    // Compute subtotal from items
    const computeSubtotal = (items) => {
        if (!items || items.length === 0) return 0;
        return items.reduce((sum, item) => {
            const price = Number(item.unit_price) || 0;
            const qty = Number(item.quantity) || 0;
            return sum + (price * qty);
        }, 0);
    };

    const subtotal = useMemo(() => computeSubtotal(order?.items), [order?.items]);
    // ────────────────────────────────────────────────────────

    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [productResults, setProductResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productQty, setProductQty] = useState(1);
    const [productSearchLoading, setProductSearchLoading] = useState(false);

    const [customerForm, setCustomerForm] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        city: '',
        province: '',
        street: '',
    });

    const currency = order?.currency || 'MAD';

    // ── FIX: Use different variable name to avoid conflict ──
    const orderTotal = subtotal + shippingCost - discountAmount;

    const handleStatusChange = (newVal) => {
        setStatus(newVal);
        setShowStatusMenu(false);
        if (onStatusChange) onStatusChange(newVal);
    };

    const handleCustomerSave = async () => {
        try {
            const response = await api.put(
                `/orders/${order.id}`,
                customerForm
            );

            const updatedOrder =
                response.data.data ?? response.data;

            onOrderUpdated?.(updatedOrder);

            setShowCustomerModal(false);

        } catch (err) {
            console.error('Failed to update customer:', err);
        }
    };

    const handleProductSearch = async (val) => {
        setProductSearch(val);
        if (!activeShopId) { setProductResults([]); return; }
        setProductSearchLoading(true);
        try {
            const res = await api.get(`/shops/${activeShopId}/products`, {
                params: val.trim() ? { search: val } : {},
            });
            setProductResults(res.data?.data ?? []);
        } catch (err) {
            console.error('Product search failed:', err);
        } finally {
            setProductSearchLoading(false);
        }
    };

    const handleLoadAllProducts = async () => {
        if (!activeShopId) return;
        setProductSearchLoading(true);
        try {
            const res = await api.get(`/shops/${activeShopId}/products`);
            setProductResults(res.data?.data ?? []);
        } catch (err) {
            console.error('Failed to load products:', err);
        } finally {
            setProductSearchLoading(false);
        }
    };

    const handleAddProduct = async () => {
        if (!selectedProduct) return;
        try {
            const existingItems = (order.items || []).map(i => ({
                product_id: i.product_id,
                quantity: i.quantity,
            }));
            const existingIndex = existingItems.findIndex(i => i.product_id === selectedProduct.id);
            if (existingIndex >= 0) {
                existingItems[existingIndex].quantity += productQty;
            } else {
                existingItems.push({ product_id: selectedProduct.id, quantity: productQty });
            }
            const res = await api.put(`/orders/${order.id}`, { items: existingItems });
            if (res.data) {
                onOrderUpdated?.(res.data.data ?? res.data);
            }
            setShowProductModal(false);
            setProductSearch('');
            setProductResults([]);
            setSelectedProduct(null);
            setProductQty(1);
        } catch (err) {
            console.error('Failed to add product:', err);
        }
    };

    const sourceType = order?.source?.type || order?.source_channel || 'shopify';
    const client = {
        name: order?.customer_name || order?.client?.name || '',
        phone: order?.customer_phone || order?.client?.phone || '',
        email: order?.customer_email || order?.client?.email || '',
        address: order?.street || order?.client?.address || '',
        city: order?.city || order?.client?.city || '',
        province: order?.province || '',
    };

    // ── FIX: Rename to shippingAddress to avoid conflict ──
    const shippingAddress = order?.shipping_address || {
        name: client.name, phone: client.phone,
        address1: client.address, city: client.city,
        province: client.province, country: client.country, zip: client.zip,
    };
    const billing = order?.billing_address || shippingAddress;

    const initials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
    };

    const fulfillmentStatus = order?.fulfillment_status || 'unfulfilled';
    const fulfillmentLabel = fulfillmentStatus.replace('_', ' ');
    const fulfillmentColor = fulfillmentStatus === 'fulfilled' ? 'var(--success)' : 'var(--warning)';

    const currentStatusMeta = ORDER_STATUSES_OD.find(s => s.value === status)
        || { label: status, color: 'var(--purple)' };

    const card = {
        background: 'var(--bg-card)',
        borderRadius: 10,
        border: '1px solid var(--border-color)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        flexShrink: 0,
    };

    const cardBody = { padding: '10px 14px' };

    const cardTitle = {
        fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
        letterSpacing: '0.04em', textTransform: 'uppercase',
        marginBottom: 8,
    };

    const row = {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', fontSize: '0.82rem',
        color: 'var(--text-main)', marginBottom: 4,
    };

    const [histories, setHistories] = useState(order?.histories ?? []);

    useEffect(() => {
        api.get(`/orders/${order.id}?with=histories`)
            .then(r => setHistories(r.data?.data?.histories ?? r.data?.histories ?? []))
    }, [order.id]);
    // ── FIX: Update to use shippingCost and discountAmount ──
    useEffect(() => {
        if (!order) return;

        setCustomerForm({
            customer_name: order.customer_name || client.name || '',
            customer_phone: order.customer_phone || client.phone || '',
            customer_email: order.customer_email || client.email || '',
            city: order.city || shippingAddress.city || '',
            province: order.province || shippingAddress.province || '',
            street: order.street || shippingAddress.address1 || '',
        });

        // Sync shipping and discount with order data
        setShippingCost(Number(order?.shipping_price) || 0);
        setDiscountAmount(Number(order?.discount) || 0);
    }, [order]);

    useEffect(() => {
        if (showProductModal && activeShopId) {
            handleLoadAllProducts();
        }
    }, [showProductModal]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-app)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

            {/* ── TOP HEADER BAR ────────────────────────────────────────────── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-color)', gap: 10, flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <SourceIcon source={sourceType} />
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                            {order?.order_number || order?.id || '—'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>
                            {formatDate(order?.created_at)}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <FinancialBadge status={order?.financial_status} />
                    {onClose && (
                        <button
                            onClick={onClose}
                            style={{
                                background: 'var(--bg-app)', color: 'var(--text-muted)', border: 'none',
                                width: 26, height: 26, borderRadius: '50%', fontSize: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', flexShrink: 0,
                            }}
                        >✕</button>
                    )}
                </div>
            </div>

            {/* ── STATUS + CREATE PARCEL BAR ─────────────────────────────────── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 14px', background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-color)', flexShrink: 0, position: 'relative',
            }}>
                {/* Status pill + change btn */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 20,
                        background: currentStatusMeta.color + '18',
                        border: `1px solid ${currentStatusMeta.color}33`,
                        fontSize: '0.75rem', fontWeight: 700, color: currentStatusMeta.color,
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: currentStatusMeta.color }} />
                        {currentStatusMeta.label}
                    </span>
                    <button
                        onClick={() => setShowStatusMenu(v => !v)}
                        style={{ background: 'none', border: 'none', color: 'var(--purple)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: '0 2px' }}
                    >
                        ✎ Change
                    </button>
                    {showStatusMenu && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 14, zIndex: 9999,
                            background: 'var(--bg-card)', border: '1px solid #e8e8ee', borderRadius: 10,
                            padding: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 180,
                        }}>
                            {ORDER_STATUSES_OD.map(s => (
                                <div
                                    key={s.value}
                                    onClick={() => handleStatusChange(s.value)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '7px 10px', borderRadius: 7, cursor: 'pointer',
                                        background: s.value === status ? s.color + '18' : 'transparent',
                                        fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)',
                                    }}
                                >
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                                    {s.label}
                                    {s.value === status && (
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="3" style={{ marginLeft: 'auto' }}>
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={onCreateParcel}
                    style={{
                        background: 'var(--purple)', color: '#fff', border: 'none',
                        borderRadius: 7, padding: '6px 14px',
                        fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5,
                    }}
                >
                    + Create Parcel
                </button>
            </div>

            {/* ── TABS ─────────────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 0, background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
                {['details', 'history'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '8px 18px', background: 'none', border: 'none',
                            borderBottom: activeTab === tab ? '2px solid var(--purple)' : '2px solid transparent',
                            color: activeTab === tab ? 'var(--purple)' : 'var(--text-muted)',
                            fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                            textTransform: 'capitalize',
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* ── SCROLLABLE BODY ───────────────────────────────────────────────── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>

                {activeTab === 'details' && (<>

                    {/* ── CUSTOMER SECTION (inline edit or read-only) ──────── */}
                    {showCustomerModal ? (
                        <div style={{ ...card, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12 }}>
                            <div style={{ padding: '20px 24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.03em' }}>EDIT CUSTOMER</div>
                                    <button onClick={() => setShowCustomerModal(false)} style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'var(--text-muted)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.65rem' }}>✕</button>
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                        <span style={{ fontSize: '0.75rem' }}>🚚</span>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>DELIVERY COMPANY</span>
                                    </div>
                                    <select style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.88rem', color: 'var(--text-main)', background: 'var(--bg-card)', boxSizing: 'border-box' }}>
                                        <option value="" style={{ color: 'var(--text-muted)' }}>🚚 Select company...</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                        <span style={{ fontSize: '0.75rem' }}>👤</span>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>CUSTOMER</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <input placeholder="Name" type="text" value={customerForm.customer_name} onChange={e => setCustomerForm(prev => ({ ...prev, customer_name: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box', background: 'var(--bg-input)', color: 'var(--text-main)' }} />
                                        <input placeholder="Phone" type="text" value={customerForm.customer_phone} onChange={e => setCustomerForm(prev => ({ ...prev, customer_phone: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box', background: 'var(--bg-input)', color: 'var(--text-main)' }} />
                                        <input placeholder="Email (optional)" type="email" value={customerForm.customer_email} onChange={e => setCustomerForm(prev => ({ ...prev, customer_email: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box', background: 'var(--bg-input)', color: 'var(--text-main)' }} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                        <span style={{ fontSize: '0.75rem' }}>📍</span>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>SHIPPING ADDRESS</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <input placeholder="Province" type="text" value={customerForm.province} onChange={e => setCustomerForm(prev => ({ ...prev, province: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box', background: 'var(--bg-input)', color: 'var(--text-main)' }} />
                                        <input placeholder="City" type="text" value={customerForm.city} onChange={e => setCustomerForm(prev => ({ ...prev, city: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box', background: 'var(--bg-input)', color: 'var(--text-main)' }} />
                                        <input placeholder="Street" type="text" value={customerForm.street} onChange={e => setCustomerForm(prev => ({ ...prev, street: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box', background: 'var(--bg-input)', color: 'var(--text-main)' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => setShowCustomerModal(false)} style={{ flex: 1, padding: '11px', borderRadius: 8, border: 'none', background: 'var(--bg-app)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>Cancel</button>
                                    <button onClick={handleCustomerSave} style={{ flex: 1.5, padding: '11px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        <span style={{ background: 'var(--bg-card)', color: 'var(--primary)', borderRadius: '50%', width: 14, height: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>✓</span> Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ ...card, background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 12 }}>
                            <div style={{ padding: '20px 24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--purple-light)', color: 'var(--purple)', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials(client.name)}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{client.name || '—'}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 3 }}>{client.phone || '—'}</div>
                                        {client.email && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>{client.email}</div>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                        <button title="Edit" onClick={() => setShowCustomerModal(true)} style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: 'var(--bg-app)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>✎</button>
                                        <button title="Call" style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: 'var(--primary-light)', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>📞</button>
                                        <button title="WhatsApp" style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: 'var(--success-light)', color: 'var(--success)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>💬</button>
                                    </div>
                                </div>
                                <div style={{ height: 1, background: 'var(--border-color)', margin: '0 -24px 20px' }} />
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>SHIPPING</span>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: 12, color: 'var(--warning)', background: 'var(--warning-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--warning)' }} /> UNFULFILLED
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                                        {shippingAddress.address1 && <div>{shippingAddress.address1}</div>}
                                        <div>{[shippingAddress.city, shippingAddress.province, shippingAddress.zip].filter(Boolean).join(', ')}</div>
                                        {shippingAddress.country && <div>{shippingAddress.country}</div>}
                                    </div>
                                </div>
                                <div style={{ height: 1, background: 'var(--border-color)', margin: '0 -24px 20px' }} />
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🏢</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>BILLING</span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                                        {billing.address1 && <div>{billing.address1}</div>}
                                        <div>{[billing.city, billing.province, billing.zip].filter(Boolean).join(', ')}</div>
                                        {billing.country && <div>{billing.country}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── ITEMS CARD ─────────────────────────────────────────── */}
                    <div style={card}>
                        <div style={{ ...cardBody, paddingBottom: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={cardTitle}>Items ({order?.items?.length ?? 0})</span>
                                <button
                                    onClick={() => { setShowProductModal(true); handleLoadAllProducts(); }}
                                    style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                    + Add Product
                                </button>
                            </div>
                            {order?.items?.length > 0 ? order.items.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '7px 0',
                                    borderTop: i > 0 ? '1px solid var(--border-color)' : 'none',
                                }}>
                                    {/* Thumbnail */}
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 7, background: 'var(--bg-app)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, overflow: 'hidden', fontSize: '0.65rem', color: 'var(--text-muted)',
                                    }}>
                                        {(item.image_url || item.product?.image)
                                            ? <img src={item.image_url || item.product?.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : 'IMG'}
                                    </div>
                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.product_name}
                                        </div>
                                        {item.variant_title && (
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>{item.variant_title}</div>
                                        )}
                                        {item.sku && (
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>SKU: {item.sku}</div>
                                        )}
                                    </div>
                                    {/* Qty controls */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                        <button onClick={async (e) => {
                                            e.stopPropagation(); e.preventDefault();
                                            const newQty = item.quantity - 1;
                                            if (newQty < 1) return;
                                            const updatedItems = order.items.map(i =>
                                                i.id === item.id ? { product_id: i.product_id, quantity: newQty } : { product_id: i.product_id, quantity: i.quantity }
                                            );
                                            try {
                                                const res = await api.put(`/orders/${order.id}`, { items: updatedItems });
                                                if (res.data) {
                                                    onOrderUpdated?.(res.data.data ?? res.data);
                                                }
                                            } catch (err) {
                                                console.error('Failed to update quantity:', err);
                                            }
                                        }} style={{
                                            width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--border-color)',
                                            background: 'var(--bg-app)', cursor: 'pointer', fontSize: '0.9rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
                                        }}>−</button>
                                        <span style={{ minWidth: 18, textAlign: 'center', fontWeight: 700, fontSize: '0.82rem' }}>
                                            {item.quantity}
                                        </span>
                                        <button onClick={async (e) => {
                                            e.stopPropagation(); e.preventDefault();
                                            const newQty = item.quantity + 1;
                                            const updatedItems = order.items.map(i =>
                                                i.id === item.id ? { product_id: i.product_id, quantity: newQty } : { product_id: i.product_id, quantity: i.quantity }
                                            );
                                            try {
                                                const res = await api.put(`/orders/${order.id}`, { items: updatedItems });
                                                if (res.data) {
                                                    onOrderUpdated?.(res.data.data ?? res.data);
                                                }
                                            } catch (err) {
                                                console.error('Failed to update quantity:', err);
                                            }
                                        }} style={{
                                            width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--border-color)',
                                            background: 'var(--bg-app)', cursor: 'pointer', fontSize: '0.9rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
                                        }}>+</button>
                                    </div>
                                    {/* Price */}
                                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)', flexShrink: 0, minWidth: 60, textAlign: 'right' }}>
                                        {item.unit_price} {currency}
                                    </div>
                                </div>
                            )) : (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 8px' }}>No products.</p>
                            )}
                        </div>
                    </div>

                    {/* ── PRICING CARD (FIXED) ───────────────────────────────────────── */}
                    <div style={card}>
                        <div style={cardBody}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={cardTitle}>Pricing</span>
                                <button
                                    onClick={() => setIsEditingPrice(v => !v)}
                                    style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                    {isEditingPrice ? 'Save' : '✎ Edit'}
                                </button>
                            </div>

                            {isEditingPrice ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Subtotal (auto)</span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{subtotal} {currency}</span>
                                    </div>
                                    {[
                                        { label: 'Shipping', name: 'shipping', value: shippingCost },
                                        { label: 'Discount', name: 'discount', value: discountAmount },
                                    ].map(({ label, name, value }) => (
                                        <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</span>
                                            <input
                                                type="number"
                                                name={name}
                                                value={value}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (name === 'shipping') setShippingCost(val);
                                                    else setDiscountAmount(val);
                                                }}
                                                style={{
                                                    width: 90, padding: '5px 8px', borderRadius: 6,
                                                    border: '1px solid var(--border-color)', textAlign: 'right',
                                                    fontSize: '0.82rem', outline: 'none',
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div style={{ ...row, marginBottom: 5 }}>
                                        <span>Subtotal</span>
                                        <span>{subtotal} {currency}</span>
                                    </div>
                                    {shippingCost > 0 && (
                                        <div style={{ ...row, marginBottom: 5 }}>
                                            <span>Shipping</span>
                                            <span>{shippingCost} {currency}</span>
                                        </div>
                                    )}
                                    {discountAmount > 0 && (
                                        <div style={{ ...row, color: 'var(--danger)', marginBottom: 5 }}>
                                            <span>Discount</span>
                                            <span>−{discountAmount} {currency}</span>
                                        </div>
                                    )}
                                </>
                            )}

                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                borderTop: '1px solid var(--border-color)', marginTop: 8, paddingTop: 8,
                                fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)',
                            }}>
                                <span>Total</span>
                                <span>{subtotal + shippingCost - discountAmount} {currency}</span>
                            </div>
                        </div>
                    </div>
                    {/* ─────────────────────────────────────────────────────────── */}

                </>)}

                {activeTab === 'history' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, minHeight: 0 }}>
                        {/* CONFIRMATION STATUS */}
                        <div style={{ background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 16px 12px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
                                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--purple-light)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>✓</div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>CONFIRMATION STATUS</div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                                {(() => {
                                    const statusHistories = (histories || []).filter(
                                        h => h.action_type === 'status_changed'
                                    );
                                    return statusHistories.length > 0 ? (
                                        [...statusHistories].reverse().map((h, i, arr) => {
                                            const newMeta = ORDER_STATUSES_OD.find(s => s.value === h.new_value) || { label: h.new_value || h.action_type, color: 'var(--purple)' };
                                            return (
                                                <div key={h.id ?? i} style={{ display: 'flex', gap: 12, paddingBottom: 20, position: 'relative' }}>
                                                    {i < arr.length - 1 && (
                                                        <div style={{ position: 'absolute', top: 20, left: 7, width: 2, height: 'calc(100% - 20px)', background: 'var(--border-color)' }} />
                                                    )}
                                                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `3px solid ${newMeta.color}30`, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, zIndex: 1 }}>
                                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: newMeta.color }} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ marginBottom: 4 }}>
                                                            <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: newMeta.color + '18', color: newMeta.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: newMeta.color }} />
                                                                {newMeta.label}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                            <span>{formatDateShort(h.created_at)}</span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                                                {h.user?.name || 'System'}
                                                            </span>
                                                        </div>
                                                        {h.action_type !== 'status_changed' &&
                                                            h.action_type !== 'status_changed' && (
                                                                <div style={{ marginTop: 3, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{h.description}</div>
                                                            )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Aucun historique de confirmation.</div>
                                    )
                                })()}
                            </div>
                        </div>

                        {/* DELIVERY STATUS */}
                        <div style={{ background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 16px 12px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
                                <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', fontSize: '1rem' }}>📦</div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>DELIVERY STATUS</div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <svg style={{ color: 'var(--text-muted)', marginBottom: 12 }} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14L15 21H9L5 8Z"></path><path d="M12 3v5"></path><path d="m9 3 3 5"></path><path d="m15 3-3 5"></path></svg>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>No delivery updates yet</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Delivery company status changes will appear here</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Spacer for Safari/Chrome scroll padding bug */}
                <div style={{ height: 16, flexShrink: 0 }} />
            </div>

            {/* ── ADD PRODUCT MODAL ────────────────────────────────────────────── */}
            {showProductModal && (
                <div
                    onClick={() => { setShowProductModal(false); setProductSearch(''); setProductResults([]); setSelectedProduct(null); setProductQty(1); }}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-card)', borderRadius: 12, padding: 20,
                            width: 360, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                        }}
                    >
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: 12 }}>
                            Add Product
                        </div>

                        {!selectedProduct ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={productSearch}
                                    onChange={e => handleProductSearch(e.target.value)}
                                    style={{
                                        width: '100%', padding: '8px 10px', borderRadius: 7,
                                        border: '1px solid var(--border-color)', fontSize: '0.85rem',
                                        outline: 'none', boxSizing: 'border-box', marginBottom: 10,
                                        background: 'var(--bg-input)', color: 'var(--text-main)',
                                    }}
                                />
                                <div style={{ flex: 1, overflowY: 'auto', maxHeight: 280 }}>
                                    {productSearchLoading && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px 0' }}>Searching...</div>
                                    )}
                                    {!productSearchLoading && productResults.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => setSelectedProduct(p)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                padding: '8px 6px', borderRadius: 7, cursor: 'pointer',
                                                borderBottom: '1px solid var(--border-color)',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{
                                                width: 38, height: 38, borderRadius: 6, background: 'var(--bg-app)',
                                                flexShrink: 0, overflow: 'hidden',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.65rem', color: 'var(--text-muted)',
                                            }}>
                                                {p.image
                                                    ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : 'IMG'}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {p.title}
                                                </div>
                                                {p.vendor && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.vendor}</div>}
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)', flexShrink: 0 }}>
                                                {p.variants?.[0]?.price} {currency}
                                            </div>
                                        </div>
                                    ))}
                                    {!productSearchLoading && productSearch && productResults.length === 0 && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px 0' }}>No products found.</div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 8, background: 'var(--bg-app)',
                                        flexShrink: 0, overflow: 'hidden',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.65rem', color: 'var(--text-muted)',
                                    }}>
                                        {selectedProduct.image
                                            ? <img src={selectedProduct.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : 'IMG'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{selectedProduct.title}</div>
                                        {selectedProduct.vendor && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selectedProduct.vendor}</div>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Quantity</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <button
                                            onClick={() => setProductQty(q => Math.max(1, q - 1))}
                                            style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-app)', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
                                        >−</button>
                                        <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{productQty}</span>
                                        <button
                                            onClick={() => setProductQty(q => q + 1)}
                                            style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-app)', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
                                        >+</button>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                                    Price: <strong>{selectedProduct.variants?.[0]?.price} {currency}</strong>
                                </div>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    style={{ background: 'none', border: 'none', color: 'var(--purple)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, marginBottom: 8 }}
                                >← Back to search</button>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button
                                onClick={() => { setShowProductModal(false); setProductSearch(''); setProductResults([]); setSelectedProduct(null); setProductQty(1); }}
                                style={{
                                    flex: 1, padding: '8px 0', borderRadius: 7,
                                    background: 'var(--bg-app)', color: 'var(--text-muted)',
                                    border: 'none', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                                }}
                            >Cancel</button>
                            <button
                                onClick={handleAddProduct}
                                disabled={!selectedProduct}
                                style={{
                                    flex: 1, padding: '8px 0', borderRadius: 7,
                                    background: selectedProduct ? 'var(--purple)' : 'var(--purple-light)', color: '#fff',
                                    border: 'none', fontWeight: 700, fontSize: '0.82rem',
                                    cursor: selectedProduct ? 'pointer' : 'not-allowed',
                                }}
                            >Add to Order</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OrderDetails;