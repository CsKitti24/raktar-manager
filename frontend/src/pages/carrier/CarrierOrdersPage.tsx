import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Address {
  country: string;
  city: string;
  street: string;
  postal_code: string;
}

interface Order {
  id: number;
  order_number: string;
  orderer_id: number;
  supplier_id: number | null;
  carrier_id: number | null;
  warehouse_user_id: number | null;
  status: string;
  comment: string;
  total_amount: number;
  is_locked: number;
  created_at: string;
  updated_at: string;
  address: Address;
  items: OrderItem[];
}

const STATUS_LABELS: Record<string, { label: string; badge: string }> = {
  pending:    { label: 'Függőben',     badge: 'badge-yellow' },
  processing: { label: 'Feldolgozás',  badge: 'badge-blue'   },
  shipped:    { label: 'Szállítás',    badge: 'badge-pink'   },
  delivered:  { label: 'Teljesítve',   badge: 'badge-green'  },
  cancelled:  { label: 'Törölve',      badge: 'badge-red'    },
};

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const CarrierOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Status change modal
  const [statusModal, setStatusModal] = useState<{ orderId: number; current: string } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Detail expand
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders/get-orders')
      .then(res => {
        setOrders(res.data);
      })
      .catch(() => toast.error('Adatok betöltése sikertelen!'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === '' || o.status === statusFilter;
    return matchStatus;
  });

  const openStatus = (orderId: number, current: string) => {
    setStatusModal({ orderId, current });
    setSelectedStatus(current);
  };

  const handleUpdateStatus = async () => {
    if (!statusModal) return;
    setUpdatingStatus(true);
    try {
      await api.put(`/orders/${statusModal.orderId}/status`, { status: selectedStatus });
      toast.success('Fuvar állapota frissítve!');
      setStatusModal(null);
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Hiba az állapot módosításánál!');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusInfo = (s: string) => STATUS_LABELS[s] ?? { label: s, badge: 'badge-gray' };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fuvarjaim</h1>
          <p className="page-subtitle">A hozzám rendelt fuvarok és állapotuk kezelése</p>
        </div>
      </div>

      <div className="admin-card">
        {/* Filter bar */}
        <div className="filter-bar">
          <select
            id="orders-status-filter"
            className="filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Minden állapot</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{statusInfo(s).label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner-ring" /> Betöltés...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚚</div>
            <div className="empty-state-text">Jelenleg nincs hozzád rendelve fuvar.</div>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Rendelésszám</th>
                  <th>Célállomás</th>
                  <th>Állapot</th>
                  <th>Dátum</th>
                  <th>Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <React.Fragment key={order.id}>
                    <tr>
                      <td>
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: '#0f172a', padding: 0, fontSize: '0.875rem' }}
                        >
                          {expandedOrder === order.id ? '▾' : '▸'} {order.order_number}
                        </button>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.875rem', color: '#334155' }}>
                          {order.address?.city}, {order.address?.country}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${statusInfo(order.status).badge}`}>
                          {statusInfo(order.status).label}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        {new Date(order.created_at).toLocaleDateString('hu-HU')}
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          onClick={() => openStatus(order.id, order.status)}
                          style={{ fontSize: '0.75rem' }}
                        >
                          ✏️ Állapot
                        </button>
                      </td>
                    </tr>
                    {expandedOrder === order.id && (
                      <tr>
                        <td colSpan={5} style={{ background: '#f8fafc', padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Szállítási cím</div>
                              <div style={{ fontSize: '0.875rem' }}>
                                {order.address?.postal_code} {order.address?.city}, {order.address?.street}<br />
                                {order.address?.country}
                              </div>
                              {order.comment && (
                                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                                  <strong>Megjegyzés:</strong> {order.comment}
                                </div>
                              )}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Szállítandó Áruk</div>
                              {order.items?.map(item => (
                                <div key={item.id} style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '0.25rem' }}>
                                  Termék #{item.product_id} — {item.quantity} db
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status update modal */}
      {statusModal && (
        <div className="modal-overlay" onClick={() => setStatusModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
               <h3 className="modal-title">✏️ Fuvar állapotának módosítása</h3>
              <button className="modal-close" onClick={() => setStatusModal(null)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Új állapot *</label>
              <select
                id="modal-status-select"
                className="form-select"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{statusInfo(s).label}</option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setStatusModal(null)}>Mégse</button>
              <button
                className="btn-primary"
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
              >
                {updatingStatus ? 'Mentés...' : 'Mentés'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CarrierOrdersPage;
