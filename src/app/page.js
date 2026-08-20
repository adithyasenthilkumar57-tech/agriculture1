'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary-900 via-primary-800 to-neutral-900 text-white p-8 md:p-14 shadow-xl">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-80 h-80 bg-transport-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide text-primary-200">
            <span>✨</span> Next-Generation Rural AgriTech
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-display tracking-tight leading-tight">
            Smarter Farming. <br />
            Smarter Transport. <br />
            <span className="text-primary-400">Smarter Decisions.</span>
          </h1>

          <p className="text-base md:text-lg text-neutral-200 leading-relaxed font-sans max-w-2xl">
            AgriMitra AI brings complete agriculture management, dedicated agricultural transportation,
            and an intelligent AI assistant together into one simple platform.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {user ? (
              <Link href="/dashboard" className="btn btn-primary btn-lg shadow-lg">
                Go to Dashboard 🌾
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary btn-lg shadow-lg">
                  Get Started Free 🚀
                </Link>
                <Link href="/login" className="btn btn-ghost text-white border-white/30 hover:bg-white/10 btn-lg">
                  Sign In
                </Link>
              </>
            )}
            <Link href="/ai" className="btn btn-ai btn-lg">
              Ask AI Assistant 🤖
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap gap-6 text-xs text-neutral-300 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> 100% Real User Data
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> Verified Transporters
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> Live Weather Intelligence
            </span>
          </div>
        </div>
      </section>

      {/* The Three Pillars Section */}
      <section id="pillars" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
            The Three-Part Architecture
          </span>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-neutral-900 mt-2">
            Everything Your Farm Needs in One Platform
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Built specifically for rural agriculture: Manage your fields, move your produce, and make confident AI-assisted decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Agriculture */}
          <div className="card p-6 border-t-4 border-t-primary-500 flex flex-col justify-between hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-2xl">
                🌾
              </div>
              <h3 className="text-xl font-bold font-display text-neutral-900">
                1. Agriculture Ecosystem
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Manage your farms, crop lifecycle timelines, soil test health records, live weather alerts, farming tasks, and crop health observations.
              </p>
              <ul className="text-xs space-y-2 text-neutral-500 font-medium pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-primary-600">✓</span> Multi-farm profiling & soil tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-600">✓</span> Crop timeline (Planting to Harvest)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-600">✓</span> Live agricultural weather intelligence
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link href="/farms" className="btn btn-outline w-full text-xs">
                Explore Farm Management →
              </Link>
            </div>
          </div>

          {/* Pillar 2: Transport */}
          <div className="card p-6 border-t-4 border-t-transport-500 flex flex-col justify-between hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-transport-100 flex items-center justify-center text-2xl">
                🚜
              </div>
              <h3 className="text-xl font-bold font-display text-neutral-900">
                2. Agricultural Logistics
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Dedicated agricultural transport connecting farms to mandis, buyers, cold storages, and suppliers. Real transporter bids and transparent trip tracking.
              </p>
              <ul className="text-xs space-y-2 text-neutral-500 font-medium pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-transport-600">✓</span> 7-step easy transport booking
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-transport-600">✓</span> Verified vehicles & cold-chain support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-transport-600">✓</span> Real-time trip status lifecycle
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link href="/transport" className="btn btn-transport w-full text-xs">
                Book Agricultural Transport →
              </Link>
            </div>
          </div>

          {/* Pillar 3: AI Assistant */}
          <div className="card p-6 border-t-4 border-t-ai-500 flex flex-col justify-between hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-ai-100 flex items-center justify-center text-2xl">
                🤖
              </div>
              <h3 className="text-xl font-bold font-display text-neutral-900">
                3. AI Agriculture Assistant
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Contextual AI assistant that knows your farm and crops (with your permission) to give precise advice, diagnose issues, and plan logistics.
              </p>
              <ul className="text-xs space-y-2 text-neutral-500 font-medium pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-ai-600">✓</span> Context-aware farming advice
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-ai-600">✓</span> Transport planning & vehicle suggestions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-ai-600">✓</span> AI screening with expert handoff
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Link href="/ai" className="btn btn-ai w-full text-xs">
                Chat with AgriMitra AI →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-white rounded-3xl p-8 md:p-12 border border-neutral-100 shadow-sm space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold font-display text-neutral-900">
            Connected Farm-to-Market Workflow
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            How the three modules seamlessly communicate to assist you every day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60 space-y-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-sm text-neutral-800">Add Your Farm & Crops</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Record your farm location, soil type, crops, and planting dates to start your crop timeline.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60 space-y-2">
            <div className="w-8 h-8 rounded-full bg-ai-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-sm text-neutral-800">Ask AI for Guidance</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Toggle "Use My Farm Data" for contextual farming, pest alerts, and logistics advice.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60 space-y-2">
            <div className="w-8 h-8 rounded-full bg-transport-500 text-white font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-sm text-neutral-800">Book Produce Transport</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Connect your harvest directly to transport requests. Receive real transporter offers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60 space-y-2">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white font-bold text-xs flex items-center justify-center">
              4
            </div>
            <h4 className="font-bold text-sm text-neutral-800">Deliver & Trade</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Track delivery to mandis, buyers or cold storage, and list products on the marketplace.
            </p>
          </div>
        </div>
      </section>

      {/* Real Data Guarantee Banner */}
      <section className="bg-primary-50 rounded-2xl p-6 border border-primary-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🛡️</span>
          <div>
            <h3 className="text-base font-bold text-primary-900 font-display">
              Real Data Guarantee — Zero Fake Records
            </h3>
            <p className="text-xs text-primary-800 leading-relaxed">
              AgriMitra AI never populates fake transporters, fake prices, or fake reviews. Everything comes from verified users, real connected APIs, or shows a clean empty state.
            </p>
          </div>
        </div>
        <Link href="/register" className="btn btn-primary btn-sm shrink-0">
          Create Account
        </Link>
      </section>
    </div>
  );
}
