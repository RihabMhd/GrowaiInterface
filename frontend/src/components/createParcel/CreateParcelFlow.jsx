import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { companiesService } from "../../services/companiesService";
import { shipmentsService } from "../../services/shipmentsService";

// ─── Design tokens ────────────────────────────────────────────────────────────
const css = `
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .cpf-modal {
    animation: modalIn 0.18s cubic-bezier(0.16,1,0.3,1) both;
  }

  .cpf-input:focus {
    outline: none;
    border-color: #7C3AED !important;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
  }
  .cpf-input.valid {
    border-color: #10B981 !important;
  }
  .cpf-input.error-state {
    border-color: #EF4444 !important;
  }
  .cpf-input.error-state:focus {
    box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
  }

  .cpf-select {
    appearance: none;
    -webkit-appearance: none;
  }
  .cpf-select:focus {
    outline: none;
    border-color: #7C3AED !important;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
  }

  .cpf-carrier-row {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid var(--border-color, #E5E7EB);
    background: var(--bg-card, #fff);
    cursor: pointer;
    text-align: left;
    transition: border-color 0.13s, background 0.13s, box-shadow 0.13s;
    margin-bottom: 8px;
  }
  .cpf-carrier-row:hover {
    border-color: #7C3AED;
    box-shadow: 0 2px 12px rgba(124,58,237,0.08);
  }
  .cpf-carrier-row:last-child { margin-bottom: 0; }

  .cpf-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 16px;
    border-radius: 10px;
    background: var(--bg-app, #F9FAFB);
    border: 1px solid var(--border-color, #E5E7EB);
    margin-bottom: 8px;
    gap: 12px;
  }
  .cpf-toggle-row:last-of-type { margin-bottom: 0; }

  .cpf-toggle-btn {
    flex-shrink: 0;
    width: 44px;
    height: 24px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    position: relative;
    transition: background 0.15s ease;
  }
  .cpf-toggle-thumb {
    position: absolute;
    top: 2px;
    width: 20px;
    height: 20px;
    border-radius: 999px;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.18);
    transition: left 0.15s ease;
  }

  .cpf-btn-back {
    flex: 1;
    padding: 11px 16px;
    border-radius: 10px;
    background: transparent;
    border: 1px solid var(--border-color, #E5E7EB);
    color: var(--text-main, #111);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.12s;
  }
  .cpf-btn-back:hover { background: var(--bg-app, #F9FAFB); }

  .cpf-btn-submit {
    flex: 2;
    padding: 11px 16px;
    border-radius: 10px;
    background: #7C3AED;
    border: none;
    color: #fff;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    transition: background 0.12s, opacity 0.12s;
  }
  .cpf-btn-submit:hover:not(:disabled) { background: #6D28D9; }
  .cpf-btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

  .cpf-clearable-select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  .cpf-clearable-select-wrapper select {
    padding-right: 52px;
  }
  .cpf-select-icons {
    position: absolute;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 4px;
    pointer-events: none;
  }
  .cpf-select-icons .clear-btn {
    pointer-events: auto;
    cursor: pointer;
    color: #9CA3AF;
    font-size: 0.9rem;
    line-height: 1;
    background: none;
    border: none;
    padding: 0 2px;
    display: flex;
    align-items: center;
  }
  .cpf-select-icons .clear-btn:hover { color: #374151; }
`;

// ─── Required asterisk ─────────────────────────────────────────────────────
function Req() {
  return <span style={{ color: "#EF4444", marginLeft: 2 }}>*</span>;
}

// ─── Field wrapper ─────────────────────────────────────────────────────────
function Field({ label, error, required, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main, #111)" }}>
          {label}
          {required && <Req />}
        </label>
        {error && (
          <span style={{ fontSize: "0.72rem", color: "#EF4444", fontWeight: 600 }}>{error}</span>
        )}
      </div>
      {children}
      {hint && !error && (
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #6B7280)", marginTop: 2 }}>{hint}</span>
      )}
    </div>
  );
}

