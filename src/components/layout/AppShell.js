'use client';

import { useAuth } from '@/context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function AppShell({ children }) {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />
      <div className="flex-1 flex">
        {user && <Sidebar />}
        <main
          className={`flex-1 w-full transition-all ${
            user ? 'md:ml-64 pb-20 md:pb-8' : 'pb-8'
          } p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto`}
        >
          {children}
        </main>
      </div>
      {user && <BottomNav />}
    </div>
  );
}
