import { NavLink } from "react-router-dom";

export default function Sidebar({ user }) {
  // Navigation Links from screenshot
  const navLinks = [
    { name: "Tableau de bord", path: "/dashboard", icon: "dashboard-icon" },
    { name: "Commandes", path: "/commandes", icon: "orders-icon" },
    { name: "Clients", path: "/clients", icon: "clients-icon" },
    { name: "Products", path: "/products", icon: "products-icon" },
    { name: "Companies", path: "/companies", icon: "companies-icon" },
    { name: "Status", path: "/status", icon: "status-icon" },
    { name: "Team", path: "/team", icon: "team-icon" },
    { name: "Affiliés", path: "/affilies", icon: "affiliates-icon" }
  ];

  const sourceLinks = [
    { name: "Shopify", path: "/sources/shopify", icon: "shopify-icon" },
    { name: "Google Sheets", path: "/sources/google-sheets", icon: "sheets-icon" }
  ];

  const appLinks = [
    { name: "WhatsApp", path: "/apps/whatsapp", icon: "whatsapp-icon", badge: "PRO" },
    { name: "Tarifs", path: "/apps/tarifs", icon: "tarifs-icon" }
  ];

  // Dummy icons for now (using small colored boxes/circles or generic SVGs)
  const renderIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          FlashManager
        </div>
      </div>
      
      <div className="sidebar-content">
        <ul>
          {navLinks.map((link, idx) => (
            <li key={idx}>
              <NavLink 
                to={link.path} 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                end={link.path === '/dashboard'}
              >
                {renderIcon()}
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>

        <h3 className="sidebar-menu-title">Sources de commandes</h3>
        <ul>
          {sourceLinks.map((link, idx) => (
            <li key={idx}>
              <NavLink to={link.path} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                {renderIcon()}
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>

        <h3 className="sidebar-menu-title">Applications</h3>
        <ul>
          {appLinks.map((link, idx) => (
            <li key={idx}>
              <NavLink to={link.path} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                {renderIcon()}
                {link.name}
                {link.badge && <span className="sidebar-badge">{link.badge}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-footer">
        <div className="avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.name || "Rihab Mahdi"}</div>
          <div className="user-email">{user?.email || "rihabmahdi19@gmail.com"}</div>
        </div>
      </div>
    </aside>
  );
}
