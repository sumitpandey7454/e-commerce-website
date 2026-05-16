import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../utils/constants';

export default function CategoryGrid() {
  return (
    <section className="section">
      <div className="container">
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: 12 }}>Browse</span>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800 }}>
              Shop by <span className="text-gradient">Category</span>
            </h2>
          </div>
          <Link to="/products" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
            View All →
          </Link>
        </div>

        {/* Category Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 16,
        }}>
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="card"
                style={{
                  padding: 24, textAlign: 'center', cursor: 'pointer',
                  animationDelay: `${i * 0.05}s`,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Glow effect */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: cat.color, opacity: 0.6,
                }} />

                {/* Icon */}
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: `${cat.color}15`,
                  border: `1px solid ${cat.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: '1.8rem',
                  transition: 'all 0.3s ease',
                }}>
                  {cat.icon}
                </div>

                <p className="font-display" style={{
                  fontWeight: 700, fontSize: '0.85rem',
                  color: 'var(--text-1)', lineHeight: 1.3,
                }}>
                  {cat.label}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}