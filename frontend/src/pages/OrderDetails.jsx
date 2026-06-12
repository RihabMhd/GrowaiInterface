import React, { useState } from 'react';
import '../OrderDetails.css';

// ── Utility ──────────────────────────────────────────────────────────────────

const SourceIcon = ({ source }) => {
    const map = {
        shopify:   { label: 'S', color: '#95bf47' },
        facebook:  { label: 'f', color: '#1877f2' },
        tiktok:    { label: 'T', color: '#010101' },
        instagram: { label: 'ig', color: '#e1306c' },
        whatsapp:  { label: 'W', color: '#25d366' },
        manual:    { label: 'M', color: '#7239ea' },
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
        unpaid:   { label: 'Unpaid',   cls: 'financial-unpaid' },
        pending:  { label: 'Pending',  cls: 'financial-pending' },
        paid:     { label: 'Paid',     cls: 'financial-paid' },
        refunded: { label: 'Refunded', cls: 'financial-refunded' },
    };
    const s = map[status?.toLowerCase()] || map.unpaid;
    return <span className={`financial-badge ${s.cls}`}>{s.label}</span>;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString([], {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
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
    { value: 'nouveau',      label: 'Nouveau',         color: '#7239ea' },
    { value: 'confirmed',    label: 'Confirmé',        color: '#50cd89' },
    { value: 'no_response',  label: 'Pas de réponse',  color: '#00a3ff' },
    { value: 'rappel',       label: 'Rappel',          color: '#9b6dff' },
    { value: 'cancelled',    label: 'Annulé',          color: '#f1416c' },
    { value: 'doublon',      label: 'Doublon',         color: '#ffc700' },
    { value: 'wrong_number', label: 'Mauvais numéro',  color: '#fd7e14' },
];

// ── Main Component ────────────────────────────────────────────────────────────

const OrderDetails = ({ order, onClose, onStatusChange, onCreateParcel }) => {
    const [status, setStatus] = useState(order?.status || 'nouveau');
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [pricing, setPricing] = useState({
        subtotal: Number(order?.total_price) - Number(order?.shipping_price) + Number(order?.discount) || 0,
        shipping: Number(order?.shipping_price) || 0,
        discount: Number(order?.discount) || 0,
    });

    const currency = order?.currency || 'MAD';
    const total = pricing.subtotal + pricing.shipping - pricing.discount;

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setPricing(prev => ({ ...prev, [name]: Number(value) }));
    };

    const handleStatusChange = (newVal) => {
        setStatus(newVal);
        setShowStatusMenu(false);
        // Parent expects only new status (order ID is known in parent)
        if (onStatusChange) onStatusChange(newVal);
    };

    const sourceType = order?.source?.type || order?.source_channel || 'shopify';
    const client = order?.client || {};

    const shipping = order?.shipping_address || {
        name: client.name, phone: client.phone,
        address1: client.address, city: client.city,
        province: client.province, country: client.country, zip: client.zip,
    };
    const billing = order?.billing_address || shipping;

    const initials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
    };

    const fulfillmentStatus = order?.fulfillment_status || 'unfulfilled';
    const fulfillmentLabel  = fulfillmentStatus.replace('_', ' ');
    const fulfillmentColor  = fulfillmentStatus === 'fulfilled' ? '#388e3c' : '#f57c00';

    const currentStatusMeta = ORDER_STATUSES_OD.find(s => s.value === status)
        || { label: status, color: '#7239ea' };

    // ── Shared compact card style ─────────────────────────────────────────────
    const card = {
        background: '#fff',
        borderRadius: 10,
        border: '1px solid #f0f0f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
    };

    const cardBody = { padding: '10px 14px' };

    const cardTitle = {
        fontSize: '0.75rem', fontWeight: 700, color: '#888',
        letterSpacing: '0.04em', textTransform: 'uppercase',
        marginBottom: 8,
    };

    const row = {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', fontSize: '0.82rem',
        color: '#444', marginBottom: 4,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f4f4f8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

            {/* ── TOP HEADER BAR ────────────────────────────────────────────── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: '#fff',
                borderBottom: '1px solid #f0f0f0', gap: 10, flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <SourceIcon source={sourceType} />
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#222', whiteSpace: 'nowrap' }}>
                            {order?.order_number || order?.id || '—'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#999', marginTop: 1 }}>
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
                                background: '#f0f0f0', color: '#666', border: 'none',
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
                padding: '7px 14px', background: '#fff',
                borderBottom: '1px solid #f0f0f0', flexShrink: 0, position: 'relative',
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
                        style={{ background: 'none', border: 'none', color: '#7239ea', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: '0 2px' }}
                    >
                        ✎ Change
                    </button>
                    {showStatusMenu && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 14, zIndex: 9999,
                            background: '#fff', border: '1px solid #e8e8ee', borderRadius: 10,
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
                                        fontSize: '0.8rem', fontWeight: 600, color: '#333',
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
                        background: '#7239ea', color: '#fff', border: 'none',
                        borderRadius: 7, padding: '6px 14px',
                        fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5,
                    }}
                >
                    + Create Parcel
                </button>
            </div>

            {/* ── TABS ─────────────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', gap: 0, background: '#fff', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
                {['details', 'history'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '8px 18px', background: 'none', border: 'none',
                            borderBottom: activeTab === tab ? '2px solid #7239ea' : '2px solid transparent',
                            color: activeTab === tab ? '#7239ea' : '#888',
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

                    {/* ── CUSTOMER CARD ─────────────────────────────────────── */}
                    <div style={card}>
                        <div style={{ ...cardBody, paddingBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {/* Avatar */}
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: '#e8e0f8', color: '#7239ea',
                                    fontWeight: 700, fontSize: '0.82rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    {initials(client.name)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {client.name || '—'}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#7239ea', fontWeight: 600, marginTop: 1 }}>
                                        {client.phone || '—'}
                                    </div>
                                </div>
                                {/* Action icons */}
                                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                                    {[
                                        { title: 'Edit', icon: '✎' },
                                        { title: 'Call', icon: '📞' },
                                        { title: 'WhatsApp', icon: '💬' },
                                    ].map(({ title, icon }) => (
                                        <button key={title} title={title} style={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            border: '1px solid #e8e8ee', background: '#fafafa',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.8rem',
                                        }}>
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {client.email && (
                                <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#666' }}>
                                    ✉ {client.email}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── SHIPPING + BILLING (side by side) ─────────────────── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {/* Shipping */}
                        <div style={card}>
                            <div style={cardBody}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                                    <span style={{ fontSize: '0.72rem' }}>📍</span>
                                    <span style={cardTitle}>Shipping</span>
                                    <span style={{
                                        marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 700,
                                        padding: '1px 6px', borderRadius: 10,
                                        color: fulfillmentColor, background: fulfillmentColor + '18',
                                    }}>
                                        {fulfillmentLabel}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#444', lineHeight: 1.55 }}>
                                    {shipping.address1 && <div>{shipping.address1}</div>}
                                    <div>{[shipping.city, shipping.province, shipping.zip].filter(Boolean).join(', ')}</div>
                                    {shipping.country && <div>{shipping.country}</div>}
                                </div>
                            </div>
                        </div>
                        {/* Billing */}
                        <div style={card}>
                            <div style={cardBody}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                                    <span style={{ fontSize: '0.72rem' }}>🏦</span>
                                    <span style={cardTitle}>Billing</span>
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#444', lineHeight: 1.55 }}>
                                    {billing.address1 && <div>{billing.address1}</div>}
                                    <div>{[billing.city, billing.province, billing.zip].filter(Boolean).join(', ')}</div>
                                    {billing.country && <div>{billing.country}</div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── ITEMS CARD ─────────────────────────────────────────── */}
                    <div style={card}>
                        <div style={{ ...cardBody, paddingBottom: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={cardTitle}>Items ({order?.items?.length ?? 0})</span>
                                <button style={{ background: 'none', border: 'none', color: '#7239ea', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                                    + Add Product
                                </button>
                            </div>
                            {order?.items?.length > 0 ? order.items.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '7px 0',
                                    borderTop: i > 0 ? '1px solid #f4f4f8' : 'none',
                                }}>
                                    {/* Thumbnail */}
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 7, background: '#eee',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, overflow: 'hidden', fontSize: '0.65rem', color: '#aaa',
                                    }}>
                                        {item.image_url
                                            ? <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : 'IMG'}
                                    </div>
                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.product_name}
                                        </div>
                                        {item.variant_title && (
                                            <div style={{ fontSize: '0.72rem', color: '#999', marginTop: 1 }}>{item.variant_title}</div>
                                        )}
                                        {item.sku && (
                                            <div style={{ fontSize: '0.68rem', color: '#bbb' }}>SKU: {item.sku}</div>
                                        )}
                                    </div>
                                    {/* Qty controls */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                        <button style={{
                                            width: 22, height: 22, borderRadius: '50%', border: '1px solid #e0e0e0',
                                            background: '#f5f5f5', cursor: 'pointer', fontSize: '0.9rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555',
                                        }}>−</button>
                                        <span style={{ minWidth: 18, textAlign: 'center', fontWeight: 700, fontSize: '0.82rem' }}>
                                            {item.quantity}
                                        </span>
                                        <button style={{
                                            width: 22, height: 22, borderRadius: '50%', border: '1px solid #e0e0e0',
                                            background: '#f5f5f5', cursor: 'pointer', fontSize: '0.9rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555',
                                        }}>+</button>
                                    </div>
                                    {/* Price */}
                                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#222', flexShrink: 0, minWidth: 60, textAlign: 'right' }}>
                                        {item.unit_price} {currency}
                                    </div>
                                </div>
                            )) : (
                                <p style={{ fontSize: '0.8rem', color: '#aaa', margin: '4px 0 8px' }}>No products.</p>
                            )}
                        </div>
                    </div>

                    {/* ── PRICING CARD ───────────────────────────────────────── */}
                    <div style={card}>
                        <div style={cardBody}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={cardTitle}>Pricing</span>
                                <button
                                    onClick={() => setIsEditingPrice(v => !v)}
                                    style={{ background: 'none', border: 'none', color: '#7239ea', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                                >
                                    {isEditingPrice ? 'Save' : '✎ Edit'}
                                </button>
                            </div>

                            {isEditingPrice ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {[
                                        { label: 'Subtotal', name: 'subtotal', value: pricing.subtotal },
                                        { label: 'Shipping', name: 'shipping', value: pricing.shipping },
                                        { label: 'Discount', name: 'discount', value: pricing.discount },
                                    ].map(({ label, name, value }) => (
                                        <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#666' }}>{label}</span>
                                            <input
                                                type="number"
                                                name={name}
                                                value={value}
                                                onChange={handlePriceChange}
                                                style={{
                                                    width: 90, padding: '5px 8px', borderRadius: 6,
                                                    border: '1px solid #ddd', textAlign: 'right',
                                                    fontSize: '0.82rem', outline: 'none',
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {[
                                        { label: 'Subtotal', val: pricing.subtotal },
                                        { label: 'Shipping', val: pricing.shipping },
                                        ...(pricing.discount > 0 ? [{ label: 'Discount', val: `−${pricing.discount}`, red: true }] : []),
                                    ].map(({ label, val, red }) => (
                                        <div key={label} style={{ ...row, color: red ? '#d32f2f' : '#555', marginBottom: 5 }}>
                                            <span>{label}</span>
                                            <span>{val} {currency}</span>
                                        </div>
                                    ))}
                                </>
                            )}

                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                borderTop: '1px solid #f0f0f0', marginTop: 8, paddingTop: 8,
                                fontWeight: 700, fontSize: '0.95rem', color: '#222',
                            }}>
                                <span>Total</span>
                                <span>{total} {currency}</span>
                            </div>
                        </div>
                    </div>

                </>)}

                {/* ── HISTORY TAB ──────────────────────────────────────────────── */}
                {activeTab === 'history' && (
                    <div style={card}>
                        <div style={cardBody}>
                            <div style={cardTitle}>Action History</div>
                            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                                {order?.histories?.length > 0 ? order.histories.map((h, i) => (
                                    <div key={i} style={{
                                        display: 'flex', gap: 12,
                                        paddingBottom: 14, position: 'relative',
                                    }}>
                                        {/* connector line */}
                                        {i < order.histories.length - 1 && (
                                            <div style={{
                                                position: 'absolute', top: 14, left: 4,
                                                width: 2, height: 'calc(100% - 10px)',
                                                background: '#e8e8ee',
                                            }} />
                                        )}
                                        <div style={{
                                            width: 10, height: 10, borderRadius: '50%',
                                            background: '#7239ea', flexShrink: 0, marginTop: 3, zIndex: 1,
                                        }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#333' }}>
                                                {h.description}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#aaa', marginTop: 2 }}>
                                                <span style={{ fontWeight: 600, color: '#777' }}>{h.user?.name || 'System'}</span>
                                                <span>{formatDateShort(h.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <span style={{ fontSize: '0.8rem', color: '#bbb', fontStyle: 'italic' }}>
                                        Aucun historique.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default OrderDetails;