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

interface InventoryLog {
  id: number;
  inventory_id: number;
  order_id: number | null;
  change_type: string;
  quantity_change: number;
  performed_by: number;
  note: string | null;
  created_at: string;
}

const WarehouseDispatchPage: React.FC = () => {
  const [products, setProducts]   = useState<Product[]>([]);
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [logs, setLogs]           = useState<InventoryLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    product_id: '',
    location_id: '',
    quantity: '',
    order_id: '',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = () => {
    setLoadingData(true);
    Promise.all([
      api.get('/product/products'),
      api.get('/storage-locations/list'),
      api.get('/inventory/list'),
      api.get('/inventory/log'),
    ])
      .then(([p, l, inv, lg]) => {
        setProducts(p.data);
        setLocations(l.data);
        setInventory(inv.data);
        setLogs(lg.data.slice(0, 20)); // show last 20
      })
      .catch(() => toast.error('Adatok betöltése sikertelen!'))
      .finally(() => setLoadingData(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Filter available locations for chosen product
  const availableForProduct = form.product_id
    ? inventory.filter(i => i.product_id === parseInt(form.product_id) && i.quantity > 0)
    : [];

  const maxQty = form.product_id && form.location_id
    ? inventory.find(i => i.product_id === parseInt(form.product_id) && i.location_id === parseInt(form.location_id))?.quantity ?? 0
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.location_id || !form.quantity) {
      toast.error('Kérlek töltsd ki az összes kötelező mezőt!');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/inventory/dispatch', {
        product_id:  parseInt(form.product_id),
        location_id: parseInt(form.location_id),
        quantity:    parseInt(form.quantity),
        order_id:    form.order_id ? parseInt(form.order_id) : null,
        note:        form.note || null,
      });
      toast.success('Áru kiadása sikeresen rögzítve!');
      setForm({ product_id: '', location_id: '', quantity: '', order_id: '', note: '' });
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Hiba az áru kiadásakor!');
    } finally {
      setSubmitting(false);
    }
  };

  const productName  = (id: number) => products.find(p => p.id === id)?.name ?? `#${id}`;
  const locationCode = (id: number) => locations.find(l => l.id === id)?.code ?? `#${id}`;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Áru kiadása</h1>
          <p className="page-subtitle">Kimenő áru rögzítése – készletcsökkentés</p>
        </div>
      </div>

      {/* Form card */}
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">📤 Kiadás rögzítése</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Termék *</label>
              <select
                id="dispatch-product"
                name="product_id"
                className="form-select"
                value={form.product_id}
                onChange={e => {
                  setForm(prev => ({ ...prev, product_id: e.target.value, location_id: '', quantity: '' }));
                }}
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
                id="dispatch-location"
                name="location_id"
                className="form-select"
                value={form.location_id}
                onChange={e => setForm(prev => ({ ...prev, location_id: e.target.value, quantity: '' }))}
                required
                disabled={!form.product_id}
              >
                <option value="">— Válassz tárhelyet —</option>
                {availableForProduct.map(inv => (
                  <option key={inv.location_id} value={inv.location_id}>
                    {locationCode(inv.location_id)} ({inv.quantity} db elérhető)
                  </option>
                ))}
              </select>
              {form.product_id && availableForProduct.length === 0 && (
                <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Nincs készlet ennél a terméknél.
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Mennyiség *{maxQty !== null && <span style={{ color: '#64748b', fontWeight: 400 }}> (max: {maxQty} db)</span>}
              </label>
              <input
                id="dispatch-quantity"
                type="number"
                name="quantity"
                className="form-input"
                min="1"
                max={maxQty ?? undefined}
                placeholder="pl. 10"
                value={form.quantity}
                onChange={handleChange}
                required
                disabled={!form.location_id}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rendelés ID (opcionális)</label>
              <input
                id="dispatch-order-id"
                type="number"
                name="order_id"
                className="form-input"
                placeholder="pl. 42"
                value={form.order_id}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Megjegyzés</label>
              <textarea
                id="dispatch-note"
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
              id="dispatch-submit"
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ background: '#f59e0b' }}
            >
              {submitting ? 'Rögzítés...' : '📤 Kiadás rögzítése'}
            </button>
          </div>
        </form>
      </div>

      {/* Movement log */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Legutóbbi készletmozgások</h2>
        </div>
        {loadingData ? (
          <div className="loading-spinner"><div className="spinner-ring" /> Betöltés...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">Nincs rögzített mozgás.</div>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Típus</th>
                  <th>Termék</th>
                  <th>Mennyiség</th>
                  <th>Rendelés ID</th>
                  <th>Megjegyzés</th>
                  <th>Dátum</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <span className={`badge ${log.change_type === 'in' ? 'badge-green' : 'badge-red'}`}>
                        {log.change_type === 'in' ? '📥 Bevételezés' : '📤 Kiadás'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>inv #{log.inventory_id}</td>
                    <td><strong>{log.quantity_change} db</strong></td>
                    <td>{log.order_id ?? '–'}</td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{log.note ?? '–'}</td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {new Date(log.created_at).toLocaleString('hu-HU')}
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

export default WarehouseDispatchPage;
