// src/components/Sidebar.js
import React from 'react';
import './Sidebar.css';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

// Add userRole to the component props
const Sidebar = ({ onPageChange, currentPage, userRole, isOpen, isCollapsed, onToggleCollapse }) => {
    const isPlantsActive = currentPage === 'plants' || currentPage === 'plantDetails';
    const isDiariesActive = currentPage === 'diaries' || currentPage === 'diaryDetails';
    const isAdminActive = currentPage === 'admin';
    
    return (
        <div className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
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
            <div className="sidebar-toggle" onClick={onToggleCollapse}>
                {isCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
            </div>
        </div>
    );
};

export default Sidebar;