import React, { useState } from 'react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [prefix, setPrefix] = useState('FM');
  const [exchangeRate, setExchangeRate] = useState('10');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const styles = {
    // Outer wrapper — just padding inside the app's main area
    wrapper: {
      padding: '28px 32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100%',
    },
    pageTitle: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#111827',
      margin: '0 0 4px 0',
    },
    pageSubtitle: {
      fontSize: '13px',
      color: '#6b7280',
      margin: '0 0 24px 0',
    },
    // Two-column layout: small left panel + main content
    layout: {
      display: 'flex',
      gap: '24px',
      alignItems: 'flex-start',
    },
    leftPanel: {
      width: '200px',
      minWidth: '200px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '16px',
      flexShrink: 0,
    },
    userProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '16px',
      paddingBottom: '16px',
      borderBottom: '1px solid #f3f4f6',
    },
    avatar: {
      width: '38px',
      height: '38px',
      borderRadius: '50%',
      backgroundColor: '#f97316',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '700',
      flexShrink: 0,
    },
    userName: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#111827',
      margin: 0,
    },
    userRole: {
      fontSize: '11px',
      color: '#9ca3af',
      margin: '2px 0 0 0',
    },
    navMenu: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    navItem: { marginBottom: '2px' },
    navLink: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '9px 12px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: isActive ? '600' : '500',
      color: isActive ? '#7c3aed' : '#374151',
      backgroundColor: isActive ? '#f5f3ff' : 'transparent',
      cursor: 'pointer',
      border: isActive ? '1.5px solid #ede9fe' : '1.5px solid transparent',
      transition: 'all 0.15s',
    }),
    // Right content area
    contentArea: {
      flex: 1,
      minWidth: 0,
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '28px',
      marginBottom: '20px',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      marginBottom: '24px',
      paddingBottom: '20px',
      borderBottom: '1px solid #f3f4f6',
    },
    cardIconWrap: {
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      backgroundColor: '#f5f3ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      flexShrink: 0,
    },
    cardTitle: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 3px 0',
    },
    cardSubtitle: {
      fontSize: '13px',
      color: '#6b7280',
      margin: 0,
    },
    profileImageSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '28px',
    },
    profileImageContainer: { position: 'relative' },
    profileImage: {
      width: '72px',
      height: '72px',
      borderRadius: '14px',
      backgroundColor: '#f97316',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: '32px',
      fontWeight: '700',
    },
    editBadge: {
      position: 'absolute',
      top: '-6px',
      right: '-6px',
      width: '20px',
      height: '20px',
      backgroundColor: '#ef4444',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: '10px',
      cursor: 'pointer',
    },
    changeImageButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 14px',
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      color: '#374151',
      cursor: 'pointer',
      marginBottom: '6px',
    },
    imageSizeNote: {
      fontSize: '12px',
      color: '#9ca3af',
      margin: 0,
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '20px',
    },
    formLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px',
    },
    formInput: {
      width: '100%',
      padding: '10px 14px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#111827',
      backgroundColor: '#f9fafb',
      outline: 'none',
      boxSizing: 'border-box',
    },
    formGroup: { marginBottom: '20px' },
    badge: {
      display: 'inline-block',
      padding: '2px 8px',
      backgroundColor: '#f5f3ff',
      color: '#7c3aed',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
    },
    inactiveBadge: {
      display: 'inline-block',
      padding: '2px 8px',
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
    },
    emailNote: {
      fontSize: '12px',
      color: '#9ca3af',
      marginTop: '6px',
    },
    emailLink: {
      color: '#7c3aed',
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    saveButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 22px',
      backgroundColor: '#111827',
      color: '#ffffff',
      border: 'none',
      borderRadius: '24px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    setPasswordButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 22px',
      backgroundColor: '#111827',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '8px',
    },
    enable2FAButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      backgroundColor: '#111827',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      flexShrink: 0,
    },
    twoFARow: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '16px',
    },
    warningBox: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      marginTop: '20px',
      padding: '14px',
      backgroundColor: '#fffbeb',
      borderRadius: '8px',
      border: '1px solid #fde68a',
    },
    warningText: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#92400e',
      margin: '0 0 4px 0',
    },
    warningSubtext: {
      fontSize: '12px',
      color: '#b45309',
      margin: 0,
    },
    prefixRow: {
      display: 'flex',
      alignItems: 'center',
    },
    prefixLabel: {
      padding: '10px 14px',
      backgroundColor: '#f3f4f6',
      border: '1px solid #e5e7eb',
      borderRight: 'none',
      borderRadius: '8px 0 0 8px',
      fontSize: '12px',
      fontWeight: '700',
      color: '#6b7280',
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap',
    },
    prefixInput: {
      padding: '10px 14px',
      border: '1px solid #e5e7eb',
      borderRight: 'none',
      fontSize: '14px',
      fontWeight: '700',
      color: '#111827',
      backgroundColor: '#ffffff',
      outline: 'none',
      width: '90px',
    },
    prefixArrow: {
      padding: '10px 10px',
      border: '1px solid #e5e7eb',
      borderRight: 'none',
      fontSize: '13px',
      color: '#6b7280',
      backgroundColor: '#f9fafb',
    },
    prefixPreview: {
      padding: '10px 14px',
      border: '1px solid #e5e7eb',
      borderRight: 'none',
      fontSize: '13px',
      fontWeight: '600',
      color: '#6b7280',
      backgroundColor: '#f9fafb',
    },
    prefixSaveBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '10px 18px',
      backgroundColor: '#9ca3af',
      color: '#ffffff',
      border: 'none',
      borderRadius: '0 8px 8px 0',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    localMarketGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
    },
    sectionLabel: {
      fontSize: '11px',
      fontWeight: '700',
      color: '#6b7280',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    selectInput: {
      width: '100%',
      padding: '10px 14px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#111827',
      backgroundColor: '#ffffff',
      outline: 'none',
      cursor: 'pointer',
    },
    exchangeRow: {
      display: 'flex',
      alignItems: 'center',
    },
    exchangePrefix: {
      padding: '10px 14px',
      border: '1px solid #e5e7eb',
      borderRight: 'none',
      borderRadius: '8px 0 0 8px',
      fontSize: '13px',
      color: '#6b7280',
      backgroundColor: '#f9fafb',
      whiteSpace: 'nowrap',
    },
    exchangeInput: {
      padding: '10px 14px',
      border: '1px solid #e5e7eb',
      borderRight: 'none',
      fontSize: '14px',
      fontWeight: '700',
      color: '#111827',
      backgroundColor: '#ffffff',
      outline: 'none',
      width: '70px',
    },
    exchangeSuffix: {
      padding: '10px 14px',
      border: '1px solid #e5e7eb',
      borderRight: 'none',
      fontSize: '13px',
      color: '#6b7280',
      backgroundColor: '#f9fafb',
    },
    exchangeSaveBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '10px 18px',
      backgroundColor: '#9ca3af',
      color: '#ffffff',
      border: 'none',
      borderRadius: '0 8px 8px 0',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    exchangeNote: {
      marginTop: '10px',
      padding: '10px 14px',
      backgroundColor: '#fffbeb',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      color: '#92400e',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    usageNote: {
      fontSize: '12px',
      color: '#9ca3af',
      marginTop: '8px',
    },
    accountRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 0',
      borderBottom: '1px solid #f3f4f6',
    },
    accountRowLast: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 0',
    },
    accountRowLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 3px 0',
    },
    accountRowSub: {
      fontSize: '12px',
      color: '#9ca3af',
      margin: 0,
    },
    accountIDBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    accountIDValue: {
      padding: '6px 12px',
      backgroundColor: '#f3f4f6',
      borderRadius: '6px',
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#374151',
    },
    copyBtn: {
      padding: '5px 8px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      background: '#fff',
      cursor: 'pointer',
      fontSize: '13px',
    },
    roleBadge: {
      padding: '4px 12px',
      backgroundColor: '#f5f3ff',
      color: '#7c3aed',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
    },
    activeBadge: {
      padding: '4px 12px',
      backgroundColor: '#d1fae5',
      color: '#065f46',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
    },
  };

  const navItems = [
    { name: 'Profile', icon: '👤' },
    { name: 'Security', icon: '🔒' },
    { name: 'Business', icon: '💼' },
    { name: 'Account', icon: 'ℹ️' },
  ];

  const renderProfile = () => (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.cardIconWrap}>👤</div>
        <div>
          <h2 style={styles.cardTitle}>Profile Information</h2>
          <p style={styles.cardSubtitle}>Update your account details</p>
        </div>
      </div>

      <div style={styles.profileImageSection}>
        <div style={styles.profileImageContainer}>
          <div style={styles.profileImage}>R</div>
          <div style={styles.editBadge}>✕</div>
        </div>
        <div>
          <button style={styles.changeImageButton}>
            <span>📷</span> Change Image
          </button>
          <p style={styles.imageSizeNote}>JPG, PNG or GIF. Max size 2MB</p>
        </div>
      </div>

      <div style={styles.formGrid}>
        <div>
          <label style={styles.formLabel}>Full Name</label>
          <input type="text" style={styles.formInput} defaultValue="Rihab Mahdi" />
        </div>
        <div>
          <label style={styles.formLabel}><span>📱</span> WhatsApp</label>
          <input type="text" style={styles.formInput} defaultValue="+21279226258" />
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.formLabel}>
          Email Address <span style={styles.badge}>Primary</span>
        </label>
        <input type="email" style={styles.formInput} defaultValue="rihabmahdi19@gmail.com" />
        <p style={styles.emailNote}>
          To change your email, contact{' '}
          <a href="mailto:contact@flash-manager.com" style={styles.emailLink}>
            contact@flash-manager.com
          </a>
        </p>
      </div>

      <button style={styles.saveButton}>
        <span>✓</span> Save Changes
      </button>
    </div>
  );

  const renderSecurity = () => (
    <>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.cardIconWrap, backgroundColor: '#fef3c7' }}>🔒</div>
          <div>
            <h2 style={styles.cardTitle}>Set Password</h2>
            <p style={styles.cardSubtitle}>Set Password</p>
          </div>
        </div>

        <div style={styles.formGrid}>
          <div>
            <label style={styles.formLabel}>Set Password</label>
            <input
              type="password"
              style={styles.formInput}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <p style={styles.imageSizeNote}>Minimum 8 characters</p>
          </div>
          <div>
            <label style={styles.formLabel}>Confirm Password</label>
            <input
              type="password"
              style={styles.formInput}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <button style={styles.setPasswordButton}>
          <span>🔒</span> Set Password
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.twoFARow}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ ...styles.cardIconWrap, backgroundColor: '#f5f3ff' }}>🔐</div>
            <div>
              <h2 style={{ ...styles.cardTitle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Two-Factor Authentication <span style={styles.inactiveBadge}>Inactive</span>
              </h2>
              <p style={styles.cardSubtitle}>Protect your account with Google Authenticator</p>
            </div>
          </div>
          <button style={styles.enable2FAButton}>
            <span>🛡️</span> Enable 2FA
          </button>
        </div>

        <div style={styles.warningBox}>
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <div>
            <p style={styles.warningText}>Your account is not protected by 2FA</p>
            <p style={styles.warningSubtext}>
              Enable two-factor authentication to add an extra layer of security using Google Authenticator.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  const renderBusiness = () => (
    <>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.cardIconWrap, backgroundColor: '#ede9fe' }}>🔖</div>
          <div>
            <h2 style={styles.cardTitle}>Order Identification</h2>
            <p style={styles.cardSubtitle}>Prefix used for manually created orders</p>
          </div>
        </div>

        <div style={styles.prefixRow}>
          <span style={styles.prefixLabel}>PREFIX</span>
          <input
            type="text"
            style={styles.prefixInput}
            value={prefix}
            onChange={e => setPrefix(e.target.value)}
          />
          <span style={styles.prefixArrow}>→</span>
          <span style={styles.prefixPreview}>{prefix}1001</span>
          <button style={styles.prefixSaveBtn}><span>✓</span> Save</button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.cardIconWrap, backgroundColor: '#e0f2fe' }}>🌐</div>
          <div>
            <h2 style={styles.cardTitle}>Local Market</h2>
            <p style={styles.cardSubtitle}>Your operating country and its local currency rate</p>
          </div>
        </div>

        <div style={styles.localMarketGrid}>
          <div>
            <div style={styles.sectionLabel}><span style={{ color: '#3b82f6' }}>🌍</span> COUNTRY</div>
            <select style={styles.selectInput}>
              <option value="MA">🇲🇦  Morocco</option>
              <option value="FR">🇫🇷  France</option>
              <option value="US">🇺🇸  United States</option>
              <option value="TN">🇹🇳  Tunisia</option>
              <option value="DZ">🇩🇿  Algeria</option>
            </select>
            <p style={styles.usageNote}>Used to filter relevant delivery carriers and set the default currency.</p>
          </div>
          <div>
            <div style={styles.sectionLabel}><span style={{ color: '#f59e0b' }}>💱</span> EXCHANGE RATE</div>
            <div style={styles.exchangeRow}>
              <span style={styles.exchangePrefix}>$1 =</span>
              <input
                type="text"
                style={styles.exchangeInput}
                value={exchangeRate}
                onChange={e => setExchangeRate(e.target.value)}
              />
              <span style={styles.exchangeSuffix}>MAD</span>
              <button style={styles.exchangeSaveBtn}><span>✓</span> Save</button>
            </div>
            <div style={styles.exchangeNote}>
              <span>💰</span>
              <span>$10 = {exchangeRate * 10} MAD</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderAccount = () => (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={{ ...styles.cardIconWrap, backgroundColor: '#ede9fe' }}>ℹ️</div>
        <div>
          <h2 style={styles.cardTitle}>Account Information</h2>
          <p style={styles.cardSubtitle}>Your staff account details</p>
        </div>
      </div>

      <div style={styles.accountRow}>
        <div>
          <p style={styles.accountRowLabel}>Account ID</p>
          <p style={styles.accountRowSub}>Your unique identifier</p>
        </div>
        <div style={styles.accountIDBox}>
          <span style={styles.accountIDValue}>909bf238-5951-42ff-9509-7b...</span>
          <button style={styles.copyBtn} title="Copy">📋</button>
        </div>
      </div>

      <div style={styles.accountRow}>
        <div>
          <p style={styles.accountRowLabel}>Role</p>
          <p style={styles.accountRowSub}>Your access level</p>
        </div>
        <span style={styles.roleBadge}>Owner</span>
      </div>

      <div style={styles.accountRow}>
        <div>
          <p style={styles.accountRowLabel}>Account Status</p>
          <p style={styles.accountRowSub}>Current account state</p>
        </div>
        <span style={styles.activeBadge}>Active</span>
      </div>

      <div style={styles.accountRowLast}>
        <div>
          <p style={styles.accountRowLabel}>Member Since</p>
          <p style={styles.accountRowSub}>Account creation date</p>
        </div>
        <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>May 13, 2026</span>
      </div>
    </div>
  );

  const tabContent = { Profile: renderProfile, Security: renderSecurity, Business: renderBusiness, Account: renderAccount };

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.pageTitle}>Settings</h1>
      <p style={styles.pageSubtitle}>Manage your account and preferences</p>

      <div style={styles.layout}>
        {/* Left panel: user card + nav */}
        <div style={styles.leftPanel}>
          <div style={styles.userProfile}>
            <div style={styles.avatar}>R</div>
            <div>
              <p style={styles.userName}>Rihab Mahdi</p>
              <p style={styles.userRole}>Owner</p>
            </div>
          </div>

          <ul style={styles.navMenu}>
            {navItems.map((item) => (
              <li key={item.name} style={styles.navItem}>
                <div
                  style={styles.navLink(activeTab === item.name)}
                  onClick={() => setActiveTab(item.name)}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right content area */}
        <div style={styles.contentArea}>
          {tabContent[activeTab]?.()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;