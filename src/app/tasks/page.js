'use client';

import { useState, useEffect } from 'react';
import { useFarm } from '@/context/FarmContext';
import EmptyState from '@/components/shared/EmptyState';

export default function TasksPage() {
  const { farms, activeFarm, crops } = useFarm();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('pending'); // 'pending' | 'completed' | 'all'

  const [formData, setFormData] = useState({
    title: '',
    category: 'irrigation',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    farm: activeFarm?._id || '',
    crop: '',
    description: '',
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' ? '/api/tasks' : `/api/tasks?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const handleToggleComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({
          title: '',
          category: 'irrigation',
          priority: 'medium',
          dueDate: new Date().toISOString().split('T')[0],
          farm: activeFarm?._id || '',
          crop: '',
          description: '',
        });
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">📋 Farming Task Management</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Organize irrigation cycles, fertilizer schedules, field inspections, and harvest preparations
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary btn-sm text-xs font-bold"
        >
          + Create Farming Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {['pending', 'completed', 'all'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors ${
              filter === tab
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-full" />
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task._id}
                className={`card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                  isCompleted ? 'opacity-60 bg-neutral-50' : 'hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center text-xs transition-colors ${
                      isCompleted
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'border-neutral-300 hover:border-primary-500 bg-white'
                    }`}
                  >
                    {isCompleted && '✓'}
                  </button>

                  <div>
                    <h4
                      className={`text-sm font-bold text-neutral-900 ${
                        isCompleted ? 'line-through text-neutral-400' : ''
                      }`}
                    >
                      {task.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                      <span className="capitalize">Category: {task.category.replace(/_/g, ' ')}</span>
                      {task.farm && <span>• Farm: {task.farm.name}</span>}
                      {task.crop && <span>• Crop: {task.crop.name}</span>}
                      <span>• Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-neutral-600 mt-1">{task.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span
                    className={`badge text-[10px] capitalize ${
                      task.priority === 'urgent'
                        ? 'badge-error'
                        : task.priority === 'high'
                        ? 'badge-warning'
                        : 'badge-neutral'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <button
                    onClick={() => handleDelete(task._id)}
                    className="text-neutral-400 hover:text-red-600 text-xs p-1"
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="📋"
          title="No Farming Tasks"
          description={
            filter === 'completed'
              ? 'No completed tasks yet.'
              : 'Add your farming tasks to manage irrigation, fertilizer application, spraying, and harvesting on schedule.'
          }
          actionLabel="Create First Task"
          onAction={() => setShowModal(true)}
        />
      )}

      {/* Task Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="card p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-900 font-display">Create Farming Task</h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="label label-required text-xs">Task Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Apply NPK fertilizer to East Tomato field"
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label text-xs">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input select text-xs"
                  >
                    <option value="irrigation">Irrigation</option>
                    <option value="fertilizer">Fertilizer Application</option>
                    <option value="spraying">Pesticide / Spraying</option>
                    <option value="inspection">Field Inspection</option>
                    <option value="pest_monitoring">Pest Monitoring</option>
                    <option value="soil_testing">Soil Testing</option>
                    <option value="sowing">Sowing / Planting</option>
                    <option value="harvest_prep">Harvest Preparation</option>
                    <option value="harvesting">Harvesting</option>
                    <option value="transport">Transport Logistics</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label text-xs">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input select text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label label-required text-xs">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label text-xs">Associated Farm</label>
                  <select
                    value={formData.farm}
                    onChange={(e) => setFormData({ ...formData, farm: e.target.value })}
                    className="input select text-xs"
                  >
                    <option value="">None / General</option>
                    {farms.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label text-xs">Description / Instructions</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Specific dosage, water volume, tool requirements..."
                  className="input textarea text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost btn-sm text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm text-xs font-bold">
                  Save Task 📋
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
