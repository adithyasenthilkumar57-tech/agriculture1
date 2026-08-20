'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-neutral-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <span className="text-2xl transition-transform group-hover:scale-110">🌾</span>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-tight text-neutral-900 leading-none">
                AGRIMITRA <span className="text-primary-600">AI</span>
              </span>
              <span className="text-[10px] text-neutral-500 font-medium tracking-wide">
                From Farm to Market, Made Simple
              </span>
            </div>
          </Link>

          {/* Desktop Nav for logged out or global */}
          {!user && (
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-neutral-600">
              <Link href="/#pillars" className="hover:text-primary-600 transition-colors">
                Three Pillars
              </Link>
              <Link href="/#how-it-works" className="hover:text-primary-600 transition-colors">
                How It Works
              </Link>
              <Link href="/marketplace" className="hover:text-primary-600 transition-colors">
                Marketplace
              </Link>
            </nav>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* User role badge */}
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-200">
                {user.role}
              </span>

              {/* Notification icon */}
              <Link
                href="/notifications"
                className="relative p-2 text-neutral-600 hover:text-primary-600 transition-colors rounded-full hover:bg-neutral-100"
                title="Notifications"
              >
                <span className="text-lg">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* User Menu / Name */}
              <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm font-semibold text-neutral-800 hover:text-primary-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate">{user.name}</span>
                </Link>

                <button
                  onClick={logout}
                  className="btn btn-ghost btn-sm text-xs ml-1"
                  title="Log out"
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn btn-ghost btn-sm">
                Log In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