// ─── Input ─────────────────────────────────────────────────────────────────
function Input({ value, onChange, placeholder, type = "text", error, valid, suffix }) {
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    paddingRight: suffix ? 38 : 12,
    borderRadius: 8,
    border: `1px solid ${error ? "#EF4444" : valid ? "#10B981" : "var(--border-color, #E5E7EB)"}`,
    fontSize: "0.875rem",
    boxSizing: "border-box",
    background: "var(--bg-input, #fff)",
    color: "var(--text-main, #111)",
    transition: "border-color 0.12s, box-shadow 0.12s",
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
        className={`cpf-input${valid ? " valid" : ""}${error ? " error-state" : ""}`}
      />
      {suffix && (
        <span style={{
          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
          display: "flex", alignItems: "center",
        }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

// ─── Textarea ──────────────────────────────────────────────────────────────
function Textarea({ value, onChange, placeholder, error, minHeight = 80 }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`cpf-input${error ? " error-state" : ""}`}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 8,
        border: `1px solid ${error ? "#EF4444" : "var(--border-color, #E5E7EB)"}`,
        fontSize: "0.875rem",
        boxSizing: "border-box",
        background: "var(--bg-input, #fff)",
        color: "var(--text-main, #111)",
        minHeight,
        resize: "vertical",
        transition: "border-color 0.12s, box-shadow 0.12s",
      }}
    />
  );
}

// ─── City select (styled, full-width chevron) ─────────────────────────────
function CitySelect({ value, onChange, options, error, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`cpf-select${error ? " error-state" : ""}`}
        style={{
          width: "100%",
          padding: "10px 36px 10px 12px",
          borderRadius: 8,
          border: `1px solid ${error ? "#EF4444" : "var(--border-color, #E5E7EB)"}`,
          fontSize: "0.875rem",
          boxSizing: "border-box",
          background: "var(--bg-input, #fff)",
          color: value ? "var(--text-main, #111)" : "var(--text-muted, #9CA3AF)",
          cursor: "pointer",
          transition: "border-color 0.12s, box-shadow 0.12s",
        }}
      >
        <option value="" disabled style={{ color: "#9CA3AF" }}>{placeholder}</option>
        {(options || []).map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
      <span style={{
        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
        pointerEvents: "none", color: "#9CA3AF",
      }}>
        <ChevronIcon />
      </span>
    </div>
  );
}

// ─── Clearable select (delivery type) ────────────────────────────────────
function ClearableSelect({ value, onChange, options, error, placeholder }) {
  return (
    <div className="cpf-clearable-select-wrapper">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`cpf-select${error ? " error-state" : ""}`}
        style={{
          width: "100%",
          padding: "10px 52px 10px 12px",
          borderRadius: 8,
          border: `1px solid ${error ? "#EF4444" : "var(--border-color, #E5E7EB)"}`,
          fontSize: "0.875rem",
          boxSizing: "border-box",
          background: "var(--bg-input, #fff)",
          color: value ? "var(--text-main, #111)" : "var(--text-muted, #9CA3AF)",
          cursor: "pointer",
          transition: "border-color 0.12s, box-shadow 0.12s",
        }}
      >
        <option value="">{placeholder}</option>
        {(options || []).map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="cpf-select-icons">
        {value && (
          <button
            type="button"
            className="clear-btn"
            onClick={() => onChange("")}
            aria-label="Clear selection"
          >
            ✕
          </button>
        )}
        <ChevronIcon />
      </span>
    </div>
  );
}

// ─── Toggle row ────────────────────────────────────────────────────────────
function SwitchRow({ label, checked, onChange, required }) {
  return (
    <div className="cpf-toggle-row">
      <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-main, #111)" }}>
        {label}
        {required && <Req />}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="cpf-toggle-btn"
        style={{ background: checked ? "#7C3AED" : "#D1D5DB" }}
      >
        <span
          className="cpf-toggle-thumb"
          style={{ left: checked ? 22 : 2 }}
        />
      </button>
    </div>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────
function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 3l5 5-5 5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill="#10B981" />
      <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="4" width="12" height="9" rx="1.5" stroke="white" strokeWidth="1.3" />
      <path d="M1 7h12M5 4V2.5a2 2 0 014 0V4" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Carrier logo avatar ───────────────────────────────────────────────────
function CarrierAvatar({ company, size = 40, radius = 10 }) {
  if (company?.logo_url) {
    return (
      <img
        src={company.logo_url}
        alt={company.name}
        style={{ width: size, height: size, borderRadius: radius, objectFit: "contain", background: "#F3F4F6", border: "1px solid #E5E7EB", flexShrink: 0 }}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    );
  }
  // Fallback: colored circle with initials
  const initial = company?.name?.[0]?.toUpperCase() ?? "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: "#EDE9FE", color: "#7C3AED",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: size * 0.38,
    }}>
      {initial}
    </div>
  );
}

