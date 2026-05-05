import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Profile.css';

interface Address {
  id: number;
  country: string;
  city: string;
  postal_code: string;
  street: string;
}

interface Order {
  id: number;
  order_number: string;
  created_at: string;
  status: string;
  total_amount?: number;
}

interface UserDataApi {
  id: number;
  username: string;
  full_name?: string;
  email: string;
  phone?: string;
}

const ProfilePage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userData, setUserData] = useState({
    id: 0,
    name: '',
    email: '',
    phone: '',
    addressId: 0,
    addressStr: '',
    country: '',
    city: '',
    postal_code: '',
    street: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: '',
    phone: '',
    country: '',
    city: '',
    postal_code: '',
    street: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Get current user ID
      const meRes = await axios.get('/api/auth/me', { headers });
      const userId = meRes.data.id;

      // 2. Get user details
      let meUser: UserDataApi | null = null;
      try {
        const usersRes = await axios.get('/api/user/get', { headers });
        meUser = usersRes.data.find((u: UserDataApi) => u.id === userId) ?? null;
      } catch {
        console.warn('Nem sikerült a felhasználói adatokat lekérni (esetleg nincs Admin jogosultságod).');
      }

      // 3. Get user addresses
      let addressList: Address[] = [];
      try {
        const addrRes = await axios.get('/api/address/get', { headers });
        addressList = addrRes.data;
      } catch {
        console.warn('Nem sikerült a címeket lekérni.');
      }
      setAddresses(addressList);
      const firstAddress = addressList.length > 0 ? addressList[0] : null;

      // 4. Get user orders
      try {
        const ordersRes = await axios.get('/api/orders/get-orders', { headers });
        setOrders(ordersRes.data);
      } catch {
        console.warn('Nem sikerült a rendeléseket lekérni.');
      }

      const profileData = {
        id: userId as number,
        name: meUser ? (meUser.full_name || meUser.username) : String(meRes.data.username),
        email: meUser ? meUser.email : 'Ismeretlen (Nincs jogosultság)',
        phone: meUser ? (meUser.phone || '') : '',
        addressId: firstAddress ? firstAddress.id : 0,
        addressStr: firstAddress ? `${firstAddress.postal_code} ${firstAddress.city}, ${firstAddress.street}` : 'Nincs megadva',
        country: firstAddress ? firstAddress.country : 'Magyarország',
        city: firstAddress ? firstAddress.city : '',
        postal_code: firstAddress ? firstAddress.postal_code : '',
        street: firstAddress ? firstAddress.street : ''
      };

      setUserData(profileData);
      setEditForm({
        email: profileData.email,
        phone: profileData.phone,
        country: profileData.country,
        city: profileData.city,
        postal_code: profileData.postal_code,
        street: profileData.street
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Hiba történt a profil adatok betöltésekor. Kérjük, próbáld újra.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Update User Profile (email, phone)
      if (editForm.email !== 'Ismeretlen (Nincs jogosultság)') {
        await axios.put('/api/user/me/profile', {
          email: editForm.email,
          phone: editForm.phone
        }, { headers });
      }

      // Update Address
      if (userData.addressId > 0) {
        await axios.put(`/api/address/${userData.addressId}`, {
          country: editForm.country,
          city: editForm.city,
          postal_code: editForm.postal_code,
          street: editForm.street
        }, { headers });
      } else if (editForm.city || editForm.street) {
        // Create new address
        await axios.post('/api/address/add', {
          country: editForm.country || 'Magyarország',
          city: editForm.city,
          postal_code: editForm.postal_code,
          street: editForm.street
        }, { headers });
      }

      setSuccessMsg('Adatok sikeresen elmentve!');
      setIsEditing(false);
      await fetchProfile(); // Refresh
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as Record<string, string>;
        setError(data.message || 'Hiba történt a mentés során.');
      } else {
        setError('Hiba történt a mentés során.');
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading && !userData.id) return <div className="profile-container"><div style={{ padding: '40px', textAlign: 'center' }}>Betöltés...</div></div>;

  return (
    <div className="container">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Saját Profil</h1>
          <p>Kezeld személyes adataidat és rendeléseidet</p>
        </div>

        {error && <div className="error-message" style={{ margin: '20px', color: '#ff6b6b' }}>{error}</div>}
        {successMsg && <div className="success-message" style={{ margin: '20px', color: '#4CAF50', backgroundColor: 'rgba(76, 175, 80, 0.1)', padding: '10px', borderRadius: '4px' }}>{successMsg}</div>}

        <div className="profile-content">
          <div className="profile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' }}>
              <h2 style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>Személyes Adatok</h2>
              {!isEditing && (
                <button
                  className="edit-btn"
                  style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.9rem', backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6' }}
                  onClick={() => { setIsEditing(true); setSuccessMsg(''); }}
                >
                  Szerkesztés
                </button>
              )}
            </div>

            <div className="profile-details">
              <div className="detail-group">
                <label>Név</label>
                <div className="detail-value">{userData.name}</div>
              </div>

              <div className="detail-group">
                <label>E-mail cím</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="profile-input"
                    disabled={editForm.email === 'Ismeretlen (Nincs jogosultság)'}
                  />
                ) : (
                  <div className="detail-value">{userData.email}</div>
                )}
              </div>

              <div className="detail-group">
                <label>Telefonszám</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="profile-input"
                    placeholder="+36 30 123 4567"
                  />
                ) : (
                  <div className="detail-value">{userData.phone || 'Nincs megadva'}</div>
                )}
              </div>

              {!isEditing ? (
                <div className="detail-group">
                  <label>Szállítási cím</label>
                  <div className="detail-value">{userData.addressStr}</div>
                </div>
              ) : (
                <>
                  {addresses.length > 0 && (
                    <div className="detail-group" style={{ marginBottom: '10px' }}>
                      <label>Szerkesztendő cím kiválasztása ▾</label>
                      <select
                        className="profile-input"
                        style={{ cursor: 'pointer', appearance: 'auto', paddingRight: '1rem' }}
                        value={userData.addressId}
                        onChange={(e) => {
                          const selectedId = parseInt(e.target.value);
                          const addr = addresses.find(a => a.id === selectedId);
                          if (addr) {
                            setUserData({ ...userData, addressId: addr.id });
                            setEditForm({
                              ...editForm,
                              country: addr.country,
                              city: addr.city,
                              postal_code: addr.postal_code,
                              street: addr.street
                            });
                          } else if (selectedId === 0) {
                            setUserData({ ...userData, addressId: 0 });
                            setEditForm({
                              ...editForm,
                              country: 'Magyarország',
                              city: '',
                              postal_code: '',
                              street: ''
                            });
                          }
                        }}
                      >
                        {addresses.map(a => (
                          <option key={a.id} value={a.id}>{a.postal_code} {a.city}, {a.street}</option>
                        ))}
                        <option value={0}>+ Új cím hozzáadása</option>
                      </select>
                    </div>
                  )}

                  <div className="detail-group">
                    <label>Irányítószám</label>
                    <input
                      type="text"
                      value={editForm.postal_code}
                      onChange={e => setEditForm({ ...editForm, postal_code: e.target.value })}
                      className="profile-input"
                    />
                  </div>
                  <div className="detail-group">
                    <label>Város</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                      className="profile-input"
                    />
                  </div>
                  <div className="detail-group">
                    <label>Utca, házszám</label>
                    <input
                      type="text"
                      value={editForm.street}
                      onChange={e => setEditForm({ ...editForm, street: e.target.value })}
                      className="profile-input"
                    />
                  </div>
                  <div className="detail-group">
                    <label>Ország</label>
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={e => setEditForm({ ...editForm, country: e.target.value })}
                      className="profile-input"
                    />
                  </div>
                </>
              )}
            </div>

            {isEditing && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  className="edit-btn"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)', width: 'auto', padding: '0.6rem 1.5rem' }}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Mentés...' : 'Mentés'}
                </button>
                <button
                  className="edit-btn"
                  style={{ backgroundColor: '#555', width: 'auto', padding: '0.6rem 1.5rem' }}
                  onClick={() => { setIsEditing(false); setSuccessMsg(''); setError(''); }}
                >
                  Mégse
                </button>
              </div>
            )}
          </div>

          <div className="profile-card">
            <h2>Rendeléseim</h2>
            <div className="orders-list">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="order-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid var(--border)' }}>
                    <div className="order-info" style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="order-id" style={{ fontWeight: 'bold' }}>#{order.order_number}</span>
                      <span className="order-date" style={{ color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString('hu-HU')}</span>
                    </div>
                    <div className={`order-status ${order.status}`} style={{ alignSelf: 'center', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9em', background: 'var(--bg-card-hover)' }}>
                      {order.status}
                    </div>
                    <div className="order-total" style={{ alignSelf: 'center', fontWeight: 'bold' }}>
                      {order.total_amount ? `${order.total_amount.toLocaleString('hu-HU')} Ft` : 'N/A'}
                    </div>
                  </div>
                ))
              ) : (
                <p>Még nem adtál le rendelést.</p>
              )}
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="logout-btn" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Kijelentkezés
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
