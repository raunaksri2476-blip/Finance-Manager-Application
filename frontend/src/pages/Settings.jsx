import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { User, Lock, Globe, LogOut, Save, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    currency: user?.currency || 'INR',
    dateFormat: user?.dateFormat || 'DD/MM/YYYY',
    theme: user?.theme || 'light',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(profileData);
      updateUser(res.data);
      setToast({ type: 'success', message: 'Profile settings updated successfully.' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      return setToast({ type: 'error', message: 'New passwords do not match' });
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setToast({ type: 'success', message: 'Password changed successfully.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal profile, security credentials, and system preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" /> Profile Details
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'preferences'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" /> Preferences
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'security'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Security & Login
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm max-w-2xl">
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              required
            />

            <Input
              label="Email Address (Read Only)"
              name="email"
              value={user?.email || ''}
              disabled
            />

            <Input
              label="Phone Number"
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              placeholder="+91 9876543210"
            />

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" loading={loading} icon={Save}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'preferences' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Select
              label="Primary Currency"
              name="currency"
              value={profileData.currency}
              onChange={handleProfileChange}
              options={[{ label: 'Indian Rupee (INR ₹)', value: 'INR' }, { label: 'US Dollar (USD $)', value: 'USD' }]}
            />

            <Select
              label="Date Display Format"
              name="dateFormat"
              value={profileData.dateFormat}
              onChange={handleProfileChange}
              options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']}
            />

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" loading={loading} icon={Save}>
                Save Preferences
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Change Password
              </h3>

              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />

              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                required
              />

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" loading={loading} icon={Lock}>
                  Update Password
                </Button>
              </div>
            </form>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-rose-600 mb-2">Session Control</h3>
              <Button
                variant="danger"
                icon={LogOut}
                onClick={() => setShowLogoutConfirm(true)}
              >
                Sign Out of Account
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out?"
        message="Are you sure you want to log out of Finance Manager?"
        confirmText="Logout"
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Settings;
