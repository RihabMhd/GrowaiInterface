import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  return (user || token) ? children : <Navigate to="/" />;
}