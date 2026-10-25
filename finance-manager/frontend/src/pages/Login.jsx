import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@financemanager.com');
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      await login('demo@financemanager.com', 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed. Make sure database is seeded!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 text-2xl font-extrabold">
            ₹
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-500 font-medium">
            Sign in to manage your finances & budgets
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" variant="primary" className="w-full py-3" loading={loading} icon={ArrowRight}>
            Sign In
          </Button>
        </form>

        {/* Quick Demo Access */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-center">
          <p className="text-xs text-slate-600 font-semibold mb-2">Want to try without registering?</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            icon={Sparkles}
            onClick={handleDemoLogin}
          >
            One-Click Demo Account (Raunak)
          </Button>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
