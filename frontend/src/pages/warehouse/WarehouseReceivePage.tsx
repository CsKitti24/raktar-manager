import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface Product {
  id: number;
  name: string;
}

interface StorageLocation {
  id: number;
  code: string;
  description: string | null;
}

interface InventoryRecord {
  id: number;
  product_id: number;
  location_id: number;
  quantity: number;
  updated_at: string | null;
}

const WarehouseReceivePage: React.FC = () => {
  const [products, setProducts]   = useState<Product[]>([]);
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    product_id: '',
    location_id: '',
    quantity: '',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = () => {
    Promise.all([
      api.get('/product/products'),
      api.get('/storage-locations/list'),
      api.get('/inventory/list'),
    ])
      .then(([p, l, inv]) => {
        setProducts(p.data);
        setLocations(l.data);
        setInventory(inv.data);
      })
      .catch(() => toast.error('Adatok betöltése sikertelen!'))
      .finally(() => setLoadingData(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.location_id || !form.quantity) {
      toast.error('Kérlek töltsd ki az összes kötelező mezőt!');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/inventory/receive', {
        product_id:  parseInt(form.product_id),
        location_id: parseInt(form.location_id),
        quantity:    parseInt(form.quantity),
        note:        form.note || null,
      });
      toast.success('Áru sikeresen bevételezve!');
      setForm({ product_id: '', location_id: '', quantity: '', note: '' });
      setLoadingData(true);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Hiba a bevételezés során!');
    } finally {
      setSubmitting(false);
    }
  };

  const productName = (id: number) => products.find(p => p.id === id)?.name ?? `#${id}`;
  const locationCode = (id: number) => locations.find(l => l.id === id)?.code ?? `#${id}`;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Áru bevételezése</h1>
          <p className="page-subtitle">Beérkező szállítmány rögzítése és tárhelyre helyezése</p>
        </div>
      </div>

      {/* Form card */}
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">📥 Bevételezés rögzítése</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Termék *</label>
              <select
                id="receive-product"
                name="product_id"
                className="form-select"
                value={form.product_id}
                onChange={handleChange}
                required
              >
                <option value="">— Válassz terméket —</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tárhely *</label>
              <select
                id="receive-location"
                name="location_id"
                className="form-select"
                value={form.location_id}
                onChange={handleChange}
                required
              >
                <option value="">— Válassz tárhelyet —</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.code}{l.description ? ` – ${l.description}` : ''}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mennyiség *</label>
              <input
                id="receive-quantity"
                type="number"
                name="quantity"
                className="form-input"
                min="1"
                placeholder="pl. 50"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Megjegyzés</label>
              <textarea
                id="receive-note"
                name="note"
                className="form-textarea"
                placeholder="Opcionális megjegyzés..."
                value={form.note}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              id="receive-submit"
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Rögzítés...' : '📥 Bevételezés rögzítése'}
            </button>
          </div>
        </form>
      </div>

      {/* Current inventory table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Aktuális készlet</h2>
        </div>
        {loadingData ? (
          <div className="loading-spinner"><div className="spinner-ring" /> Betöltés...</div>
        ) : inventory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-text">Nincs készletadat.</div>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Termék</th>
                  <th>Tárhely</th>
                  <th>Mennyiség</th>
                  <th>Utoljára módosítva</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(row => (
                  <tr key={row.id}>
                    <td><strong>{productName(row.product_id)}</strong></td>
                    <td><span className="badge badge-blue">{locationCode(row.location_id)}</span></td>
                    <td>
                      <span className={`badge ${row.quantity <= 5 ? 'badge-red' : 'badge-green'}`}>
                        {row.quantity} db
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {row.updated_at ? new Date(row.updated_at).toLocaleString('hu-HU') : '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default WarehouseReceivePage;
