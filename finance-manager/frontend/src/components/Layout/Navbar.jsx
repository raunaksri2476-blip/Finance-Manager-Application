import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import { Menu, Bell, Check, Trash2, X, ShieldAlert, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard Overview';
      case '/accounts':
        return 'Financial Accounts';
      case '/transactions':
        return 'Transaction History';
      case '/budgets':
        return 'Budget Planner';
      case '/goals':
        return 'Financial Goals';
      case '/reports':
        return 'Analytics & Reports';
      case '/settings':
        return 'Account Settings';
      default:
        return 'Finance Manager';
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000); // Polling every 20s
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside to close notification menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotif = async (id) => {
    try {
      await notificationAPI.delete(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'danger':
        return <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight">
              {getPageTitle(location.pathname)}
            </h2>
          </div>
        </div>

        {/* Right Side: Notifications & User Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown Container */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Panel */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Notifications
                      </h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item._id}
                          className={`p-3.5 flex items-start gap-3 transition-colors ${
                            !item.isRead ? 'bg-emerald-50/30' : 'hover:bg-slate-50'
                          }`}
                        >
                          {getTypeIcon(item.type)}
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 truncate">
                              {item.title}
                            </h5>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                              {item.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(item.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!item.isRead && (
                              <button
                                onClick={() => handleMarkRead(item._id)}
                                title="Mark read"
                                className="p-1 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotif(item._id)}
                              title="Delete"
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Avatar Link */}
          <Link
            to="/settings"
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden sm:inline text-xs font-bold text-slate-800">
              {user?.name || 'User'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
