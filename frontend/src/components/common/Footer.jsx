import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../utils/constants';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Footer() {
  const [msgForm, setMsgForm] = useState({ name:'', email:'', message:'' });
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msgForm.name || !msgForm.message) return toast.error('Name and message are required');
    setSending(true);
    try {
      await api.post('/messages', msgForm);
      toast.success('Message sent! We\'ll get back to you.');
      setMsgForm({ name:'', email:'', message:'' });
    } catch {
      toast.error('Failed to send message. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <footer style={{ background:'var(--bg-2)', borderTop:'1px solid var(--border)', marginTop:80 }}>
      {/* Contact Us Section */}
      <div style={{ background:'var(--bg-3)', padding:'60px 0' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom:16 }}>📬 Contact Us</span>
              <h2 className="font-display" style={{ fontSize:'2.2rem', fontWeight:800, lineHeight:1.2, marginBottom:16 }}>
                Have a <span className="text-gradient">Question?</span><br/>We're Here to Help
              </h2>
              <p style={{ color:'var(--text-2)', lineHeight:1.8, marginBottom:24 }}>
                Send us a message anytime — no sign-in required. Our support team responds within 24 hours.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[
                  { icon:'📧', label:'sumitpandey7454@gmail.com' },
                  { icon:'📞', label:'+91 7454824558' },
                  { icon:'🕐', label:'Mon–Sat, 9 AM – 6 PM IST' },
                ].map(item => (
                  <div key={item.label} style={{ display:'flex', alignItems:'center', gap:12, color:'var(--text-2)', fontSize:'0.9rem' }}>
                    <span style={{ fontSize:'1.2rem' }}>{item.icon}</span> {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSend} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <input
                  value={msgForm.name}
                  onChange={e => setMsgForm(p => ({ ...p, name:e.target.value }))}
                  placeholder="Your Name *"
                  required
                  className="input"
                />
                <input
                  type="email"
                  value={msgForm.email}
                  onChange={e => setMsgForm(p => ({ ...p, email:e.target.value }))}
                  placeholder="Email (optional)"
                  className="input"
                />
              </div>
              <textarea
                value={msgForm.message}
                onChange={e => setMsgForm(p => ({ ...p, message:e.target.value }))}
                placeholder="Your message... *"
                required
                rows={4}
                className="input"
                style={{ resize:'none' }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sending}
                style={{ alignSelf:'flex-start' }}
              >
                {sending ? 'Sending...' : '🚀 Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div style={{ padding:'48px 0 24px' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:40 }}>
            <div>
              <Link to="/" style={{ textDecoration:'none' }}>
                <span className="text-3d" style={{ fontSize:'1.6rem', color:'var(--text-1)' }}>
                  Smart<span style={{ color:'var(--primary)' }}>Shop</span>
                </span>
              </Link>
              <p style={{ color:'var(--text-3)', fontSize:'0.875rem', lineHeight:1.8, marginTop:16, maxWidth:280 }}>
                Your ultimate shopping destination. Quality products, trusted sellers, seamless experience.
              </p>
            </div>

            <div>
              <h4 className="font-display" style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:16 }}>Categories</h4>
              {CATEGORIES.slice(0,5).map(cat => (
                <Link key={cat.id} to={`/category/${cat.id}`} style={{
                  display:'block', color:'var(--text-3)', textDecoration:'none',
                  fontSize:'0.875rem', padding:'4px 0', transition:'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                >
                  {cat.icon} {cat.label}
                </Link>
              ))}
            </div>

            <div>
              <h4 className="font-display" style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:16 }}>Company</h4>
              {['About Us','Careers','Press','Blog'].map(l => (
                <Link key={l} to="#" style={{
                  display:'block', color:'var(--text-3)', textDecoration:'none',
                  fontSize:'0.875rem', padding:'4px 0',
                }}>{l}</Link>
              ))}
            </div>

            <div>
              <h4 className="font-display" style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:16 }}>Support</h4>
              {['Help Center','Returns','Track Order','Privacy Policy'].map(l => (
                <Link key={l} to="#" style={{
                  display:'block', color:'var(--text-3)', textDecoration:'none',
                  fontSize:'0.875rem', padding:'4px 0',
                }}>{l}</Link>
              ))}
            </div>
          </div>

          <div style={{ borderTop:'1px solid var(--border)', paddingTop:24, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ color:'var(--text-3)', fontSize:'0.8rem' }}>
              © 2025 SmartShop. All rights reserved.
            </p>
            <div style={{ display:'flex', gap:16 }}>
              {['Visa','Mastercard','Razorpay','UPI'].map(p => (
                <span key={p} style={{
                  background:'var(--bg-3)', border:'1px solid var(--border)',
                  borderRadius:4, padding:'3px 8px', fontSize:'0.7rem',
                  color:'var(--text-3)', fontWeight:600,
                }}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}