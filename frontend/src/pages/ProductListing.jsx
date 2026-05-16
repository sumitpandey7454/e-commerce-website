import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import { CATEGORIES } from '../utils/constants';
import api from '../services/api';

export default function ProductListing({ forcedCategory }) {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);

  const [filters, setFilters] = useState({
    category: forcedCategory || searchParams.get('category') || '',
    sort:     searchParams.get('sort') || '-createdAt',
    minPrice: '',
    maxPrice: '',
    search:   searchParams.get('search') || '',
    inStock:  false,
  });

  useEffect(() => {
    if (forcedCategory !== undefined) setFilters(f => ({ ...f, category: forcedCategory || '' }));
  }, [forcedCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.category) params.set('category', filters.category);
        if (filters.sort)     params.set('sort',     filters.sort);
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        if (filters.search)   params.set('search',   filters.search);
        if (filters.inStock)  params.set('inStock',  'true');
        params.set('page',  page);
        params.set('limit', 12);
        const res = await api.get(`/products?${params}`);
        setProducts(res.data.products || res.data || []);
        setTotal(res.data.total || 0);
      } catch {
        setProducts(Array.from({ length: 12 }, (_, i) => ({
          _id:           `p${i}`,
          name:          ['Sony WH-1000XM5','Nike Air Max 270','Atomic Habits','Instant Pot Duo','Samsung QLED TV','Apple AirPods Pro','Minimalist Serum','Yonex Racket','Men Chinos','Floral Dress','Lenovo Laptop','Logitech Mouse'][i],
          price:         [24990,8995,349,6999,89990,19990,399,8990,1499,1299,54990,7995][i],
          originalPrice: [34990,11995,599,9999,129990,26900,699,11990,2999,2499,69990,9995][i],
          category:      ['electronics','shoes','books','home-kitchen','electronics','electronics','beauty','sports','fashion','fashion','electronics','electronics'][i],
          rating:        [4.7,4.6,4.9,4.7,4.5,4.8,4.6,4.8,4.2,4.5,4.4,4.6][i],
          numReviews:    [2341,2103,8901,3421,891,5621,4321,567,456,789,743,1203][i],
          stock:         i === 3 ? 0 : i === 7 ? 3 : 50,
          featured:      i < 4,
          images:        [],
          seller:        { name: i < 6 ? 'TechStore India' : 'FashionHub' },
        })));
        setTotal(48);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters, page]);

  const setFilter = (k, v) => { setFilters(p => ({ ...p, [k]: v })); setPage(1); };
  const activeCat = CATEGORIES.find(c => c.id === filters.category);
  const hasActiveFilters = (filters.category && !forcedCategory) || filters.minPrice || filters.maxPrice || filters.search || filters.inStock;

  const sortOptions = [
    { value: '-createdAt', label: 'Newest First'      },
    { value: 'price',      label: 'Price: Low → High' },
    { value: '-price',     label: 'Price: High → Low' },
    { value: '-rating',    label: 'Top Rated'          },
    { value: '-numSales',  label: 'Best Selling'       },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <style>{`
        @keyframes shimmerLoad {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Category Banner */}
      {activeCat && (
        <div style={{
          background: `linear-gradient(135deg, ${activeCat.color}18 0%, transparent 70%)`,
          borderBottom: '1px solid var(--border)', padding: '28px 0',
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: `${activeCat.color}20`, border: `2px solid ${activeCat.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
            }}>{activeCat.icon}</div>
            <div>
              <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Category</p>
              <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800 }}>{activeCat.label}</h1>
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

          {/* ── Sidebar ── */}
          <aside style={{ width: 230, flexShrink: 0 }}>
            <div className="card" style={{ padding: 20, position: 'sticky', top: 88 }}>
              <h3 className="font-display" style={{ fontWeight: 700, marginBottom: 20, fontSize: '1rem' }}>🔍 Filters</h3>

              {/* Search */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Search</label>
                <input value={filters.search} onChange={e => setFilter('search', e.target.value)}
                  placeholder="Search products..." className="input" style={{ fontSize: '0.85rem' }} />
              </div>

              {/* Category (only show when not forced) */}
              {!forcedCategory && (
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Category</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <button onClick={() => setFilter('category', '')} style={{
                      textAlign: 'left', padding: '7px 10px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${!filters.category ? 'rgba(255,79,10,0.3)' : 'transparent'}`,
                      background: !filters.category ? 'rgba(255,79,10,0.1)' : 'none',
                      color: !filters.category ? 'var(--primary)' : 'var(--text-2)', fontSize: '0.83rem', fontWeight: !filters.category ? 700 : 400,
                    }}>All Categories</button>
                    {CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => setFilter('category', cat.id)} style={{
                        textAlign: 'left', padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                        background: filters.category === cat.id ? `${cat.color}18` : 'none',
                        border: `1px solid ${filters.category === cat.id ? `${cat.color}40` : 'transparent'}`,
                        color: filters.category === cat.id ? cat.color : 'var(--text-2)',
                        fontSize: '0.83rem', fontWeight: filters.category === cat.id ? 700 : 400,
                        display: 'flex', alignItems: 'center', gap: 7,
                      }}>
                        <span>{cat.icon}</span>{cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Price Range (₹)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)}
                    placeholder="Min" className="input" style={{ fontSize: '0.8rem' }} type="number" min="0" />
                  <input value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)}
                    placeholder="Max" className="input" style={{ fontSize: '0.8rem' }} type="number" min="0" />
                </div>
              </div>

              {/* In Stock Toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 0' }}>
                <div onClick={() => setFilter('inStock', !filters.inStock)} style={{
                  width: 40, height: 22, borderRadius: 99, cursor: 'pointer',
                  background: filters.inStock ? 'var(--primary)' : 'var(--bg-3)',
                  border: `1px solid ${filters.inStock ? 'var(--primary)' : 'var(--border)'}`,
                  position: 'relative', transition: 'all 0.25s', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: 2, left: filters.inStock ? 20 : 2,
                    width: 16, height: 16, borderRadius: '50%', background: 'white',
                    transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }} />
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>In Stock Only</span>
              </label>

              {hasActiveFilters && (
                <button
                  onClick={() => { setFilters({ category: forcedCategory || '', sort: '-createdAt', minPrice: '', maxPrice: '', search: '', inStock: false }); setPage(1); }}
                  style={{ marginTop: 16, width: '100%', padding: '9px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                >✕ Clear All Filters</button>
              )}
            </div>
          </aside>

          {/* ── Products ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
              <div>
                {!activeCat && (
                  <h1 className="font-display" style={{ fontWeight: 800, fontSize: '1.4rem' }}>
                    {filters.search ? `Results for "${filters.search}"` : 'All Products'}
                  </h1>
                )}
                {!loading && <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginTop: activeCat ? 0 : 4 }}>{total.toLocaleString('en-IN')} products</p>}
              </div>
              <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)}
                style={{ padding: '9px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-1)', fontSize: '0.875rem', cursor: 'pointer', outline: 'none' }}>
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="products-grid">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="card" style={{ height: 320, overflow: 'hidden' }}>
                    <div style={{ height: 200, background: 'linear-gradient(90deg, var(--bg-3) 25%, var(--bg-2) 50%, var(--bg-3) 75%)', backgroundSize: '200% 100%', animation: 'shimmerLoad 1.5s ease-in-out infinite' }} />
                    <div style={{ padding: 16 }}>
                      <div style={{ height: 10, background: 'var(--bg-3)', borderRadius: 4, marginBottom: 10, width: '55%' }} />
                      <div style={{ height: 14, background: 'var(--bg-3)', borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ height: 14, background: 'var(--bg-3)', borderRadius: 4, width: '75%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
                <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>No products found</h3>
                <p style={{ color: 'var(--text-3)', marginBottom: 20 }}>Try adjusting your filters or search terms</p>
                <button onClick={() => setFilters({ category: forcedCategory||'', sort:'-createdAt', minPrice:'', maxPrice:'', search:'', inStock:false })} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {total > 12 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 48 }}>
                    <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                      className="btn btn-ghost btn-sm" style={{ opacity: page===1 ? 0.4 : 1 }}>← Prev</button>
                    {Array.from({ length: Math.ceil(total/12) }, (_,i)=>i+1)
                      .filter(p => p===1 || p===Math.ceil(total/12) || Math.abs(p-page)<=1)
                      .reduce((acc,p,idx,arr) => { if(idx>0&&p-arr[idx-1]>1) acc.push('…'); acc.push(p); return acc; }, [])
                      .map((p,i) => p==='…'
                        ? <span key={`d${i}`} style={{ color:'var(--text-3)', padding:'0 2px' }}>…</span>
                        : <button key={p} onClick={()=>setPage(p)} style={{ width:36,height:36,borderRadius:8,border:'none', background:p===page?'var(--primary)':'var(--bg-3)', color:p===page?'white':'var(--text-2)', cursor:'pointer',fontWeight:700,fontSize:'0.875rem',transition:'all 0.15s' }}>{p}</button>
                      )}
                    <button onClick={()=>setPage(p=>p+1)} disabled={page>=Math.ceil(total/12)}
                      className="btn btn-ghost btn-sm" style={{ opacity: page>=Math.ceil(total/12)?0.4:1 }}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}