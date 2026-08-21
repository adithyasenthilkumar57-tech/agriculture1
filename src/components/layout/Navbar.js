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
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
            </div>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
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
