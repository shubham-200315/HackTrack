import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="h-9 w-9 border-3 border-neutral-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-xs text-neutral-400 mt-4 font-bold uppercase tracking-widest animate-pulse">
          Verifying security keys...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
