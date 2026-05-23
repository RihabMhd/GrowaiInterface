import React, { useState } from 'react';
import { 
  Users, 
  RefreshCw, 
  Search, 
  History, 
  Crown, 
  DollarSign, 
  ArrowUpDown, 
  Phone, 
  MessageCircle 
} from 'lucide-react';

const INITIAL_CLIENTS = [
  {
    id: 1,
    name: 'Dolore nihil qui fug',
    email: 'xilevosu@mailinator.com',
    phone: '212679226258',
    location: 'Ut nobis quibusdam a, Sit deserunt nisi m',
    orders: 0,
    totalSpent: '0.00 MAD',
    lastOrder: 'Never',
  },
  {
    id: 2,
    name: 'Vel explicabo Ex de',
    email: 'gybiguv@mailinator.com',
    phone: '18343541815',
    location: 'Ea doloremque ipsum, Tempora assumenda fa',
    orders: 0,
    totalSpent: '0.00 MAD',
    lastOrder: 'Never',
  },
  {
    id: 3,
    name: 'Dolore nihil qui fug',
    email: 'xilevosu@mailinator.com',
    phone: '15083056142',
    location: 'Ut nobis quibusdam a, Sit deserunt nisi m',
    orders: 0,
    totalSpent: '18.00 MAD',
    lastOrder: '5d ago',
  }
];

export default function ClientsPage() {
  const [activeTab, setActiveTab] = useState('Recent');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = INITIAL_CLIENTS.filter(client => {
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.phone.includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.location.toLowerCase().includes(query)
    );
  });

  return (
    <div className="main-content" style={{ background: 'var(--bg-app)' }}>
      
      {/* Top Header Layer */}
      <div className="page-header" style={{ marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <div style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} style={{ color: '#2d2d2d' }} />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>Clients</h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manage and view your registered consumer base</p>
        </div>
        
        <button 
          className="btn-primary-action" 
          style={{ 
            backgroundColor: 'var(--purple)', 
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px'
          }}
        >
          <RefreshCw size={11} />
          Sync from Orders
        </button>
      </div>

      {/* Grid of Independent Metric Cards */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#7239ea', flexShrink: 0 }}/>
            <span className="card-title">TOTAL CLIENTS</span>
          </div>
          <div className="card-value">3</div>
        </div>
        
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#50cd89', flexShrink: 0 }}/>
            <span className="card-title">TOTAL ORDERS</span>
          </div>
          <div className="card-value">3</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffc700', flexShrink: 0 }}/>
            <span className="card-title">TOTAL REVENUE</span>
          </div>
          <div className="card-value">18.00 MAD</div>
        </div>
      </div>

      {/* Navigation Filter Segment Controls */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '12px', paddingLeft: '0px' }}>
        {[
          { id: 'Recent', label: 'Recent', icon: <History size={13} /> },
          { id: 'Most Orders', label: 'Most Orders', icon: <Crown size={13} /> },
          { id: 'Top Spenders', label: 'Top Spenders', icon: <DollarSign size={13} /> },
          { id: 'Name A-Z', label: 'Name A-Z', icon: <ArrowUpDown size={13} /> },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 0',
                background: 'none',
                fontSize: '12px',
                fontWeight: isSelected ? '700' : '500',
                color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                borderBottom: isSelected ? '2px solid var(--text-main)' : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'all 0.15s'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Modern Search Row Wrapper */}
      <div className="search-filter-bar" style={{ marginBottom: '10px' }}>
        <div className="search-input-wrapper">
          <Search className="search-icon" size={15} style={{ left: '12px' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, phone, email or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px', height: '34px', borderRadius: '6px', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Main Table Content Module */}
      <div className="card" style={{ padding: '0px', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="products-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '20px', width: '25%' }}>CLIENT</th>
                <th style={{ width: '15%' }}>PHONE</th>
                <th style={{ width: '25%' }}>LOCATION</th>
                <th style={{ width: '10%', textAlign: 'center' }}>ORDERS</th>
                <th style={{ width: '12%' }}>TOTAL SPENT</th>
                <th style={{ width: '13%' }}>LAST ORDER</th>
                <th style={{ width: '10%', textAlign: 'right', paddingRight: '20px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  
                  {/* Client Identification Cells */}
                  <td style={{ paddingLeft: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Geometric Minimal Vector Flag Emblem */}
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#c1272d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#006233" strokeWidth="3">
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                      </div>
                      <div>
                        <div className="cell-text-strong" style={{ fontSize: '13px' }}>{client.name}</div>
                        <div className="cell-text" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{client.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Number Row Data */}
                  <td>
                    <span className="cell-text" style={{ color: 'var(--text-main)' }}>{client.phone}</span>
                  </td>

                  {/* Geolocation String Cell */}
                  <td>
                    <span className="cell-text" style={{ display: 'block', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>
                      {client.location}
                    </span>
                  </td>

                  {/* Total Placed Orders Indicator Pill */}
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      backgroundColor: 'rgba(105, 147, 255, 0.1)',
                      color: 'var(--primary)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {client.orders}
                    </span>
                  </td>

                  {/* Financial Value Summary Cell */}
                  <td>
                    <span className="cell-text-strong">{client.totalSpent}</span>
                  </td>

                  {/* Tracker Timeline Date Cell */}
                  <td>
                    <span className="cell-text">{client.lastOrder}</span>
                  </td>

                  {/* Quick External Actions Hook */}
                  <td style={{ paddingRight: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
                      <a href={`tel:${client.phone}`} style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center' }}>
                        <Phone size={14} />
                      </a>
                      <a href={`https://wa.me/${client.phone}`} target="_blank" rel="noreferrer" style={{ color: '#25D366', display: 'inline-flex', alignItems: 'center' }}>
                        <MessageCircle size={14} fill="#25D366" stroke="none" />
                      </a>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
