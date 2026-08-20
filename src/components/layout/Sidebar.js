'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFarm } from '@/context/FarmContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { farms, activeFarm, setActiveFarm } = useFarm();

  if (!user) return null;

  const isFarmer = user.role === 'farmer';
  const isTransporter = user.role === 'transporter';
  const isAdmin = user.role === 'admin';

  const navLinks = [
    {
      section: 'Core Pillars',
      links: [
        { href: '/dashboard', label: '🌾 Agriculture Dashboard', exact: true },
        { href: '/transport', label: '🚜 Agricultural Transport' },
        { href: '/ai', label: '🤖 AgriMitra AI Chatbot' },
      ],
    },
    ...(isFarmer || isAdmin
      ? [
          {
            section: 'Farm Management',
            links: [
              { href: '/farms', label: '🏡 My Farms' },
              { href: '/crops', label: '🌱 Crops & Timeline' },
              { href: '/soil', label: '🧪 Soil Health' },
              { href: '/weather', label: '🌤️ Weather Intelligence' },
              { href: '/tasks', label: '📋 Farming Tasks' },
            ],
          },
        ]
      : []),
    ...(isTransporter || isAdmin
      ? [
          {
            section: 'Transporter Hub',
            links: [
              { href: '/transport/transporter', label: '🚚 Transporter Dashboard' },
              { href: '/transport/vehicles', label: '🚛 My Vehicles' },
            ],
          },
        ]
      : []),
    {
      section: 'Market & Network',
      links: [
        { href: '/marketplace', label: '🏪 Agricultural Market' },
        { href: '/notifications', label: '🔔 Notifications' },
        { href: '/profile', label: '👤 Profile & Settings' },
      ],
    },
    ...(isAdmin
      ? [
          {
            section: 'Administration',
            links: [{ href: '/admin', label: '⚙️ Admin Control Panel' }],
          },
        ]
      : []),
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 fixed top-16 bottom-0 left-0 bg-white border-r border-neutral-100 overflow-y-auto p-3 z-20">
      {/* Active Farm Selector (for Farmers) */}
      {isFarmer && farms.length > 0 && (
        <div className="mb-4 p-2.5 bg-primary-50/60 rounded-xl border border-primary-100">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-800 mb-1">
            Active Farm Context
          </label>
          <select
            value={activeFarm?._id || ''}
            onChange={(e) => {
              const selected = farms.find((f) => f._id === e.target.value);
              if (selected) setActiveFarm(selected);
            }}
            aria-label="Active Farm Context"
            className="w-full text-xs font-semibold bg-white border border-primary-200 rounded-lg p-1.5 text-neutral-800 outline-none focus:ring-2 focus:ring-primary-500"
          >
            {farms.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name} ({f.location?.district || 'Farm'})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation Sections */}
      <nav className="space-y-4 flex-1">
        {navLinks.map((sec, idx) => (
          <div key={idx}>
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-3 mb-1">
              {sec.section}
            </div>
            <div className="space-y-0.5">
              {sec.links.map((link) => {
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-xs font-bold'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Tagline */}
      <div className="pt-3 border-t border-neutral-100 text-center">
        <p className="text-[10px] text-neutral-400 font-medium">
          AgriMitra AI • v1.0.0
        </p>
      </div>
    </aside>
  );
}
