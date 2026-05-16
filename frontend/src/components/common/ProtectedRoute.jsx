import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
        <div className="animate-spin" style={{ width:40, height:40, border:'3px solid var(--border)', borderTopColor:'var(--primary)', borderRadius:'50%' }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}