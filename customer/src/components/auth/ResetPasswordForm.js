import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { FaLock, FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

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

const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(passwords.password);

  const validate = () => {
    if (!passwords.password) return 'Password is required';
    if (passwords.password.length < 6) return 'Password must be at least 6 characters';
    if (passwords.password !== passwords.confirmPassword) return 'Passwords do not match';
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
    try {
      await authService.resetPassword(token, { password: passwords.password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0a0b]">
      <div className="w-full max-w-md bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-2xl shadow-xl p-8 animate-slideUp">
        {success ? (
          <div className="text-center">
            <FaCheckCircle className="text-primary-400 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#f9f0d7] mb-2">Password Reset!</h2>
            <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mb-6">Your password has been successfully reset.</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-[#f9f0d7] font-semibold px-6 py-2.5 rounded-lg transition"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary-600">Reset Password</h2>
              <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-2">Enter your new password</p>
            </div>

            {!token && (
              <div className="bg-[#e7c588] border border-[#e7c588]/40 text-[#e7c588] px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <FaExclamationCircle /> Invalid or missing reset token.
              </div>
            )}

            {error && (
              <div className="bg-[#e7c588] border border-[#e7c588]/40 text-[#e7c588] px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80 mb-1">New Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e7c588]/80" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.password}
                    onChange={(e) => { setPasswords({ ...passwords, password: e.target.value }); if (error) setError(''); }}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 border border-[#e7c588]/25 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwords.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-[#1c1c1f]'} transition`} />
                      ))}
                    </div>
                    <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-1">Strength: {strengthLabels[strength - 1] || 'None'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80 mb-1">Confirm New Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e7c588]/80" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={passwords.confirmPassword}
                    onChange={(e) => { setPasswords({ ...passwords, confirmPassword: e.target.value }); if (error) setError(''); }}
                    placeholder="Confirm your new password"
                    className="w-full pl-10 pr-10 py-2.5 border border-[#e7c588]/25 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588]/80">
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading || !token}
                className="w-full bg-primary-600 hover:bg-primary-700 text-[#f9f0d7] font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <FaSpinner className="animate-spin" /> : null}
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className="text-center mt-6">
              <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordForm;
