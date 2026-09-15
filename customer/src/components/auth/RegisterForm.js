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
const strengthColors = ['bg-[#e7c588]', 'bg-[#0a0a0b]0', 'bg-[#0a0a0b]0', 'bg-[#0a0a0b]0', 'bg-primary-400'];

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
    `w-full pl-10 pr-10 py-3 bg-[#0a0a0b] dark:bg-[#121214]  border rounded-xl text-[#f9f0d7] dark:text-[#f9f0d7]  placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
      errors[field] ? 'border-[#e7c588]/40 focus:ring-[#e7c588]/40' : 'border-[#e7c588]/25  focus:border-primary-400:border-primary-400/50 focus:ring-primary-400/20:ring-primary-400/20'
    }`;

  return (
    <div className="w-full">
      {apiError && (
        <div className="bg-[#e7c588]/10 border border-[#e7c588]/40 text-[#e7c588] px-4 py-3 rounded-xl mb-5 text-sm animate-slideUp">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="animate-tilt-in">
          <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80  mb-1.5">Full Name</label>
          <div className="relative group">
            <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80  group-focus-within:text-[#e7c588]/80within:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-colors" />
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className={inputClass('name')} />
          </div>
          {errors.name && <p className="text-[#e7c588] text-xs mt-1.5">{errors.name}</p>}
        </div>

        <div className="animate-tilt-in" style={{ animationDelay: '0.05s' }}>
          <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80  mb-1.5">Email</label>
          <div className="relative group">
            <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80  group-focus-within:text-[#e7c588]/80within:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-colors" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className={inputClass('email')} />
          </div>
          {errors.email && <p className="text-[#e7c588] text-xs mt-1.5">{errors.email}</p>}
        </div>

        <div className="animate-tilt-in" style={{ animationDelay: '0.1s' }}>
          <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80  mb-1.5">Phone</label>
          <div className="relative group">
            <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80  group-focus-within:text-[#e7c588]/80within:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-colors" />
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className={inputClass('phone')} />
          </div>
          {errors.phone && <p className="text-[#e7c588] text-xs mt-1.5">{errors.phone}</p>}
        </div>

        <div className="animate-tilt-in" style={{ animationDelay: '0.15s' }}>
          <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80  mb-1.5">Password</label>
          <div className="relative group">
            <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80  group-focus-within:text-[#e7c588]/80within:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-colors" />
            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Min. 6 characters" className={inputClass('password')} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80  hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  transition-colors">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {formData.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-[#1c1c1f] dark:bg-[#1c1c1f] '} transition-all duration-300`} />
                ))}
              </div>
              <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mt-1">Strength: <span className={`font-medium ${strength >= 4 ? 'text-primary-400' : strength >= 3 ? 'text-primary-400' : 'text-[#e7c588]'}`}>{strengthLabels[strength - 1] || 'None'}</span></p>
            </div>
          )}
          {errors.password && <p className="text-[#e7c588] text-xs mt-1.5">{errors.password}</p>}
        </div>

        <div className="animate-tilt-in" style={{ animationDelay: '0.2s' }}>
          <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80  mb-1.5">Confirm Password</label>
          <div className="relative group">
            <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80  group-focus-within:text-[#e7c588]/80within:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition-colors" />
            <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" className={inputClass('confirmPassword')} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#e7c588]/80 dark:text-[#e7c588]/80  hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  transition-colors">
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-[#e7c588] text-xs mt-1.5">{errors.confirmPassword}</p>}
        </div>

        <div className="flex items-start gap-3 animate-tilt-in" style={{ animationDelay: '0.25s' }}>
          <button
            type="button"
            onClick={() => { setAgreeTerms(!agreeTerms); if (errors.terms) setErrors({ ...errors, terms: '' }); }}
            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
              agreeTerms ? 'bg-primary-400 border-[#e7c588]/40' : 'border-[#e7c588]/25 hover:border-primary-400:border-primary-400/50'
            }`}
          >
            {agreeTerms && <FaCheck className="text-[#f9f0d7] text-[10px]" />}
          </button>
          <label htmlFor="terms" className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  cursor-pointer">
            I agree to the{' '}
            <Link to="/terms" className="text-primary-400 hover:text-[#f3e0ae] dark:text-[#e7c588]/80 ">Terms & Conditions</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-primary-400 hover:text-[#f3e0ae] dark:text-[#e7c588]/80 ">Privacy Policy</Link>
          </label>
        </div>
        {errors.terms && <p className="text-[#e7c588] text-xs -mt-2 ml-8">{errors.terms}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full py-3.5 bg-primary-500 hover:bg-primary-600:bg-primary-500 text-[#f9f0d7] font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary-400/25/25 hover:shadow-primary-400/40:shadow-primary-400/40 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed animate-tilt-in"
          style={{ animationDelay: '0.3s' }}
        >
          {loading ? <FaSpinner className="animate-spin" /> : null}
          {loading ? 'Creating account...' : 'Create Account'}
          {!loading && <FaArrowRight className="text-sm" />}
        </button>
      </form>

      <p className="text-center text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80  mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-400 hover:text-[#f3e0ae] dark:text-[#e7c588]/80  font-semibold transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