// ─── Modal header ──────────────────────────────────────────────────────────
function ModalHeader({ title, subtitle, company, onClose }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 20px", borderBottom: "1px solid var(--border-color, #E5E7EB)",
      flexShrink: 0, gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {company ? (
          <CarrierAvatar company={company} size={40} radius={10} />
        ) : (
          // Step 1: purple box icon (package)
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: "#7C3AED",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="6" width="16" height="12" rx="2" stroke="white" strokeWidth="1.6" />
              <path d="M2 10h16M7 6V4a3 3 0 016 0v2" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
        )}
        <div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main, #111)", lineHeight: 1.2 }}>{title}</div>
          {subtitle && <div style={{ fontSize: "0.8rem", color: "var(--text-muted, #6B7280)", marginTop: 3 }}>{subtitle}</div>}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "var(--bg-app, #F9FAFB)",
          border: "1px solid var(--border-color, #E5E7EB)",
          color: "var(--text-muted, #6B7280)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1rem", flexShrink: 0,
          transition: "background 0.12s",
        }}
      >
        ×
      </button>
    </div>
  );
}

// ─── Form footer ───────────────────────────────────────────────────────────
function FormFooter({ onBack, onSubmit, submitLoading }) {
  return (
    <div style={{
      padding: "14px 20px",
      borderTop: "1px solid var(--border-color, #E5E7EB)",
      background: "var(--bg-card, #fff)",
      display: "flex", gap: 10, flexShrink: 0,
    }}>
      <button type="button" onClick={onBack} className="cpf-btn-back">Back</button>
      <button type="button" onClick={onSubmit} disabled={submitLoading} className="cpf-btn-submit">
        <PackageIcon />
        {submitLoading ? "Creating…" : "Create Parcel"}
      </button>
    </div>
  );
}

// ─── Phone field with validation ───────────────────────────────────────────
function PhoneField({ value, onChange, error }) {
  const isValid = value && /^\d{8,10}$/.test(String(value).replace(/\s/g, ""));
  return (
    <Field label="Phone" error={error} required hint="digits only · max 10">
      <Input
        value={value}
        onChange={onChange}
        placeholder="Phone"
        error={error}
        valid={isValid && !error}
        suffix={isValid && !error ? <CheckCircleIcon /> : null}
      />
    </Field>
  );
}

// ─── Two-column grid helper ────────────────────────────────────────────────
function FieldGrid({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
      {children}
    </div>
  );
}

// ─── normalizeOrder (unchanged) ────────────────────────────────────────────
function normalizeOrder(order) {
  const orderNumber = order?.order_number ?? order?.number ?? order?.id;
  const clientName = order?.client?.name ?? order?.customer_name ?? order?.customer?.name ?? "";
  const phone = order?.client?.phone ?? order?.customer_phone ?? order?.customer?.phone ?? "";
  const city = order?.client?.city ?? order?.city ?? order?.customer?.city ?? "";
  const address = order?.client?.address ?? order?.address ?? order?.street ?? order?.client?.street ?? "";
  const total = order?.total_price ?? order?.total ?? order?.amount ?? order?.total_price_with_shipping ?? "";
  const note = order?.notes ?? order?.note ?? order?.client?.notes ?? order?.client_note ?? "";
  const items = Array.isArray(order?.items) ? order.items : [];
  const firstItemProduct = items?.[0]?.product_name ?? items?.[0]?.product?.title ?? items?.[0]?.title ?? "";

  return {
    id: order?.id,
    order_number: orderNumber,
    client: { name: clientName, phone, city, address },
    shipping: { city, address },
    total,
    notes: note,
    items,
    firstItemProduct,
  };
}

