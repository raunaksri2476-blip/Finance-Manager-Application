import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.phone
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-500 font-medium">
            Start taking control of your money today
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Full Name"
            name="name"
            icon={User}
            value={formData.name}
            onChange={handleChange}
            placeholder="Raunak Sharma"
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            icon={Phone}
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            required
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            icon={Lock}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat password"
            required
          />

          <Button type="submit" variant="primary" className="w-full py-3 mt-2" loading={loading} icon={ArrowRight}>
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
