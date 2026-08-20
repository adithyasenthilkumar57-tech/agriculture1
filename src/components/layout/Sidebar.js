'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFarm } from '@/context/FarmContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { farms, activeFarm, setActiveFarm } = useFarm();
  const { t, language } = useLanguage();

  if (!user) return null;

  const isFarmer = user.role === 'farmer';
  const isTransporter = user.role === 'transporter';
  const isAdmin = user.role === 'admin';

  const navLinks = [
    {
      section: language === 'ta' ? 'முக்கிய தூண்கள்' : 'Core Pillars',
      links: [
        { href: '/dashboard', label: `🌾 ${t('dashboard')}`, exact: true },
        { href: '/transport', label: `🚜 ${t('transport')}` },
        { href: '/ai', label: `🤖 ${t('aiAssistant')}` },
      ],
    },
    ...(isFarmer || isAdmin
      ? [
          {
            section: language === 'ta' ? 'பண்ணை மேலாண்மை' : 'Farm Management',
            links: [
              { href: '/farms', label: `🏡 ${t('myFarms')}` },
              { href: '/crops', label: `🌱 ${t('crops')}` },
              { href: '/soil', label: `🧪 ${t('soilHealth')}` },
              { href: '/weather', label: `🌤️ ${t('weather')}` },
              { href: '/tasks', label: `📋 ${t('tasks')}` },
            ],
          },
        ]
      : []),
    ...(isTransporter || isAdmin
      ? [
          {
            section: language === 'ta' ? 'போக்குவரத்து மையம்' : 'Transporter Hub',
            links: [
              { href: '/transport/transporter', label: `🚚 ${t('transporterHub')}` },
              { href: '/transport/vehicles', label: `🚛 ${t('myVehicles')}` },
            ],
          },
        ]
      : []),
    {
      section: language === 'ta' ? 'சந்தை & நெட்வொர்க்' : 'Market & Network',
      links: [
        { href: '/marketplace', label: `🏪 ${t('marketplace')}` },
        { href: '/notifications', label: `🔔 ${t('notifications')}` },
        { href: '/profile', label: `👤 ${t('profile')}` },
      ],
    },
    ...(isAdmin
      ? [
          {
            section: language === 'ta' ? 'நிர்வாகம்' : 'Administration',
            links: [{ href: '/admin', label: `⚙️ ${t('adminPanel')}` }],
          },
        ]
      : []),
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 fixed top-16 bottom-0 left-0 bg-white border-r border-neutral-100 overflow-y-auto p-3 z-20 transition-colors">
      {/* Active Farm Selector (for Farmers) */}
      {isFarmer && farms.length > 0 && (
        <div className="mb-4 p-2.5 bg-primary-50/60 rounded-xl border border-primary-100">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-primary-800 mb-1">
            {t('activeFarmContext')}
          </label>
          <select
            value={activeFarm?._id || ''}
            onChange={(e) => {
              const selected = farms.find((f) => f._id === e.target.value);
              if (selected) setActiveFarm(selected);
            }}
            aria-label={t('activeFarmContext')}
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
          {t('appName')} • v1.0.0
        </p>
      </div>
    </aside>
  );
}
