import { useEffect, useState, useContext } from "react";
import { useLanguage } from "../context/LanguageContext";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const languages = [
    { code: "EN", label: "English", flag: "🇬🇧" },
    { code: "FR", label: "Français", flag: "🇫🇷" },
    { code: "AR", label: "العربية", flag: "🇸🇦" },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[1];
  const isAgent = user?.role === "staff";

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDark]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".nav-item-lang-container")) {
        setIsLangDropdownOpen(false);
      }
      if (!e.target.closest(".nav-item-profile-container")) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleSelectLang = (lang) => {
    setLanguage(lang.code);
    setIsLangDropdownOpen(false);
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <div className="sidebar-logo" style={{ display: "flex", alignItems: "center", paddingLeft: "10px" }}>
          <span style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "0.5px", color: "var(--text-main)" }}>Growai</span>
        </div>
      </div>
      <div className="navbar-right" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        
        {/* Language Selector (AR/FR/EN) */}
        <div className="nav-item-lang-container" style={{ position: 'relative' }}>
          <div 
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="nav-item" 
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '6px 12px', 
              borderRadius: '6px', 
              backgroundColor: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.05)', 
              userSelect: 'none',
              transition: 'background-color 0.2s'
            }}
          >
            <span style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center' }}>{currentLang.flag}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-navbar)' }}>{currentLang.code}</span>
            <svg 
              width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transition: 'transform 0.2s', transform: isLangDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: 'rgba(255,255,255,0.5)' }}
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>

          {isLangDropdownOpen && (
            <div 
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                padding: '4px',
                minWidth: '150px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
            >
              {languages.map((lang) => {
                const isActive = currentLang.code === lang.code;
                return (
                  <div
                    key={lang.code}
                    onClick={() => handleSelectLang(lang)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      backgroundColor: isActive ? 'var(--purple)' : 'transparent',
                      transition: 'all 0.15s',
                      userSelect: 'none'
                    }}
                    className={isActive ? "" : "lang-option-hover"}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </div>
                    {isActive && <span style={{ fontSize: '0.9rem', color: '#fff' }}>✓</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button className="icon-btn" onClick={toggleTheme}>
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>

        {/* Profile Dropdown for Agents/Everyone */}
        {isAgent && (
          <div className="nav-item-profile-container" style={{ position: 'relative' }}>
            <div 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                border: '1px solid transparent'
              }}
              className="navbar-profile-hover"
            >
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name} 
                  style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-color)" }} 
                />
              ) : (
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  backgroundColor: "#ff5722", color: "white", display: "flex",
                  alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.95rem"
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : "R"}
                </div>
              )}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "rgba(255,255,255,0.5)" }}><path d="M6 9l6 6 6-6"/></svg>
            </div>

            {isProfileDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "260px",
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "10px",
                padding: "8px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                zIndex: 10000,
                display: "flex",
                flexDirection: "column",
                gap: "2px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", borderBottom: "1px solid #27272a", marginBottom: "6px" }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#ff5722", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : "R"}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <strong style={{ color: "white", fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</strong>
                    <span style={{ color: "#71717a", fontSize: "0.75rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</span>
                  </div>
                </div>

                <button 
                  onClick={() => { navigate("/settings"); setIsProfileDropdownOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", width: "100%", background: "none", color: "white", fontSize: "0.8rem", fontWeight: "600", borderRadius: "6px", cursor: "pointer", textAlign: "left" }}
                  className="dropdown-item-hover"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4z"></path></svg>
                  Paramètres
                </button>
                <button 
                  onClick={() => { navigate("/help"); setIsProfileDropdownOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", width: "100%", background: "none", color: "white", fontSize: "0.8rem", fontWeight: "600", borderRadius: "6px", cursor: "pointer", textAlign: "left" }}
                  className="dropdown-item-hover"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  Aide
                </button>

                <hr style={{ border: "0", borderTop: "1px solid #27272a", margin: "6px 4px" }} />

                <button 
                  onClick={() => { logout(); setIsProfileDropdownOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", width: "100%", background: "none", color: "#f64e60", fontSize: "0.8rem", fontWeight: "700", borderRadius: "6px", cursor: "pointer", textAlign: "left" }}
                  className="dropdown-item-hover-logout"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#f64e60" }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Déconnexion
                </button>
              </div>
            )}
            <style>{`
              .navbar-profile-hover:hover { background-color: rgba(255, 255, 255, 0.05); }
              .dropdown-item-hover:hover { background-color: rgba(255, 255, 255, 0.05); }
              .dropdown-item-hover-logout:hover { background-color: rgba(246, 78, 96, 0.1); }
            `}</style>
          </div>
        )}

      </div>
    </header>
  );
}
