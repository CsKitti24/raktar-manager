import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface StorageLocation {
  id: number;
  code: string;
  description: string | null;
  is_active: number;
  created_at: string;
}

interface InventoryRecord {
  id: number;
  product_id: number;
  location_id: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
}

const WarehouseStoragePage: React.FC = () => {
  const [locations, setLocations]   = useState<StorageLocation[]>([]);
  const [inventory, setInventory]   = useState<InventoryRecord[]>([]);
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | null>(null);

  useEffect(() => {
    Promise.all([
      api.get('/storage-locations/list'),
      api.get('/inventory/list'),
      api.get('/product/products'),
    ])
      .then(([l, inv, p]) => {
        setLocations(l.data);
        setInventory(inv.data);
        setProducts(p.data);
      })
      .catch(() => toast.error('Adatok betöltése sikertelen!'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = locations.filter(l =>
    search === '' ||
    l.code.toLowerCase().includes(search.toLowerCase()) ||
    (l.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const itemsInLocation = (locationId: number) =>
    inventory.filter(i => i.location_id === locationId);

  const totalItems = (locationId: number) =>
    itemsInLocation(locationId).reduce((sum, i) => sum + i.quantity, 0);

  const productName = (id: number) =>
    products.find(p => p.id === id)?.name ?? `Termék #${id}`;

  const activeCount   = locations.filter(l => l.is_active).length;
  const inactiveCount = locations.filter(l => !l.is_active).length;
  const totalStock    = inventory.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tárolóhelyek</h1>
          <p className="page-subtitle">Raktári tárhelyek és készletük áttekintése</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedLocation ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Location list */}
        <div className="admin-card">
          <div className="filter-bar">
            <input
              id="storage-search"
              type="text"
              className="filter-input"
              placeholder="Keresés kód vagy leírás alapján..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading-spinner"><div className="spinner-ring" /> Betöltés...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📍</div>
              <div className="empty-state-text">Nem található tárhely.</div>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kód</th>
                    <th>Leírás</th>
                    <th>Tételek</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(loc => {
                    const count = totalItems(loc.id);
                    return (
                      <tr key={loc.id} style={selectedLocation?.id === loc.id ? { background: '#fdf2f8' } : {}}>
                        <td><strong>{loc.code}</strong></td>
                        <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{loc.description ?? '–'}</td>
                        <td>
                          <span className={`badge ${count === 0 ? 'badge-gray' : 'badge-blue'}`}>
                            {count} db
                          </span>
                        </td>
                        <td>
                          <button
                            id={`view-location-${loc.id}`}
                            className="btn-ghost"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => setSelectedLocation(selectedLocation?.id === loc.id ? null : loc)}
                          >
                            {selectedLocation?.id === loc.id ? 'Bezárás' : 'Részletek'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Location detail panel */}
        {selectedLocation && (
          <div className="admin-card">
            <div className="admin-card-header" style={{ justifyContent: 'space-between' }}>
              <h2 className="admin-card-title">📍 {selectedLocation.code}</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedLocation(null)}
                style={{ fontSize: '1.1rem' }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              {selectedLocation.description && (
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {selectedLocation.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <span className="badge badge-gray">
                  Létrehozva: {new Date(selectedLocation.created_at).toLocaleDateString('hu-HU')}
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Raktáron lévő termékek
              </div>

              {itemsInLocation(selectedLocation.id).length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <div className="empty-state-icon">📭</div>
                  <div className="empty-state-text">Ez a tárhely üres.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {itemsInLocation(selectedLocation.id).map(item => (
                    <div key={item.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                    }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{productName(item.product_id)}</span>
                      <span className={`badge ${item.quantity <= 5 ? 'badge-red' : 'badge-green'}`}>
                        {item.quantity} db
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WarehouseStoragePage;
