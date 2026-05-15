import { useContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { AuthContext } from "../auth/AuthContext";

export default function DashboardLayout() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="app-container">
      <Navbar />
      <div className="app-main">
        <Sidebar user={user} onLogout={logout} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
