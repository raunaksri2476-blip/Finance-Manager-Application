import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wallet } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center select-none font-sans">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 flex items-center justify-center mb-4 animate-pulse shadow-lg shadow-purple-900/40">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-extrabold text-lg tracking-tight text-white font-sans">FINANCE MANAGER</h1>
        <p className="text-xs text-zinc-400 mt-1 font-medium">Loading your financial workspace...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const PublicAuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center select-none font-sans">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 flex items-center justify-center mb-4 animate-pulse shadow-lg shadow-purple-900/40">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-extrabold text-lg tracking-tight text-white font-sans">FINANCE MANAGER</h1>
        <p className="text-xs text-zinc-400 mt-1 font-medium">Loading your financial workspace...</p>
      </div>
    );
  }

  if (user) {
    if (profile?.role === 'admin' || profile?.isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center select-none font-sans">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-400 flex items-center justify-center mb-4 animate-pulse shadow-lg shadow-purple-900/40">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-extrabold text-lg tracking-tight text-white font-sans">FINANCE MANAGER</h1>
        <p className="text-xs text-zinc-400 mt-1 font-medium">Verifying administrator credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role !== 'admin' && !profile?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
