'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    preferredLanguage: 'en',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        preferredLanguage: formData.preferredLanguage,
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-6 px-4">
      <div className="card p-8 shadow-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌾</div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">Create AgriMitra Account</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Join the connected ecosystem for farmers, transporters & buyers
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="label label-required text-xs">Select Your Role</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'farmer', label: 'Farmer', icon: '🌾' },
                { id: 'transporter', label: 'Transporter', icon: '🚜' },
                { id: 'buyer', label: 'Buyer', icon: '🏪' },
                { id: 'expert', label: 'Expert', icon: '👨‍🔬' },
              ].map((roleOption) => (
                <button
                  type="button"
                  key={roleOption.id}
                  onClick={() => setFormData((p) => ({ ...p, role: roleOption.id }))}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    formData.role === roleOption.id
                      ? 'border-primary-600 bg-primary-50 text-primary-900 ring-2 ring-primary-500/20 font-bold'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <span className="text-xl">{roleOption.icon}</span>
                  <span className="text-xs">{roleOption.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label label-required text-xs">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ramesh Kumar"
                className="input text-sm"
              />
            </div>

            <div>
              <label className="label text-xs">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="input text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label label-required text-xs">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ramesh@example.com"
                className="input text-sm"
              />
            </div>

            <div>
              <label className="label text-xs">Preferred Language</label>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                className="input select text-sm"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label label-required text-xs">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="input text-sm"
              />
            </div>

            <div>
              <label className="label label-required text-xs">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className="input text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 text-sm font-bold shadow-md mt-2"
          >
            {loading ? 'Creating Account...' : 'Complete Registration 🚀'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-100 text-center text-xs text-neutral-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
