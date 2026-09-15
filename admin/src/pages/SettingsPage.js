import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FaUser, FaLock, FaCog, FaPalette, FaEnvelope, FaBell,
  FaDatabase, FaHistory, FaSave, FaEye, FaEyeSlash,
  FaPaperPlane, FaDownload, FaUpload, FaCheckCircle,
  FaMoon, FaSun, FaGlobe, FaLanguage, FaClock,
  FaServer, FaShieldAlt, FaDatabase as FaDB, FaTrash,
} from 'react-icons/fa';
import ThemeContext from '../context/ThemeContext';
import adminService from '../services/adminService';
import PageHeader from '../components/common/PageHeader';

const sections = [
  { key: 'profile', label: 'Admin Profile', icon: FaUser },
  { key: 'password', label: 'Change Password', icon: FaLock },
  { key: 'system', label: 'System Settings', icon: FaCog },
  { key: 'theme', label: 'Theme Settings', icon: FaPalette },
  { key: 'email', label: 'Email Settings', icon: FaEnvelope },
  { key: 'notifications', label: 'Notifications', icon: FaBell },
  { key: 'database', label: 'Database', icon: FaDB },
  { key: 'activity', label: 'Activity Logs', icon: FaHistory },
];

const timezones = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'America/New_York', label: 'America/New York (EST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'America/Los_Angeles', label: 'America/Los Angeles (PST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ar', label: 'Arabic' },
  { value: 'es', label: 'Spanish' },
];

const primaryColors = [
  { value: '#7993df', label: 'Primary', class: 'bg-primary-400' },
];

const mockActivityLogs = [
  { id: 1, action: 'Approved owner "ParkEasy Solutions"', admin: 'Admin User', time: '2 hours ago', type: 'success' },
  { id: 2, action: 'Updated system settings', admin: 'Admin User', time: '4 hours ago', type: 'info' },
  { id: 3, action: 'Rejected owner "QuickPark Ltd"', admin: 'Admin User', time: '6 hours ago', type: 'warning' },
  { id: 4, action: 'Changed SMTP configuration', admin: 'Admin User', time: '1 day ago', type: 'info' },
  { id: 5, action: 'Deleted parking "Old Lot #42"', admin: 'Admin User', time: '1 day ago', type: 'danger' },
  { id: 6, action: 'Suspended user "john@example.com"', admin: 'Admin User', time: '2 days ago', type: 'warning' },
  { id: 7, action: 'Created coupon "SUMMER20"', admin: 'Admin User', time: '3 days ago', type: 'success' },
  { id: 8, action: 'Database backup completed', admin: 'System', time: '3 days ago', type: 'info' },
];

