import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: "EN", label: "English", flag: "🇬🇧" },
    { code: "FR", label: "Français", flag: "🇫🇷" },
    { code: "AR", label: "العربية", flag: "🇸🇦" },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[1];

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
      <div className="navbar-right">
        
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

      </div>
    </header>
  );
}
