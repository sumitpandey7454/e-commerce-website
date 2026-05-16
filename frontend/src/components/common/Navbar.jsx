import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { CATEGORIES, ROLES } from '../../utils/constants';
import LoginModal from '../auth/LoginModal';
import CartSidebar from '../cart/CartSidebar';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

export default function Navbar() {
  const { user, logout, isAdmin, isSeller, isBuyer } = useAuth();
  const { itemCount, setIsOpen: setCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginRole, setLoginRole] = useState('buyer');

  const userMenuRef = useRef(null);
  const categoryRef = useRef(null);
  const loginDropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setShowCategoryMenu(false);
      if (loginDropRef.current && !loginDropRef.current.contains(e.target)) setShowLoginDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isSeller) return '/seller';
    return '/buyer';
  };

  const handleLoginClick = (role) => {
    setLoginRole(role);
    setShowLoginDropdown(false);
    setShowLoginModal(true);
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(10,10,15,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', height:64, gap:16 }}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration:'none', flexShrink:0 }}>
              <span className="text-3d" style={{ fontSize:'1.6rem', color:'var(--text-1)' }}>
Smart<span style={{ color:'var(--primary)' }}>Shop</span>              </span>
            </Link>

            {/* Categories Dropdown */}
            <div ref={categoryRef} style={{ position:'relative', display:'flex', alignItems:'center' }}>
              <button
                onClick={() => setShowCategoryMenu(v => !v)}
                style={{
                  display:'flex', alignItems:'center', gap:6,
                  background:'none', border:'none', color:'var(--text-2)',
                  cursor:'pointer', font:'inherit', fontSize:'0.9rem', padding:'8px 12px',
                  borderRadius:'var(--r-sm)', transition:'color 0.2s',
                }}
                onMouseEnter={e => e.target.style.color = 'var(--text-1)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-2)'}
              >
                Categories <ChevronDown />
              </button>
              {showCategoryMenu && (
                <div style={{
                  position:'absolute', top:'calc(100% + 8px)', left:0,
                  background:'var(--bg-card)', border:'1px solid var(--border)',
                  borderRadius:'var(--r-lg)', padding:16, minWidth:280,
                  display:'grid', gridTemplateColumns:'1fr 1fr', gap:4,
                  boxShadow:'var(--shadow-card)', animation:'fadeInUp 0.2s ease',
                }}>
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.id}`}
                      onClick={() => setShowCategoryMenu(false)}
                      style={{
                        display:'flex', alignItems:'center', gap:8, padding:'10px 12px',
                        borderRadius:'var(--r-sm)', textDecoration:'none', color:'var(--text-2)',
                        fontSize:'0.85rem', transition:'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.color = 'var(--text-1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
                    >
                      <span>{cat.icon}</span> {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ flex:1, maxWidth:480, display:'flex', position:'relative' }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products, brands..."
                style={{
                  width:'100%', padding:'10px 16px 10px 44px',
                  background:'var(--bg-3)', border:'1px solid var(--border)',
                  borderRadius:99, color:'var(--text-1)', fontSize:'0.875rem',
                  outline:'none', fontFamily:'var(--font-body)', transition:'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', display:'flex' }}>
                <SearchIcon />
              </span>
            </form>

            {/* Right Actions */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                style={{
                  position:'relative', background:'none', border:'none',
                  color:'var(--text-2)', cursor:'pointer', padding:10,
                  borderRadius:'var(--r-sm)', display:'flex',
                  transition:'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
              >
                <CartIcon />
                {itemCount > 0 && (
                  <span style={{
                    position:'absolute', top:4, right:4,
                    background:'var(--primary)', color:'white',
                    fontSize:'0.65rem', fontWeight:700,
                    width:18, height:18, borderRadius:'50%',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* User Menu or Login */}
              {user ? (
                <div ref={userMenuRef} style={{ position:'relative' }}>
                  <button
                    onClick={() => setShowUserMenu(v => !v)}
                    style={{
                      display:'flex', alignItems:'center', gap:8,
                      background:'var(--bg-3)', border:'1px solid var(--border)',
                      borderRadius:99, padding:'6px 14px 6px 8px',
                      color:'var(--text-1)', cursor:'pointer', transition:'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{
                      width:28, height:28, borderRadius:'50%',
                      background:'var(--primary)', display:'flex',
                      alignItems:'center', justifyContent:'center',
                      fontSize:'0.75rem', fontWeight:700, color:'white',
                    }}>
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontSize:'0.85rem', fontWeight:500 }}>{user.name?.split(' ')[0]}</span>
                    <ChevronDown />
                  </button>
                  {showUserMenu && (
                    <div style={{
                      position:'absolute', top:'calc(100% + 8px)', right:0,
                      background:'var(--bg-card)', border:'1px solid var(--border)',
                      borderRadius:'var(--r-lg)', padding:8, minWidth:200,
                      boxShadow:'var(--shadow-card)', animation:'fadeInUp 0.2s ease',
                    }}>
                      <div style={{ padding:'8px 12px 12px', borderBottom:'1px solid var(--border)', marginBottom:8 }}>
                        <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-1)' }}>{user.name}</p>
                        <p style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:2 }}>{user.email}</p>
                        <span className="badge badge-primary" style={{ marginTop:6, textTransform:'capitalize' }}>{user.role}</span>
                      </div>
                      {[
                        { label:'Dashboard', path: getDashboardLink() },
                        { label:'My Orders', path:'/buyer/orders', hide: !isBuyer },
                        { label:'My Products', path:'/seller/products', hide: !isSeller },
                        { label:'Profile', path:'/profile' },
                      ].filter(i => !i.hide).map(item => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display:'block', padding:'10px 12px', borderRadius:'var(--r-sm)',
                            textDecoration:'none', color:'var(--text-2)', fontSize:'0.875rem',
                            transition:'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.color = 'var(--text-1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <div style={{ borderTop:'1px solid var(--border)', marginTop:8, paddingTop:8 }}>
                        <button
                          onClick={() => { setShowUserMenu(false); logout(); navigate('/'); }}
                          style={{
                            width:'100%', textAlign:'left', padding:'10px 12px',
                            borderRadius:'var(--r-sm)', background:'none', border:'none',
                            color:'var(--danger)', cursor:'pointer', fontSize:'0.875rem',
                            transition:'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div ref={loginDropRef} style={{ position:'relative' }}>
                  <button
                    onClick={() => setShowLoginDropdown(v => !v)}
                    style={{
                      display:'flex', alignItems:'center', gap:8,
                      background:'var(--primary)', border:'none',
                      borderRadius:99, padding:'8px 18px',
                      color:'white', cursor:'pointer', fontSize:'0.875rem',
                      fontWeight:600, fontFamily:'var(--font-display)',
                      transition:'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dark)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
                  >
                    <UserIcon /> Login <ChevronDown />
                  </button>
                  {showLoginDropdown && (
                    <div style={{
                      position:'absolute', top:'calc(100% + 8px)', right:0,
                      background:'var(--bg-card)', border:'1px solid var(--border)',
                      borderRadius:'var(--r-lg)', padding:8, minWidth:180,
                      boxShadow:'var(--shadow-card)', animation:'fadeInUp 0.2s ease',
                    }}>
                      <p style={{ padding:'8px 12px 4px', fontSize:'0.75rem', color:'var(--text-3)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                        Login as
                      </p>
                      {['buyer','seller','admin'].map(role => (
                        <button
                          key={role}
                          onClick={() => handleLoginClick(role)}
                          style={{
                            width:'100%', textAlign:'left', padding:'10px 12px',
                            borderRadius:'var(--r-sm)', background:'none', border:'none',
                            color:'var(--text-2)', cursor:'pointer', fontSize:'0.875rem',
                            textTransform:'capitalize', transition:'all 0.15s',
                            display:'flex', alignItems:'center', gap:8,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.color = 'var(--text-1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
                        >
                          <span style={{ fontSize:'1rem' }}>
                            {role === 'buyer' ? '🛒' : role === 'seller' ? '🏪' : '⚙️'}
                          </span>
                          {role}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          defaultRole={loginRole}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      )}
      <CartSidebar />
    </>
  );
}