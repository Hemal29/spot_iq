import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';
import { FaCamera, FaUser, FaLock, FaEye, FaEyeSlash, FaCheck, FaSave } from 'react-icons/fa';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await adminService.getProfile();
      const data = res.data?.data || res.data?.admin || res.data || {};
      setProfile(data);
      setForm({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
      setAvatarPreview(data.avatar || null);
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        formData.append('name', form.name);
        formData.append('phone', form.phone);
        await adminService.updateProfile(formData);
      } else {
        await adminService.updateProfile({ name: form.name, phone: form.phone });
      }
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await adminService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="My Profile" subtitle="Manage your account settings" breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Profile' }]} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-gray-100/20 shadow-md">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center">
                  <FaUser className="text-4xl text-white" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <FaCamera className="text-2xl text-white" />
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100  mt-4">{profile?.name || 'Admin'}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{profile?.email}</p>
          <span className="mt-2 px-3 py-1 text-xs font-medium bg-gray-100/10 text-gray-700 dark:text-gray-300  rounded-full">Administrator</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Full Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Email Address</label>
            <input type="email" value={form.email} readOnly className="input-field opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Phone Number</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="input-field" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaSave />}
            Save Profile
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br bg-primary-500 flex items-center justify-center">
            <FaLock className="text-lg text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Change Password</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Update your account password</p>
          </div>
        </div>

        <div className="space-y-5">
          {[
            { key: 'current', label: 'Current Password', field: 'currentPassword' },
            { key: 'new', label: 'New Password', field: 'newPassword' },
            { key: 'confirm', label: 'Confirm New Password', field: 'confirmPassword' },
          ].map(({ key, label, field }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={showPassword[key] ? 'text' : 'password'}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  value={passwordForm[field]}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, [field]: e.target.value }))}
                  className="input-field pr-12"
                />
                <button type="button" onClick={() => setShowPassword((p) => ({ ...p, [key]: !p[key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 ">
                  {showPassword[key] ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleChangePassword}
            disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            className="btn-primary"
          >
            {changingPassword ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FaLock />}
            Change Password
          </button>
        </div>
      </motion.div>
    </div>
  );
}
