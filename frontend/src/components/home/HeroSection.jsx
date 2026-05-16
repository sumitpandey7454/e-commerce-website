import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const slides = [
  {
    headline: 'Shop The Future',
    sub: 'Discover millions of products',
    accent: 'Today',
    bg: 'radial-gradient(ellipse at 30% 50%, rgba(255,79,10,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,215,0,0.06) 0%, transparent 50%)',
    emoji: '🚀',
  },
  {
    headline: 'Style That',
    sub: 'Fashion for every occasion',
    accent: 'Speaks',
    bg: 'radial-gradient(ellipse at 70% 50%, rgba(236,72,153,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 20%, rgba(168,85,247,0.06) 0%, transparent 50%)',
    emoji: '✨',
  },
  {
    headline: 'Deals That',
    sub: 'Best prices, guaranteed',
    accent: 'Amaze',
    bg: 'radial-gradient(ellipse at 50% 60%, rgba(16,185,129,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 10%, rgba(59,130,246,0.06) 0%, transparent 50%)',
    emoji: '⚡',
  },
];

const stats = [
  { label: 'Products Listed', value: '2M+' },
  { label: 'Happy Buyers', value: '500K+' },
  { label: 'Trusted Sellers', value: '50K+' },
  { label: 'Cities Covered', value: '200+' },
];

export default function HeroSection() {
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setSlide(s => (s + 1) % slides.length);
        setAnimating(false);
      }, 300);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const current = slides[slide];

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: 80,
    }}>
      {/* Dynamic BG */}
      <div style={{
        position: 'absolute', inset: 0,
        background: current.bg,
        transition: 'background 1s ease',
        pointerEvents: 'none',
      }} />

      {/* Grid Pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Floating Orbs */}
      <div className="orb" style={{ width:400, height:400, background:'var(--primary)', top:-100, right:-100, opacity:0.08 }} />
      <div className="orb" style={{ width:300, height:300, background:'var(--accent)', bottom:100, left:-80, opacity:0.06 }} />

      <div className="container" style={{ zIndex:1 }}>
        <div style={{
          maxWidth: 760,
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(20px)' : 'translateY(0)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}>
          {/* Pre-headline badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,79,10,0.1)', border: '1px solid rgba(255,79,10,0.2)',
            borderRadius: 99, padding: '6px 16px', marginBottom: 24,
            fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)',
            letterSpacing: '0.04em',
          }}>
            <span style={{ animation: 'pulse-ring 2s infinite' }}>●</span>
            🇮🇳 India's Fastest Growing Marketplace
          </div>

          {/* Main Headline */}
          <h1 className="font-display" style={{
            fontSize: 'clamp(3rem, 7vw, 5.5rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: 8,
            letterSpacing: '-0.02em',
          }}>
            {current.headline}
          </h1>
          <h1 className="font-display text-gradient" style={{
            fontSize: 'clamp(3rem, 7vw, 5.5rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: 24,
            letterSpacing: '-0.02em',
          }}>
            {current.accent} {current.emoji}
          </h1>

          <p style={{
            fontSize: '1.15rem', color: 'var(--text-2)',
            lineHeight: 1.7, maxWidth: 480, marginBottom: 36,
          }}>
            {current.sub} — electronics, fashion, books, shoes & more. Start shopping or start selling today.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary btn-lg">
              🛒 Shop Now
            </Link>
            <Link to="/products" className="btn btn-outline btn-lg" style={{ padding: '16px 32px' }}>
              Explore Deals →
            </Link>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 20, marginTop: 36, flexWrap: 'wrap' }}>
            {['Free Delivery', 'Easy Returns', 'Secure Payment', '24/7 Support'].map(badge => (
              <div key={badge} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                color: 'var(--text-3)', fontSize: '0.8rem',
              }}>
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span> {badge}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1, marginTop: 72, maxWidth: 600,
          background: 'var(--border)',
          borderRadius: 'var(--r-lg)', overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{
              background: 'var(--bg-card)', padding: '20px 16px', textAlign: 'center',
            }}>
              <p className="font-display" style={{
                fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)',
                lineHeight: 1,
              }}>
                {s.value}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 4, lineHeight: 1.3 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 8, zIndex: 1,
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            style={{
              width: i === slide ? 24 : 8, height: 8, borderRadius: 99,
              background: i === slide ? 'var(--primary)' : 'var(--border-hover)',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </section>
  );
}