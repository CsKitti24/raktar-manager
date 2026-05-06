import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  supplied_quantity: number | null;
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
  estimated_delivery_at: string | null;
  supplier_notes: string | null;
  address: Address;
  items: OrderItem[];
}

const STATUS_LABELS: Record<string, { label: string; badge: string }> = {
  'megrendelve': { label: 'Megrendelve', badge: 'badge-blue' },
  'kifizetve': { label: 'Kifizetve', badge: 'badge-green' },
  'szállítás alatt': { label: 'Szállítás alatt', badge: 'badge-yellow' },
  'teljesítve': { label: 'Teljesítve', badge: 'badge-green' },
  'törölve': { label: 'Törölve', badge: 'badge-red' },
};

const SupplierOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Status/Form update modal
  const [formModal, setFormModal] = useState<Order | null>(null);
  const [estimatedDate, setEstimatedDate] = useState('');
  const [supplierNotes, setSupplierNotes] = useState('');
  const [itemQuantities, setItemQuantities] = useState<Record<number, number>>({});
  const [updating, setUpdating] = useState(false);

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

  const openForm = (order: Order) => {
    setFormModal(order);
    
    // Default estimated date to order's existing one or empty
    if (order.estimated_delivery_at) {
      // Formats API datetime to input datetime-local format
      setEstimatedDate(new Date(order.estimated_delivery_at).toISOString().slice(0, 16));
    } else {
      setEstimatedDate('');
    }
    
    setSupplierNotes(order.supplier_notes || '');
    
    // Initialize item quantities with previously supplied or originally requested quantities
    const quantities: Record<number, number> = {};
    order.items.forEach(item => {
      quantities[item.id] = item.supplied_quantity ?? item.quantity;
    });
    setItemQuantities(quantities);
  };

  const handleUpdateItemQuantity = (itemId: number, value: number) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleSubmitForm = async () => {
    if (!formModal) return;
    if (!estimatedDate) {
      toast.error('Kérjük, adja meg a várható szállítási időpontot!');
      return;
    }

    setUpdating(true);
    
    const itemsPayload = Object.entries(itemQuantities).map(([id, qty]) => ({
      id: parseInt(id),
      supplied_quantity: qty
    }));

    const payload = {
      estimated_delivery_at: new Date(estimatedDate).toISOString(),
      supplier_notes: supplierNotes,
      items: itemsPayload
    };

    try {
      await api.put(`/orders/${formModal.id}/supplier-form`, payload);
      toast.success('Áruszállítási űrlap sikeresen mentve!');
      setFormModal(null);
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Hiba az űrlap mentésénél!');
    } finally {
      setUpdating(false);
    }
  };

  const statusInfo = (s: string) => STATUS_LABELS[s] ?? { label: s, badge: 'badge-gray' };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Beszállítói feladatok</h1>
          <p className="page-subtitle">Hozzám rendelt megrendelések és áruszállítási űrlapok kezelése</p>
        </div>
      </div>

      <div className="admin-card">
        {/* Filter bar */}
        <div className="filter-bar">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Minden állapot</option>
            {Object.keys(STATUS_LABELS).map(s => (
              <option key={s} value={s}>{statusInfo(s).label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner-ring" /> Betöltés...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-text">Jelenleg nincs hozzád rendelve beszállítási feladat.</div>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Rendelésszám</th>
                  <th>Célállomás</th>
                  <th>Állapot</th>
                  <th>Várható szállítás</th>
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
                        {order.estimated_delivery_at 
                          ? new Date(order.estimated_delivery_at).toLocaleString('hu-HU', { dateStyle: 'short', timeStyle: 'short' }) 
                          : '-'}
                      </td>
                      <td>
                        <button
                          className="btn-primary"
                          onClick={() => openForm(order)}
                          style={{ fontSize: '0.75rem' }}
                        >
                          📋 Űrlap
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
                                  <strong>Megrendelői megjegyzés:</strong> {order.comment}
                                </div>
                              )}
                              {order.supplier_notes && (
                                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
                                  <strong>Beszállítói megjegyzés:</strong> {order.supplier_notes}
                                </div>
                              )}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Szállítandó Áruk</div>
                              {order.items?.map(item => (
                                <div key={item.id} style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>Termék #{item.product_id}</span>
                                  <span>
                                    {item.supplied_quantity !== null ? (
                                      <strong style={{ color: item.supplied_quantity === item.quantity ? 'inherit' : '#eab308' }}>
                                        {item.supplied_quantity} / {item.quantity} db
                                      </strong>
                                    ) : (
                                      <span>Rendelve: {item.quantity} db</span>
                                    )}
                                  </span>
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

      {/* Shipping Form Modal */}
      {formModal && (
        <div className="modal-overlay" onClick={() => setFormModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
               <h3 className="modal-title">📋 Áruszállítási űrlap</h3>
              <button className="modal-close" onClick={() => setFormModal(null)}>×</button>
            </div>
            
            <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#475569' }}>
              Rendelésszám: <strong>{formModal.order_number}</strong>
            </div>

            <div className="form-group">
              <label className="form-label">Várható szállítási időpont *</label>
              <input
                type="datetime-local"
                className="form-control"
                value={estimatedDate}
                onChange={e => setEstimatedDate(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Beszállítói megjegyzés</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Ide írhatsz bármilyen extra információt a szállítással kapcsolatban..."
                value={supplierNotes}
                onChange={e => setSupplierNotes(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Szállítandó tételek (ellenőrzés)</label>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {formModal.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#334155' }}>
                      Termék #{item.product_id} (Rendelve: {item.quantity} db)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tényleges:</span>
                      <input 
                        type="number"
                        min="0"
                        className="form-control"
                        style={{ width: '80px', padding: '0.25rem 0.5rem' }}
                        value={itemQuantities[item.id] ?? ''}
                        onChange={e => handleUpdateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => setFormModal(null)}>Mégse</button>
              <button
                className="btn-primary"
                onClick={handleSubmitForm}
                disabled={updating}
              >
                {updating ? 'Mentés folyamatban...' : 'Mentés és állapot frissítése'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupplierOrdersPage;
