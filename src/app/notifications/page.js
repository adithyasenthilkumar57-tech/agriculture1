'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EmptyState from '@/components/shared/EmptyState';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/all/read', { method: 'PUT' });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-neutral-900">🔔 System Notifications</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real notifications for transport offers, trip status updates, and weather alerts
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="btn btn-ghost btn-sm text-xs font-semibold"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-full" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`card p-4 flex items-start gap-3 transition-all ${
                n.isRead ? 'bg-white opacity-75' : 'bg-primary-50/30 border-primary-200 shadow-xs'
              }`}
            >
              <div className="text-2xl shrink-0 mt-0.5">
                {n.type.includes('transport') ? '🚜' : n.type.includes('weather') ? '🌤️' : '🔔'}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-neutral-900">{n.title}</h4>
                  <span className="text-[10px] text-neutral-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">{n.body}</p>
                {n.link && (
                  <div className="pt-1">
                    <Link
                      href={n.link}
                      className="text-xs font-bold text-primary-600 hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔔"
          title="No Notifications Yet"
          description="You will receive real-time notifications when transporters submit offers, trip statuses change, or task reminders occur."
        />
      )}
    </div>
  );
}
