import React from 'react';
import { 
  FiInfo, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiXCircle 
} from 'react-icons/fi';
import './NotificationPanel.css';

const NotificationPanel = ({ notifications }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <FiInfo className="notification-icon info" />;
      case 'warning':
        return <FiAlertCircle className="notification-icon warning" />;
      case 'success':
        return <FiCheckCircle className="notification-icon success" />;
      case 'error':
        return <FiXCircle className="notification-icon error" />;
      default:
        return <FiInfo className="notification-icon info" />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  };

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h2>Recent Notifications</h2>
        <button className="mark-all-read">Mark all as read</button>
      </div>

      <div className="notification-list">
        {notifications?.map((notification) => (
          <div 
            key={notification.id} 
            className={`notification-item ${notification.is_read ? 'read' : ''}`}
          >
            {getNotificationIcon(notification.type)}
            
            <div className="notification-content">
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
              <span className="notification-time">
                {formatTime(notification.created_at)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="notification-footer">
        <button className="view-all-notifications">
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel; 