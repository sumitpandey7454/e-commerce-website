import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const StatCard = ({ icon, label, value, color = 'var(--primary)', trend }) => (
  <div className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
      background: color,
    }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
        <p className="font-display" style={{ fontSize: '2rem', fontWeight: 800, marginTop: 4, color: 'var(--text-1)' }}>{value}</p>
        {trend && <p style={{ color: 'var(--success)', fontSize: '0.75rem', marginTop: 4 }}>{trend}</p>}
      </div>
      <span style={{ fontSize: '2rem' }}>{icon}</span>
    </div>
  </div>
);

const STATUS_COLORS = {
  pending: 'var(--warning)',
  confirmed: 'var(--info)',
  shipped: 'var(--primary)',
  delivered: 'var(--success)',
  cancelled: 'var(--danger)',
};

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my');
        setOrders(res.data.orders || res.data || []);
      } catch {
        // Placeholder data
        setOrders([
          { _id: 'ORD001', createdAt: new Date().toISOString(), status: 'delivered', totalAmount: 4999, items: [{ name: 'Wireless Headphones', qty: 1, price: 4999 }], paymentStatus: 'success' },
          { _id: 'ORD002', createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'shipped', totalAmount: 1299, items: [{ name: 'Laptop Stand', qty: 1, price: 1299 }], paymentStatus: 'success' },
          { _id: 'ORD003', createdAt: new Date(Date.now() - 172800000).toISOString(), status: 'pending', totalAmount: 8999, items: [{ name: 'Smart Watch', qty: 1, price: 8999 }], paymentStatus: 'pending' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    pending: orders.filter(o => ['pending','confirmed','shipped'].includes(o.status)).length,
    spent: orders.filter(o => o.paymentStatus === 'success').reduce((s, o) => s + o.totalAmount, 0),
  };

  const filtered = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', fontWeight: 800, color: 'white',
            }}>
              {user?.name?.[0]?.toUpperCase() || 'B'}
            </div>
            <div>
              <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                Hey, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>
                Welcome to your buyer dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
          <StatCard icon="📦" label="Total Orders" value={stats.total} />
          <StatCard icon="✅" label="Delivered" value={stats.delivered} color="var(--success)" trend="All delivered safely" />
          <StatCard icon="🚚" label="In Progress" value={stats.pending} color="var(--info)" />
          <StatCard icon="💰" label="Total Spent" value={`₹${stats.spent.toLocaleString('en-IN')}`} color="var(--accent)" />
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap',
        }}>
          <Link to="/products" className="btn btn-primary">🛒 Continue Shopping</Link>
          <Link to="/products?sort=-createdAt" className="btn btn-outline">🆕 New Arrivals</Link>
          <Link to="/products?featured=true" className="btn btn-ghost">⭐ Featured Deals</Link>
        </div>

        {/* Orders Section */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <h2 className="font-display" style={{ fontWeight: 800, fontSize: '1.2rem' }}>My Orders</h2>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'pending', 'shipped', 'delivered', 'cancelled'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '6px 14px', borderRadius: 99, border: 'none',
                    background: activeTab === tab ? 'var(--primary)' : 'var(--bg-3)',
                    color: activeTab === tab ? 'white' : 'var(--text-3)',
                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                    textTransform: 'capitalize', transition: 'all 0.2s',
                    border: `1px solid ${activeTab === tab ? 'transparent' : 'var(--border)'}`,
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
              <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 12px' }} />
              Loading orders...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>📦</div>
              <h3 className="font-display" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8, color: 'var(--text-2)' }}>No orders yet</h3>
              <p style={{ color: 'var(--text-3)', marginBottom: 20 }}>Start shopping to see your orders here</p>
              <Link to="/products" className="btn btn-primary">Shop Now</Link>
            </div>
          ) : (
            <div>
              {filtered.map((order, i) => (
                <div
                  key={order._id}
                  style={{
                    padding: '20px 24px',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                  }}
                >
                  {/* Order ID & Date */}
                  <div style={{ minWidth: 120 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: 2 }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  </div>

                  {/* Items */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {order.items?.[0]?.name || 'Product'}
                      {order.items?.length > 1 && ` +${order.items.length - 1} more`}
                    </p>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: 2 }}>
                      {order.items?.reduce((s, i) => s + i.qty, 0)} item(s)
                    </p>
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: 'right', minWidth: 100 }}>
                    <p className="font-display" style={{ fontWeight: 800, fontSize: '1rem' }}>
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </p>
                    <p style={{
                      fontSize: '0.7rem', fontWeight: 600, marginTop: 2,
                      color: order.paymentStatus === 'success' ? 'var(--success)' : 'var(--warning)',
                    }}>
                      {order.paymentStatus?.toUpperCase()}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div style={{
                    padding: '6px 14px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700,
                    background: `${STATUS_COLORS[order.status]}20`,
                    color: STATUS_COLORS[order.status],
                    textTransform: 'capitalize', minWidth: 90, textAlign: 'center',
                  }}>
                    {order.status}
                  </div>

                  {/* Actions */}
                  <Link
                    to={`/buyer/orders/${order._id}`}
                    style={{
                      padding: '8px 16px', borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-3)', border: '1px solid var(--border)',
                      color: 'var(--text-2)', textDecoration: 'none',
                      fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
                  >
                    Details →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}