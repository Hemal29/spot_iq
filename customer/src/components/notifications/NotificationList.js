import React from 'react';
import {
  FaBell, FaInfoCircle, FaCheckCircle, FaExclamationTriangle,
  FaTimes, FaCheckDouble, FaRegBell,
} from 'react-icons/fa';

const iconMap = {
  info: FaInfoCircle,
  success: FaCheckCircle,
  warning: FaExclamationTriangle,
  error: FaExclamationTriangle,
};

const colorMap = {
  info: 'text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 bg-[#121214]',
  success: 'text-primary-400 bg-[#121214]',
  warning: 'text-primary-400 bg-[#121214]',
  error: 'text-[#e7c588] bg-[#e7c588]',
};

const NotificationList = ({ notifications = [], onMarkAllRead, onDismiss }) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-xl shadow-md overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#e7c588]/25">
        <div className="flex items-center gap-2">
          <FaBell className="text-primary-600" />
          <h3 className="text-lg font-semibold text-[#f9f0d7]">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition"
          >
            <FaCheckDouble /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <FaRegBell className="text-[#e7c588]/80 text-4xl mx-auto mb-3" />
          <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 text-sm">No notifications</p>
          <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="divide-y divide-[#e7c588]/25 max-h-[480px] overflow-y-auto">
          {notifications.map((notification) => {
            const Icon = iconMap[notification.type] || FaBell;
            const colorClass = colorMap[notification.type] || colorMap.info;

            return (
              <div
                key={notification._id || notification.id}
                className={`flex items-start gap-3 px-5 py-4 transition hover:bg-[#0a0a0b] dark:hover:bg-[#121214] dark:bg-[#121214] ${
                  !notification.read ? 'bg-primary-50/50' : ''
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${notification.read ? 'text-[#f3e0ae]' : 'text-[#f9f0d7] dark:text-[#f9f0d7] font-semibold'}`}>
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-0.5">{notification.message}</p>
                  <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-1">
                    {notification.time
                      ? new Date(notification.time).toLocaleString()
                      : notification.createdAt
                        ? new Date(notification.createdAt).toLocaleString()
                        : ''}
                  </p>
                </div>
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(notification._id || notification.id)}
                    className="text-[#e7c588]/80 hover:text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 transition shrink-0 mt-1"
                  >
                    <FaTimes size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationList;