const AMEEX_FALLBACK_CITIES = [
  "Agadir","Al Hoceima","Casablanca","Chefchaouen","El Jadida","Essaouira",
  "Fes","Ifrane","Kenitra","Khemisset","Laayoune","Marrakech","Meknes",
  "Mohammedia","Nador","Oujda","Ouarzazate","Rabat","Safi","Salé",
  "Tanger","Tangier","Taza","Tetouan","Tiznit",
].filter(Boolean);

// ─── AMEEX form ────────────────────────────────────────────────────────────
function AmeexShipmentForm({ selectedCompany, onBack, onSubmit, submitLoading, formErrors, onChangeForm, form, cityOptions, order }) {
  const errors = formErrors || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Scrollable form body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px" }}>

        {/* City — full width */}
        <Field label="City" error={errors.city} required>
          <CitySelect
            value={form.city}
            onChange={(v) => onChangeForm("city", v)}
            options={(cityOptions || []).map((c) => ({ value: c, label: c }))}
            placeholder="Select Cities..."
            error={errors.city}
          />
        </Field>

        {/* Row: Api Id + Nom de Client */}
        <FieldGrid>
          <Field label="Api Id" error={errors.api_id} required>
            <Input value={form.api_id} onChange={(v) => onChangeForm("api_id", v)} placeholder="Api Id" error={errors.api_id} />
          </Field>
          <Field label="Nom de Client" error={errors.client_name} required>
            <Input value={form.client_name} onChange={(v) => onChangeForm("client_name", v)} placeholder="Nom de Client" error={errors.client_name} />
          </Field>
        </FieldGrid>

        {/* Row: Phone + Address */}
        <FieldGrid>
          <PhoneField
            value={form.phone}
            onChange={(v) => onChangeForm("phone", v)}
            error={errors.phone}
          />
          <Field label="Address" error={errors.address} required>
            <Input value={form.address} onChange={(v) => onChangeForm("address", v)} placeholder="Address" error={errors.address} />
          </Field>
        </FieldGrid>

        {/* Row: Totale + Type de livraison */}
        <FieldGrid>
          <Field label="Totale" error={errors.total} required>
            <Input value={form.total} onChange={(v) => onChangeForm("total", v)} type="number" placeholder="0.00" error={errors.total} />
          </Field>
          <Field label="Type de livraison" error={errors.delivery_type} required>
            <ClearableSelect
              value={form.delivery_type}
              onChange={(v) => onChangeForm("delivery_type", v)}
              options={["SIMPLE", "EXPRESS"].map((x) => ({ value: x, label: x }))}
              placeholder="Select..."
              error={errors.delivery_type}
            />
          </Field>
        </FieldGrid>

        {/* Toggle rows */}
        <div style={{ marginBottom: 14 }}>
          <SwitchRow label="Ouverture ?" checked={!!form.openable} onChange={(v) => onChangeForm("openable", v)} required />
          <SwitchRow label="Tester le Produit ?" checked={!!form.test_product} onChange={(v) => onChangeForm("test_product", v)} required />
          <SwitchRow label="Fragile ?" checked={!!form.fragile} onChange={(v) => onChangeForm("fragile", v)} required />
        </div>

        {/* Product */}
        <Field label="Product" error={errors.product} required>
          <Input
            value={form.product}
            onChange={(v) => onChangeForm("product", v)}
            placeholder={`Order #${order?.order_number ?? order?.id}`}
            error={errors.product}
          />
        </Field>

        {/* Exchange toggle */}
        <div style={{ marginBottom: 14 }}>
          <SwitchRow label="Echange ?" checked={!!form.exchange} onChange={(v) => onChangeForm("exchange", v)} required />
        </div>

        {/* Note */}
        <Field label="Note" error={errors.note}>
          <Textarea value={form.note} onChange={(v) => onChangeForm("note", v)} placeholder="Note" error={errors.note} />
        </Field>
      </div>

      <FormFooter onBack={onBack} onSubmit={onSubmit} submitLoading={submitLoading} />
    </div>
  );
}

