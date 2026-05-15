import { useContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { AuthContext } from "../auth/AuthContext";

export default function DashboardLayout() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="app-layout">
      <Sidebar user={user} onLogout={logout} />
      <div className="main-wrapper">
        <Navbar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
