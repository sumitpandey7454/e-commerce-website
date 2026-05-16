import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StarIcon = ({ filled }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return toast.error('Out of stock');
    addItem(product);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(w => !w);
    toast.success(wishlist ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  return (
    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="card"
        style={{ overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
      >
        {/* Image */}
        <div style={{
          position: 'relative', height: 200, background: 'var(--bg-3)',
          overflow: 'hidden',
        }}>
          {!imgError && product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem', background: 'var(--bg-2)',
            }}>📦</div>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {discount > 0 && (
              <span style={{
                background: 'var(--danger)', color: 'white',
                fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px',
                borderRadius: 99, letterSpacing: '0.04em',
              }}>
                -{discount}%
              </span>
            )}
            {product.stock === 0 && (
              <span style={{
                background: 'rgba(0,0,0,0.7)', color: 'white',
                fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px',
                borderRadius: 99,
              }}>
                OUT OF STOCK
              </span>
            )}
            {product.featured && (
              <span style={{
                background: 'var(--accent)', color: '#1a1a00',
                fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px',
                borderRadius: 99,
              }}>
                ⭐ FEATURED
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: wishlist ? '#EF4444' : 'white',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', transition: 'all 0.2s',
            }}
          >
            {wishlist ? '❤️' : '🤍'}
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px' }}>
          {/* Category */}
          <span style={{
            fontSize: '0.7rem', color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
          }}>
            {product.category}
          </span>

          {/* Name */}
          <h3 style={{
            fontWeight: 600, fontSize: '0.9rem', marginTop: 4, marginBottom: 8,
            lineHeight: 1.4, color: 'var(--text-1)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
              <div className="stars">
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: s <= Math.round(product.rating) ? 'var(--accent)' : 'var(--border-hover)' }}>
                    <StarIcon filled={s <= Math.round(product.rating)} />
                  </span>
                ))}
              </div>
              <span style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>
                ({product.numReviews || 0})
              </span>
            </div>
          )}

          {/* Price + Cart */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span style={{ color: 'var(--text-3)', fontSize: '0.75rem', textDecoration: 'line-through', marginLeft: 6 }}>
                  ₹{product.originalPrice?.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: product.stock === 0 ? 'var(--bg-3)' : 'var(--primary)',
                border: 'none', color: 'white', cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', flexShrink: 0,
                opacity: product.stock === 0 ? 0.5 : 1,
              }}
              onMouseEnter={e => product.stock > 0 && (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <CartIcon />
            </button>
          </div>

          {/* Seller info */}
          {product.seller?.name && (
            <p style={{ color: 'var(--text-3)', fontSize: '0.72rem', marginTop: 8 }}>
              by {product.seller.name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}