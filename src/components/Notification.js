import React from 'react';
import './Notification.css';

const Notification = ({ message, type = 'info', onClose, visible }) => {
  if (!visible) return null;

  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="notification-close">
        &times;
      </button>
    </div>
  );
};

export default Notification;