import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface Category { id: number; name: string; description?: string; }
interface Product  { id: number; name: string; sku: string; price: number; category_id: number; description?: string; is_active: boolean; }

const EMPTY_FORM = { name: '', sku: '', price: '', description: '', category_id: '' };

const ProductManagementPage: React.FC = () => {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [idSearch,   setIdSearch]   = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [editId,     setEditId]     = useState<number | null>(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([api.get('/product/products'), api.get('/product/categories')])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data); })
      .catch(() => toast.error('Betöltési hiba.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit   = (p: Product) => {
    setEditId(p.id);
    setForm({ name: p.name, sku: p.sku, price: String(p.price), description: p.description ?? '', category_id: String(p.category_id) });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.sku || !form.price || !form.category_id) {
      toast.error('Töltsd ki a kötelező mezőket!'); return;
    }
    setSaving(true);
    const payload = { name: form.name, sku: form.sku, price: parseFloat(form.price), description: form.description, category_id: parseInt(form.category_id) };
    try {
      if (editId !== null) {
        await api.put(`/product/products/${editId}`, payload);
        toast.success('Termék frissítve!');
      } else {
        await api.post('/product/products', payload);
        toast.success('Termék létrehozva!');
      }
      setShowModal(false);
      fetchAll();
    } catch { toast.error('Mentési hiba.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Törlöd a(z) "${name}" terméket?`)) return;
    try {
      await api.delete(`/product/products/${id}`);
      toast.success('Termék törölve.');
      fetchAll();
    } catch { toast.error('Törlési hiba.'); }
  };

  const getCatName = (id: number) => categories.find(c => c.id === id)?.name ?? '—';

  const filtered = products.filter(p => {
    const matchId   = idSearch   ? String(p.id) === idSearch.trim() : true;
    const matchName = nameSearch ? p.name.toLowerCase().includes(nameSearch.toLowerCase()) || p.sku.toLowerCase().includes(nameSearch.toLowerCase()) : true;
    return matchId && matchName;
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Termékmenedzsment</h1>
          <p className="page-subtitle">{products.length} termék a rendszerben</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Új termék</button>
      </div>

      <div className="admin-card">
        <div className="filter-bar">
          <div className="id-search-row">
            <input className="filter-input" type="number" placeholder="ID szerinti keresés" value={idSearch} onChange={e => setIdSearch(e.target.value)} />
            <button className="btn-secondary" onClick={() => setIdSearch('')}>✕</button>
          </div>
          <input className="filter-input" type="text" placeholder="Keresés névben, cikkszámban..." value={nameSearch} onChange={e => setNameSearch(e.target.value)} />
          <button className="btn-secondary" onClick={fetchAll}>🔄 Frissítés</button>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner-ring" />Betöltés...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📦</div><div className="empty-state-text">Nincs találat</div></div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>Név</th><th>Cikkszám</th><th>Ár</th><th>Kategória</th><th>Leírás</th><th>Státusz</th><th>Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>#{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: '0.8rem' }}>{p.sku}</code></td>
                    <td><strong style={{ color: '#ec4899' }}>{p.price.toLocaleString('hu-HU')} Ft</strong></td>
                    <td><span className="badge badge-blue">{getCatName(p.category_id)}</span></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#64748b', fontSize: '0.82rem' }}>{p.description || '—'}</td>
                    <td><span className={`badge ${p.is_active ? 'badge-green' : 'badge-red'}`}>{p.is_active ? '● Aktív' : '● Inaktív'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-ghost" onClick={() => openEdit(p)}>Szerkesztés</button>
                        <button className="btn-danger" onClick={() => handleDelete(p.id, p.name)}>Törlés</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Új/szerkesztés Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Termék szerkesztése' : 'Új termék hozzáadása'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Megnevezés *</label>
              <input className="form-input" type="text" placeholder="Pl. Csavar M8" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Cikkszám (SKU) *</label>
              <input className="form-input" type="text" placeholder="Pl. CSR-M8-100" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Ár (Ft) *</label>
              <input className="form-input" type="number" placeholder="Pl. 1500" min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Kategória *</label>
              <select className="form-select" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                <option value="">— Válassz kategóriát —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Leírás</label>
              <textarea className="form-textarea" placeholder="Opcionális leírás..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Mégse</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Mentés...' : 'Mentés'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductManagementPage;
