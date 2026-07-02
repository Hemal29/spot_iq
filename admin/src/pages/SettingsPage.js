import { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import FormField from '../components/common/FormField';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import adminService from '../services/adminService';

const tabs = ['general', 'email', 'payment'];

const tabLabels = {
  general: 'General Settings',
  email: 'Email Settings',
  payment: 'Payment Settings',
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await adminService.getSettings();
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setSettings({
        general: {},
        email: {},
        payment: {},
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    try {
      await adminService.updateSettings(settings);
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      await adminService.testEmailSettings(settings.email);
      setSuccess('Test email sent successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Test email failed:', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Settings" subtitle="Configure your SpotIQ admin panel" />

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-100">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium transition border-b-2 ${
                  activeTab === tab
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Site Name">
                    <input
                      value={settings.general?.siteName || ''}
                      onChange={(e) => updateField('general', 'siteName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </FormField>
                  <FormField label="Contact Email">
                    <input
                      type="email"
                      value={settings.general?.contactEmail || ''}
                      onChange={(e) => updateField('general', 'contactEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </FormField>
                  <FormField label="Contact Phone">
                    <input
                      value={settings.general?.contactPhone || ''}
                      onChange={(e) => updateField('general', 'contactPhone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </FormField>
                  <FormField label="Currency">
                    <select
                      value={settings.general?.currency || 'INR'}
                      onChange={(e) => updateField('general', 'currency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </FormField>
                  <FormField label="Timezone">
                    <select
                      value={settings.general?.timezone || 'Asia/Kolkata'}
                      onChange={(e) => updateField('general', 'timezone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    </select>
                  </FormField>
                </div>
                <FormField label="Description" className="mt-4">
                  <textarea
                    value={settings.general?.description || ''}
                    onChange={(e) => updateField('general', 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  />
                </FormField>
                <FormField label="Address" className="mt-2">
                  <textarea
                    value={settings.general?.address || ''}
                    onChange={(e) => updateField('general', 'address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  />
                </FormField>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button onClick={handleSave} loading={saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">SMTP Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="SMTP Host">
                    <input
                      value={settings.email?.smtpHost || ''}
                      onChange={(e) => updateField('email', 'smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </FormField>
                  <FormField label="SMTP Port">
                    <input
                      type="number"
                      value={settings.email?.smtpPort || ''}
                      onChange={(e) => updateField('email', 'smtpPort', e.target.value)}
                      placeholder="587"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </FormField>
                  <FormField label="SMTP Username">
                    <input
                      value={settings.email?.smtpUser || ''}
                      onChange={(e) => updateField('email', 'smtpUser', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </FormField>
                  <FormField label="SMTP Password">
                    <input
                      type="password"
                      value={settings.email?.smtpPass || ''}
                      onChange={(e) => updateField('email', 'smtpPass', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </FormField>
                  <FormField label="From Name">
                    <input
                      value={settings.email?.fromName || ''}
                      onChange={(e) => updateField('email', 'fromName', e.target.value)}
                      placeholder="SpotIQ"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </FormField>
                  <FormField label="From Email">
                    <input
                      type="email"
                      value={settings.email?.fromEmail || ''}
                      onChange={(e) => updateField('email', 'fromEmail', e.target.value)}
                      placeholder="noreply@spotiq.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </FormField>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={handleTestEmail}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Test Email
                </button>
                <Button onClick={handleSave} loading={saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Gateway</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Razorpay Key ID">
                    <input
                      value={settings.payment?.razorpayKeyId || ''}
                      onChange={(e) => updateField('payment', 'razorpayKeyId', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </FormField>
                  <FormField label="Razorpay Key Secret">
                    <input
                      type="password"
                      value={settings.payment?.razorpayKeySecret || ''}
                      onChange={(e) => updateField('payment', 'razorpayKeySecret', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </FormField>
                  <FormField label="Currency">
                    <select
                      value={settings.payment?.currency || 'INR'}
                      onChange={(e) => updateField('payment', 'currency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </FormField>
                  <FormField label="Tax Rate (%)">
                    <input
                      type="number"
                      step="0.1"
                      value={settings.payment?.taxRate || ''}
                      onChange={(e) => updateField('payment', 'taxRate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </FormField>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button onClick={handleSave} loading={saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
