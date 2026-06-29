/**
 * Single source of truth for ALL status definitions.
 *
 * Every page, badge, filter, dropdown, and helper MUST import from here.
 * Do NOT add another hardcoded status list anywhere else in the frontend.
 */

// ── Order confirmation statuses ──────────────────────────────────────────────

export const ORDER_STATUSES = [
  { value: "new",           label: "New",       color: "#3b82f6", icon: "●" },
  { value: "confirmed",    label: "Confirmed",      color: "#22c55e", icon: "●" },
  { value: "no_response",  label: "No Response",color: "#f59e0b", icon: "◎" },
  { value: "callback",     label: "Callback",        color: "#a855f7", icon: "☎" },
  { value: "cancelled",    label: "Cancelled",        color: "#ef4444", icon: "⊗" },
  { value: "duplicate",    label: "Duplicate",       color: "#94a3b8", icon: "◈" },
  { value: "wrong_number", label: "Wrong Number",color: "#f97316", icon: "⚠" },
  { value: "abandoned",    label: "Abandoned",     color: "#ef4444", icon: "⊗" },
  { value: "recovered",    label: "Recovered",      color: "#22c55e", icon: "↩" },
];

export const STATUS_META = Object.fromEntries(
  ORDER_STATUSES.map((s) => [s.value, { color: s.color, label: s.label }])
);

export function getStatusMeta(value) {
  return (
    ORDER_STATUSES.find((s) => s.value === value) || {
      value: value || "unknown",
      label: value || "Unknown",
      color: "#6b7280",
      icon: "●",
    }
  );
}

// ── Canonical fulfillment statuses (shipment) ────────────────────────────────
// The frontend MUST use only these statuses for filtering, badges, colors,
// translations, and analytics. Provider-specific statuses are NEVER exposed.

export const SHIPMENT_STATUSES = [
  { value: "unfulfilled",        label: "Unfulfilled",        color: "#6B7280", bgColor: "var(--bg-app)",        textColor: "var(--text-main)",  icon: "Clock"         },
  { value: "label_created",      label: "Label Created",      color: "#9CA3AF", bgColor: "var(--bg-app)",        textColor: "var(--text-main)",  icon: "Clock"         },
  { value: "label_purchased",    label: "Label Purchased",    color: "#818CF8", bgColor: "#eef2ff",              textColor: "#3730a3",          icon: "Clock"         },
  { value: "label_printed",      label: "Label Printed",      color: "#6366F1", bgColor: "#eef2ff",              textColor: "#3730a3",          icon: "Truck"         },
  { value: "confirmed",          label: "Confirmed",          color: "#22C55E", bgColor: "var(--success-light)", textColor: "var(--success)",   icon: "CheckCircle2"  },
  { value: "in_transit",         label: "In Transit",         color: "#3B82F6", bgColor: "var(--primary-light)", textColor: "var(--primary)",   icon: "Truck"         },
  { value: "out_for_delivery",   label: "Out for Delivery",   color: "#F59E0B", bgColor: "var(--warning-light)", textColor: "var(--warning)",   icon: "Truck"         },
  { value: "delivered",          label: "Delivered",          color: "#10B981", bgColor: "var(--success-light)", textColor: "var(--success)",   icon: "CheckCircle2"  },
  { value: "attempted_delivery", label: "Attempted Delivery", color: "#F97316", bgColor: "#fff7ed",              textColor: "#9a3412",          icon: "AlertCircle"   },
  { value: "delivery_failed",    label: "Delivery Failed",    color: "#EF4444", bgColor: "#fef2f2",              textColor: "#7f1d1d",          icon: "AlertCircle"   },
  { value: "delayed",            label: "Delayed",            color: "#F97316", bgColor: "#fff7ed",              textColor: "#9a3412",          icon: "Clock"         },
  { value: "returned",           label: "Returned",           color: "#8B5CF6", bgColor: "#f5f3ff",              textColor: "#5b21b6",          icon: "RotateCcw"     },
  { value: "partial",            label: "Partial",            color: "#EAB308", bgColor: "#fefce8",              textColor: "#854d0e",          icon: "Truck"         },
  { value: "fulfilled",          label: "Fulfilled",          color: "#059669", bgColor: "var(--success-light)", textColor: "var(--success)",   icon: "CheckCircle2"  },
];

export const SHIPMENT_STATUS_META = Object.fromEntries(
  SHIPMENT_STATUSES.map((s) => [s.value, { color: s.color, label: s.label, bgColor: s.bgColor, textColor: s.textColor, icon: s.icon }])
);

export function getShipmentStatusMeta(value) {
  return (
    SHIPMENT_STATUSES.find((s) => s.value === value) || {
      value: value || "unknown",
      label: value || "Unknown",
      color: "#6b7280",
      bgColor: "var(--bg-app)",
      textColor: "var(--text-main)",
      icon: "Clock",
    }
  );
}

// ── Fulfillment statuses ─────────────────────────────────────────────────────

export const FULFILLMENT_STATUSES = [
  { value: "unfulfilled",     label: "Unfulfilled", color: "var(--warning)" },
  { value: "fulfilled",       label: "Fulfilled",   color: "var(--success)" },
  { value: "in_transit",      label: "In Transit",  color: "var(--primary)" },
  { value: "delivered",       label: "Delivered",   color: "var(--success)" },
  { value: "delivery_failed", label: "Failed",      color: "var(--danger)" },
];

