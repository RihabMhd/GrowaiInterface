import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import AdminOrders from "./AdminOrders.jsx";
import AgentOrders from "./AgentOrders.jsx";

/**
 * Orders — role-based router.
 *
 * Renders AdminOrders for role === "admin"
 * Renders AgentOrders for role === "staff"
 *
 * Add more roles here if needed.
 */
export default function Orders() {
  const { user } = useContext(AuthContext);

  if (user?.role === "admin") {
    return <AdminOrders />;
  }

  if (user?.role === "staff") {
    return <AgentOrders />;
  }

  // Fallback for unauthenticated or unknown role
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", color: "var(--text-muted)", gap: "12px"
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p style={{ fontSize: "0.95rem", fontWeight: "500" }}>Access denied. Please log in with a valid account.</p>
    </div>
  );
}