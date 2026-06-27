import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiMapPin, FiSave } from 'react-icons/fi';

export default function UserProfilePage() {
  const { user, login } = useAuth();
  const [tab, setTab] = useState<'profile' | 'password' | 'address'>('profile');
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [addressForm, setAddressForm] = useState({
    line1: (user?.address as any)?.line1 || '',
    city: (user?.address as any)?.city || '',
    state: (user?.address as any)?.state || '',
    country: (user?.address as any)?.country || '',
    postalCode: (user?.address as any)?.postalCode || '',
  });

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', profileForm);
      toast.success('Profile updated!');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setSaving(true);
    try {
      await api.put('/auth/profile', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const handleAddressSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', { address: addressForm });
      toast.success('Address saved!');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to save address');
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-2xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{user?.name}</h1>
            <p className="text-stone-500 text-sm">{user?.email} · {user?.role}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm">
          {[
            { key: 'profile', label: 'Profile', icon: <FiUser size={14} /> },
            { key: 'password', label: 'Password', icon: <FiLock size={14} /> },
            { key: 'address', label: 'Address', icon: <FiMapPin size={14} /> },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* Profile Tab */}
          {tab === 'profile' && (
            <div className="space-y-5">
              <h2 className="font-bold text-stone-800 text-lg">Personal Information</h2>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Full Name</label>
                <input
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email</label>
                <input
                  value={user?.email}
                  disabled
                  className="w-full border border-stone-200 rounded-lg px-4 py-3 text-stone-400 bg-stone-50 cursor-not-allowed"
                />
                <p className="text-xs text-stone-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Phone <span className="font-normal text-stone-400">(optional)</span></label>
                <input
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                  className="w-full border border-stone-300 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button
                onClick={handleProfileSave}
                disabled={saving}
                className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-700 disabled:opacity-60"
              >
                <FiSave size={16} /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          )}

          {/* Password Tab */}
          {tab === 'password' && (
            <div className="space-y-5">
              <h2 className="font-bold text-stone-800 text-lg">Change Password</h2>
              {[
                { label: 'Current Password', key: 'currentPassword' },
                { label: 'New Password', key: 'newPassword' },
                { label: 'Confirm New Password', key: 'confirmPassword' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">{label}</label>
                  <input
                    type="password"
                    value={(passwordForm as any)[key]}
                    onChange={e => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                    placeholder="••••••••"
                    className="w-full border border-stone-300 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              ))}
              <button
                onClick={handlePasswordSave}
                disabled={saving}
                className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-700 disabled:opacity-60"
              >
                <FiLock size={16} /> {saving ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          )}

          {/* Address Tab */}
          {tab === 'address' && (
            <div className="space-y-5">
              <h2 className="font-bold text-stone-800 text-lg">Shipping Address</h2>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Address Line</label>
                <input
                  value={addressForm.line1}
                  onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })}
                  placeholder="123 Main Street"
                  className="w-full border border-stone-300 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">City</label>
                  <input
                    value={addressForm.city}
                    onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="Abuja"
                    className="w-full border border-stone-300 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">State</label>
                  <input
                    value={addressForm.state}
                    onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="FCT"
                    className="w-full border border-stone-300 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Country</label>
                  <input
                    value={addressForm.country}
                    onChange={e => setAddressForm({ ...addressForm, country: e.target.value })}
                    placeholder="Nigeria"
                    className="w-full border border-stone-300 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Postal Code</label>
                  <input
                    value={addressForm.postalCode}
                    onChange={e => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    placeholder="900001"
                    className="w-full border border-stone-300 rounded-lg px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
              <button
                onClick={handleAddressSave}
                disabled={saving}
                className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-stone-700 disabled:opacity-60"
              >
                <FiMapPin size={16} /> {saving ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
