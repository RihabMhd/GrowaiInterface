import { useEffect, useState } from "react";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);

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

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        {/* Empty left side because the sidebar header covers the top left corner visually */}
      </div>
      <div className="navbar-right">
        
        {/* Language Selector */}
        <div className="nav-item">
          <div style={{ width: '20px', height: '14px', backgroundColor: '#002654', display: 'flex' }}>
             {/* French flag mock */}
             <div style={{ width: '33%', backgroundColor: '#002654' }}></div>
             <div style={{ width: '33%', backgroundColor: '#fff' }}></div>
             <div style={{ width: '34%', backgroundColor: '#ed2939' }}></div>
          </div>
          FR
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
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
