import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../Home.css';

const CheckoutPage: React.FC = () => {
  const { cart, totalPrice, clearCart, removeFromCart, updateQuantity } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'cart' | 'details'>('cart');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    billingCountry: 'Magyarország',
    billingCity: '',
    billingPostalCode: '',
    billingStreet: '',
    shippingCountry: 'Magyarország',
    shippingCity: '',
    shippingPostalCode: '',
    shippingStreet: '',
    sameAsBilling: true,
    paymentMethod: 'transfer',
    comment: ''
  });

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Jelentkezz be a rendelés leadásához!');
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [isLoggedIn]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const meRes = await axios.get('/api/auth/me', { headers });
      const userId = meRes.data.id;
      
      let userData: any = {};
      try {
        const usersRes = await axios.get('/api/user/get', { headers });
        userData = usersRes.data.find((u: any) => u.id === userId) || {};
      } catch (e) {}

      let address: any = {};
      try {
        const addrRes = await axios.get('/api/address/get', { headers });
        if (addrRes.data.length > 0) address = addrRes.data[0];
      } catch (e) {}

      setFormData(prev => ({
        ...prev,
        name: userData.full_name || meRes.data.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        billingCountry: address.country || 'Magyarország',
        billingCity: address.city || '',
        billingPostalCode: address.postal_code || '',
        billingStreet: address.street || '',
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Create or get Billing Address
      const billingAddrRes = await axios.post('/api/address/add', {
        country: formData.billingCountry,
        city: formData.billingCity,
        postal_code: formData.billingPostalCode,
        street: formData.billingStreet
      }, { headers });
      const billingAddressId = billingAddrRes.data.id;

      // 2. Create or get Shipping Address (if different)
      let shippingAddressId = billingAddressId;
      if (!formData.sameAsBilling) {
        const shippingAddrRes = await axios.post('/api/address/add', {
          country: formData.shippingCountry,
          city: formData.shippingCity,
          postal_code: formData.shippingPostalCode,
          street: formData.shippingStreet
        }, { headers });
        shippingAddressId = shippingAddrRes.data.id;
      }

      // 3. Create Order
      const orderData = {
        address_id: shippingAddressId,
        billing_address_id: billingAddressId,
        billing_name: formData.name,
        billing_email: formData.email,
        billing_phone: formData.phone,
        payment_method: formData.paymentMethod,
        comment: formData.comment,
        items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity }))
      };

      await axios.post('/api/orders/create', orderData, { headers });

      toast.success('Rendelés sikeresen leadva!');
      clearCart();
      navigate('/profile');
    } catch (error: any) {
      console.error('Order creation error:', error);
      const errorDetail = error.response?.data?.detail || error.response?.data?.message || JSON.stringify(error.response?.data);
      toast.error(`Hiba történt: ${errorDetail}`);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="main-content" style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>A kosarad üres.</h2>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            marginTop: '20px', 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--text-muted)', 
            cursor: 'pointer', 
            fontSize: '1rem',
            padding: '5px 0',
            textDecoration: 'underline'
          }}
        >
          Vissza a vásárláshoz
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="checkout-page-container">
        {/* Checkout Header / Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '3rem', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 2 }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', background: step === 'cart' ? 'var(--accent)' : '#4CAF50', 
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700',
              border: '4px solid var(--bg-main)', boxShadow: '0 0 0 2px ' + (step === 'cart' ? 'var(--accent)' : '#4CAF50')
            }}>
              {step === 'cart' ? '1' : '✓'}
            </div>
            <span style={{ fontWeight: '600', color: step === 'cart' ? 'var(--text-main)' : 'var(--text-muted)' }}>Kosár tartalma</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 2 }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', background: step === 'details' ? 'var(--accent)' : '#e2e8f0', 
              color: step === 'details' ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700',
              border: '4px solid var(--bg-main)', boxShadow: '0 0 0 2px ' + (step === 'details' ? 'var(--accent)' : '#e2e8f0')
            }}>
              2
            </div>
            <span style={{ fontWeight: '600', color: step === 'details' ? 'var(--text-main)' : 'var(--text-muted)' }}>Adatok megadása</span>
          </div>
          {/* Progress Line */}
          <div style={{ 
            position: 'absolute', top: '20px', left: 'calc(50% - 70px)', width: '140px', height: '2px', 
            background: step === 'details' ? '#4CAF50' : '#e2e8f0', zIndex: 1 
          }}></div>
        </div>

        {step === 'cart' ? (
          <div className="cart-step">
            <h2 style={{ marginBottom: '1.5rem' }}>Kosár ellenőrzése</h2>
            <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
              <div className="cart-items-list" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                {cart.map(item => (
                  <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h3>
                        <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '1.1rem' }}>{item.price.toLocaleString('hu-HU')} Ft</span>
                      </div>
                    </div>
                    <div className="cart-item-actions" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                      <div className="quantity-selector">
                        <button 
                          className="qty-btn"
                          type="button"
                          onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <div className="qty-value">
                          {item.quantity} <span className="qty-unit">db</span>
                        </div>
                        <button 
                          className="qty-btn"
                          type="button"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '1.1rem', minWidth: '120px', textAlign: 'right', color: 'var(--text-main)' }}>
                        {(item.price * item.quantity).toLocaleString('hu-HU')} Ft
                      </div>
                      <button 
                        className="remove-item-btn"
                        type="button"
                        onClick={() => removeFromCart(item.product_id)}
                        title="Eltávolítás a kosárból"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary-side">
                <div style={{ background: 'var(--bg-nav)', color: 'white', padding: '2rem', borderRadius: '12px', position: 'sticky', top: '100px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Összegzés</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: '700', marginBottom: '2rem' }}>
                    <span>Fizetendő:</span>
                    <span>{totalPrice.toLocaleString('hu-HU')} Ft</span>
                  </div>
                  <button 
                    className="add-to-cart-btn" 
                    type="button"
                    style={{ background: 'white', color: 'var(--bg-nav)', fontSize: '1.1rem', padding: '1rem' }}
                    onClick={() => setStep('details')}
                  >
                    Tovább az adatokhoz &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleOrderSubmit} className="checkout-form-container">
            <div style={{ marginBottom: '1.5rem' }}>
              <button 
                type="button" 
                onClick={() => setStep('cart')} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  cursor: 'pointer', 
                  fontWeight: '500', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: 0,
                  fontSize: '0.9rem'
                }}
              >
                &larr; Vissza a kosárhoz
              </button>
            </div>
            
            <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
              <div className="checkout-left-column">
                {/* Customer Info */}
                <div className="checkout-section-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Személyes adatok</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="input-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Teljes név</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required className="checkout-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email cím</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="checkout-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                      </div>
                      <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Telefonszám</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="checkout-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="checkout-section-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Számlázási cím</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="input-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Ország</label>
                      <input type="text" name="billingCountry" value={formData.billingCountry} onChange={handleChange} required className="checkout-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                      <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Irányítószám</label>
                        <input type="text" name="billingPostalCode" value={formData.billingPostalCode} onChange={handleChange} required className="checkout-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                      </div>
                      <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Város</label>
                        <input type="text" name="billingCity" value={formData.billingCity} onChange={handleChange} required className="checkout-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                      </div>
                    </div>
                    <div className="input-group">
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Utca, házszám</label>
                      <input type="text" name="billingStreet" value={formData.billingStreet} onChange={handleChange} required className="checkout-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    </div>
                  </div>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', cursor: 'pointer', fontWeight: '500' }}>
                    <input type="checkbox" name="sameAsBilling" checked={formData.sameAsBilling} onChange={handleChange} />
                    A szállítási cím megegyezik a számlázási címmel
                  </label>
                </div>

                {!formData.sameAsBilling && (
                  <div className="checkout-section-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Szállítási cím</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Ország</label>
                        <input type="text" name="shippingCountry" value={formData.shippingCountry} onChange={handleChange} required className="checkout-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                        <div className="input-group">
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Irányítószám</label>
                          <input type="text" name="shippingPostalCode" value={formData.shippingPostalCode} onChange={handleChange} required className="checkout-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                        </div>
                        <div className="input-group">
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Város</label>
                          <input type="text" name="shippingCity" value={formData.shippingCity} onChange={handleChange} required className="checkout-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                        </div>
                      </div>
                      <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Utca, házszám</label>
                        <input type="text" name="shippingStreet" value={formData.shippingStreet} onChange={handleChange} required className="checkout-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="checkout-section-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Fizetési mód</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                      <input type="radio" name="paymentMethod" value="transfer" checked={formData.paymentMethod === 'transfer'} onChange={handleChange} />
                      <div>
                        <div style={{ fontWeight: '600' }}>Utólagos átutalás</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fizetés a megrendelés feldolgozása után, banki átutalással.</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="checkout-right-column">
                <div className="order-summary-card" style={{ background: 'var(--bg-nav)', color: 'white', padding: '2rem', borderRadius: '12px', position: 'sticky', top: '100px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Rendelés összegzése</h3>
                  <div className="summary-items" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {cart.map(item => (
                      <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{item.quantity} db</span>
                          <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
                        </div>
                        <span style={{ fontWeight: '600' }}>{(item.price * item.quantity).toLocaleString('hu-HU')} Ft</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700' }}>
                      <span>Összesen:</span>
                      <span>{totalPrice.toLocaleString('hu-HU')} Ft</span>
                    </div>
                  </div>
                  <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Megjegyzés (opcionális)</label>
                    <textarea name="comment" value={formData.comment} onChange={handleChange} rows={3} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', padding: '0.5rem' }} />
                  </div>
                  <button type="submit" className="add-to-cart-btn" style={{ background: 'white', color: 'var(--bg-nav)', fontSize: '1.1rem', padding: '1rem' }} disabled={loading}>
                    {loading ? 'Rendelés feldolgozása...' : 'Rendelés véglegesítése'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
