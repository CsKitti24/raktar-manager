import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface Category { id: number; name: string; description?: string; }

const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [idSearch,   setIdSearch]   = useState('');
  const [showModal,  setShowModal]  = useState(false);
  const [form,       setForm]       = useState({ name: '', description: '' });
  const [saving,     setSaving]     = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    api.get('/product/categories')
      .then(r => setCategories(r.data))
      .catch(() => toast.error('Nem sikerült betölteni a kategóriákat.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('A kategória neve kötelező!'); return; }
    setSaving(true);
    try {
      await api.post('/product/categories', { name: form.name, description: form.description });
      toast.success('Kategória létrehozva!');
      setShowModal(false);
      setForm({ name: '', description: '' });
      fetchCategories();
    } catch { toast.error('Létrehozási hiba.'); }
    finally { setSaving(false); }
  };

  const filtered = idSearch
    ? categories.filter(c => String(c.id) === idSearch.trim())
    : categories;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kategóriamenedzsment</h1>
          <p className="page-subtitle">{categories.length} kategória a rendszerben</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm({ name: '', description: '' }); setShowModal(true); }}>
          + Új kategória
        </button>
      </div>

      <div className="admin-card">
        <div className="filter-bar">
          <div className="id-search-row">
            <input className="filter-input" type="number" placeholder="Keresés ID alapján" value={idSearch} onChange={e => setIdSearch(e.target.value)} />
            <button className="btn-secondary" onClick={() => setIdSearch('')}>✕ Törlés</button>
          </div>
          <button className="btn-secondary" onClick={fetchCategories}>🔄 Frissítés</button>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner-ring" />Betöltés...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🏷️</div><div className="empty-state-text">Nincs találat</div></div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Kategória neve</th><th>Leírás</th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>#{c.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1rem' }}>🏷️</span>
                        <strong style={{ color: '#0f172a' }}>{c.name}</strong>
                      </div>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{c.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Új kategória Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3 className="modal-title">Új kategória létrehozása</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Kategória neve *</label>
              <input className="form-input" type="text" placeholder="Pl. Elektronika" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Leírás (opcionális)</label>
              <textarea className="form-textarea" placeholder="Kategória rövid leírása..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Mégse</button>
              <button className="btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Létrehozás...' : 'Létrehozás'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryManagementPage;
