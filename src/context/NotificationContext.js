// src/context/NotificationContext.js

import React, { createContext, useState, useContext, useCallback } from 'react';
import Notification from '../components/Notification';

// Tạo Context
const NotificationContext = createContext();

//Tạo Provider (Component cha quản lý state)
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'info', // info, success, error, warning
  });

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ visible: true, message, type });
    // Tự động ẩn sau 10 giây
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 10000);
  }, []);

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {/* Component Notification sẽ luôn được render ở đây */}
      <Notification
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />
      {children}
    </NotificationContext.Provider>
  );
};

//Tạo custom Hook để dễ dàng sử dụng
export const useNotification = () => {
  return useContext(NotificationContext);
};