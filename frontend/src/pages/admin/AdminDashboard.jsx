import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, color = 'var(--primary)', sub }) => (
  <div className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
        <p className="font-display" style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: 6 }}>{value}</p>
        {sub && <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: 4 }}>{sub}</p>}
      </div>
      <span style={{ fontSize: '2.4rem' }}>{icon}</span>
    </div>
  </div>
);

const TABS = ['overview', 'users', 'products', 'orders', 'messages'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState({ users:[], products:[], orders:[], messages:[] });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [uRes, pRes, oRes, mRes] = await Promise.all([
  api.get('/users/admin/all'),
  api.get('/products?limit=50'),
  api.get('/orders/admin/all'),
  api.get('/messages/admin/all'),
]);
setData({
  users:    Array.isArray(uRes.data.users)    ? uRes.data.users    : [],
  products: Array.isArray(pRes.data.products) ? pRes.data.products : [],
  orders:   Array.isArray(oRes.data.orders)   ? oRes.data.orders   : [],
  messages: Array.isArray(mRes.data.messages) ? mRes.data.messages : [],
});
      } catch {
        // Rich placeholder data
        setData({
          users: [
            { _id:'U1', name:'Rahul Mehta', email:'rahul@example.com', role:'buyer',  createdAt: new Date().toISOString(), isActive: true },
            { _id:'U2', name:'Priya Store', email:'priya@example.com', role:'seller', createdAt: new Date().toISOString(), isActive: true },
            { _id:'U3', name:'Anjali K.',   email:'anjali@example.com', role:'buyer', createdAt: new Date(Date.now()-86400000).toISOString(), isActive: false },
            { _id:'U4', name:'Vikram Shah', email:'vikram@example.com', role:'seller',createdAt: new Date(Date.now()-172800000).toISOString(), isActive: true },
          ],
          products: [
            { _id:'P1', name:'Wireless Headphones Pro', price:2999, stock:45, category:'electronics', status:'active', seller:{ name:'Priya Store' } },
            { _id:'P2', name:'Running Shoes X1',        price:3499, stock:12, category:'shoes',        status:'active', seller:{ name:'Vikram Shah' } },
            { _id:'P3', name:'Smart Watch Series 5',    price:8999, stock:0,  category:'electronics', status:'inactive',seller:{ name:'Priya Store' } },
          ],
          orders: [
            { _id:'O1', createdAt: new Date().toISOString(), status:'pending',   totalAmount:5998, buyer:{name:'Rahul Mehta'}, paymentStatus:'success' },
            { _id:'O2', createdAt: new Date(Date.now()-86400000).toISOString(), status:'shipped', totalAmount:1299, buyer:{name:'Anjali K.'}, paymentStatus:'success' },
            { _id:'O3', createdAt: new Date(Date.now()-172800000).toISOString(), status:'delivered',totalAmount:3499, buyer:{name:'Rahul Mehta'}, paymentStatus:'success' },
          ],
          messages: [
            { _id:'M1', name:'Sanjay Gupta', email:'sanjay@example.com', message:'I have a problem with my order #ORD001. The product arrived damaged.', createdAt: new Date().toISOString(), read: false },
            { _id:'M2', name:'Meena R.',     email:'meena@example.com',  message:'How do I become a seller on ShopVerse? What are the requirements?',  createdAt: new Date(Date.now()-3600000).toISOString(), read: false },
            { _id:'M3', name:'Arun P.',      email:'',                   message:'Great platform! Just wanted to say the delivery was super fast. Will shop again!', createdAt: new Date(Date.now()-86400000).toISOString(), read: true },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const deleteUser = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/users/${id}`);
      setData(d => ({ ...d, users: d.users.filter(u => u._id !== id) }));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
    finally { setDeletingId(null); }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      setData(d => ({ ...d, products: d.products.filter(p => p._id !== id) }));
      toast.success('Product deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeletingId(null); }
  };

  const deleteMessage = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/messages/${id}`);
      setData(d => ({ ...d, messages: d.messages.filter(m => m._id !== id) }));
      toast.success('Message deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeletingId(null); }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/messages/${id}`, { read: true });
      setData(d => ({ ...d, messages: d.messages.map(m => m._id === id ? { ...m, read: true } : m) }));
    } catch {}
  };

  const totalRevenue = data.orders.filter(o => o.paymentStatus === 'success').reduce((s,o) => s + o.totalAmount, 0);
  const unread = data.messages.filter(m => !m.read).length;

  const STATUS_COLORS = { pending:'var(--warning)', confirmed:'var(--info)', shipped:'var(--primary)', delivered:'var(--success)', cancelled:'var(--danger)' };
  const ROLE_COLORS   = { buyer:'var(--info)', seller:'var(--warning)', admin:'var(--primary)' };

  const tabConfig = [
    { key:'overview',  label:'Overview',  icon:'📊' },
    { key:'users',     label:'Users',     icon:'👥', badge: data.users.length },
    { key:'products',  label:'Products',  icon:'📦', badge: data.products.length },
    { key:'orders',    label:'Orders',    icon:'📋', badge: data.orders.length },
    { key:'messages',  label:'Messages',  icon:'💬', badge: unread || null },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:80 }}>
      <div className="container" style={{ paddingTop:32, paddingBottom:48 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{
              width:60, height:60, borderRadius:16,
              background:'linear-gradient(135deg, var(--primary), #FF007A)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem',
            }}>⚙️</div>
            <div>
              <h1 className="font-display" style={{ fontSize:'2rem', fontWeight:800 }}>
                Admin <span className="text-gradient">Control Panel</span>
              </h1>
              <p style={{ color:'var(--text-3)', fontSize:'0.875rem' }}>Logged in as {user?.name} · Super Admin</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <span className="badge badge-danger" style={{ fontSize:'0.75rem' }}>
              {unread} unread messages
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display:'flex', gap:4, marginBottom:32, background:'var(--bg-3)', borderRadius:'var(--r-md)', padding:4, width:'fit-content', flexWrap:'wrap' }}>
          {tabConfig.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding:'9px 18px', borderRadius:'var(--r-sm)', border:'none',
              background: tab === t.key ? 'var(--primary)' : 'transparent',
              color: tab === t.key ? 'white' : 'var(--text-3)',
              cursor:'pointer', fontSize:'0.875rem', fontWeight:600,
              fontFamily:'var(--font-display)', transition:'all 0.2s',
              display:'flex', alignItems:'center', gap:6, position:'relative',
            }}>
              {t.icon} {t.label}
              {t.badge > 0 && (
                <span style={{
                  background: tab === t.key ? 'rgba(255,255,255,0.3)' : 'var(--primary)',
                  color:'white', fontSize:'0.65rem', fontWeight:800,
                  padding:'1px 6px', borderRadius:99, minWidth:18, textAlign:'center',
                }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20, marginBottom:32 }}>
              <StatCard icon="👥" label="Total Users"    value={data.users.length}    sub={`${data.users.filter(u=>u.role==='seller').length} sellers`} />
              <StatCard icon="📦" label="Total Products" value={data.products.length} color="var(--info)"    sub={`${data.products.filter(p=>p.stock===0).length} out of stock`} />
              <StatCard icon="📋" label="Total Orders"   value={data.orders.length}   color="var(--warning)" sub={`${data.orders.filter(o=>o.status==='pending').length} pending`} />
              <StatCard icon="💰" label="Total Revenue"  value={`₹${totalRevenue.toLocaleString('en-IN')}`} color="var(--success)" sub="All time" />
            </div>

            {/* Recent Activity Split */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>

              {/* Recent Users */}
              <div className="card" style={{ overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h3 className="font-display" style={{ fontWeight:700, fontSize:'1rem' }}>Recent Users</h3>
                  <button onClick={()=>setTab('users')} style={{ background:'none',border:'none',color:'var(--primary)',cursor:'pointer',fontSize:'0.8rem',fontWeight:600 }}>View All →</button>
                </div>
                {data.users.slice(0,4).map((u,i) => (
                  <div key={u._id} style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:12, borderBottom: i<3?'1px solid var(--border)':'none' }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.875rem', fontWeight:700, color:'white', flexShrink:0 }}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:600, fontSize:'0.875rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u.name}</p>
                      <p style={{ color:'var(--text-3)', fontSize:'0.72rem', marginTop:1 }}>{u.email}</p>
                    </div>
                    <span style={{ padding:'3px 10px', borderRadius:99, fontSize:'0.68rem', fontWeight:700, background:`${ROLE_COLORS[u.role]}20`, color:ROLE_COLORS[u.role], textTransform:'capitalize', flexShrink:0 }}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recent Messages */}
              <div className="card" style={{ overflow:'hidden' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <h3 className="font-display" style={{ fontWeight:700, fontSize:'1rem' }}>Recent Messages</h3>
                  <button onClick={()=>setTab('messages')} style={{ background:'none',border:'none',color:'var(--primary)',cursor:'pointer',fontSize:'0.8rem',fontWeight:600 }}>View All →</button>
                </div>
                {data.messages.slice(0,3).map((m,i) => (
                  <div key={m._id} style={{ padding:'14px 20px', borderBottom: i<2?'1px solid var(--border)':'none', opacity: m.read?0.6:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontWeight:700, fontSize:'0.875rem' }}>{m.name}</span>
                      {!m.read && <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--primary)', flexShrink:0 }} />}
                      <span style={{ marginLeft:'auto', color:'var(--text-3)', fontSize:'0.72rem' }}>
                        {new Date(m.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
                      </span>
                    </div>
                    <p style={{ color:'var(--text-3)', fontSize:'0.8rem', lineHeight:1.5, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)' }}>
              <h3 className="font-display" style={{ fontWeight:700 }}>All Users ({data.users.length})</h3>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--bg-3)' }}>
                  {['User','Email','Role','Joined','Status','Action'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:'0.72rem', color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.users.map((u,i) => (
                  <tr key={u._id} style={{ borderTop:'1px solid var(--border)' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-3)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding:'14px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--primary),var(--accent))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.875rem', fontWeight:700, color:'white', flexShrink:0 }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight:600, fontSize:'0.875rem' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'14px 16px', color:'var(--text-3)', fontSize:'0.8rem' }}>{u.email}</td>
                    <td style={{ padding:'14px 16px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:99, fontSize:'0.7rem', fontWeight:700, background:`${ROLE_COLORS[u.role]}20`, color:ROLE_COLORS[u.role], textTransform:'capitalize' }}>{u.role}</span>
                    </td>
                    <td style={{ padding:'14px 16px', color:'var(--text-3)', fontSize:'0.8rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding:'14px 16px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:99, fontSize:'0.7rem', fontWeight:700, background: u.isActive!==false?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)', color: u.isActive!==false?'var(--success)':'var(--danger)' }}>
                        {u.isActive!==false ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <button
                        onClick={() => deleteUser(u._id)}
                        disabled={deletingId === u._id || u.role === 'admin'}
                        style={{ padding:'5px 12px', borderRadius:6, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'var(--danger)', cursor: u.role==='admin'?'not-allowed':'pointer', fontSize:'0.75rem', fontWeight:600, opacity: u.role==='admin'?0.4:1 }}
                      >
                        {deletingId===u._id ? '...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === 'products' && (
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)' }}>
              <h3 className="font-display" style={{ fontWeight:700 }}>All Products ({data.products.length})</h3>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--bg-3)' }}>
                  {['Product','Seller','Category','Price','Stock','Status','Action'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:'0.72rem', color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.products.map((p,i) => (
                  <tr key={p._id} style={{ borderTop:'1px solid var(--border)' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-3)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding:'14px 16px' }}>
                      <p style={{ fontWeight:600, fontSize:'0.875rem', maxWidth:200, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</p>
                    </td>
                    <td style={{ padding:'14px 16px', color:'var(--text-3)', fontSize:'0.8rem' }}>{p.seller?.name || '—'}</td>
                    <td style={{ padding:'14px 16px', color:'var(--text-3)', fontSize:'0.8rem', textTransform:'capitalize' }}>{p.category}</td>
                    <td style={{ padding:'14px 16px' }}>
                      <span className="font-display" style={{ fontWeight:700, color:'var(--primary)' }}>₹{p.price?.toLocaleString('en-IN')}</span>
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <span style={{ color: p.stock===0?'var(--danger)':p.stock<10?'var(--warning)':'var(--success)', fontWeight:600, fontSize:'0.875rem' }}>
                        {p.stock===0?'Out':p.stock}
                      </span>
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:99, fontSize:'0.7rem', fontWeight:700, background: p.status==='active'?'rgba(34,197,94,0.15)':'rgba(107,103,133,0.15)', color: p.status==='active'?'var(--success)':'var(--text-3)', textTransform:'capitalize' }}>{p.status||'active'}</span>
                    </td>
                    <td style={{ padding:'14px 16px' }}>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        disabled={deletingId===p._id}
                        style={{ padding:'5px 12px', borderRadius:6, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'var(--danger)', cursor:'pointer', fontSize:'0.75rem', fontWeight:600 }}
                      >{deletingId===p._id?'...':'Delete'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)' }}>
              <h3 className="font-display" style={{ fontWeight:700 }}>All Orders ({data.orders.length})</h3>
            </div>
            {data.orders.map((o,i) => (
              <div key={o._id} style={{ padding:'16px 24px', display:'flex', alignItems:'center', gap:16, borderBottom: i<data.orders.length-1?'1px solid var(--border)':'none', flexWrap:'wrap' }}>
                <div style={{ minWidth:110 }}>
                  <p style={{ fontWeight:700, fontSize:'0.8rem', color:'var(--primary)', fontFamily:'var(--font-display)' }}>#{o._id.slice(-6).toUpperCase()}</p>
                  <p style={{ color:'var(--text-3)', fontSize:'0.72rem', marginTop:2 }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:600, fontSize:'0.875rem' }}>Buyer: {o.buyer?.name}</p>
                </div>
                <p className="font-display" style={{ fontWeight:800 }}>₹{o.totalAmount?.toLocaleString('en-IN')}</p>
                <span style={{ padding:'5px 14px', borderRadius:99, fontSize:'0.75rem', fontWeight:700, background:`${STATUS_COLORS[o.status]}20`, color:STATUS_COLORS[o.status], textTransform:'capitalize' }}>
                  {o.status}
                </span>
                <span style={{ padding:'5px 14px', borderRadius:99, fontSize:'0.72rem', fontWeight:700, background: o.paymentStatus==='success'?'rgba(34,197,94,0.15)':'rgba(245,158,11,0.15)', color: o.paymentStatus==='success'?'var(--success)':'var(--warning)' }}>
                  {o.paymentStatus}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === 'messages' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
              <h2 className="font-display" style={{ fontWeight:800, fontSize:'1.3rem' }}>Contact Messages</h2>
              {unread > 0 && <span className="badge badge-danger">{unread} unread</span>}
            </div>
            {data.messages.length === 0 ? (
              <div className="card" style={{ padding:60, textAlign:'center', color:'var(--text-3)' }}>No messages yet</div>
            ) : data.messages.map(m => (
              <div key={m._id} className="card" style={{
                padding:24, borderLeft: m.read ? '1px solid var(--border)' : '3px solid var(--primary)',
                opacity: m.read ? 0.7 : 1,
              }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--bg-3)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.875rem' }}>
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{m.name}</p>
                        {m.email && <p style={{ color:'var(--primary)', fontSize:'0.75rem' }}>{m.email}</p>}
                      </div>
                      {!m.read && <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--primary)', flexShrink:0 }} />}
                      <span style={{ marginLeft:'auto', color:'var(--text-3)', fontSize:'0.75rem' }}>
                        {new Date(m.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                      </span>
                    </div>
                    <p style={{ color:'var(--text-2)', fontSize:'0.9rem', lineHeight:1.7, paddingLeft:46 }}>{m.message}</p>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    {!m.read && (
                      <button onClick={() => markRead(m._id)} style={{ padding:'6px 14px', borderRadius:8, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', color:'var(--info)', cursor:'pointer', fontSize:'0.75rem', fontWeight:600 }}>
                        Mark Read
                      </button>
                    )}
                    {m.email && (
                      <a href={`mailto:${m.email}`} style={{ padding:'6px 14px', borderRadius:8, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)', color:'var(--success)', textDecoration:'none', fontSize:'0.75rem', fontWeight:600 }}>
                        Reply
                      </a>
                    )}
                    <button onClick={() => deleteMessage(m._id)} disabled={deletingId===m._id} style={{ padding:'6px 14px', borderRadius:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'var(--danger)', cursor:'pointer', fontSize:'0.75rem', fontWeight:600 }}>
                      {deletingId===m._id?'...':'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}