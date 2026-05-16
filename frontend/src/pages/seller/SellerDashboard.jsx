import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, color = 'var(--primary)', sub }) => (
  <div className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ color: 'var(--text-3)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
        <p className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginTop: 4 }}>{value}</p>
        {sub && <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: 4 }}>{sub}</p>}
      </div>
      <span style={{ fontSize: '2.2rem' }}>{icon}</span>
    </div>
  </div>
);

const TABS = ['overview', 'products', 'orders'];

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [prodRes, ordRes] = await Promise.all([
          api.get('/products/seller/me'),
          api.get('/orders/seller'),
        ]);
        setProducts(prodRes.data.products || prodRes.data || []);
        setOrders(ordRes.data.orders || ordRes.data || []);
      } catch {
        // Placeholder
        setProducts([
          { _id: 'P1', name: 'Wireless Headphones Pro', price: 2999, stock: 45, category: 'electronics', status: 'active', images: [], numSales: 120, rating: 4.5 },
          { _id: 'P2', name: 'Ergonomic Laptop Stand', price: 1299, stock: 0, category: 'electronics', status: 'active', images: [], numSales: 87, rating: 4.8 },
          { _id: 'P3', name: 'Running Shoes X1', price: 3499, stock: 12, category: 'shoes', status: 'active', images: [], numSales: 204, rating: 4.2 },
          { _id: 'P4', name: 'Smart Watch Series 5', price: 8999, stock: 7, category: 'electronics', status: 'inactive', images: [], numSales: 56, rating: 4.0 },
        ]);
        setOrders([
          { _id: 'O1', createdAt: new Date().toISOString(), status: 'pending', totalAmount: 5998, buyer: { name: 'Rahul M.' }, items: [{ name: 'Wireless Headphones', qty: 2 }] },
          { _id: 'O2', createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'shipped', totalAmount: 1299, buyer: { name: 'Priya S.' }, items: [{ name: 'Laptop Stand', qty: 1 }] },
          { _id: 'O3', createdAt: new Date(Date.now() - 172800000).toISOString(), status: 'delivered', totalAmount: 3499, buyer: { name: 'Anjali K.' }, items: [{ name: 'Running Shoes', qty: 1 }] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts(p => p.filter(prod => prod._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const STATUS_COLORS = { pending:'var(--warning)', confirmed:'var(--info)', shipped:'var(--primary)', delivered:'var(--success)', cancelled:'var(--danger)' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem',
            }}>🏪</div>
            <div>
              <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                Seller Dashboard
              </h1>
              <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>{user?.name} · {user?.email}</p>
            </div>
          </div>
          <Link to="/seller/upload" className="btn btn-primary">
            + Upload Product
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'var(--bg-3)', borderRadius: 'var(--r-md)', padding: 4, width: 'fit-content' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 20px', borderRadius: 'var(--r-sm)', border: 'none',
              background: tab === t ? 'var(--primary)' : 'transparent',
              color: tab === t ? 'white' : 'var(--text-3)',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
              fontFamily: 'var(--font-display)', textTransform: 'capitalize', transition: 'all 0.2s',
            }}>{t}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
              <StatCard icon="📦" label="Total Products" value={products.length} sub={`${products.filter(p=>p.stock===0).length} out of stock`} />
              <StatCard icon="📋" label="Total Orders" value={orders.length} color="var(--info)" sub={`${pendingOrders} pending`} />
              <StatCard icon="💰" label="Total Revenue" value={`₹${revenue.toLocaleString('en-IN')}`} color="var(--success)" sub="All time" />
              <StatCard icon="⭐" label="Avg Rating" value={(products.reduce((s,p)=>s+(p.rating||0),0)/Math.max(products.length,1)).toFixed(1)} color="var(--accent)" sub="Across all products" />
            </div>

            {/* Recent Orders */}
            <div className="card" style={{ overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="font-display" style={{ fontWeight: 700 }}>Recent Orders</h3>
                <button onClick={() => setTab('orders')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>View All →</button>
              </div>
              {orders.slice(0,3).map((o, i) => (
                <div key={o._id} style={{
                  padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16,
                  borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.items?.[0]?.name}</p>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: 2 }}>by {o.buyer?.name} · {new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <p className="font-display" style={{ fontWeight: 700 }}>₹{o.totalAmount?.toLocaleString('en-IN')}</p>
                  <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: `${STATUS_COLORS[o.status]}20`, color: STATUS_COLORS[o.status], textTransform: 'capitalize' }}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Top Products */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                <h3 className="font-display" style={{ fontWeight: 700 }}>Top Products by Sales</h3>
              </div>
              {[...products].sort((a,b) => (b.numSales||0)-(a.numSales||0)).slice(0,3).map((p,i) => (
                <div key={p._id} style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: i<2?'1px solid var(--border)':'none' }}>
                  <span className="font-display" style={{ width: 28, fontWeight: 800, color: ['var(--accent)','var(--text-2)','var(--text-3)'][i], fontSize: '1.1rem' }}>#{i+1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</p>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: 2, textTransform: 'capitalize' }}>{p.category}</p>
                  </div>
                  <p style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{p.price?.toLocaleString('en-IN')}</p>
                  <p style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>{p.numSales || 0} sold</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── PRODUCTS TAB ── */}
        {tab === 'products' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="font-display" style={{ fontWeight: 700 }}>My Products ({products.length})</h3>
              <Link to="/seller/upload" className="btn btn-primary btn-sm">+ New Product</Link>
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Loading...</div>
            ) : products.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center' }}>
                <p style={{ color: 'var(--text-3)', marginBottom: 16 }}>No products yet</p>
                <Link to="/seller/upload" className="btn btn-primary">Upload First Product</Link>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-3)' }}>
                    {['Product', 'Category', 'Price', 'Stock', 'Sales', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p._id} style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                            {p.images?.[0] ? <img src={p.images[0]} style={{ width:'100%',height:'100%',objectFit:'cover',borderRadius:8 }} /> : '📦'}
                          </div>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', textTransform: 'capitalize' }}>{p.category}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className="font-display" style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{p.price?.toLocaleString('en-IN')}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ color: p.stock === 0 ? 'var(--danger)' : p.stock < 10 ? 'var(--warning)' : 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>
                          {p.stock === 0 ? '⚠ Out' : p.stock}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-3)', fontSize: '0.875rem' }}>{p.numSales || 0}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700,
                          background: p.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(107,103,133,0.15)',
                          color: p.status === 'active' ? 'var(--success)' : 'var(--text-3)',
                          textTransform: 'capitalize',
                        }}>{p.status || 'active'}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => navigate(`/seller/edit/${p._id}`)}
                            style={{ padding: '5px 12px', borderRadius: 6, background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--info)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                          >Edit</button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            disabled={deletingId === p._id}
                            style={{ padding: '5px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                          >{deletingId === p._id ? '...' : 'Delete'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-display" style={{ fontWeight: 700 }}>Orders for My Products ({orders.length})</h3>
            </div>
            {orders.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>No orders yet</div>
            ) : (
              orders.map((o, i) => (
                <div key={o._id} style={{
                  padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16,
                  borderBottom: i < orders.length - 1 ? '1px solid var(--border)' : 'none',
                  flexWrap: 'wrap',
                }}>
                  <div style={{ minWidth: 100 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>#{o._id.slice(-6).toUpperCase()}</p>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.72rem', marginTop: 2 }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.items?.[0]?.name}{o.items?.length > 1 && ` +${o.items.length-1} more`}</p>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: 2 }}>Buyer: {o.buyer?.name}</p>
                  </div>
                  <p className="font-display" style={{ fontWeight: 800 }}>₹{o.totalAmount?.toLocaleString('en-IN')}</p>
                  <select
                    defaultValue={o.status}
                    onChange={async (e) => {
                      try {
                        await api.put(`/orders/${o._id}/status`, { status: e.target.value });
                        setOrders(prev => prev.map(ord => ord._id === o._id ? { ...ord, status: e.target.value } : ord));
                        toast.success('Order status updated');
                      } catch { toast.error('Failed to update status'); }
                    }}
                    style={{
                      padding: '6px 12px', borderRadius: 8, border: `1px solid ${STATUS_COLORS[o.status]}40`,
                      background: `${STATUS_COLORS[o.status]}15`, color: STATUS_COLORS[o.status],
                      fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)',
                    }}
                  >
                    {['pending','confirmed','shipped','delivered','cancelled'].map(s => (
                      <option key={s} value={s} style={{ background: 'var(--bg-card)', color: 'var(--text-1)' }}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}