// ─── Generic form ──────────────────────────────────────────────────────────
function GenericShipmentForm({ selectedCompany, onBack, onSubmit, submitLoading, formErrors, onChangeForm, form, cityOptions, order }) {
  const errors = formErrors || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px" }}>

        <Field label="City" error={errors.city} required>
          <CitySelect
            value={form.city}
            onChange={(v) => onChangeForm("city", v)}
            options={(cityOptions || []).map((c) => ({ value: c, label: c }))}
            placeholder="Select Cities..."
            error={errors.city}
          />
        </Field>

        <FieldGrid>
          <Field label="Client name" error={errors.client_name} required>
            <Input value={form.client_name} onChange={(v) => onChangeForm("client_name", v)} placeholder="Client name" error={errors.client_name} />
          </Field>
          <PhoneField
            value={form.phone}
            onChange={(v) => onChangeForm("phone", v)}
            error={errors.phone}
          />
        </FieldGrid>

        <Field label="Address" error={errors.address} required>
          <Input value={form.address} onChange={(v) => onChangeForm("address", v)} placeholder="Street address" error={errors.address} />
        </Field>

        <Field label="Total" error={errors.total} required>
          <Input value={form.total} onChange={(v) => onChangeForm("total", v)} type="number" placeholder="0.00" error={errors.total} />
        </Field>

        <Field label="Note" error={errors.note}>
          <Textarea value={form.note} onChange={(v) => onChangeForm("note", v)} placeholder="Optional note" error={errors.note} />
        </Field>
      </div>

      <FormFooter onBack={onBack} onSubmit={onSubmit} submitLoading={submitLoading} />
    </div>
  );
}

