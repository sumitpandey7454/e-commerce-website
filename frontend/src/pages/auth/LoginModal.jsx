import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function LoginModal({ onClose, onSuccess, defaultRole = 'buyer' }) {
  const { login, register, sendOtp, verifyOtp, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState(defaultRole);
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', otp:'' });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      const id = setTimeout(() => setTimer(t => t - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timer]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const getRedirectPath = (userRole) => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'seller') return '/seller';
    return '/buyer';
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ email: form.email, password: form.password, role });
      toast.success(`Welcome back, ${user.name}!`);
      onSuccess?.();
      navigate(getRedirectPath(user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('All fields required');
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password, role });
      toast.success(`Welcome to SmartShop, ${user.name}!`);
      onSuccess?.();
      navigate(getRedirectPath(user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!form.phone || form.phone.length < 10) return toast.error('Enter valid 10-digit phone number');
    setLoading(true);
    try {
      await sendOtp(form.phone);
      setOtpSent(true);
      setTimer(30);
      toast.success('OTP sent to your phone');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!form.otp) return toast.error('Enter OTP');
    setLoading(true);
    try {
      const user = await verifyOtp(form.phone, form.otp, role);
      toast.success(`Welcome, ${user.name}!`);
      onSuccess?.();
      navigate(getRedirectPath(user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Google Login ──
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const user = await googleLogin(tokenResponse.access_token);
        toast.success(`Welcome, ${user.name}!`);
        onSuccess?.();
        navigate(getRedirectPath(user.role));
      } catch (err) {
        toast.error('Google login failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error('Google login failed'),
  });

  const inputStyle = {
    width:'100%', padding:'12px 16px',
    background:'var(--bg-3)', border:'1px solid var(--border)',
    borderRadius:'var(--r-md)', color:'var(--text-1)',
    fontSize:'0.9rem', fontFamily:'var(--font-body)', outline:'none',
    transition:'border-color 0.2s', marginBottom:12,
  };

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:2000,
      background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:16, animation:'fadeIn 0.2s ease',
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:'var(--bg-card)', border:'1px solid var(--border)',
        borderRadius:'var(--r-xl)', padding:32, width:'100%', maxWidth:440,
        animation:'fadeInUp 0.3s ease', position:'relative',
      }}>
        <button onClick={onClose} style={{
          position:'absolute', top:16, right:16, background:'var(--bg-3)',
          border:'1px solid var(--border)', borderRadius:'50%', width:32, height:32,
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'var(--text-2)', cursor:'pointer',
        }}>
          <XIcon />
        </button>

        <div style={{ marginBottom:24 }}>
          <h2 className="font-display" style={{ fontSize:'1.6rem', fontWeight:800, marginBottom:4 }}>
            {mode === 'register' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ color:'var(--text-3)', fontSize:'0.875rem' }}>
            {mode === 'register' ? 'Join SmartShop today' : 'Sign in to continue'}
          </p>
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:24, background:'var(--bg-3)', borderRadius:'var(--r-md)', padding:4 }}>
          {[
            { v:'buyer', icon:'🛒', label:'Buyer' },
            { v:'seller', icon:'🏪', label:'Seller' },
            { v:'admin', icon:'⚙️', label:'Admin' },
          ].map(r => (
            <button key={r.v} onClick={() => setRole(r.v)} style={{
              flex:1, padding:'8px 0', borderRadius:'var(--r-sm)', border:'none',
              background: role === r.v ? 'var(--primary)' : 'transparent',
              color: role === r.v ? 'white' : 'var(--text-3)',
              cursor:'pointer', fontSize:'0.8rem', fontWeight:600,
              transition:'all 0.2s', fontFamily:'var(--font-display)',
            }}>
              {r.icon} {r.label}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', marginBottom:24, borderBottom:'1px solid var(--border)' }}>
          {[
            { v:'login', label:'Email Login' },
            { v:'otp', label:'Phone OTP' },
            { v:'register', label:'Register' },
          ].map(tab => (
            <button key={tab.v} onClick={() => { setMode(tab.v); setOtpSent(false); }} style={{
              flex:1, padding:'10px 0', background:'none', border:'none',
              borderBottom: mode === tab.v ? '2px solid var(--primary)' : '2px solid transparent',
              color: mode === tab.v ? 'var(--primary)' : 'var(--text-3)',
              cursor:'pointer', fontSize:'0.8rem', fontWeight:600,
              fontFamily:'var(--font-display)', transition:'all 0.2s', marginBottom:-1,
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {mode === 'login' && (
          <form onSubmit={handleEmailLogin}>
            <input type="email" placeholder="Email address" required
              value={form.email} onChange={e => setField('email', e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <input type="password" placeholder="Password" required
              value={form.password} onChange={e => setField('password', e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button type="submit" className="btn btn-primary" style={{ width:'100%', marginTop:4 }} disabled={loading}>
              {loading ? 'Signing in...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>
          </form>
        )}

        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <input type="tel" placeholder="Phone number (10 digits)" maxLength={10}
                value={form.phone} onChange={e => setField('phone', e.target.value.replace(/\D/g,''))}
                style={{ ...inputStyle, marginBottom:0, flex:1 }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                disabled={otpSent}
              />
              <button type="button" onClick={handleSendOtp}
                disabled={loading || (otpSent && timer > 0)}
                style={{
                  padding:'12px 16px', background:'var(--bg-3)',
                  border:'1px solid var(--border)', borderRadius:'var(--r-md)',
                  color: (otpSent && timer > 0) ? 'var(--text-3)' : 'var(--primary)',
                  cursor: (otpSent && timer > 0) ? 'not-allowed' : 'pointer',
                  fontSize:'0.8rem', fontWeight:600, whiteSpace:'nowrap',
                  fontFamily:'var(--font-display)',
                }}
              >
                {loading ? '...' : (otpSent && timer > 0) ? `${timer}s` : otpSent ? 'Resend' : 'Get OTP'}
              </button>
            </div>
            {otpSent && (
              <>
                <input type="text" placeholder="Enter 6-digit OTP" maxLength={6}
                  value={form.otp} onChange={e => setField('otp', e.target.value.replace(/\D/g,''))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="submit" className="btn btn-primary" style={{ width:'100%' }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </>
            )}
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Full Name" required
              value={form.name} onChange={e => setField('name', e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <input type="email" placeholder="Email address" required
              value={form.email} onChange={e => setField('email', e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <input type="password" placeholder="Create password (min 8 chars)" required minLength={8}
              value={form.password} onChange={e => setField('password', e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button type="submit" className="btn btn-primary" style={{ width:'100%' }} disabled={loading}>
              {loading ? 'Creating Account...' : `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>
          </form>
        )}

        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0 16px' }}>
          <div style={{ flex:1, height:1, background:'var(--border)' }} />
          <span style={{ color:'var(--text-3)', fontSize:'0.8rem' }}>or continue with</span>
          <div style={{ flex:1, height:1, background:'var(--border)' }} />
        </div>

        <button
  onClick={() => {
    handleGoogleLogin();
  }}
  disabled={loading}
  style={{
    width:'100%', padding:'12px', background:'white', border:'1px solid var(--border)',
    borderRadius:'var(--r-md)', color:'#333', cursor:'pointer', fontSize:'0.875rem',
    fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:10,
  }}
>
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
  Continue with Google
</button>

        <p style={{ textAlign:'center', color:'var(--text-3)', fontSize:'0.75rem', marginTop:16 }}>
          By continuing, you agree to our{' '}
          <a href="#" style={{ color:'var(--primary)', textDecoration:'none' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="#" style={{ color:'var(--primary)', textDecoration:'none' }}>Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}