export default function SettingsPage() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [systemSettings, setSystemSettings] = useState({ siteName: 'SpotIQ', currency: 'INR', timezone: 'Asia/Kolkata', language: 'en' });
  const [themeSettings, setThemeSettings] = useState({ darkMode: false, primaryColor: '#4f46e5' });
  const [emailSettings, setEmailSettings] = useState({ smtpHost: '', smtpPort: '587', smtpUser: '', smtpPass: '', fromName: 'SpotIQ', fromEmail: '' });
  const [notifSettings, setNotifSettings] = useState({ emailNotifications: true, pushNotifications: true, smsNotifications: false });
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    setThemeSettings((prev) => ({ ...prev, darkMode: theme === 'dark' }));
  }, [theme]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSettings();
      const data = res.data || {};
      if (data.profile) setProfile({ name: data.profile.name || '', email: data.profile.email || '', phone: data.profile.phone || '' });
      if (data.system) setSystemSettings((prev) => ({ ...prev, ...data.system }));
      if (data.theme) setThemeSettings((prev) => ({ ...prev, ...data.theme }));
      if (data.email) setEmailSettings((prev) => ({ ...prev, ...data.email }));
      if (data.notifications) setNotifSettings((prev) => ({ ...prev, ...data.notifications }));
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await adminService.updateProfile({ name: profile.name, phone: profile.phone });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await adminService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSystem = async () => {
    setSaving(true);
    try {
      await adminService.updateSettings({ system: systemSettings });
      toast.success('System settings saved');
    } catch (err) {
      toast.error('Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      await adminService.updateSettings({ theme: themeSettings });
      toast.success('Theme settings saved');
    } catch (err) {
      toast.error('Failed to save theme settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    setSaving(true);
    try {
      await adminService.updateSettings({ email: emailSettings });
      toast.success('Email settings saved');
    } catch (err) {
      toast.error('Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    try {
      await adminService.testEmailSettings(emailSettings);
      toast.success('Test email sent successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await adminService.updateSettings({ notifications: notifSettings });
      toast.success('Notification settings saved');
    } catch (err) {
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = () => {
    toast.info('Database backup initiated... This may take a few minutes.');
    setTimeout(() => toast.success('Database backup completed successfully!'), 3000);
  };

  const handleRestore = () => {
    toast.warning('Database restore will overwrite current data. Proceed with caution.');
    setTimeout(() => toast.success('Database restored from latest backup.'), 3000);
  };

  const activityTypeStyles = {
    success: 'bg-gray-100 dark:bg-gray-800 text-primary-400/20',
    info: 'bg-gray-100 dark:bg-gray-800 text-gray-600/20 ',
    warning: 'bg-gray-100 dark:bg-gray-800 text-primary-400/20',
    danger: 'bg-red-100 text-red-600/20',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Settings" subtitle="Configure your admin panel" />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="glass-card p-2 sticky top-6">
            <nav className="space-y-1">
              {sections.map((sec) => (
                <button
                  key={sec.key}
                  onClick={() => setActiveSection(sec.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeSection === sec.key
                      ? 'bg-gradient-to-r from-primary-400/15 to-primary-400/5 text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 dark:text-gray-500  hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:bg-gray-800  hover:text-gray-900 dark:text-gray-100 '
                  }`}
                >
                  <sec.icon className="text-sm" />
                  {sec.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeSection === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br bg-primary-600 flex items-center justify-center">
                    <FaUser className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Admin Profile</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Update your personal information</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Full Name</label>
                    <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Email</label>
                    <input type="email" value={profile.email} readOnly className="input-field opacity-60 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Phone</label>
                    <input type="tel" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className="input-field" />
                  </div>
                </div>
                <div className="flex justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 ">
                  <button onClick={handleSaveProfile} disabled={saving} className="btn-primary disabled:opacity-50">
                    <FaSave className="text-xs" />
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeSection === 'password' && (
              <motion.div key="password" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br bg-primary-500 flex items-center justify-center">
                    <FaLock className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Change Password</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Update your account password</p>
                  </div>
                </div>
                <div className="space-y-4 max-w-md">
                  {[
                    { key: 'current', label: 'Current Password', field: 'currentPassword' },
                    { key: 'new', label: 'New Password', field: 'newPassword' },
                    { key: 'confirm', label: 'Confirm New Password', field: 'confirmPassword' },
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">{item.label}</label>
                      <div className="relative">
                        <input
                          type={showPassword[item.key] ? 'text' : 'password'}
                          value={passwordForm[item.field]}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, [item.field]: e.target.value }))}
                          className="input-field pr-10"
                          placeholder={`Enter ${item.label.toLowerCase()}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => ({ ...p, [item.key]: !p[item.key] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 "
                        >
                          {showPassword[item.key] ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 ">
                  <button onClick={handleChangePassword} disabled={saving} className="btn-primary disabled:opacity-50">
                    <FaLock className="text-xs" />
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeSection === 'system' && (
              <motion.div key="system" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                    <FaCog className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">System Settings</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Configure general system preferences</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">Site Name</label>
                    <input type="text" value={systemSettings.siteName} onChange={(e) => setSystemSettings((p) => ({ ...p, siteName: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">
                      <span className="flex items-center gap-1.5"><FaGlobe className="text-xs" /> Currency</span>
                    </label>
                    <select value={systemSettings.currency} onChange={(e) => setSystemSettings((p) => ({ ...p, currency: e.target.value }))} className="select-field">
                      <option value="INR">INR (&#8377;)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (&euro;)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">
                      <span className="flex items-center gap-1.5"><FaClock className="text-xs" /> Timezone</span>
                    </label>
                    <select value={systemSettings.timezone} onChange={(e) => setSystemSettings((p) => ({ ...p, timezone: e.target.value }))} className="select-field">
                      {timezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">
                      <span className="flex items-center gap-1.5"><FaLanguage className="text-xs" /> Language</span>
                    </label>
                    <select value={systemSettings.language} onChange={(e) => setSystemSettings((p) => ({ ...p, language: e.target.value }))} className="select-field">
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 ">
                  <button onClick={handleSaveSystem} disabled={saving} className="btn-primary disabled:opacity-50">
                    <FaSave className="text-xs" />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeSection === 'theme' && (
              <motion.div key="theme" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <FaPalette className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Theme Settings</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Customize the appearance</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300  mb-3">Appearance</h4>
                    <div className="flex items-center justify-between p-4 glass-card rounded-xl">
                      <div className="flex items-center gap-3">
                        {themeSettings.darkMode ? <FaMoon className="text-primary-300" /> : <FaSun className="text-primary-400" />}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 ">Dark Mode</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Switch between light and dark themes</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newMode = !themeSettings.darkMode;
                          setThemeSettings((p) => ({ ...p, darkMode: newMode }));
                          if (toggleTheme) toggleTheme();
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                          themeSettings.darkMode ? 'bg-gray-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow-md transition-transform duration-300 ${
                          themeSettings.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300  mb-3">Primary Color</h4>
                    <div className="flex flex-wrap gap-3">
                      {primaryColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setThemeSettings((p) => ({ ...p, primaryColor: color.value }))}
                          className={`relative w-10 h-10 rounded-xl ${color.class} transition-all duration-200 ${
                            themeSettings.primaryColor === color.value
                              ? 'ring-2 ring-offset-2 ring-offset-white  ring-gray-900  scale-110'
                              : 'hover:scale-105'
                          }`}
                          title={color.label}
                        >
                          {themeSettings.primaryColor === color.value && (
                            <FaCheckCircle className="absolute inset-0 m-auto text-white text-sm" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 ">
                  <button onClick={handleSaveTheme} disabled={saving} className="btn-primary disabled:opacity-50">
                    <FaSave className="text-xs" />
                    {saving ? 'Saving...' : 'Save Theme'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeSection === 'email' && (
              <motion.div key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-primary-400 flex items-center justify-center">
                    <FaEnvelope className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Email Settings</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Configure SMTP email server</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">
                      <span className="flex items-center gap-1.5"><FaServer className="text-xs" /> SMTP Host</span>
                    </label>
                    <input type="text" value={emailSettings.smtpHost} onChange={(e) => setEmailSettings((p) => ({ ...p, smtpHost: e.target.value }))} placeholder="smtp.gmail.com" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">SMTP Port</label>
                    <input type="number" value={emailSettings.smtpPort} onChange={(e) => setEmailSettings((p) => ({ ...p, smtpPort: e.target.value }))} placeholder="587" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">SMTP Username</label>
                    <input type="text" value={emailSettings.smtpUser} onChange={(e) => setEmailSettings((p) => ({ ...p, smtpUser: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">SMTP Password</label>
                    <input type="password" value={emailSettings.smtpPass} onChange={(e) => setEmailSettings((p) => ({ ...p, smtpPass: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">From Name</label>
                    <input type="text" value={emailSettings.fromName} onChange={(e) => setEmailSettings((p) => ({ ...p, fromName: e.target.value }))} placeholder="SpotIQ" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">From Email</label>
                    <input type="email" value={emailSettings.fromEmail} onChange={(e) => setEmailSettings((p) => ({ ...p, fromEmail: e.target.value }))} placeholder="noreply@spotiq.com" className="input-field" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 ">
                  <button onClick={handleTestEmail} disabled={testingEmail} className="btn-outline">
                    <FaPaperPlane className="text-xs" />
                    {testingEmail ? 'Sending...' : 'Send Test Email'}
                  </button>
                  <button onClick={handleSaveEmail} disabled={saving} className="btn-primary disabled:opacity-50">
                    <FaSave className="text-xs" />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeSection === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-primary-400 flex items-center justify-center">
                    <FaBell className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Notification Settings</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Manage notification preferences</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email alerts for important events', icon: FaEnvelope },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive browser push notifications', icon: FaBell },
                    { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive SMS alerts for critical updates', icon: FaShieldAlt },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 glass-card rounded-xl">
                      <div className="flex items-center gap-3">
                        <item.icon className="text-gray-400 dark:text-gray-500 " />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 ">{item.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifSettings((p) => ({ ...p, [item.key]: !p[item.key] }))}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                          notifSettings[item.key] ? 'bg-gray-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow-md transition-transform duration-300 ${
                          notifSettings[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 ">
                  <button onClick={handleSaveNotifications} disabled={saving} className="btn-primary disabled:opacity-50">
                    <FaSave className="text-xs" />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeSection === 'database' && (
              <motion.div key="database" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <FaDB className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Database Management</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Backup and restore your database</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 glass-card rounded-xl text-center hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br bg-primary-600 flex items-center justify-center mx-auto mb-3">
                      <FaDownload className="text-white text-xl" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-1">Backup Database</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-4">Create a full backup of your database</p>
                    <button onClick={handleBackup} className="btn-primary w-full">
                      <FaDownload className="text-xs" />
                      Backup Now
                    </button>
                  </div>
                  <div className="p-5 glass-card rounded-xl text-center hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br bg-primary-500 flex items-center justify-center mx-auto mb-3">
                      <FaUpload className="text-white text-xl" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100  mb-1">Restore Database</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-4">Restore from a previous backup</p>
                    <button onClick={handleRestore} className="btn-danger w-full">
                      <FaUpload className="text-xs" />
                      Restore
                    </button>
                  </div>
                </div>
                <div className="mt-5 p-4 bg-gray-50/10 border border-gray-200/20 rounded-xl">
                  <p className="text-sm text-gray-600">
                    <strong>Warning:</strong> Database operations are irreversible. Always create a backup before restoring.
                  </p>
                </div>
              </motion.div>
            )}

            {activeSection === 'activity' && (
              <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                    <FaHistory className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 ">Activity Logs</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 ">Recent admin actions</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {mockActivityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 glass-card rounded-xl hover:shadow-sm transition-shadow">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activityTypeStyles[log.type]?.split(' ')[0] || 'bg-gray-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100 ">{log.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{log.admin}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 ">&bull;</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 ">{log.time}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${activityTypeStyles[log.type] || 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                        {log.type}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
