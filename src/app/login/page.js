'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 px-4">
      <div className="card p-8 shadow-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌾</div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">Welcome to AgriMitra</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Sign in to access your farm, transport, and AI assistant
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label label-required text-xs">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              className="input text-sm"
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label label-required text-xs mb-0">Password</label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input text-sm"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 text-sm font-bold shadow-md mt-2"
          >
            {loading ? 'Signing In...' : 'Sign In 🚀'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-100 text-center text-xs text-neutral-600">
          Don't have an account yet?{' '}
          <Link href="/register" className="text-primary-600 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
