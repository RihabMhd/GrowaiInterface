import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">
            <svg style={{ width: '24px', height: '24px', color: '#8950fc' }} viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            Tableau de bord
          </h2>
          <p className="page-subtitle">Surveillez les indicateurs clés et la performance</p>
        </div>
        <select className="select-input">
          <option>Aujourd'hui</option>
          <option>Hier</option>
          <option>Les 7 derniers jours</option>
        </select>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        
        <div className="card">
          <div className="card-header">
            <div className="card-icon icon-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="card-title">Total Commandes</div>
            </div>
          </div>
          <div className="card-value">0</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon icon-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="card-title">Confirmées</div>
            </div>
          </div>
          <div className="card-value">0</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon icon-warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="card-title">En Attente</div>
            </div>
          </div>
          <div className="card-value">0</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon icon-danger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="card-title">Annulées</div>
            </div>
          </div>
          <div className="card-value">0</div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ backgroundColor: '#f3f6f9', color: '#b5b5c3' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="card-title" style={{ fontSize: '0.65rem' }}>Temps Moyen<br/>Confirmation</div>
            </div>
          </div>
          <div className="card-value" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>— Aucune donnée</div>
        </div>

      </div>

      <div className="dashboard-grid-large" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        
        {/* Revenus */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '40px' }}>
            <div className="card-icon icon-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem' }}>Revenus</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Des commandes confirmées</div>
            </div>
            <div className="badge badge-success">+0%</div>
          </div>
          <div className="card-value" style={{ fontSize: '2.5rem' }}>0</div>
        </div>

        {/* Aperçu */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'flex-start', gap: '15px' }}>
            <div className="card-icon icon-primary" style={{ height: '30px', width: '30px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem' }}>Aperçu</div>
          </div>
          
          <div className="data-list" style={{ marginTop: '20px' }}>
            <div className="data-item">
              <div className="data-item-label">
                <div className="data-item-dot dot-primary"></div>
                Produits
              </div>
              <div className="data-item-value">0</div>
            </div>
            <div className="data-item">
              <div className="data-item-label">
                <div className="data-item-dot dot-success"></div>
                Clients
              </div>
              <div className="data-item-value">1</div>
            </div>
            <div className="data-item">
              <div className="data-item-label">
                <div className="data-item-dot dot-warning"></div>
                Membres d'équipe
              </div>
              <div className="data-item-value">0</div>
            </div>
            <div className="data-item">
              <div className="data-item-label">
                <div className="data-item-dot dot-success"></div>
                Livrées
              </div>
              <div className="data-item-value">0</div>
            </div>
          </div>
        </div>

        {/* Taux de confirmation */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'flex-start', gap: '15px' }}>
            <div className="card-icon icon-success" style={{ height: '30px', width: '30px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem' }}>Taux de confirmation</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '8px solid var(--border-color)', borderTopColor: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem', fontWeight: '700' }}>0%</span>
            </div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div className="data-item-dot dot-success"></div> 0 confirmed</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div className="data-item-dot" style={{ backgroundColor: 'var(--border-color)' }}></div> 0 other</span>
            </div>
          </div>
        </div>

        {/* Forfait & utilisation */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Forfait & utilisation</h3>
               <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--border-color)', borderRadius: '4px', fontWeight: 600 }}>FREE</span>
             </div>
             <div className="card-icon icon-purple" style={{ height: '30px', width: '30px', cursor: 'pointer' }}>
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
             </div>
           </div>
           
           <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
             Renouvelle dans 16 jours · 1 juin 2026
           </div>

           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '15px' }}>
             <span>Période de<br/>Facturation</span>
             <span style={{ textAlign: 'right' }}>1 mai → 1 juin · Jour 15 sur<br/>31</span>
           </div>

           <div style={{ display: 'flex', gap: '10px' }}>
             <div style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--border-color)', borderTopColor: 'var(--purple)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>1<span style={{ fontSize: '0.7rem' }}>%</span></span>
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--purple)', letterSpacing: '0.5px' }}>COMMANDES</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, margin: '5px 0' }}>1 <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>/ 100</span></div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Projection: 2 sur la période</div>
             </div>
             <div style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--border-color)', borderTopColor: 'var(--success)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>0<span style={{ fontSize: '0.7rem' }}>%</span></span>
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--success)', letterSpacing: '0.5px' }}>BOUTIQUES</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, margin: '5px 0' }}>0 <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>/ 1</span></div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Boutiques connectées</div>
             </div>
           </div>

        </div>

      </div>
    </div>
  );
}