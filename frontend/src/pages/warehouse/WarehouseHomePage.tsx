import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface Summary {
  total_orders: number;
  active_complaints: number;
  low_stock_items: number;
  active_storage_locations: number;
}

const WarehouseHomePage: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(r => setSummary(r.data))
      .catch(() => setError('Nem sikerült betölteni az adatokat.'))
      .finally(() => setLoading(false));
  }, []);

  const cards = summary
    ? [
        { label: 'Összes rendelés',      value: summary.total_orders,             icon: '📋', color: 'pink'   },
        { label: 'Alacsony készlet',      value: summary.low_stock_items,          icon: '📦', color: 'orange' },
        { label: 'Aktív tárolóhelyek',    value: summary.active_storage_locations, icon: '📍', color: 'blue'   },
        { label: 'Aktív reklamációk',     value: summary.active_complaints,        icon: '⚠️', color: 'green'  },
      ]
    : [];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Raktáros vezérlőpult</h1>
          <p className="page-subtitle">Készlet és logisztikai áttekintés</p>
        </div>
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner-ring" />
          Adatok betöltése...
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem 1.25rem', borderRadius: 12, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="stats-grid">
          {cards.map(c => (
            <div className="stat-card" key={c.label}>
              <div className={`stat-icon ${c.color}`}>{c.icon}</div>
              <div className="stat-value">{c.value ?? 0}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Gyors elérés</h2>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { href: '/warehouse/receive',  label: '📥 Áru bevételezése' },
            { href: '/warehouse/dispatch', label: '📤 Áru kiadása' },
            { href: '/warehouse/orders',   label: '📋 Rendelések' },
            { href: '/warehouse/storage',  label: '📍 Tárolóhelyek' },
          ].map(item => (
            <a key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ fontSize: '0.875rem' }}>{item.label}</button>
            </a>
          ))}
        </div>
      </div>
    </>
  );
};

export default WarehouseHomePage;
