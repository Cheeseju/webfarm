// src/components/Sidebar.js
import React from 'react';
import './Sidebar.css';

// Add userRole to the component props
const Sidebar = ({ onPageChange, currentPage, userRole }) => { 
    const isPlantsActive = currentPage === 'plants' || currentPage === 'plantDetails';
    const isDiariesActive = currentPage === 'diaries' || currentPage === 'diaryDetails';
    const isAdminActive = currentPage === 'admin';
    
    return (
        <div className="sidebar">
            <div 
              className={`sidebar-item ${isDiariesActive ? 'active' : ''}`} 
                onClick={() => onPageChange('diaries')} 
            >
                <i className="calendar-icon">📅</i>
                <span>Nhật ký</span>
            </div>
            <div 
                 className={`sidebar-item ${isPlantsActive ? 'active' : ''}`} 
                onClick={() => onPageChange('plants')}
            >
                <i className="plant-icon">🌿</i>
                <span>Cây trồng</span>
            </div>
          
            {/* Thêm mục Admin nếu người dùng có role admin */}
            {userRole === 'admin' && (
                <div 
                  className={`sidebar-item ${isAdminActive ? 'active' : ''}`} 
                  onClick={() => onPageChange('admin')}
                >
                    <i className="admin-icon">⚙️</i>
                    <span>Quản trị</span>
                </div>
            )}
        </div>
    );
};

export default Sidebar;