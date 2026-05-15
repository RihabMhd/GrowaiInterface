import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  ),
  help: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  cart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  ),
  cartX: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      <line x1="13" y1="9" x2="17" y2="13"></line>
      <line x1="17" y1="9" x2="13" y2="13"></line>
    </svg>
  )
};

export default function Sidebar({ user, onLogout }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCommandesOpen, setIsCommandesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-expand Commandes if on a sub-route
  useEffect(() => {
    if (location.pathname.startsWith("/commandes")) {
      setIsCommandesOpen(true);
    }
  }, [location.pathname]);

  const togglePopup = () => setIsPopupOpen(!isPopupOpen);
  const toggleCommandes = (e) => {
    e.preventDefault();
    setIsCommandesOpen(!isCommandesOpen);
  };

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
      <div className="sidebar-content">
        <ul>
          {navLinks.map((link, idx) => {
            if (link.name === "Commandes") {
              const isParentActive = location.pathname.startsWith("/commandes");
              return (
                <li key={idx}>
                  <div 
                    className={`sidebar-link ${isParentActive ? 'parent-active' : ''}`}
                    onClick={toggleCommandes}
                    style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {link.icon}
                      {link.name}
                    </div>
                    <svg 
                      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
                      style={{ transition: 'transform 0.2s', transform: isCommandesOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                    >
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>
                  
                  {isCommandesOpen && (
                    <div className="sidebar-submenu">
                      <NavLink to="/commandes/toutes" className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}>
                        {Icons.cart} Toutes
                      </NavLink>
                      <NavLink to="/commandes/abandonnees" className={({ isActive }) => `sidebar-sublink ${isActive ? "active" : ""}`}>
                        {Icons.cartX} Abandonnées
                      </NavLink>
                    </div>
                  )}
                </li>
              );
            }
            return (
              <li key={idx}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                  end={link.path === "/dashboard"}
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              </li>
            );
          })}
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

      <div className={`sidebar-footer ${isPopupOpen ? 'active' : ''}`} onClick={togglePopup}>
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
                <div className="popup-icon-wrapper">{Icons.settings}</div>
                Paramètres
              </button>
              <button className="popup-item" onClick={() => { navigate("/help"); setIsPopupOpen(false); }}>
                <div className="popup-icon-wrapper">{Icons.help}</div>
                Centre d'aide
              </button>
              
              <hr className="popup-divider" />
              
              <button className="popup-item logout-btn" onClick={() => { onLogout(); setIsPopupOpen(false); }}>
                <div className="popup-icon-wrapper">{Icons.logout}</div>
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}