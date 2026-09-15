import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaArrowRight } from 'react-icons/fa';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ email: searchParams.get('email') || '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email format';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await login(formData);
      navigate('/', { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {apiError && (
        <div className="bg-[#e7c588]/10 border border-[#e7c588]/40 text-[#e7c588] px-4 py-3 rounded-xl mb-5 text-sm animate-slideUp">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="animate-tilt-in">
          <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80  mb-1.5">Email</label>
          <div className="relative group">
            <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80  group-focus-within:text-[#e7c588]/80within:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-colors" />
            <input
              type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full pl-10 pr-4 py-3 bg-[#0a0a0b] dark:bg-[#121214]  border rounded-xl text-[#f9f0d7] dark:text-[#f9f0d7]  placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                errors.email ? 'border-[#e7c588]/40 focus:ring-[#e7c588]/40' : 'border-[#e7c588]/25  focus:border-primary-400:border-primary-400/50 focus:ring-primary-400/20:ring-primary-400/20'
              }`}
            />
          </div>
          {errors.email && <p className="text-[#e7c588] text-xs mt-1.5">{errors.email}</p>}
        </div>

        <div className="animate-tilt-in" style={{ animationDelay: '0.1s' }}>
          <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80  mb-1.5">Password</label>
          <div className="relative group">
            <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80  group-focus-within:text-[#e7c588]/80within:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full pl-10 pr-10 py-3 bg-[#0a0a0b] dark:bg-[#121214]  border rounded-xl text-[#f9f0d7] dark:text-[#f9f0d7]  placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                errors.password ? 'border-[#e7c588]/40 focus:ring-[#e7c588]/40' : 'border-[#e7c588]/25  focus:border-primary-400:border-primary-400/50 focus:ring-primary-400/20:ring-primary-400/20'
              }`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80  hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  transition-colors">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && <p className="text-[#e7c588] text-xs mt-1.5">{errors.password}</p>}
        </div>

        <div className="flex justify-end animate-tilt-in" style={{ animationDelay: '0.15s' }}>
          <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-[#f3e0ae] dark:text-[#e7c588]/80  font-medium transition-colors">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-3.5 bg-primary-500 hover:bg-primary-600:bg-primary-500 text-[#f9f0d7] font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary-400/25/25 hover:shadow-primary-400/40:shadow-primary-400/40 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed animate-tilt-in"
          style={{ animationDelay: '0.2s' }}
        >
          {loading ? <FaSpinner className="animate-spin" /> : null}
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <FaArrowRight className="text-sm" />}
        </button>
      </form>

      <p className="text-center text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-400 hover:text-[#f3e0ae] dark:text-[#e7c588]/80  font-semibold transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
