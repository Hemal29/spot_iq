import { useState } from 'react';
import ProfileInfo from '../components/profile/ProfileInfo';
import ChangePassword from '../components/profile/ChangePassword';
import VehicleManager from '../components/profile/VehicleManager';
import PageHero from '../components/common/PageHero';

const TABS = [
  { key: 'info', label: 'Profile Info' },
  { key: 'password', label: 'Change Password' },
  { key: 'vehicles', label: 'My Vehicles' },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <PageHero title="My" highlight="Profile" subtitle="Manage your account, password and vehicles" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-400 text-[#f9f0d7] shadow-sm'
                  : 'bg-[#0a0a0b] dark:bg-[#0a0a0b] text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#f9f0d7] dark:text-[#f9f0d7] border border-[#e7c588]/25'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-xl shadow-sm border border-[#e7c588]/25 dark:border-[#e7c588]/25 p-6">
          {activeTab === 'info' && <ProfileInfo />}
          {activeTab === 'password' && <ChangePassword />}
          {activeTab === 'vehicles' && <VehicleManager />}
        </div>
      </div>
    </div>
  );
}
