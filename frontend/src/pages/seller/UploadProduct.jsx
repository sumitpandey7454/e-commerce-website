import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../utils/constants';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function UploadProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', price: '', originalPrice: '',
    category: '', stock: '', brand: '', tags: '',
  });

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.stock) {
      return toast.error('Please fill all required fields');
    }
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      // Attach images if any
      const fileInput = document.querySelector('#product-images');
      if (fileInput?.files) {
        Array.from(fileInput.files).forEach(f => data.append('images', f));
      }
      await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Product uploaded successfully! 🎉');
      navigate('/seller');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload product');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'var(--bg-3)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-md)', color: 'var(--text-1)',
    fontSize: '0.9rem', fontFamily: 'var(--font-body)', outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block', fontSize: '0.8rem', fontWeight: 700,
    color: 'var(--text-3)', textTransform: 'uppercase',
    letterSpacing: '0.06em', marginBottom: 6,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <div className="container" style={{ maxWidth: 860, paddingTop: 32, paddingBottom: 48 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button onClick={() => navigate('/seller')} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '0.875rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Back to Dashboard
          </button>
          <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800 }}>
            Upload New <span className="text-gradient">Product</span>
          </h1>
          <p style={{ color: 'var(--text-3)', marginTop: 6 }}>Fill in the details below to list your product on ShopVerse</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Images Upload */}
              <div className="card" style={{ padding: 24 }}>
                <h3 className="font-display" style={{ fontWeight: 700, marginBottom: 16 }}>Product Images</h3>
                <div style={{
                  border: '2px dashed var(--border)', borderRadius: 'var(--r-md)',
                  padding: 32, textAlign: 'center', cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onDragLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  onClick={() => document.querySelector('#product-images').click()}
                >
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>📸</div>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>Drop images here or click to upload</p>
                  <p style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>Up to 5 images · PNG, JPG, WEBP</p>
                  <input id="product-images" type="file" multiple accept="image/*" onChange={handleImages} style={{ display: 'none' }} />
                </div>

                {imagePreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                    {imagePreviews.map((src, i) => (
                      <div key={i} style={{ width: 70, height: 70, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                        <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {i === 0 && (
                          <span style={{ position: 'absolute', bottom: 2, left: 2, background: 'var(--primary)', color: 'white', fontSize: '0.55rem', fontWeight: 700, padding: '1px 5px', borderRadius: 4 }}>MAIN</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="card" style={{ padding: 24 }}>
                <h3 className="font-display" style={{ fontWeight: 700, marginBottom: 16 }}>Pricing & Stock</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Selling Price (₹) *</label>
                    <input value={form.price} onChange={e => setField('price', e.target.value)}
                      type="number" min="1" required placeholder="e.g. 2999"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Original Price (₹)</label>
                    <input value={form.originalPrice} onChange={e => setField('originalPrice', e.target.value)}
                      type="number" min="1" placeholder="MRP / Strikethrough"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>Stock Quantity *</label>
                    <input value={form.stock} onChange={e => setField('stock', e.target.value)}
                      type="number" min="0" required placeholder="Available units"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                </div>
                {form.price && form.originalPrice && Number(form.originalPrice) > Number(form.price) && (
                  <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(34,197,94,0.1)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)' }}>
                    <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>
                      ✓ {Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)}% discount will be shown to buyers
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Product Info */}
              <div className="card" style={{ padding: 24 }}>
                <h3 className="font-display" style={{ fontWeight: 700, marginBottom: 16 }}>Product Details</h3>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Product Name *</label>
                  <input value={form.name} onChange={e => setField('name', e.target.value)}
                    required placeholder="e.g. Wireless Noise Cancelling Headphones"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Category *</label>
                  <select value={form.category} onChange={e => setField('category', e.target.value)} required
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Brand</label>
                  <input value={form.brand} onChange={e => setField('brand', e.target.value)}
                    placeholder="e.g. Sony, Nike, Samsung"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Description *</label>
                  <textarea value={form.description} onChange={e => setField('description', e.target.value)}
                    required rows={5} placeholder="Describe your product in detail — features, material, dimensions, what's included..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Tags (comma-separated)</label>
                  <input value={form.tags} onChange={e => setField('tags', e.target.value)}
                    placeholder="e.g. wireless, bluetooth, premium, gift"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '16px', fontSize: '1rem', fontWeight: 700 }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <span className="animate-spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
                    Uploading...
                  </span>
                ) : '🚀 Publish Product'}
              </button>
              <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', textAlign: 'center' }}>
                Your product will be visible to buyers immediately after publishing.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}