import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);

  const [address, setAddress] = useState({
    name:    user?.name || '',
    phone:   user?.phone || '',
    line1:   '',
    line2:   '',
    city:    '',
    state:   '',
    pincode: '',
  });

  const setField = (k, v) => setAddress(p => ({ ...p, [k]: v }));

  if (items.length === 0) {
    navigate('/products');
    return null;
  }

  const handlePay = async () => {
    if (!address.name || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
      return toast.error('Please fill all required address fields');
    }
    if (address.phone.length !== 10) return toast.error('Enter valid 10-digit phone number');
    if (address.pincode.length !== 6) return toast.error('Enter valid 6-digit pincode');

    setPaying(true);
    try {
      const cartItems = items.map(i => ({ product: i._id, qty: i.qty }));

      const res = await api.post('/payment/razorpay/create', {
        items: cartItems,
        shippingAddress: address,
      });

      const { orderId, amount, currency, keyId } = res.data;

      const options = {
        key:         keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency:    currency || 'INR',
        name:        'ShopVerse',
        description: `Order of ${items.length} item(s)`,
        order_id:    orderId,
        prefill:     { name: user.name, email: user.email || '', contact: address.phone },
        theme:       { color: '#FF4F0A' },
        handler: async (response) => {
          try {
            await api.post('/payment/razorpay/verify', {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            toast.success('🎉 Order placed successfully!');
            navigate('/buyer');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { toast.error('Payment failed. Please try again.'); setPaying(false); });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setPaying(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'var(--bg-3)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-md)', color: 'var(--text-1)',
    fontSize: '0.875rem', fontFamily: 'var(--font-body)', outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: 'var(--text-3)', textTransform: 'uppercase',
    letterSpacing: '0.06em', marginBottom: 6,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <div className="container" style={{ maxWidth: 1000, paddingTop: 32, paddingBottom: 48 }}>

        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 32 }}>
          Checkout
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>

          {/* Delivery Address */}
          <div>
            <div className="card" style={{ padding: 28, marginBottom: 24 }}>
              <h2 className="font-display" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                📍 Delivery Address
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input value={address.name} onChange={e => setField('name', e.target.value)}
                    placeholder="Recipient name" style={inputStyle}
                    onFocus={e => e.target.style.borderColor='var(--primary)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'} />
                </div>
                <div>
                  <label style={labelStyle}>Phone *</label>
                  <input value={address.phone} onChange={e => setField('phone', e.target.value.replace(/\D/g,''))}
                    placeholder="10-digit mobile" maxLength={10} style={inputStyle}
                    onFocus={e => e.target.style.borderColor='var(--primary)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Address Line 1 *</label>
                  <input value={address.line1} onChange={e => setField('line1', e.target.value)}
                    placeholder="House/Flat no., Building, Street" style={inputStyle}
                    onFocus={e => e.target.style.borderColor='var(--primary)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Address Line 2</label>
                  <input value={address.line2} onChange={e => setField('line2', e.target.value)}
                    placeholder="Landmark, Area (optional)" style={inputStyle}
                    onFocus={e => e.target.style.borderColor='var(--primary)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'} />
                </div>
                <div>
                  <label style={labelStyle}>City *</label>
                  <input value={address.city} onChange={e => setField('city', e.target.value)}
                    placeholder="City" style={inputStyle}
                    onFocus={e => e.target.style.borderColor='var(--primary)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'} />
                </div>
                <div>
                  <label style={labelStyle}>State *</label>
                  <select value={address.state} onChange={e => setField('state', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor='var(--primary)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'}>
                    <option value="">Select State</option>
                    {['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Pincode *</label>
                  <input value={address.pincode} onChange={e => setField('pincode', e.target.value.replace(/\D/g,''))}
                    placeholder="6-digit pincode" maxLength={6} style={inputStyle}
                    onFocus={e => e.target.style.borderColor='var(--primary)'}
                    onBlur={e => e.target.style.borderColor='var(--border)'} />
                </div>
              </div>
            </div>

            {/* Payment Method Info */}
            <div className="card" style={{ padding: 24 }}>
              <h2 className="font-display" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>
                💳 Payment Method
              </h2>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', border: '2px solid var(--primary)',
                borderRadius: 'var(--r-md)', background: 'rgba(255,79,10,0.05)',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#072654', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: '#0ea5e9' }}>R</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Razorpay</p>
                  <p style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>UPI · Cards · Net Banking · Wallets · EMI</p>
                </div>
                <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Selected</span>
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: '0.78rem', marginTop: 12 }}>
                🔒 Your payment info is encrypted and secure via Razorpay PCI-DSS compliant gateway.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card" style={{ padding: 24, position: 'sticky', top: 96 }}>
              <h2 className="font-display" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>
                🛒 Order Summary
              </h2>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, maxHeight: 280, overflowY: 'auto' }}>
                {items.map(item => (
                  <div key={item._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 8, background: 'var(--bg-3)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                      {item.images?.[0] ? <img src={item.images[0]} style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : '📦'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                      <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: 2 }}>Qty: {item.qty}</p>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary)', flexShrink: 0 }}>
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="divider" />

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-2)' }}>Subtotal ({items.reduce((s,i)=>s+i.qty,0)} items)</span>
                  <span style={{ fontWeight: 600 }}>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-2)' }}>Delivery Charges</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-2)' }}>Platform Fee</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>₹0</span>
                </div>
              </div>

              <div className="divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'baseline' }}>
                <span className="font-display" style={{ fontWeight: 800, fontSize: '1rem' }}>Total Amount</span>
                <span className="font-display" style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                onClick={handlePay}
                disabled={paying}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700 }}
              >
                {paying ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <span className="animate-spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                    Processing...
                  </span>
                ) : `⚡ Pay ₹${total.toLocaleString('en-IN')}`}
              </button>

              <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.75rem', marginTop: 12 }}>
                🔒 Secured by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}