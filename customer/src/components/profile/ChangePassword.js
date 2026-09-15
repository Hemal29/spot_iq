import React, { useState } from 'react';
import authService from '../../services/authService';
import { FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const getPasswordStrength = (pw) => {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const strengthColors = ['bg-[#e7c588]', 'bg-[#0a0a0b]0', 'bg-[#0a0a0b]0', 'bg-[#0a0a0b]0', 'bg-primary-400'];

const requirements = [
  { label: 'At least 6 characters', test: (pw) => pw.length >= 6 },
  { label: 'At least 10 characters', test: (pw) => pw.length >= 10 },
  { label: 'Contains uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Contains a number', test: (pw) => /[0-9]/.test(pw) },
  { label: 'Contains a special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [showFields, setShowFields] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(formData.newPassword);

  const validate = () => {
    if (!formData.currentPassword) return 'Current password is required';
    if (!formData.newPassword) return 'New password is required';
    if (formData.newPassword.length < 6) return 'New password must be at least 6 characters';
    if (formData.newPassword !== formData.confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess(true);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-[#f9f0d7] mb-4">Change Password</h3>

      {success && (
        <div className="bg-[#0a0a0b] dark:bg-[#121214] border border-[#e7c588]/25 dark:border-[#e7c588]/25 text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <FaCheckCircle /> Password changed successfully!
        </div>
      )}

      {error && (
        <div className="bg-[#e7c588] border border-[#e7c588]/40 text-[#e7c588] px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <FaTimesCircle /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80 mb-1">Current Password</label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e7c588]/80" />
            <input
              type={showFields.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => { setFormData({ ...formData, currentPassword: e.target.value }); if (error) setError(''); }}
              placeholder="Enter current password"
              className="w-full pl-10 pr-10 py-2.5 border border-[#e7c588]/25 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
            <button type="button" onClick={() => setShowFields({ ...showFields, current: !showFields.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80">
              {showFields.current ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80 mb-1">New Password</label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e7c588]/80" />
            <input
              type={showFields.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => { setFormData({ ...formData, newPassword: e.target.value }); if (error) setError(''); }}
              placeholder="Enter new password"
              className="w-full pl-10 pr-10 py-2.5 border border-[#e7c588]/25 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
            <button type="button" onClick={() => setShowFields({ ...showFields, new: !showFields.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80">
              {showFields.new ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex gap-1 mb-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-[#1c1c1f]'} transition`} />
                ))}
              </div>
              <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mb-2">Strength: {strengthLabels[strength - 1] || 'None'}</p>
              <ul className="space-y-1">
                {requirements.map((req, i) => {
                  const met = req.test(formData.newPassword);
                  return (
                    <li key={i} className={`text-xs flex items-center gap-1.5 ${met ? 'text-primary-400' : 'text-[#e7c588]/80'}`}>
                      {met ? <FaCheckCircle /> : <FaTimesCircle />} {req.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80 mb-1">Confirm New Password</label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e7c588]/80" />
            <input
              type={showFields.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); if (error) setError(''); }}
              placeholder="Confirm new password"
              className="w-full pl-10 pr-10 py-2.5 border border-[#e7c588]/25 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
            <button type="button" onClick={() => setShowFields({ ...showFields, confirm: !showFields.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80">
              {showFields.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-[#f9f0d7] font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-60"
        >
          {loading ? <FaSpinner className="animate-spin" /> : null}
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