export const FULFILLMENT_STATUS_META = Object.fromEntries(
  FULFILLMENT_STATUSES.map((s) => [s.value, { color: s.color, label: s.label }])
);

export function getFulfillmentMeta(value) {
  return (
    FULFILLMENT_STATUSES.find((s) => s.value === value) || {
      value: value || "unknown",
      label: value || "Unknown",
      color: "#6b7280",
    }
  );
}

// ── Company / delivery statuses ──────────────────────────────────────────────

export const COMPANY_STATUSES = [
  { slug: "unfulfilled",        label: "Unfulfilled",        color: "#6B7280", icon: "⏳" },
  { slug: "label_created",      label: "Label Created",      color: "#9CA3AF", icon: "🏷️" },
  { slug: "label_purchased",    label: "Label Purchased",    color: "#818CF8", icon: "💳" },
  { slug: "label_printed",      label: "Label Printed",      color: "#6366F1", icon: "🖨️" },
  { slug: "confirmed",          label: "Confirmed",          color: "#22C55E", icon: "✅" },
  { slug: "in_transit",         label: "In Transit",         color: "#3B82F6", icon: "🚚" },
  { slug: "out_for_delivery",   label: "Out for Delivery",   color: "#F59E0B", icon: "📦" },
  { slug: "delivered",          label: "Delivered",          color: "#10B981", icon: "🎉" },
  { slug: "attempted_delivery", label: "Attempted Delivery", color: "#F97316", icon: "🔄" },
  { slug: "delivery_failed",    label: "Delivery Failed",    color: "#EF4444", icon: "❌" },
  { slug: "delayed",            label: "Delayed",            color: "#F97316", icon: "⏳" },
  { slug: "returned",           label: "Returned",           color: "#8B5CF6", icon: "↩️" },
  { slug: "partial",            label: "Partial",            color: "#EAB308", icon: "📦" },
  { slug: "fulfilled",          label: "Fulfilled",          color: "#059669", icon: "✅" },
];

export const COMPANY_STATUS_META = Object.fromEntries(
  COMPANY_STATUSES.map((s) => [s.slug, { color: s.color, label: s.label, icon: s.icon }])
);

export function getCompanyStatusMeta(slug) {
  return (
    COMPANY_STATUSES.find((s) => s.slug === slug) || {
      slug: slug || "unknown",
      label: slug || "Unknown",
      color: "#6b7280",
      icon: "●",
    }
  );
}

// ── Abandoned order statuses ─────────────────────────────────────────────────

export const ABANDONED_ORDER_STATUSES = [
  { value: "all",           label: "All statuses" },
  { value: "open",          label: "Open" },
  { value: "recovered",     label: "Recovered" },
  { value: "recovery_sent", label: "Recovery sent" },
];

export const ABANDONED_ORDER_STATUS_META = {
  open:          { label: "Open",          cls: "open" },
  recovered:     { label: "Recovered",     cls: "recovered" },
  recovery_sent: { label: "Recovery sent", cls: "sent" },
};

// ── Product statuses ─────────────────────────────────────────────────────────

export const PRODUCT_STATUSES = [
  { value: "active",   label: "Active" },
  { value: "draft",    label: "Draft" },
  { value: "archived", label: "Archived" },
];

// ── Financial statuses ───────────────────────────────────────────────────────

export const FINANCIAL_STATUSES = [
  { value: "unpaid",   label: "Unpaid",   cls: "financial-unpaid" },
  { value: "pending",  label: "Pending",  cls: "financial-pending" },
  { value: "paid",     label: "Paid",     cls: "financial-paid" },
  { value: "refunded", label: "Refunded", cls: "financial-refunded" },
];

export const FINANCIAL_STATUS_META = Object.fromEntries(
  FINANCIAL_STATUSES.map((s) => [s.value, { label: s.label, cls: s.cls }])
);

// ── Order sources ────────────────────────────────────────────────────────────

export const ORDER_SOURCES = [
  { value: "Shopify",      label: "Shopify",       color: "var(--purple)", icon: "●" },
  { value: "Facebook",     label: "Facebook",      color: "var(--success)", icon: "●" },
  { value: "Instagram",    label: "Instagram",     color: "var(--primary)", icon: "◎" },
  { value: "TikTok",       label: "TikTok",        color: "var(--purple)", icon: "☎" },
  { value: "Snapchat",     label: "Snapchat",      color: "var(--danger)",  icon: "⊗" },
  { value: "WhatsApp",     label: "WhatsApp",      color: "var(--warning)", icon: "◈" },
  { value: "GoogleSheets", label: "Google Sheets", color: "var(--warning)", icon: "⚠" },
];

export const SOURCE_ICON_MAP = {
  shopify:    { label: "S", color: "#95bf47" },
  facebook:   { label: "f", color: "#1877f2" },
  tiktok:     { label: "T", color: "#010101" },
  instagram:  { label: "ig", color: "#e1306c" },
  whatsapp:   { label: "W", color: "#25d366" },
  manual:     { label: "M", color: "var(--purple)" },
};

// ── Shared helper: get status badge style (for agent/admin order tables) ─────

export function getStatusBadgeStyle(statusValue) {
  const meta = getStatusMeta(statusValue);
  return {
    bg: `color-mix(in srgb, ${meta.color} 10%, transparent)`,
    text: meta.color,
  };
}
