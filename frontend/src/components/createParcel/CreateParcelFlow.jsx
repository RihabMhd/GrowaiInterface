import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { companiesService } from "../../services/companiesService";
import { shipmentsService } from "../../services/shipmentsService";

function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <label
          style={{
            fontSize: "0.7rem",
            fontWeight: 800,
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
        {error ? <div style={{ fontSize: "0.72rem", color: "var(--danger)", fontWeight: 700 }}>{error}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", error }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 8,
        border: `1px solid ${error ? "var(--danger)" : "var(--border-color)"}`,
        outline: "none",
        fontSize: "0.88rem",
        boxSizing: "border-box",
        background: "var(--bg-input)",
        color: "var(--text-main)",
      }}
    />
  );
}

function Textarea({ value, onChange, placeholder, error, minHeight = 90 }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 8,
        border: `1px solid ${error ? "var(--danger)" : "var(--border-color)"}`,
        outline: "none",
        fontSize: "0.88rem",
        boxSizing: "border-box",
        background: "var(--bg-input)",
        color: "var(--text-main)",
        minHeight,
        resize: "vertical",
      }}
    />
  );
}

function Select({ value, onChange, options, error, placeholder }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 8,
        border: `1px solid ${error ? "var(--danger)" : "var(--border-color)"}`,
        outline: "none",
        fontSize: "0.88rem",
        boxSizing: "border-box",
        background: "var(--bg-input)",
        color: "var(--text-main)",
        cursor: "pointer",
      }}
    >
      <option value="" style={{ color: "var(--text-muted)" }}>
        {placeholder}
      </option>
      {(options || []).map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function SwitchRow({ label, checked, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
      <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)" }}>{label}</div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: 46,
          height: 26,
          borderRadius: 999,
          border: "1px solid var(--border-color)",
          background: checked ? "var(--purple)" : "var(--bg-app)",
          cursor: "pointer",
          position: "relative",
          transition: "background 0.15s ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 22 : 2,
            width: 22,
            height: 22,
            borderRadius: 999,
            background: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            transition: "left 0.15s ease",
          }}
        />
      </button>
    </div>
  );
}

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
    client: {
      name: clientName,
      phone,
      city,
      address,
    },
    shipping: {
      city,
      address,
    },
    total,
    notes: note,
    items,
    firstItemProduct,
  };
}

const AMEEX_FALLBACK_CITIES = [
  // isolated fallback only; should be replaced by real AMEEX reference data when available
  "Agadir",
  "Al Hoceima",
  "Casablanca",
  "Chefchaouen",
  "El Jadida",
  "Essaouira",
  "Fes",
  "Ifrane",
  "Kenitra",
  "Khemisset",
  "Laayoune",
  "Marrakech",
  "Meknes",
  "Mohammedia",
  "Nador",
  "Oujda",
  "Ouarzazate",
  "Rabat",
  "Safi",
  "Salé",
  "Tanger",
  "Tangier",
  "Taza",
  "Tetouan",
  "Tiznit",
].filter(Boolean);

