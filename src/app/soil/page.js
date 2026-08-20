'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFarm } from '@/context/FarmContext';
import EmptyState from '@/components/shared/EmptyState';

export default function SoilPage() {
  const { farms, activeFarm } = useFarm();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    farm: activeFarm?._id || '',
    testDate: new Date().toISOString().split('T')[0],
    testLab: '',
    ph: '6.8',
    nitrogen: '240',
    phosphorus: '22',
    potassium: '180',
    organicMatter: '0.65',
    moisture: '28',
    electricalConductivity: '0.4',
    soilTexture: 'loamy',
    notes: '',
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const url = activeFarm ? `/api/soil?farmId=${activeFarm._id}` : '/api/soil';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load soil records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [activeFarm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/soil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm: formData.farm || activeFarm?._id || farms[0]?._id,
          testDate: formData.testDate,
          testLab: formData.testLab,
          ph: formData.ph ? Number(formData.ph) : undefined,
          nitrogen: formData.nitrogen ? Number(formData.nitrogen) : undefined,
          phosphorus: formData.phosphorus ? Number(formData.phosphorus) : undefined,
          potassium: formData.potassium ? Number(formData.potassium) : undefined,
          organicMatter: formData.organicMatter ? Number(formData.organicMatter) : undefined,
          moisture: formData.moisture ? Number(formData.moisture) : undefined,
          electricalConductivity: formData.electricalConductivity ? Number(formData.electricalConductivity) : undefined,
          soilTexture: formData.soilTexture,
          notes: formData.notes,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchRecords();
      }
    } catch (err) {
      console.error('Failed to save soil test', err);
    }
  };

  const latestRecord = records[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">🧪 Soil Health & Nutrients</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Log soil laboratory test reports (pH, N-P-K, organic matter) to receive personalized agricultural insights
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary btn-sm text-xs font-bold"
        >
          + Add Soil Test Record
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-32 w-full" />
          <div className="skeleton h-48 w-full" />
        </div>
      ) : records.length > 0 ? (
        <div className="space-y-6">
          {/* Latest Soil Test Summary Card */}
          {latestRecord && (
            <div className="card p-6 border-l-4 border-l-earth-500 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-earth-700">
                    Latest Soil Test Analysis
                  </span>
                  <h3 className="text-lg font-bold text-neutral-900 font-display">
                    {latestRecord.farm?.name || 'Your Farm'} — Tested {new Date(latestRecord.testDate).toLocaleDateString()}
                  </h3>
                  {latestRecord.testLab && (
                    <p className="text-xs text-neutral-500">Laboratory: {latestRecord.testLab}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="badge badge-warning text-xs">
                    pH: {latestRecord.ph ?? 'N/A'}{' '}
                    {latestRecord.ph < 6.5 ? '(Acidic)' : latestRecord.ph > 7.5 ? '(Alkaline)' : '(Neutral/Optimal)'}
                  </span>
                </div>
              </div>

              {/* N-P-K & Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-center">
                  <span className="text-[10px] text-neutral-400 block font-semibold">Nitrogen (N)</span>
                  <span className="text-lg font-bold text-neutral-900">
                    {latestRecord.nitrogen?.value ?? '—'}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">kg/ha</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-center">
                  <span className="text-[10px] text-neutral-400 block font-semibold">Phosphorus (P)</span>
                  <span className="text-lg font-bold text-neutral-900">
                    {latestRecord.phosphorus?.value ?? '—'}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">kg/ha</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-center">
                  <span className="text-[10px] text-neutral-400 block font-semibold">Potassium (K)</span>
                  <span className="text-lg font-bold text-neutral-900">
                    {latestRecord.potassium?.value ?? '—'}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">kg/ha</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-center">
                  <span className="text-[10px] text-neutral-400 block font-semibold">Organic Carbon</span>
                  <span className="text-lg font-bold text-neutral-900">
                    {latestRecord.organicMatter?.value ?? '—'}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">%</span>
                </div>
              </div>

              {/* General Management Guidance based on real data */}
              <div className="p-4 rounded-xl bg-primary-50/60 border border-primary-100 space-y-1.5 text-xs text-primary-900">
                <h4 className="font-bold flex items-center gap-1.5">
                  <span>💡</span> General Soil Management Guidance
                </h4>
                <p className="leading-relaxed">
                  {latestRecord.ph < 6.5
                    ? 'Soil is slightly acidic. Agricultural lime application or well-decomposed organic manure can help balance pH for sensitive crops.'
                    : latestRecord.ph > 7.8
                    ? 'Soil is alkaline. Gypsum application and green manuring (dhaincha / sunhemp) help improve nutrient availability.'
                    : 'Soil pH is in the optimal range (6.5 - 7.5) for most cereal crops, pulses, and vegetables.'}
                </p>
              </div>
            </div>
          )}

          {/* Historical Records Table */}
          <div className="card p-5 space-y-3">
            <h3 className="font-bold text-sm text-neutral-900 font-display">Soil Test History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Farm</th>
                    <th className="p-2.5">pH</th>
                    <th className="p-2.5">N (kg/ha)</th>
                    <th className="p-2.5">P (kg/ha)</th>
                    <th className="p-2.5">K (kg/ha)</th>
                    <th className="p-2.5">Organic Matter</th>
                    <th className="p-2.5">Lab / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {records.map((r) => (
                    <tr key={r._id} className="hover:bg-neutral-50">
                      <td className="p-2.5 font-medium">{new Date(r.testDate).toLocaleDateString()}</td>
                      <td className="p-2.5">{r.farm?.name || 'Farm'}</td>
                      <td className="p-2.5 font-bold">{r.ph ?? '—'}</td>
                      <td className="p-2.5">{r.nitrogen?.value ?? '—'}</td>
                      <td className="p-2.5">{r.phosphorus?.value ?? '—'}</td>
                      <td className="p-2.5">{r.potassium?.value ?? '—'}</td>
                      <td className="p-2.5">{r.organicMatter?.value ? `${r.organicMatter.value}%` : '—'}</td>
                      <td className="p-2.5 text-neutral-500">{r.testLab || r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon="🧪"
          title="No Soil Data Available"
          description="Add your soil test information (pH, N-P-K, organic carbon) to receive personalized agricultural insights and crop suitability guidance."
          actionLabel="Add First Soil Test"
          onAction={() => setShowAddModal(true)}
        />
      )}

      {/* Add Soil Test Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="card p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900 font-display">Log Soil Test Report</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label label-required text-xs">Select Farm</label>
                  <select
                    value={formData.farm}
                    onChange={(e) => setFormData({ ...formData, farm: e.target.value })}
                    className="input select text-xs"
                  >
                    {farms.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label label-required text-xs">Test Date</label>
                  <input
                    type="date"
                    required
                    value={formData.testDate}
                    onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">Testing Lab Name / Government Center</label>
                <input
                  type="text"
                  value={formData.testLab}
                  onChange={(e) => setFormData({ ...formData, testLab: e.target.value })}
                  placeholder="e.g. Krishi Vigyan Kendra Soil Testing Lab"
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="label text-xs">pH Level</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={formData.ph}
                    onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                    placeholder="6.5"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label text-xs">N (kg/ha)</label>
                  <input
                    type="number"
                    value={formData.nitrogen}
                    onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                    placeholder="250"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label text-xs">P (kg/ha)</label>
                  <input
                    type="number"
                    value={formData.phosphorus}
                    onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                    placeholder="20"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label text-xs">K (kg/ha)</label>
                  <input
                    type="number"
                    value={formData.potassium}
                    onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                    placeholder="180"
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label text-xs">Organic Carbon (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.organicMatter}
                    onChange={(e) => setFormData({ ...formData, organicMatter: e.target.value })}
                    placeholder="0.6"
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label text-xs">Soil Texture</label>
                  <select
                    value={formData.soilTexture}
                    onChange={(e) => setFormData({ ...formData, soilTexture: e.target.value })}
                    className="input select text-xs"
                  >
                    <option value="loamy">Loamy</option>
                    <option value="clay">Clay</option>
                    <option value="sandy">Sandy</option>
                    <option value="silt">Silt</option>
                    <option value="clay_loam">Clay Loam</option>
                    <option value="sandy_loam">Sandy Loam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label text-xs">Notes / Recommendations</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Recommended urea or organic fertilizer dose..."
                  className="input textarea text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-ghost btn-sm text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm text-xs font-bold">
                  Save Soil Record 🧪
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
