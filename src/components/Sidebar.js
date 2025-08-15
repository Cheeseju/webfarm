// src/components/Sidebar.js
import React from 'react';
import './Sidebar.css';

const Sidebar = ({ onPageChange, currentPage }) => { // The component must accept these props
    return (
        <div className="sidebar">
            <div 
                className={`sidebar-item ${currentPage === 'diaries' ? 'active' : ''}`} 
                onClick={() => onPageChange('diaries')} // This function call requires the prop
            >
                <i className="calendar-icon">📅</i>
                <span>Nhật ký</span>
            </div>
            <div 
                className={`sidebar-item ${currentPage === 'plants' ? 'active' : ''}`} 
                onClick={() => onPageChange('plants')}
            >
                <i className="plant-icon">🌿</i>
                <span>Cây trồng</span>
            </div>
            <div 
                className={`sidebar-item ${currentPage === 'schedule' ? 'active' : ''}`}
                onClick={() => onPageChange('schedule')}
            >
                <i className="schedule-icon">📋</i>
                <span>Kế hoạch</span>
            </div>
        </div>
    );
};

export default Sidebar;