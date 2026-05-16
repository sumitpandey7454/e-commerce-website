import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQty, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position:'fixed', inset:0, zIndex:1100,
          background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)',
          animation:'fadeIn 0.2s ease',
        }}
      />
      {/* Panel */}
      <div style={{
        position:'fixed', right:0, top:0, bottom:0, zIndex:1200,
        width:'min(420px, 100vw)',
        background:'var(--bg-card)', borderLeft:'1px solid var(--border)',
        display:'flex', flexDirection:'column',
        animation:'slideInRight 0.3s cubic-bezier(0.23,1,0.32,1)',
      }}>
        <style>{`
          @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `}</style>

        {/* Header */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'20px 24px', borderBottom:'1px solid var(--border)',
        }}>
          <div>
            <h2 className="font-display" style={{ fontWeight:800, fontSize:'1.3rem' }}>Your Cart</h2>
            <p style={{ color:'var(--text-3)', fontSize:'0.8rem', marginTop:2 }}>
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                style={{
                  padding:'6px 12px', background:'rgba(239,68,68,0.1)',
                  border:'1px solid rgba(239,68,68,0.2)', borderRadius:'var(--r-sm)',
                  color:'var(--danger)', fontSize:'0.75rem', cursor:'pointer',
                }}
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width:36, height:36, borderRadius:'50%', background:'var(--bg-3)',
                border:'1px solid var(--border)', display:'flex', alignItems:'center',
                justifyContent:'center', color:'var(--text-2)', cursor:'pointer',
              }}
            >
              <XIcon />
            </button>
          </div>
        </div>

        {/* Items */}
        <div style={{ flex:1, overflowY:'auto', padding:16 }}>
          {items.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-3)' }}>
              <div style={{ fontSize:'4rem', marginBottom:16 }}>🛒</div>
              <h3 className="font-display" style={{ fontSize:'1.1rem', marginBottom:8, color:'var(--text-2)' }}>Cart is empty</h3>
              <p style={{ fontSize:'0.875rem' }}>Add some products to get started!</p>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-primary"
                style={{ marginTop:20 }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {items.map(item => (
                <div
                  key={item._id}
                  className="card"
                  style={{ padding:16, display:'flex', gap:12, alignItems:'center' }}
                >
                  {/* Image */}
                  <div style={{
                    width:72, height:72, flexShrink:0, borderRadius:'var(--r-sm)',
                    background:'var(--bg-3)', overflow:'hidden',
                  }}>
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    ) : (
                      <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}>📦</div>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:600, fontSize:'0.875rem', marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {item.name}
                    </p>
                    <p style={{ color:'var(--primary)', fontWeight:700, fontSize:'0.9rem' }}>
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </p>
                    {/* Qty Controls */}
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
                      <button
                        onClick={() => updateQty(item._id, item.qty - 1)}
                        style={{
                          width:26, height:26, borderRadius:'50%', background:'var(--bg-3)',
                          border:'1px solid var(--border)', color:'var(--text-1)',
                          cursor:'pointer', fontSize:'1rem', display:'flex',
                          alignItems:'center', justifyContent:'center',
                        }}
                      >−</button>
                      <span style={{ fontSize:'0.875rem', fontWeight:600, minWidth:20, textAlign:'center' }}>{item.qty}</span>
                      <button
                        onClick={() => updateQty(item._id, item.qty + 1)}
                        style={{
                          width:26, height:26, borderRadius:'50%', background:'var(--bg-3)',
                          border:'1px solid var(--border)', color:'var(--text-1)',
                          cursor:'pointer', fontSize:'1rem', display:'flex',
                          alignItems:'center', justifyContent:'center',
                        }}
                      >+</button>
                      <button
                        onClick={() => removeItem(item._id)}
                        style={{
                          marginLeft:'auto', background:'none', border:'none',
                          color:'var(--danger)', cursor:'pointer', fontSize:'0.75rem',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding:20, borderTop:'1px solid var(--border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ color:'var(--text-2)' }}>Subtotal</span>
              <span style={{ fontWeight:700, color:'var(--text-1)' }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ color:'var(--text-3)', fontSize:'0.875rem' }}>Shipping</span>
              <span style={{ color:'var(--success)', fontSize:'0.875rem', fontWeight:600 }}>FREE</span>
            </div>
            <div className="divider" />
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <span style={{ fontWeight:700, fontSize:'1rem' }}>Total</span>
              <span style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--primary)' }}>
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
            <button onClick={handleCheckout} className="btn btn-primary" style={{ width:'100%' }}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}