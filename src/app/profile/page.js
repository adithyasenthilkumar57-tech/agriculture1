'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFarm } from '@/context/FarmContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { farms, crops } = useFarm();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="pb-2 border-b border-neutral-200">
        <h1 className="text-2xl font-bold font-display text-neutral-900">👤 User Profile & Settings</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Manage your account information, registered role, and agricultural preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-primary-600 text-white flex items-center justify-center text-2xl font-bold uppercase shadow-sm">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 font-display">{user.name}</h2>
            <p className="text-xs text-neutral-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge badge-success capitalize text-xs">{user.role}</span>
              <span className="badge badge-neutral text-xs">
                Language: {user.preferredLanguage === 'hi' ? 'हिंदी' : user.preferredLanguage === 'ta' ? 'தமிழ்' : 'English'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-0.5">
            <span className="text-[10px] text-neutral-400 block font-semibold">Registered Phone</span>
            <span className="font-bold text-neutral-800">{user.phone || 'Not provided'}</span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-0.5">
            <span className="text-[10px] text-neutral-400 block font-semibold">Account Status</span>
            <span className="font-bold text-green-700">✓ Active & Authenticated</span>
          </div>

          {user.role === 'farmer' && (
            <>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-0.5">
                <span className="text-[10px] text-neutral-400 block font-semibold">Total Farms Registered</span>
                <span className="font-bold text-neutral-800">{farms.length} Farm Profile{farms.length === 1 ? '' : 's'}</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-0.5">
                <span className="text-[10px] text-neutral-400 block font-semibold">Active Crops Tracked</span>
                <span className="font-bold text-neutral-800">{crops.length} Crop{crops.length === 1 ? '' : 's'}</span>
              </div>
            </>
          )}
        </div>

        {/* API Key Configuration Note for Admin/Farmer */}
        <div className="p-4 rounded-xl bg-ai-50/60 border border-ai-200 text-xs space-y-1.5">
          <h4 className="font-bold text-ai-900 flex items-center gap-1.5">
            <span>🛡️</span> AI & Weather API Connection Security
          </h4>
          <p className="text-ai-800 leading-relaxed">
            API keys are securely read from server environment variables (<code>.env.local</code>) and are never exposed to browser JavaScript.
          </p>
        </div>

        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
          <button
            onClick={() => {
              navigator.clipboard.writeText(user.email);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-xs text-neutral-500 hover:text-neutral-800"
          >
            {copied ? '✓ Copied Email' : 'Copy Email Address'}
          </button>

          <button onClick={logout} className="btn btn-danger btn-sm text-xs font-bold">
            Sign Out 🚪
          </button>
        </div>
      </div>
    </div>
  );
}
