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
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-5 text-sm animate-slideUp">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="animate-tilt-in">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Email</label>
          <div className="relative group">
            <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-orange-400 transition-colors" />
            <input
              type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                errors.email ? 'border-red-500 dark:border-red-500/50 focus:ring-red-500/20' : 'border-gray-300 dark:border-white/10 focus:border-blue-500 dark:focus:border-orange-500/50 focus:ring-blue-500/20 dark:focus:ring-orange-500/20'
              }`}
            />
          </div>
          {errors.email && <p className="text-red-600 dark:text-red-400 text-xs mt-1.5">{errors.email}</p>}
        </div>

        <div className="animate-tilt-in" style={{ animationDelay: '0.1s' }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Password</label>
          <div className="relative group">
            <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-orange-400 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                errors.password ? 'border-red-500 dark:border-red-500/50 focus:ring-red-500/20' : 'border-gray-300 dark:border-white/10 focus:border-blue-500 dark:focus:border-orange-500/50 focus:ring-blue-500/20 dark:focus:ring-orange-500/20'
              }`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && <p className="text-red-600 dark:text-red-400 text-xs mt-1.5">{errors.password}</p>}
        </div>

        <div className="flex justify-end animate-tilt-in" style={{ animationDelay: '0.15s' }}>
          <Link to="/forgot-password" className="text-sm text-blue-600 dark:text-orange-400 hover:text-blue-700 dark:hover:text-orange-300 font-medium transition-colors">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-orange-500 dark:to-orange-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-orange-600 dark:hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 dark:shadow-orange-500/25 hover:shadow-blue-500/40 dark:hover:shadow-orange-500/40 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed animate-tilt-in"
          style={{ animationDelay: '0.2s' }}
        >
          {loading ? <FaSpinner className="animate-spin" /> : null}
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <FaArrowRight className="text-sm" />}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 dark:text-orange-400 hover:text-blue-700 dark:hover:text-orange-300 font-semibold transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
