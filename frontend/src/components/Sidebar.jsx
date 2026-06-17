import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const Icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  commandes: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  clients: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  products: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  companies: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  status: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  team: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  affilies: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  shopify: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <circle cx="12" cy="14" r="2"/>
    </svg>
  ),
  sheets: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="3" y1="15" x2="21" y2="15"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  ),
  whatsapp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  help: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  cart: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  cartX: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      <line x1="13" y1="9" x2="17" y2="13"/>
      <line x1="17" y1="9" x2="13" y2="13"/>
    </svg>
  ),
  chevronDown: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6"/>
    </svg>
  )
};

export default function Sidebar({ user, onLogout }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCommandesOpen, setIsCommandesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

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
    { keyName: "tableau_de_bord", name: t("tableau_de_bord"), path: "/dashboard", icon: Icons.dashboard },
    { keyName: "commandes", name: t("commandes"), path: "/commandes", icon: Icons.commandes },
    { keyName: "clients", name: t("clients"), path: "/clients", icon: Icons.clients },
    { keyName: "produits", name: t("produits"), path: "/products", icon: Icons.products },
    { keyName: "entreprises", name: t("entreprises"), path: "/companies", icon: Icons.companies },
    { keyName: "status", name: t("status"), path: "/status", icon: Icons.status },
    { keyName: "equipe", name: t("equipe"), path: "/team", icon: Icons.team },
    { keyName: "affilies", name: t("affilies"), path: "/affilies", icon: Icons.affilies },
  ];

  const sourceLinks = [
    { name: "Shopify", path: "/integrations/shopify", icon: Icons.shopify },
    { name: "Google Sheets", path: "/sources/google-sheets", icon: Icons.sheets },
  ];

  const appLinks = [
    { name: "WhatsApp", path: "/apps/whatsapp", icon: Icons.whatsapp }
  ];

  const isAdmin = user?.role === "admin";
  const isAgent = user?.role === "staff";

  const filteredNavLinks = navLinks.filter(link => {
    if (isAgent) return link.path === "/commandes";
    return true;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <ul className="sidebar-nav">
          {filteredNavLinks.map((link, idx) => {
            if (link.keyName === "commandes") {
              const isParentActive = location.pathname.startsWith("/commandes");
              return (
                <li key={idx}>
                  <div
                    className={`sidebar-link${isParentActive ? " parent-active" : ""}`}
                    onClick={toggleCommandes}
                  >
                    <span className="sidebar-link-icon">{link.icon}</span>
                    <span className="sidebar-link-label">{link.name}</span>
                    <span
                      className="sidebar-chevron"
                      style={{ transform: isCommandesOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
                    >
                      {Icons.chevronDown}
                    </span>
                  </div>

                  {isCommandesOpen && (
                    <ul className="sidebar-submenu">
                      <li>
                        <NavLink
                          to="/commandes/toutes"
                          className={({ isActive }) => `sidebar-sublink${isActive ? " active" : ""}`}
                        >
                          <span className="sidebar-link-icon">{Icons.cart}</span>
                          <span>{t("toutes")}</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/commandes/abandonnees"
                          className={({ isActive }) => `sidebar-sublink${isActive ? " active" : ""}`}
                        >
                          <span className="sidebar-link-icon">{Icons.cartX}</span>
                          <span>{t("abandonnees")}</span>
                        </NavLink>
                      </li>
                    </ul>
                  )}
                </li>
              );
            }
            return (
              <li key={idx}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                  end={link.path === "/dashboard"}
                >
                  <span className="sidebar-link-icon">{link.icon}</span>
                  <span className="sidebar-link-label">{link.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        {isAdmin && (
          <>
            <p className="sidebar-section-title">{t("sources_de_commandes")}</p>
            <ul className="sidebar-nav">
              {sourceLinks.map((link, idx) => (
                <li key={idx}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                  >
                    <span className="sidebar-link-icon">{link.icon}</span>
                    <span className="sidebar-link-label">{link.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>

            <p className="sidebar-section-title">{t("applications")}</p>
            <ul className="sidebar-nav">
              {appLinks.map((link, idx) => (
                <li key={idx}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
                  >
                    <span className="sidebar-link-icon">{link.icon}</span>
                    <span className="sidebar-link-label">{link.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Footer */}
      <div className={`sidebar-footer${isPopupOpen ? " active" : ""}`} onClick={togglePopup}>
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="sidebar-avatar-img"
          />
        ) : (
          <div className="sidebar-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
          </div>
        )}
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-email">{user?.email}</div>
        </div>
        <span className={`sidebar-arrow${isPopupOpen ? " open" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </span>

        {isPopupOpen && (
          <div className="user-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="sidebar-avatar-img" />
              ) : (
                <div className="sidebar-avatar large">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
                </div>
              )}
              <div className="popup-user-details">
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>
            </div>

            <div className="popup-menu">
              <button className="popup-item" onClick={() => { navigate("/settings"); setIsPopupOpen(false); }}>
                <div className="popup-icon-wrapper">{Icons.settings}</div>
                {t("modifier") === "Modifier" ? "Paramètres" : t("modifier") === "Edit" ? "Settings" : "الإعدادات"}
              </button>
              <button className="popup-item" onClick={() => { navigate("/help"); setIsPopupOpen(false); }}>
                <div className="popup-icon-wrapper">{Icons.help}</div>
                {t("help_title")}
              </button>

              <hr className="popup-divider" />

              <button className="popup-item logout-btn" onClick={() => { onLogout(); setIsPopupOpen(false); }}>
                <div className="popup-icon-wrapper">{Icons.logout}</div>
                {t("deconnexion")}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}