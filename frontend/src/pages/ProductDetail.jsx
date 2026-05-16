import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product || res.data);
      } catch {
        setProduct({
          _id: id, name: 'Wireless Noise Cancelling Headphones Pro',
          price: 2999, originalPrice: 4999,
          description: 'Experience premium sound quality with our flagship wireless headphones. Features 30-hour battery life, active noise cancellation, and ultra-comfortable ear cushions perfect for long listening sessions.',
          category: 'electronics', brand: 'SoundMax', stock: 15,
          rating: 4.5, numReviews: 1204, images: [],
          seller: { name: 'TechStore India', _id: 'S1' },
          features: ['30-hour battery life', 'Active Noise Cancellation', 'Bluetooth 5.0', 'Foldable design', 'Built-in microphone'],
        });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleRazorpay = async () => {
    if (!user) return toast.error('Please login to purchase');
    setPaying(true);
    try {
      // Create Razorpay order
      const res = await api.post('/payment/razorpay/create', {
        amount: product.price * qty,
        productId: product._id,
        quantity: qty,
      });
      const { orderId, amount, currency, keyId } = res.data;

      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency: currency || 'INR',
        name: 'ShopVerse',
        description: product.name,
        order_id: orderId,
        prefill: { name: user.name, email: user.email, contact: user.phone || '' },
        theme: { color: '#FF4F0A' },
        handler: async (response) => {
          try {
            await api.post('/payment/razorpay/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              productId: product._id,
              quantity: qty,
            });
            toast.success('🎉 Order placed successfully!');
            navigate('/buyer');
          } catch {
            toast.error('Payment verification failed');
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed');
      setPaying(false);
    }
  };

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:80 }}>
      <div className="animate-spin" style={{ width:40, height:40, border:'3px solid var(--border)', borderTopColor:'var(--primary)', borderRadius:'50%' }} />
    </div>
  );

  if (!product) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:80 }}>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontSize:'4rem' }}>😕</p>
        <h2 className="font-display" style={{ fontWeight:700, marginBottom:8 }}>Product not found</h2>
        <button onClick={() => navigate('/products')} className="btn btn-primary">Browse Products</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:80 }}>
      <div className="container" style={{ paddingTop:32, paddingBottom:48 }}>
        <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:'0.875rem', marginBottom:24, display:'flex', alignItems:'center', gap:6 }}>
          ← Back
        </button>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48 }}>
          {/* Images */}
          <div>
            <div style={{ borderRadius:'var(--r-xl)', overflow:'hidden', background:'var(--bg-3)', height:420, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, border:'1px solid var(--border)' }}>
              {product.images?.[activeImg] ? (
                <img src={product.images[activeImg]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'contain' }} />
              ) : (
                <span style={{ fontSize:'8rem' }}>📦</span>
              )}
            </div>
            {product.images?.length > 1 && (
              <div style={{ display:'flex', gap:8 }}>
                {product.images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)} style={{ width:72, height:72, borderRadius:10, overflow:'hidden', border:`2px solid ${activeImg===i?'var(--primary)':'var(--border)'}`, cursor:'pointer', flexShrink:0 }}>
                    <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {/* Category & Brand */}
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <span className="badge badge-primary" style={{ textTransform:'capitalize' }}>{product.category}</span>
              {product.brand && <span className="badge badge-info">{product.brand}</span>}
            </div>

            <h1 className="font-display" style={{ fontSize:'1.8rem', fontWeight:800, lineHeight:1.2, marginBottom:16 }}>
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating && (
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
                <div style={{ display:'flex', gap:2 }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ color: s<=Math.round(product.rating)?'var(--accent)':'var(--border-hover)', fontSize:'1.1rem' }}>★</span>
                  ))}
                </div>
                <span style={{ fontWeight:700, fontSize:'0.9rem' }}>{product.rating}</span>
                <span style={{ color:'var(--text-3)', fontSize:'0.8rem' }}>({product.numReviews?.toLocaleString('en-IN')} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:24, padding:'16px 20px', background:'var(--bg-3)', borderRadius:'var(--r-lg)', border:'1px solid var(--border)' }}>
              <span className="font-display" style={{ fontSize:'2.2rem', fontWeight:800, color:'var(--primary)' }}>
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <>
                  <span style={{ color:'var(--text-3)', fontSize:'1.1rem', textDecoration:'line-through' }}>₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                  <span style={{ background:'var(--danger)', color:'white', padding:'3px 10px', borderRadius:99, fontSize:'0.8rem', fontWeight:700 }}>
                    -{discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div style={{ marginBottom:20 }}>
              {product.stock === 0 ? (
                <span style={{ color:'var(--danger)', fontWeight:700 }}>⚠ Out of Stock</span>
              ) : product.stock < 10 ? (
                <span style={{ color:'var(--warning)', fontWeight:600, fontSize:'0.875rem' }}>⚡ Only {product.stock} left!</span>
              ) : (
                <span style={{ color:'var(--success)', fontWeight:600, fontSize:'0.875rem' }}>✓ In Stock</span>
              )}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
                <span style={{ color:'var(--text-2)', fontSize:'0.875rem', fontWeight:600 }}>Quantity:</span>
                <div style={{ display:'flex', alignItems:'center', gap:0, border:'1px solid var(--border)', borderRadius:'var(--r-md)', overflow:'hidden' }}>
                  <button onClick={() => setQty(q => Math.max(1,q-1))} style={{ width:40, height:40, background:'var(--bg-3)', border:'none', color:'var(--text-1)', cursor:'pointer', fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                  <span style={{ width:44, textAlign:'center', fontWeight:700, fontSize:'0.95rem', borderLeft:'1px solid var(--border)', borderRight:'1px solid var(--border)', padding:'0 4px', lineHeight:'40px' }}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock,q+1))} style={{ width:40, height:40, background:'var(--bg-3)', border:'none', color:'var(--text-1)', cursor:'pointer', fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display:'flex', gap:12, marginBottom:24 }}>
              <button
                onClick={() => addItem(product, qty)}
                disabled={product.stock===0}
                className="btn btn-outline"
                style={{ flex:1 }}
              >
                🛒 Add to Cart
              </button>
              <button
                onClick={handleRazorpay}
                disabled={product.stock===0 || paying}
                className="btn btn-primary"
                style={{ flex:1 }}
              >
                {paying ? 'Processing...' : '⚡ Buy Now'}
              </button>
            </div>

            {/* Trust Badges */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:24 }}>
              {[
                { icon:'🚀', text:'Free Delivery' },
                { icon:'↩️', text:'30-Day Returns' },
                { icon:'🔒', text:'Secure Payment' },
                { icon:'✅', text:'Authentic Product' },
              ].map(b => (
                <div key={b.text} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', background:'var(--bg-3)', borderRadius:8, border:'1px solid var(--border)', fontSize:'0.8rem', color:'var(--text-2)' }}>
                  <span>{b.icon}</span> {b.text}
                </div>
              ))}
            </div>

            {/* Seller */}
            {product.seller?.name && (
              <div style={{ padding:'12px 16px', background:'var(--bg-3)', borderRadius:'var(--r-md)', border:'1px solid var(--border)', fontSize:'0.875rem', color:'var(--text-2)' }}>
                🏪 Sold by <span style={{ fontWeight:700, color:'var(--primary)' }}>{product.seller.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description & Features */}
        <div style={{ marginTop:48, display:'grid', gridTemplateColumns:'2fr 1fr', gap:32 }}>
          <div className="card" style={{ padding:32 }}>
            <h2 className="font-display" style={{ fontWeight:700, fontSize:'1.2rem', marginBottom:16 }}>Product Description</h2>
            <p style={{ color:'var(--text-2)', lineHeight:1.8 }}>{product.description}</p>
          </div>
          {product.features?.length > 0 && (
            <div className="card" style={{ padding:32 }}>
              <h2 className="font-display" style={{ fontWeight:700, fontSize:'1.2rem', marginBottom:16 }}>Key Features</h2>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
                {product.features.map((f,i) => (
                  <li key={i} style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-2)', fontSize:'0.875rem' }}>
                    <span style={{ color:'var(--success)', fontWeight:700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}