function AmeexShipmentForm({
  selectedCompany,
  onBack,
  onSubmit,
  submitLoading,
  formErrors,
  onChangeForm,
  form,
  cityOptions,
  order,
}) {
  const errors = formErrors || {};

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, padding: 24, overflowY: "auto", borderRight: "1px solid var(--border-color)" }}>
        <Field label="City" error={errors.city}>
          <Select
            value={form.city}
            onChange={(v) => onChangeForm("city", v)}
            options={(cityOptions || []).map((c) => ({ value: c, label: c }))}
            placeholder="Select a city..."
            error={errors.city}
          />
        </Field>

        <Field label="API ID" error={errors.api_id}>
          <Input value={form.api_id} onChange={(v) => onChangeForm("api_id", v)} placeholder="e.g. 26185" error={errors.api_id} />
        </Field>

        <Field label="Client name" error={errors.client_name}>
          <Input
            value={form.client_name}
            onChange={(v) => onChangeForm("client_name", v)}
            placeholder="Client name"
            error={errors.client_name}
          />
        </Field>

        <Field label="Phone" error={errors.phone}>
          <Input value={form.phone} onChange={(v) => onChangeForm("phone", v)} placeholder="Phone" error={errors.phone} />
        </Field>

        <Field label="Address" error={errors.address}>
          <Input value={form.address} onChange={(v) => onChangeForm("address", v)} placeholder="Street address" error={errors.address} />
        </Field>

        <Field label="Total" error={errors.total}>
          <Input
            value={form.total}
            onChange={(v) => onChangeForm("total", v)}
            type="number"
            placeholder="0.00"
            error={errors.total}
          />
        </Field>

        <Field label="Delivery type" error={errors.delivery_type}>
          <Select
            value={form.delivery_type}
            onChange={(v) => onChangeForm("delivery_type", v)}
            options={["SIMPLE", "EXPRESS"].map((x) => ({ value: x, label: x }))}
            placeholder="Select delivery type"
            error={errors.delivery_type}
          />
        </Field>

        <SwitchRow label="Openable" checked={!!form.openable} onChange={(v) => onChangeForm("openable", v)} />
        <SwitchRow label="Test product" checked={!!form.test_product} onChange={(v) => onChangeForm("test_product", v)} />
        <SwitchRow label="Fragile" checked={!!form.fragile} onChange={(v) => onChangeForm("fragile", v)} />
        <SwitchRow label="Exchange" checked={!!form.exchange} onChange={(v) => onChangeForm("exchange", v)} />

        <Field label="Product" error={errors.product}>
          <Input
            value={form.product}
            onChange={(v) => onChangeForm("product", v)}
            placeholder={`Order #${order?.order_number ?? order?.id}`}
            error={errors.product}
          />
        </Field>

        <Field label="Note" error={errors.note}>
          <Textarea value={form.note} onChange={(v) => onChangeForm("note", v)} placeholder="Optional note" error={errors.note} />
        </Field>
      </div>

      <div style={{ width: 360, padding: 24, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Context</div>
          <div style={{ marginTop: 8, padding: 14, borderRadius: 12, background: "var(--bg-app)", border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-main)" }}>Company</div>
            <div style={{ marginTop: 6, fontSize: "0.82rem", color: "var(--text-muted)" }}>{selectedCompany?.name}</div>

            <div style={{ marginTop: 12, fontSize: "0.85rem", fontWeight: 800, color: "var(--text-main)" }}>Order</div>
            <div style={{ marginTop: 6, fontSize: "0.82rem", color: "var(--text-muted)" }}>#{order?.order_number} — {order?.client?.name || order?.customer_name || "Client"}</div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
      </div>

      <div style={{ position: "absolute", left: 24, right: 24, bottom: 24, pointerEvents: "none" }}>
        <div style={{ display: "flex", gap: 10, pointerEvents: "auto" }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 8,
              background: "var(--bg-app)",
              border: "1px solid var(--border-color)",
              color: "var(--text-main)",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitLoading}
            style={{
              flex: 2,
              padding: "11px",
              borderRadius: 8,
              background: "var(--purple)",
              border: "none",
              color: "#fff",
              fontSize: "0.85rem",
              fontWeight: 800,
              cursor: submitLoading ? "not-allowed" : "pointer",
              opacity: submitLoading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {submitLoading ? "Creating..." : "Create Parcel"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GenericShipmentForm({ selectedCompany, onBack, onSubmit, submitLoading, formErrors, onChangeForm, form, cityOptions, order }) {
  const errors = formErrors || {};

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, padding: 24, overflowY: "auto", borderRight: "1px solid var(--border-color)" }}>
        <Field label="City" error={errors.city}>
          <Select
            value={form.city}
            onChange={(v) => onChangeForm("city", v)}
            options={(cityOptions || []).map((c) => ({ value: c, label: c }))}
            placeholder="Select a city..."
            error={errors.city}
          />
        </Field>

        <Field label="Client name" error={errors.client_name}>
          <Input value={form.client_name} onChange={(v) => onChangeForm("client_name", v)} placeholder="Client name" error={errors.client_name} />
        </Field>

        <Field label="Phone" error={errors.phone}>
          <Input value={form.phone} onChange={(v) => onChangeForm("phone", v)} placeholder="Phone" error={errors.phone} />
        </Field>

        <Field label="Address" error={errors.address}>
          <Input value={form.address} onChange={(v) => onChangeForm("address", v)} placeholder="Street address" error={errors.address} />
        </Field>

        <Field label="Total" error={errors.total}>
          <Input value={form.total} onChange={(v) => onChangeForm("total", v)} type="number" placeholder="0.00" error={errors.total} />
        </Field>

        <Field label="Note" error={errors.note}>
          <Textarea value={form.note} onChange={(v) => onChangeForm("note", v)} placeholder="Optional note" error={errors.note} />
        </Field>

        <div style={{ paddingTop: 10 }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Company</div>
          <div style={{ marginTop: 8, padding: 14, borderRadius: 12, background: "var(--bg-app)", border: "1px solid var(--border-color)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-main)" }}>{selectedCompany?.name}</div>
            <div style={{ marginTop: 6, fontSize: "0.82rem", color: "var(--text-muted)" }}>slug: {selectedCompany?.slug}</div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", left: 24, right: 24, bottom: 24, pointerEvents: "none" }}>
        <div style={{ display: "flex", gap: 10, pointerEvents: "auto" }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 8,
              background: "var(--bg-app)",
              border: "1px solid var(--border-color)",
              color: "var(--text-main)",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitLoading}
            style={{
              flex: 2,
              padding: "11px",
              borderRadius: 8,
              background: "var(--purple)",
              border: "none",
              color: "#fff",
              fontSize: "0.85rem",
              fontWeight: 800,
              cursor: submitLoading ? "not-allowed" : "pointer",
              opacity: submitLoading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {submitLoading ? "Creating..." : "Create Parcel"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreateParcelFlow({ open, onClose, order, onSuccess, showToast }) {
  const [step, setStep] = useState(1);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const normalized = useMemo(() => (order ? normalizeOrder(order) : null), [order]);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const cityOptions = AMEEX_FALLBACK_CITIES; // isolated fallback (no hardcoded AMEEX refs elsewhere)

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
        if (!cancelled) setCompanies(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        if (!cancelled) setCompaniesError("Failed to load delivery companies.");
      } finally {
        if (!cancelled) setCompaniesLoading(false);
      }
    }

    fetchCompanies();
    return () => {
      cancelled = true;
    };
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

      const okMsg = "Parcel created successfully.";
      (showToast || toast)?.(okMsg, { type: "success" });
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

  const selectedSubtitle = normalized ? `#${normalized.order_number} — ${normalized.client?.name || "Client"}` : "";

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "20px",
      }}
      onClick={close}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 900,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
          overflow: "hidden",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.97) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text-main)" }}>Create Parcel</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4 }}>{selectedSubtitle}</div>
          </div>
          <button
            onClick={close}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--bg-popup-header)",
              border: "1px solid var(--border-color)",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
            }}
          >
            ×
          </button>
        </div>

        {step === 1 ? (
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
              <div style={{ marginBottom: 16, fontSize: "0.85rem", color: "var(--text-muted)" }}>Select a delivery company to ship this order</div>

              {companiesLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                  <div style={{ border: "3px solid var(--border-color)", borderTop: "3px solid var(--purple)", borderRadius: "50%", width: 32, height: 32, animation: "spin 1s linear infinite" }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              ) : companiesError ? (
                <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 14, color: "var(--danger)", fontWeight: 700 }}>{companiesError}</div>
              ) : companies.length === 0 ? (
                <div style={{ background: "var(--bg-app)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 14, color: "var(--text-muted)" }}>No active delivery companies.</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                  {companies.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCompany(c);
                        setStep(2);
                      }}
                      style={{
                        textAlign: "left",
                        padding: 14,
                        borderRadius: 12,
                        border: `1px solid ${selectedCompany?.id === c.id ? "var(--purple)" : "var(--border-color)"}`,
                        background: selectedCompany?.id === c.id ? "var(--purple-light)" : "var(--bg-app)",
                        cursor: "pointer",
                        color: "var(--text-main)",
                        minHeight: 96,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 900 }}>{c.name}</div>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--purple-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--purple)", fontWeight: 900 }}>
                          {c.slug?.[0]?.toUpperCase()}
                        </div>
                      </div>
                      <div style={{ marginTop: 8, fontSize: "0.78rem", color: "var(--text-muted)" }}>slug: {c.slug}</div>
                      <div style={{ marginTop: 6, fontSize: "0.78rem", color: "var(--text-muted)" }}>{c.phone ? `📞 ${c.phone}` : ""}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: 24, borderLeft: "1px solid var(--border-color)", width: 340, flexShrink: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Help</div>
              <div style={{ marginTop: 10, color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.5 }}>Choose the carrier used to create the shipment for this order.</div>

              <div style={{ flex: 1 }} />

              <button
                type="button"
                onClick={close}
                style={{
                  padding: "11px",
                  borderRadius: 8,
                  background: "var(--bg-app)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, position: "relative" }}>
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
  );
}

