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

interface Carrier {
  id: number;
  username: string;
  full_name: string;
}

const STATUS_LABELS: Record<string, { label: string; badge: string }> = {
  pending:    { label: 'Függőben',     badge: 'badge-yellow' },
  processing: { label: 'Feldolgozás',  badge: 'badge-blue'   },
  shipped:    { label: 'Szállítás',    badge: 'badge-pink'   },
  delivered:  { label: 'Teljesítve',   badge: 'badge-green'  },
  cancelled:  { label: 'Törölve',      badge: 'badge-red'    },
};

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const WarehouseOrdersPage: React.FC = () => {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Carrier assign modal state
  const [assignModal, setAssignModal] = useState<{ orderId: number; current: number | null } | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Status change modal
  const [statusModal, setStatusModal] = useState<{ orderId: number; current: string } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Detail expand
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/orders/get-orders'),
      api.get('/user/carriers'),
    ])
      .then(([o, c]) => {
        setOrders(o.data);
        setCarriers(c.data);
      })
      .catch(() => toast.error('Adatok betöltése sikertelen!'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = orders.filter(o => {
    const matchSearch = search === '' ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search);
    const matchStatus = statusFilter === '' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAssign = (orderId: number, current: number | null) => {
    setAssignModal({ orderId, current });
    setSelectedCarrier(current ? String(current) : '');
  };

  const handleAssignCarrier = async () => {
    if (!assignModal || !selectedCarrier) return;
    setAssigning(true);
    try {
      await api.put(`/orders/${assignModal.orderId}/assign-carrier`, { user_id: parseInt(selectedCarrier) });
      toast.success('Fuvarozó sikeresen hozzárendelve!');
      setAssignModal(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Hiba a fuvarozó hozzárendelésénél!');
    } finally {
      setAssigning(false);
    }
  };

  const openStatus = (orderId: number, current: string) => {
    setStatusModal({ orderId, current });
    setSelectedStatus(current);
  };

  const handleUpdateStatus = async () => {
    if (!statusModal) return;
    setUpdatingStatus(true);
    try {
      await api.put(`/orders/${statusModal.orderId}/status`, { status: selectedStatus });
      toast.success('Rendelés állapota frissítve!');
      setStatusModal(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Hiba az állapot módosításánál!');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const carrierName = (id: number | null) => {
    if (!id) return null;
    const c = carriers.find(c => c.id === id);
    return c ? (c.full_name || c.username) : `#${id}`;
  };

  const statusInfo = (s: string) => STATUS_LABELS[s] ?? { label: s, badge: 'badge-gray' };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Rendelések</h1>
          <p className="page-subtitle">Rendelések áttekintése, állapot- és fuvarozókezelés</p>
        </div>
      </div>

      <div className="admin-card">
        {/* Filter bar */}
        <div className="filter-bar">
          <input
            id="orders-search"
            type="text"
            className="filter-input"
            placeholder="Keresés rendelésszám vagy ID alapján..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
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
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">Nem található rendelés.</div>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Rendelésszám</th>
                  <th>Állapot</th>
                  <th>Összeg</th>
                  <th>Fuvarozó</th>
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
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                          {order.address?.city}, {order.address?.country}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${statusInfo(order.status).badge}`}>
                          {statusInfo(order.status).label}
                        </span>
                      </td>
                      <td><strong>{order.total_amount?.toLocaleString('hu-HU')} Ft</strong></td>
                      <td>
                        {order.carrier_id
                          ? <span className="badge badge-blue">{carrierName(order.carrier_id)}</span>
                          : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Nincs hozzárendelve</span>
                        }
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        {new Date(order.created_at).toLocaleDateString('hu-HU')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            id={`assign-carrier-${order.id}`}
                            className="btn-ghost"
                            onClick={() => openAssign(order.id, order.carrier_id)}
                            style={{ fontSize: '0.75rem' }}
                          >
                            🚛 Fuvarozó
                          </button>
                          <button
                            id={`update-status-${order.id}`}
                            className="btn-secondary"
                            onClick={() => openStatus(order.id, order.status)}
                            style={{ fontSize: '0.75rem' }}
                          >
                            ✏️ Állapot
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedOrder === order.id && (
                      <tr>
                        <td colSpan={6} style={{ background: '#f8fafc', padding: '1rem 1.5rem' }}>
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
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Tételek</div>
                              {order.items?.map(item => (
                                <div key={item.id} style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '0.25rem' }}>
                                  Termék #{item.product_id} — {item.quantity} db × {item.unit_price?.toLocaleString('hu-HU')} Ft
                                  = <strong>{item.subtotal?.toLocaleString('hu-HU')} Ft</strong>
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

      {/* Carrier assign modal */}
      {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🚛 Fuvarozó hozzárendelése</h3>
              <button className="modal-close" onClick={() => setAssignModal(null)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Fuvarozó *</label>
              <select
                id="modal-carrier-select"
                className="form-select"
                value={selectedCarrier}
                onChange={e => setSelectedCarrier(e.target.value)}
              >
                <option value="">— Válassz fuvarozót —</option>
                {carriers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || c.username}
                  </option>
                ))}
              </select>
              {carriers.length === 0 && (
                <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                  Nincs elérhető Carrier role-ú felhasználó a rendszerben.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setAssignModal(null)}>Mégse</button>
              <button
                id="modal-carrier-confirm"
                className="btn-primary"
                onClick={handleAssignCarrier}
                disabled={assigning || !selectedCarrier}
              >
                {assigning ? 'Mentés...' : 'Hozzárendelés'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status update modal */}
      {statusModal && (
        <div className="modal-overlay" onClick={() => setStatusModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Állapot módosítása</h3>
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
                id="modal-status-confirm"
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

export default WarehouseOrdersPage;
