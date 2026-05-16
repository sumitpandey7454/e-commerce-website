import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages — Public
import Home           from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail  from './pages/ProductDetail';
import CategoryPage   from './pages/CategoryPage';
import Checkout       from './pages/Checkout';
import Profile        from './pages/Profile';

// Buyer
import BuyerDashboard from './pages/buyer/BuyerDashboard';

// Seller
import SellerDashboard from './pages/seller/SellerDashboard';
import UploadProduct   from './pages/seller/UploadProduct';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', paddingTop: 80, textAlign: 'center',
    }}>
      <div style={{ fontSize: '6rem', marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>🚀</div>
      <h1 className="font-display text-3d" style={{ fontSize: '5rem', color: 'var(--primary)', marginBottom: 8, lineHeight: 1 }}>404</h1>
      <h2 className="font-display" style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: 12 }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-3)', marginBottom: 28, maxWidth: 360 }}>
        Looks like this page drifted off into the cosmos. Let's get you back on track.
      </p>
      <a href="/" className="btn btn-primary btn-lg">🏠 Go Back Home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />

          <Routes>
            {/* ── Public ── */}
            <Route path="/"               element={<Home />} />
            <Route path="/products"       element={<ProductListing />} />
            <Route path="/product/:id"    element={<ProductDetail />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />

            {/* ── Checkout (buyers only) ── */}
            <Route path="/checkout" element={
              <ProtectedRoute roles={['buyer']}>
                <Checkout />
              </ProtectedRoute>
            } />

            {/* ── Profile (any logged-in user) ── */}
            <Route path="/profile" element={
              <ProtectedRoute roles={['buyer','seller','admin']}>
                <Profile />
              </ProtectedRoute>
            } />

            {/* ── Buyer ── */}
            <Route path="/buyer"        element={<ProtectedRoute roles={['buyer']}><BuyerDashboard /></ProtectedRoute>} />
            <Route path="/buyer/orders" element={<ProtectedRoute roles={['buyer']}><BuyerDashboard /></ProtectedRoute>} />

            {/* ── Seller ── */}
            <Route path="/seller"          element={<ProtectedRoute roles={['seller']}><SellerDashboard /></ProtectedRoute>} />
            <Route path="/seller/upload"   element={<ProtectedRoute roles={['seller']}><UploadProduct /></ProtectedRoute>} />
            <Route path="/seller/edit/:id" element={<ProtectedRoute roles={['seller']}><UploadProduct /></ProtectedRoute>} />

            {/* ── Admin ── */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Footer />

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background:    'var(--bg-card)',
                color:         'var(--text-1)',
                border:        '1px solid var(--border)',
                borderRadius:  '12px',
                fontFamily:    'var(--font-body)',
                fontSize:      '0.875rem',
                boxShadow:     'var(--shadow-card)',
              },
              success: { iconTheme: { primary: '#22C55E', secondary: 'white' } },
              error:   { iconTheme: { primary: '#EF4444', secondary: 'white' } },
              loading: { iconTheme: { primary: 'var(--primary)', secondary: 'white' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}