// ─── Spinner ───────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        border: "2.5px solid var(--border-color, #E5E7EB)",
        borderTop: "2.5px solid #7C3AED",
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────
export default function CreateParcelFlow({ open, onClose, order, onSuccess, showToast }) {
  const [step, setStep] = useState(1);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const normalized = useMemo(() => (order ? normalizeOrder(order) : null), [order]);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const cityOptions = AMEEX_FALLBACK_CITIES;
  const [form, setForm] = useState(null);

  const initialForm = useMemo(() => {
    if (!normalized || !selectedCompany) return null;
    const base = {
      delivery_company_id: selectedCompany.id,
      city: normalized.client?.city ?? "",
      client_name: normalized.client?.name ?? "",
      phone: normalized.client?.phone ?? "",
      address: normalized.client?.address ?? "",
      total: normalized.total ?? "",
      note: normalized.notes ?? "",
    };
    if (selectedCompany?.slug === "ameex") {
      return {
        ...base,
        api_id: "",
        delivery_type: "SIMPLE",
        openable: false,
        test_product: false,
        fragile: false,
        product: normalized.firstItemProduct || `Order #${normalized.order_number}`,
        exchange: false,
      };
    }
    return base;
  }, [normalized, selectedCompany]);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setSelectedCompany(null);
    setForm(null);
    setFormErrors({});
    setCompanies([]);
    setCompaniesError(null);
  }, [open]);

  useEffect(() => {
    if (!open || step !== 1) return;
    let cancelled = false;
    async function fetchCompanies() {
      try {
        setCompaniesLoading(true);
        setCompaniesError(null);
        const data = await companiesService.getActiveDeliveryCompanies();
        if (!cancelled) setCompanies(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setCompaniesError("Failed to load delivery companies.");
      } finally {
        if (!cancelled) setCompaniesLoading(false);
      }
    }
    fetchCompanies();
    return () => { cancelled = true; };
  }, [open, step]);

  useEffect(() => {
    if (!initialForm) return;
    setForm(initialForm);
  }, [initialForm]);

  const close = () => {
    setStep(1);
    setSelectedCompany(null);
    setForm(null);
    setFormErrors({});
    onClose?.();
  };

  const onChangeForm = (key, val) => {
    setForm((p) => ({ ...(p || {}), [key]: val }));
  };

  const payloadForSubmission = () => {
    if (!normalized || !selectedCompany || !form) return null;
    const base = {
      delivery_company_id: selectedCompany.id,
      city: form.city,
      client_name: form.client_name,
      phone: form.phone,
      address: form.address,
      total: form.total,
      note: form.note ?? null,
    };
    if (selectedCompany.slug === "ameex") {
      return {
        ...base,
        api_id: form.api_id || null,
        delivery_type: form.delivery_type,
        openable: !!form.openable,
        test_product: !!form.test_product,
        fragile: !!form.fragile,
        product: form.product,
        exchange: !!form.exchange,
      };
    }
    return base;
  };

  const submit = async () => {
    setSubmitLoading(true);
    setFormErrors({});
    try {
      if (!normalized?.id) throw new Error("Missing order id");
      const payload = payloadForSubmission();
      const res = await shipmentsService.createAdminOrderShipment(normalized.id, payload);
      (showToast || toast)?.("Parcel created successfully.", { type: "success" });
      onSuccess?.(res);
      close();
    } catch (err) {
      console.error(err);
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors && typeof backendErrors === "object") {
        const flat = {};
        for (const [k, v] of Object.entries(backendErrors)) {
          flat[k] = Array.isArray(v) ? v.join(", ") : String(v);
        }
        setFormErrors(flat);
      }
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create parcel.";
      const msgLower = String(message).toLowerCase();
      const businessAlready =
        msgLower.includes("already exists") ||
        (msgLower.includes("shipment") && msgLower.includes("already")) ||
        msgLower.includes("max 1 shipment");
      if (businessAlready) {
        (showToast || toast)?.("A shipment already exists for this order.", { type: "error" });
      } else {
        (showToast || toast)?.(message, { type: "error" });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const orderSubtitle = normalized
    ? `#${normalized.order_number} — ${normalized.client?.name || "Client"}`
    : "";

  if (!open) return null;

  return (
    <>
      <style>{css}</style>
      <div
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10000, padding: 20,
        }}
        onClick={close}
      >
        <div
          className="cpf-modal"
          style={{
            background: "var(--bg-card, #fff)",
            border: "1px solid var(--border-color, #E5E7EB)",
            borderRadius: 16,
            width: "100%",
            maxWidth: 560,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <ModalHeader
            title={step === 1 ? "Create Parcel" : `Ship via ${selectedCompany?.name}`}
            subtitle={orderSubtitle}
            company={step === 2 ? selectedCompany : null}
            onClose={close}
          />

          {/* ── Step 1: carrier selection ── */}
          {step === 1 && (
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 20px" }}>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted, #6B7280)", marginBottom: 14 }}>
                Select a delivery company to ship this order:
              </p>

              {companiesLoading ? (
                <Spinner />
              ) : companiesError ? (
                <div style={{
                  padding: 14, borderRadius: 10,
                  background: "#FEF2F2", border: "1px solid #FECACA",
                  color: "#DC2626", fontSize: "0.875rem", fontWeight: 600,
                }}>
                  {companiesError}
                </div>
              ) : companies.length === 0 ? (
                <div style={{
                  padding: 14, borderRadius: 10,
                  background: "var(--bg-app, #F9FAFB)", border: "1px solid var(--border-color, #E5E7EB)",
                  color: "var(--text-muted, #6B7280)", fontSize: "0.875rem",
                }}>
                  No active delivery companies.
                </div>
              ) : (
                <div>
                  {companies.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="cpf-carrier-row"
                      onClick={() => { setSelectedCompany(c); setStep(2); }}
                    >
                      <CarrierAvatar company={c} size={44} radius={10} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main, #111)" }}>{c.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted, #9CA3AF)", marginTop: 2 }}>Click to configure shipment</div>
                      </div>
                      <ArrowRightIcon />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: shipment form ── */}
          {step === 2 && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {selectedCompany?.slug === "ameex" ? (
                <AmeexShipmentForm
                  order={normalized || order}
                  selectedCompany={selectedCompany}
                  onBack={() => setStep(1)}
                  onSubmit={submit}
                  submitLoading={submitLoading}
                  formErrors={formErrors}
                  onChangeForm={onChangeForm}
                  form={form || {}}
                  cityOptions={cityOptions}
                />
              ) : (
                <GenericShipmentForm
                  order={normalized || order}
                  selectedCompany={selectedCompany}
                  onBack={() => setStep(1)}
                  onSubmit={submit}
                  submitLoading={submitLoading}
                  formErrors={formErrors}
                  onChangeForm={onChangeForm}
                  form={form || {}}
                  cityOptions={cityOptions}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}