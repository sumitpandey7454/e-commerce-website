import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name:      user?.name || '',
    phone:     user?.phone || '',
    storeName: user?.storeName || '',
    storeDesc: user?.storeDesc || '',
  });

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const setField  = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setPwField = (k, v) => setPwForm(p => ({ ...p, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setSaving(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'var(--bg-3)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-md)', color: 'var(--text-1)',
    fontSize: '0.875rem', fontFamily: 'var(--font-body)', outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
  };

  const ROLE_COLORS = { buyer: 'var(--info)', seller: 'var(--warning)', admin: 'var(--primary)' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <div className="container" style={{ maxWidth: 700, paddingTop: 40, paddingBottom: 48 }}>

        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 800, color: 'white', flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800 }}>{user?.name}</h1>
            <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', marginTop: 2 }}>{user?.email || user?.phone}</p>
            <span style={{
              display: 'inline-block', marginTop: 6, padding: '3px 12px', borderRadius: 99,
              fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize',
              background: `${ROLE_COLORS[user?.role]}20`, color: ROLE_COLORS[user?.role],
            }}>{user?.role}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--bg-3)', borderRadius: 'var(--r-md)', padding: 4, width: 'fit-content' }}>
          {['profile', 'security'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 20px', borderRadius: 'var(--r-sm)', border: 'none',
              background: tab === t ? 'var(--primary)' : 'transparent',
              color: tab === t ? 'white' : 'var(--text-3)',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
              fontFamily: 'var(--font-display)', textTransform: 'capitalize', transition: 'all 0.2s',
            }}>{t === 'profile' ? '👤 Profile' : '🔒 Security'}</button>
          ))}
        </div>

        {tab === 'profile' && (
          <form onSubmit={handleSave}>
            <div className="card" style={{ padding: 28 }}>
              <h2 className="font-display" style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>Personal Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input value={form.name} onChange={e => setField('name', e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input value={form.phone} onChange={e => setField('phone', e.target.value.replace(/\D/g,''))}
                    maxLength={10} placeholder="10-digit number" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Email</label>
                  <input value={user?.email || ''} disabled
                    style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
                  <p style={{ color: 'var(--text-3)', fontSize: '0.72rem', marginTop: 4 }}>Email cannot be changed</p>
                </div>
              </div>

              {user?.role === 'seller' && (
                <>
                  <div className="divider" style={{ margin: '24px 0' }} />
                  <h3 className="font-display" style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16 }}>🏪 Store Information</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Store Name</label>
                      <input value={form.storeName} onChange={e => setField('storeName', e.target.value)}
                        placeholder="Your store name" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Store Description</label>
                      <textarea value={form.storeDesc} onChange={e => setField('storeDesc', e.target.value)}
                        rows={3} placeholder="Describe your store..." style={{ ...inputStyle, resize: 'vertical' }}
                        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  </div>
                </>
              )}

              <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: 24 }}>
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        )}

        {tab === 'security' && (
          <form onSubmit={handleChangePassword}>
            <div className="card" style={{ padding: 28 }}>
              <h2 className="font-display" style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>Change Password</h2>
              {!user?.googleId ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { key: 'currentPassword', label: 'Current Password', placeholder: 'Your current password' },
                    { key: 'newPassword',      label: 'New Password',     placeholder: 'At least 8 characters' },
                    { key: 'confirmPassword',  label: 'Confirm Password', placeholder: 'Repeat new password' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={labelStyle}>{f.label}</label>
                      <input type="password" value={pwForm[f.key]} onChange={e => setPwField(f.key, e.target.value)}
                        placeholder={f.placeholder} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  ))}
                  <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                    {saving ? 'Changing...' : '🔒 Change Password'}
                  </button>
                </div>
              ) : (
                <div style={{ padding: '24px', background: 'var(--bg-3)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <p style={{ fontSize: '2rem', marginBottom: 12 }}>🔗</p>
                  <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
                    Your account is linked with Google. Password management is handled by Google.
                  </p>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}