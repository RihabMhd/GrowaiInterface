import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

// Unique SVG icons matching the dark-themed screenshot
const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  commandes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  clients: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  products: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  companies: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  status: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  team: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  affilies: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  shopify: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <circle cx="12" cy="14" r="2"/>
    </svg>
  ),
  sheets: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="3" y1="15" x2="21" y2="15"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  ),
  whatsapp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
    </svg>
  ),
  tarifs: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  help: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
};

export default function Sidebar({ user, onLogout }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();

  const togglePopup = () => setIsPopupOpen(!isPopupOpen);

  const navLinks = [
    { name: "Tableau de bord", path: "/dashboard", icon: Icons.dashboard },
    { name: "Commandes", path: "/commandes", icon: Icons.commandes },
    { name: "Clients", path: "/clients", icon: Icons.clients },
    { name: "Products", path: "/products", icon: Icons.products },
    { name: "Companies", path: "/companies", icon: Icons.companies },
    { name: "Status", path: "/status", icon: Icons.status },
    { name: "Team", path: "/team", icon: Icons.team },
    { name: "Affiliés", path: "/affilies", icon: Icons.affilies },
  ];

  const sourceLinks = [
    { name: "Shopify", path: "/sources/shopify", icon: Icons.shopify },
    { name: "Google Sheets", path: "/sources/google-sheets", icon: Icons.sheets },
  ];

  const appLinks = [
    { name: "WhatsApp", path: "/apps/whatsapp", icon: Icons.whatsapp, badge: "PRO" },
    { name: "Tarifs", path: "/apps/tarifs", icon: Icons.tarifs },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          FlashManager
        </div>
      </div>

      <div className="sidebar-content">
        <ul>
          {navLinks.map((link, idx) => (
            <li key={idx}>
              <NavLink
                to={link.path}
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                end={link.path === "/dashboard"}
              >
                {link.icon} {/* Corrected: Render icon as JSX element */}
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>

        <h3 className="sidebar-menu-title">Sources de commandes</h3>
        <ul>
          {sourceLinks.map((link, idx) => (
            <li key={idx}>
              <NavLink
                to={link.path}
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              >
                {link.icon}
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>

        <h3 className="sidebar-menu-title">Applications</h3>
        <ul>
          {appLinks.map((link, idx) => (
            <li key={idx}>
              <NavLink
                to={link.path}
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              >
                {link.icon}
                {link.name}
                {link.badge && <span className="sidebar-badge">{link.badge}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-footer" onClick={togglePopup}>
        <div className="avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.name || "Rihab Mahdi"}</div>
          <div className="user-email">{user?.email || "rihabmahdi19@gmail.com"}</div>
        </div>
        <span className={`arrow ${isPopupOpen ? 'open' : ''}`}>▾</span>

        {isPopupOpen && (
          <div className="user-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div className="avatar large">
                {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
              </div>
              <div className="popup-user-details">
                <strong>{user?.name || "Rihab Mahdi"}</strong>
                <span>{user?.email || "rihabmahdi19@gmail.com"}</span>
              </div>
            </div>
            
            <div className="popup-menu">
              <button className="popup-item" onClick={() => { navigate("/settings"); setIsPopupOpen(false); }}>
                {Icons.status} Paramètres
              </button>
              <button className="popup-item" onClick={() => { navigate("/help"); setIsPopupOpen(false); }}>
                {Icons.help} Centre d'aide
              </button>
              
              <hr className="popup-divider" />
              
              <button className="popup-item logout-btn" onClick={() => { onLogout(); setIsPopupOpen(false); }}>
                {Icons.logout} Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}