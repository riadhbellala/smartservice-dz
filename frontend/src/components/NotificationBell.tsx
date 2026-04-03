import { useState, useEffect, useRef } from "react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../services/api";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      const data = response.data?.data || response.data;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string, is_read: boolean) => {
    if (is_read) return;
    try {
      await markNotificationRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;
    
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center p-2 text-slate-600 hover:text-primary transition-colors focus:outline-none"
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0 -right-0 bg-red-500 text-white text-[10px] rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 max-h-[28rem] overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-100 z-50">
          <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex justify-between items-center z-10">
            <h3 className="font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-primary text-sm font-semibold hover:text-blue-700 transition"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-slate-400 text-2xl">notifications_off</span>
                </div>
                <p className="text-slate-400 text-sm font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleMarkRead(notif.id, notif.is_read)}
                  className={`p-4 cursor-pointer transition-colors ${
                    !notif.is_read 
                      ? "bg-blue-50/30 border-l-4 border-primary" 
                      : "bg-white border-l-4 border-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <p className={`text-sm leading-tight ${!notif.is_read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="sticky bottom-0 bg-white border-t border-slate-100 p-3">
              <button 
                className="w-full text-center text-primary text-sm font-semibold py-1 hover:text-blue-700 transition"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
