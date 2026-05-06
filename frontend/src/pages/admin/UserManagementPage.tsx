import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface Role { id: number; rolename: string; }
interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  is_active: boolean;
  roles: Role[];
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    api.get('/user/get')
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Nem sikerült betölteni a felhasználókat.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDeactivate = async (id: number, username: string) => {
    if (!window.confirm(`Biztosan deaktiválod a(z) "${username}" felhasználót?`)) return;
    try {
      await api.delete(`/user/${id}`);
      toast.success('Felhasználó deaktiválva.');
      fetchUsers();
    } catch {
      toast.error('Nem sikerült a deaktiválás.');
    }
  };

  const filtered = users.filter(u =>
    `${u.username} ${u.full_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Felhasználókezelés</h1>
          <p className="page-subtitle">{users.length} felhasználó a rendszerben</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="filter-bar">
          <input
            className="filter-input"
            type="text"
            placeholder="Keresés név, email alapján..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn-secondary" onClick={fetchUsers}>
            🔄 Frissítés
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner-ring" />Betöltés...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-text">Nincs találat</div>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Felhasználónév</th>
                  <th>Teljes név</th>
                  <th>E-mail</th>
                  <th>Telefonszám</th>
                  <th>Szerepkör(ök)</th>
                  <th>Státusz</th>
                  <th>Műveletek</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>#{u.id}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{u.username}</td>
                    <td>{u.full_name || '—'}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {u.roles.length > 0
                          ? u.roles.map(r => (
                              <span key={r.id} className="badge badge-pink">{r.rolename}</span>
                            ))
                          : <span className="badge badge-gray">—</span>
                        }
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                        {u.is_active ? '● Aktív' : '● Inaktív'}
                      </span>
                    </td>
                    <td>
                      {u.is_active && (
                        <button
                          className="btn-danger"
                          onClick={() => handleDeactivate(u.id, u.username)}
                        >
                          Deaktiválás
                        </button>
                      )}
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

export default UserManagementPage;
