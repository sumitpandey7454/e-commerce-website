import HeroSection from '../components/home/HeroSection';
import CategoryGrid from '../components/home/CategoryGrid';
import FeaturedProducts from '../components/home/FeaturedProducts';

// Scrolling ticker
function Ticker() {
  const items = ['Free Delivery on orders above ₹499', '10 Categories', '2M+ Products', 'Trusted Sellers', 'Easy Returns', 'Secure Payments via Razorpay', '500K+ Happy Customers'];
  return (
    <div style={{
      background: 'var(--primary)', color: 'white',
      padding: '10px 0', overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        display: 'flex', gap: 60, whiteSpace: 'nowrap',
        animation: 'marquee 30s linear infinite',
        width: 'max-content',
      }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
            ★ {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// Why choose us section
function WhyUs() {
  const features = [
    { icon: '🚀', title: 'Lightning Fast Delivery', desc: 'Get your orders delivered within 24-48 hours with our express network.' },
    { icon: '🔒', title: '100% Secure Payments', desc: 'Powered by Razorpay — UPI, cards, net banking, EMI, and more.' },
    { icon: '↩️', title: '30-Day Easy Returns', desc: 'Not happy? Return hassle-free within 30 days. No questions asked.' },
    { icon: '🏪', title: 'Verified Sellers Only', desc: 'Every seller is verified. Quality products, genuine listings.' },
    { icon: '💬', title: '24/7 Customer Support', desc: 'Chat, email, or call — our team is always ready to help.' },
    { icon: '🎯', title: 'Best Price Guarantee', desc: 'Find it cheaper? We\'ll match the price. Always the best deal.' },
  ];

  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="badge badge-success" style={{ marginBottom: 12 }}>Why SmartShop</span>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800 }}>
            Shopping Made <span className="text-gradient">Better</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ padding: 28 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(255,79,10,0.1)', border: '1px solid rgba(255,79,10,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 className="font-display" style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>
                {f.title}
              </h3>
              <p style={{ color: 'var(--text-3)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Become a seller CTA
function SellerCTA() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, var(--bg-3) 0%, var(--bg-2) 100%)',
      padding: '80px 0',
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="orb" style={{ width: 400, height: 400, background: 'var(--primary)', right: -80, top: -80 }} />
      <div className="orb" style={{ width: 300, height: 300, background: 'var(--accent)', left: -60, bottom: -60, opacity: 0.06 }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <span className="badge badge-warning" style={{ marginBottom: 16 }}>For Sellers</span>
            <h2 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
              Start Selling on<br />
              <span className="text-gradient">SmartShop Today</span>
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 32, maxWidth: 440 }}>
              Join 50,000+ sellers already growing their business. Upload products, manage orders, and reach millions of buyers across India.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => window.scrollTo(0,0)}
              >
                🏪 Start Selling Free
              </button>
              <button className="btn btn-outline btn-lg">
                Learn More →
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Zero Listing Fee', icon: '🆓', desc: 'List unlimited products at no cost' },
              { label: 'Fast Payouts', icon: '💰', desc: 'Get paid within 7 business days' },
              { label: 'Seller Dashboard', icon: '📊', desc: 'Real-time analytics & insights' },
              { label: 'Pan-India Reach', icon: '🗺️', desc: 'Sell to buyers across 200+ cities' },
            ].map(item => (
              <div key={item.label} className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{item.icon}</div>
                <h4 className="font-display" style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>
                  {item.label}
                </h4>
                <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonials
function Testimonials() {
  const reviews = [
    { name: 'Priya S.', city: 'Mumbai', text: 'Amazing quality products and lightning fast delivery. SmartShop is my go-to for everything!', rating: 5, avatar: '👩' },
    { name: 'Rahul M.', city: 'Delhi', text: 'As a seller, the dashboard is super easy. My sales doubled in the first month!', rating: 5, avatar: '👨' },
    { name: 'Anjali K.', city: 'Bangalore', text: 'Returns are absolutely hassle-free. Great customer support, highly recommend!', rating: 4, avatar: '👩🏫' },
    { name: 'Vikram T.', city: 'Chennai', text: 'Best deals on electronics. Got my laptop at 30% off with easy EMI options.', rating: 5, avatar: '🧑' },
  ];

  return (
    <section className="section" style={{ background: 'var(--bg-2)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="badge badge-info" style={{ marginBottom: 12 }}>Reviews</span>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800 }}>
            What Our <span className="text-gradient">Customers Say</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {reviews.map((r, i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: s <= r.rating ? 'var(--accent)' : 'var(--border-hover)', fontSize: '1rem' }}>★</span>
                ))}
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 16 }}>
                "{r.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.5rem' }}>{r.avatar}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{r.name}</p>
                  <p style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>{r.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// App download CTA
function AppCTA() {
  return (
    <section style={{ padding: '80px 0', background: 'var(--bg-3)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: 24 }}>📱</div>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 16 }}>
            Shop on the <span className="text-gradient">Go</span>
          </h2>
          <p style={{ color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 32 }}>
            Download the SmartShop app for exclusive deals, faster checkout, and real-time order tracking.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-outline btn-lg">
              🍎 App Store
            </button>
            <button className="btn btn-outline btn-lg">
              🤖 Google Play
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main style={{ paddingTop: 64 }}>
      <Ticker />
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts />
      <WhyUs />
      <SellerCTA />
      <Testimonials />
      <AppCTA />
    </main>
  );
}