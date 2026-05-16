import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import api from '../../services/api';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('featured');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = activeTab === 'featured' ? '?featured=true&limit=8' : `?sort=${activeTab}&limit=8`;
        const res = await api.get(`/products${params}`);
        setProducts(res.data.products || res.data || []);
      } catch {
        // Use placeholder data if API not ready
        setProducts(Array.from({ length: 8 }, (_, i) => ({
          _id: `placeholder-${i}`,
          name: ['Wireless Headphones Pro', 'Running Shoes X1', 'Laptop Stand Ergonomic', 'Smart Watch Series 5', 'Denim Jacket Classic', 'Programming Books Bundle', 'Gaming Mouse RGB', 'Coffee Maker Deluxe'][i],
          price: [2999, 3499, 1299, 8999, 1799, 899, 1599, 4299][i],
          originalPrice: [4999, 5999, 1999, 12999, 2999, 1299, 2499, 6999][i],
          category: ['Electronics', 'Shoes', 'Electronics', 'Electronics', 'Fashion', 'Books', 'Electronics', 'Home & Kitchen'][i],
          rating: [4.5, 4.2, 4.8, 4.1, 3.9, 4.6, 4.3, 4.0][i],
          numReviews: [1204, 891, 2341, 567, 234, 1879, 743, 456][i],
          stock: i === 3 ? 0 : 10,
          featured: i < 4,
          images: [],
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeTab]);

  const tabs = [
    { key: 'featured', label: '⭐ Featured' },
    { key: '-createdAt', label: '🆕 New Arrivals' },
    { key: '-numSales', label: '🔥 Bestsellers' },
    { key: 'price', label: '💸 Under ₹999' },
  ];

  return (
    <section className="section" style={{ background: 'var(--bg-2)', paddingTop: 60, paddingBottom: 60 }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>Products</span>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800 }}>
              Products You'll <span className="text-gradient">Love</span>
            </h2>
          </div>
          <Link to="/products" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
            View All Products →
          </Link>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 20px', borderRadius: 99, border: 'none',
                background: activeTab === tab.key ? 'var(--primary)' : 'var(--bg-3)',
                color: activeTab === tab.key ? 'white' : 'var(--text-2)',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                fontFamily: 'var(--font-display)', transition: 'all 0.2s',
                border: `1px solid ${activeTab === tab.key ? 'transparent' : 'var(--border)'}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card" style={{ height: 320, overflow: 'hidden' }}>
                <div style={{ height: 200, background: 'var(--bg-3)' }} />
                <div style={{ padding: 16 }}>
                  <div style={{ height: 12, background: 'var(--bg-3)', borderRadius: 4, marginBottom: 8, width: '60%' }} />
                  <div style={{ height: 16, background: 'var(--bg-3)', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ height: 16, background: 'var(--bg-3)', borderRadius: 4, width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}