import { useState } from 'react';
import ProfileInfo from '../components/profile/ProfileInfo';
import ChangePassword from '../components/profile/ChangePassword';
import VehicleManager from '../components/profile/VehicleManager';

const TABS = [
  { key: 'info', label: 'Profile Info' },
  { key: 'password', label: 'Change Password' },
  { key: 'vehicles', label: 'My Vehicles' },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeTab === 'info' && <ProfileInfo />}
          {activeTab === 'password' && <ChangePassword />}
          {activeTab === 'vehicles' && <VehicleManager />}
        </div>
      </div>
    </div>
  );
}
