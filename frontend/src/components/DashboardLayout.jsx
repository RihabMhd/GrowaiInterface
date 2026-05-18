import { useContext, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { AuthContext } from "../auth/AuthContext";

export default function DashboardLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && user.role === "staff") {
      const allowedAgentPrefixes = ["/commandes", "/help", "/settings"];
      const isAllowed = allowedAgentPrefixes.some(path => location.pathname.startsWith(path));
      if (!isAllowed) {
        navigate("/commandes/toutes", { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="app-container">
      <Navbar />
      <div className="app-main">
        {user?.role !== "staff" && <Sidebar user={user} onLogout={logout} />}
        <main className="main-content" style={user?.role === "staff" ? { padding: "30px", flex: 1, overflowY: "auto" } : {}}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
