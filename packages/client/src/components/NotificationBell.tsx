import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Users, ShieldAlert, Sparkles, CheckCircle, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';

export interface InAppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string, actionUrl?: string | null) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (actionUrl) {
        setIsOpen(false);
        navigate(actionUrl);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'TEAM_INVITE':
      case 'TEAM_APPLICATION':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'VERIFICATION_REQUEST':
      case 'VERIFICATION_RESULT':
        return <CheckCircle className="w-4 h-4 text-indigo-400" />;
      case 'SYSTEM_ALERT':
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition flex items-center justify-center border border-transparent hover:border-gray-700"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0B0F1B] border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center px-4">
                <div className="w-10 h-10 rounded-full bg-gray-800/60 flex items-center justify-center mx-auto mb-2 text-gray-500">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-gray-300">All caught up!</p>
                <p className="text-xs text-gray-500 mt-1">
                  Team invitations and verification updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id, notif.actionUrl)}
                  className={`p-3.5 hover:bg-gray-800/40 transition cursor-pointer flex gap-3 items-start ${
                    !notif.isRead ? 'bg-indigo-950/20' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold truncate ${!notif.isRead ? 'text-white' : 'text-gray-300'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-500 font-mono">
                      <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {notif.actionUrl && (
                        <span className="text-indigo-400 flex items-center gap-0.5">
                          View details <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
