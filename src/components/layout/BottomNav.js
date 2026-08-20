'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const items = [
    { href: '/dashboard', label: 'Agriculture', icon: '🌾' },
    { href: '/transport', label: 'Transport', icon: '🚜' },
    { href: '/ai', label: 'AI Assistant', icon: '🤖' },
    { href: '/marketplace', label: 'Market', icon: '🏪' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-neutral-200 z-40 flex items-center justify-around py-1.5 px-2 safe-area-pb shadow-lg">
      {items.map((item) => {
        const isActive =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-colors ${
              isActive ? 'text-primary-600 font-bold' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
