import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaSpinner, FaArrowRight, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';

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
const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];

const RegisterForm = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const strength = getPasswordStrength(formData.password);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email format';
    if (!formData.phone) errs.phone = 'Phone is required';
    else if (!/^[+]?[\d\s()-]{7,15}$/.test(formData.phone)) errs.phone = 'Invalid phone number';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!agreeTerms) errs.terms = 'You must agree to the terms';
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
      await register({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password });
      toast.success('Account created! Please sign in.');
      navigate(`/login?email=${encodeURIComponent(formData.email)}`);
      return;
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
      errors[field] ? 'border-red-500 dark:border-red-500/50 focus:ring-red-500/20' : 'border-gray-300 dark:border-white/10 focus:border-blue-500 dark:focus:border-orange-500/50 focus:ring-blue-500/20 dark:focus:ring-orange-500/20'
    }`;

  return (
    <div className="w-full">
      {apiError && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-5 text-sm animate-slideUp">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="animate-tilt-in">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Full Name</label>
          <div className="relative group">
            <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-orange-400 transition-colors" />
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className={inputClass('name')} />
          </div>
          {errors.name && <p className="text-red-600 dark:text-red-400 text-xs mt-1.5">{errors.name}</p>}
        </div>

        <div className="animate-tilt-in" style={{ animationDelay: '0.05s' }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Email</label>
          <div className="relative group">
            <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-orange-400 transition-colors" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className={inputClass('email')} />
          </div>
          {errors.email && <p className="text-red-600 dark:text-red-400 text-xs mt-1.5">{errors.email}</p>}
        </div>

        <div className="animate-tilt-in" style={{ animationDelay: '0.1s' }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Phone</label>
          <div className="relative group">
            <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-orange-400 transition-colors" />
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className={inputClass('phone')} />
          </div>
          {errors.phone && <p className="text-red-600 dark:text-red-400 text-xs mt-1.5">{errors.phone}</p>}
        </div>

        <div className="animate-tilt-in" style={{ animationDelay: '0.15s' }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Password</label>
          <div className="relative group">
            <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-orange-400 transition-colors" />
            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Min. 6 characters" className={inputClass('password')} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {formData.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-gray-200 dark:bg-white/10'} transition-all duration-300`} />
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Strength: <span className={`font-medium ${strength >= 4 ? 'text-green-600 dark:text-green-400' : strength >= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>{strengthLabels[strength - 1] || 'None'}</span></p>
            </div>
          )}
          {errors.password && <p className="text-red-600 dark:text-red-400 text-xs mt-1.5">{errors.password}</p>}
        </div>

        <div className="animate-tilt-in" style={{ animationDelay: '0.2s' }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Confirm Password</label>
          <div className="relative group">
            <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-orange-400 transition-colors" />
            <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" className={inputClass('confirmPassword')} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-600 dark:text-red-400 text-xs mt-1.5">{errors.confirmPassword}</p>}
        </div>

        <div className="flex items-start gap-3 animate-tilt-in" style={{ animationDelay: '0.25s' }}>
          <button
            type="button"
            onClick={() => { setAgreeTerms(!agreeTerms); if (errors.terms) setErrors({ ...errors, terms: '' }); }}
            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
              agreeTerms ? 'bg-blue-600 dark:bg-orange-500 border-blue-600 dark:border-orange-500' : 'border-gray-300 dark:border-white/20 hover:border-blue-500 dark:hover:border-orange-500/50'
            }`}
          >
            {agreeTerms && <FaCheck className="text-white text-[10px]" />}
          </button>
          <label htmlFor="terms" className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
            I agree to the{' '}
            <Link to="/terms" className="text-blue-600 dark:text-orange-400 hover:text-blue-700 dark:hover:text-orange-300">Terms & Conditions</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-blue-600 dark:text-orange-400 hover:text-blue-700 dark:hover:text-orange-300">Privacy Policy</Link>
          </label>
        </div>
        {errors.terms && <p className="text-red-600 dark:text-red-400 text-xs -mt-2 ml-8">{errors.terms}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-orange-500 dark:to-orange-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-orange-600 dark:hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 dark:shadow-orange-500/25 hover:shadow-blue-500/40 dark:hover:shadow-orange-500/40 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed animate-tilt-in"
          style={{ animationDelay: '0.3s' }}
        >
          {loading ? <FaSpinner className="animate-spin" /> : null}
          {loading ? 'Creating account...' : 'Create Account'}
          {!loading && <FaArrowRight className="text-sm" />}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 dark:text-orange-400 hover:text-blue-700 dark:hover:text-orange-300 font-semibold transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
