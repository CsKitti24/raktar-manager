import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface Order {
  id: number;
  order_number: string;
  orderer_id: number;
  status: string;
  total_amount: number;
  is_locked: number;
  created_at: string;
  updated_at?: string;
}

const STATUSES = [
  { value: '',                  label: 'Összes' },
  { value: 'megrendelve',       label: 'Megrendelve' },
  { value: 'fizetésre vár',     label: 'Fizetésre vár' },
  { value: 'feldolgozás alatt', label: 'Feldolgozás alatt' },
  { value: 'beszállításra vár', label: 'Beszállításra vár' },
  { value: 'lezárt',            label: 'Lezárt' },
];

const STATUS_BADGE: Record<string, string> = {
  'megrendelve':       'badge-blue',
  'fizetésre vár':     'badge-yellow',
  'feldolgozás alatt': 'badge-pink',
  'beszállításra vár': 'badge-yellow',
  'lezárt':            'badge-green',
};

const OrderManagementPage: React.FC = () => {
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [statusFilter,  setStatusFilter]  = useState('');
  const [editOrder,     setEditOrder]     = useState<Order | null>(null);
  const [newStatus,     setNewStatus]     = useState('');
  const [saving,        setSaving]        = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders/get-orders')
      .then(r => setOrders(r.data))
      .catch(() => toast.error('Nem sikerült betölteni a rendeléseket.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const openStatusModal = (order: Order) => {
    setEditOrder(order);
    setNewStatus(order.status);
  };

  const handleStatusUpdate = async () => {
    if (!editOrder || !newStatus) return;
    setSaving(true);
    try {
      await api.put(`/orders/${editOrder.id}/status`, { status: newStatus });
      toast.success('Rendelés státusza frissítve!');
      setEditOrder(null);
      fetchOrders();
    } catch { toast.error('Nem sikerült frissíteni a státuszt.'); }
    finally { setSaving(false); }
  };

  const filtered = statusFilter
    ? orders.filter(o => o.status === statusFilter)
    : orders;

  const formatDate = (dt?: string) => dt ? new Date(dt).toLocaleString('hu-HU') : '—';

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Rendelések áttekintése</h1>
          <p className="page-subtitle">{filtered.length} / {orders.length} rendelés</p>
        </div>
        <button className="btn-secondary" onClick={fetchOrders}>🔄 Frissítés</button>
      </div>

      <div className="admin-card">
        <div className="filter-bar">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                background: statusFilter === s.value ? '#ec4899' : '#f1f5f9',
                color: statusFilter === s.value ? '#fff' : '#374151',
                transition: 'all 0.18s',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner-ring" />Betöltés...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">Nincsenek rendelések</div></div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>Rendelésszám</th><th>Megrendelő ID</th><th>Összeg</th>
                  <th>Státusz</th><th>Létrehozva</th><th>Módosítva</th><th>Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>#{o.id}</td>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.82rem' }}>{o.order_number}</td>
                    <td>#{o.orderer_id}</td>
                    <td><strong style={{ color: '#ec4899' }}>{o.total_amount ? o.total_amount.toLocaleString('hu-HU') + ' Ft' : '—'}</strong></td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[o.status] ?? 'badge-gray'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatDate(o.created_at)}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{formatDate(o.updated_at)}</td>
                    <td>
                      <button className="btn-ghost" onClick={() => openStatusModal(o)}>Státusz</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Státusz Modal ── */}
      {editOrder && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEditOrder(null); }}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h3 className="modal-title">Státusz módosítása</h3>
              <button className="modal-close" onClick={() => setEditOrder(null)}>✕</button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Rendelés: <strong>{editOrder.order_number}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">Új státusz</label>
              <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {STATUSES.filter(s => s.value !== '').map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setEditOrder(null)}>Mégse</button>
              <button className="btn-primary" onClick={handleStatusUpdate} disabled={saving}>
                {saving ? 'Mentés...' : 'Frissítés'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderManagementPage;
