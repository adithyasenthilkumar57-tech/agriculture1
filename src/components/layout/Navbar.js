'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setUnreadCount(data.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-neutral-100 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <span className="text-2xl transition-transform group-hover:scale-110">🌾</span>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-tight text-neutral-900 leading-none">
                {t('appName')}
              </span>
              <span className="text-[10px] text-neutral-500 font-medium tracking-wide">
                {t('tagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Nav for logged out */}
          {!user && (
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-neutral-600">
              <Link href="/#pillars" className="hover:text-primary-600 transition-colors">
                {language === 'ta' ? 'மூன்று தூண்கள்' : 'Three Pillars'}
              </Link>
              <Link href="/#how-it-works" className="hover:text-primary-600 transition-colors">
                {language === 'ta' ? 'எவ்வாறு செயல்படுகிறது' : 'How It Works'}
              </Link>
              <Link href="/marketplace" className="hover:text-primary-600 transition-colors">
                {t('marketplace')}
              </Link>
            </nav>
          )}
        </div>

        {/* Right side controls: Language + Theme Toggle + User Info */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher Button (English / தமிழ்) */}
          <div className="flex items-center rounded-xl bg-neutral-100 p-0.5 text-xs font-semibold border border-neutral-200">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-white text-neutral-900 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2 py-1 rounded-lg transition-all ${
                language === 'ta'
                  ? 'bg-white text-primary-700 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="தமிழ் (Tamil)"
            >
              தமிழ்
            </button>
          </div>

          {/* Dark / Light Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-neutral-600 hover:text-primary-600 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <span className="text-base leading-none">☀️</span>
            ) : (
              <span className="text-base leading-none">🌙</span>
            )}
          </button>

          {user ? (
            <>
              {/* User role badge */}
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-200">
                {user.role}
              </span>

              {/* Notification icon */}
              <Link
                href="/notifications"
                className="relative p-2 text-neutral-600 hover:text-primary-600 transition-colors rounded-xl hover:bg-neutral-100"
                title={t('notifications')}
              >
                <span className="text-base leading-none">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* User Avatar */}
              <div className="flex items-center gap-2 pl-1 border-l border-neutral-200">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-800 hover:text-primary-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-xs">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate">{user.name}</span>
                </Link>

                <button
                  onClick={logout}
                  className="btn btn-ghost btn-sm text-[11px] py-1 px-2 ml-1"
                  title={t('logout')}
                >
                  {t('logout')}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn btn-ghost btn-sm text-xs">
                {t('login')}
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm text-xs font-bold">
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
