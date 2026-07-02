import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';

const ProfileInfo = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  React.useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    }
  }, [user]);

  const getInitials = () => {
    if (!user?.name) return '?';
    return user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await updateUser(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
          {getInitials()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{user?.name || 'User'}</h3>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium">
            <FaEdit /> Edit
          </button>
        )}
      </div>

      {message.text && (
        <div className={`px-4 py-2 rounded-lg mb-4 text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none text-sm transition ${
                isEditing ? 'border-gray-300 focus:ring-2 focus:ring-primary-500' : 'border-transparent bg-gray-50 text-gray-500 cursor-default'
              }`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled
              className="w-full pl-10 pr-4 py-2.5 border border-transparent bg-gray-50 text-gray-500 cursor-default outline-none text-sm rounded-lg"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel" value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none text-sm transition ${
                isEditing ? 'border-gray-300 focus:ring-2 focus:ring-primary-500' : 'border-transparent bg-gray-50 text-gray-500 cursor-default'
              }`}
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave} disabled={loading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-1 text-sm disabled:opacity-60"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-2 rounded-lg transition flex items-center justify-center gap-1 text-sm"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
