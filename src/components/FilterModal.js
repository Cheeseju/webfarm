import React, { useState } from 'react';
import './FilterModal.css';

const FilterModal = ({ onClose, onApplyFilter }) => {
    const [filters, setFilters] = useState({
        title: '',
        startDate: '',
        endDate: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApply = () => {
        // Chỉ áp dụng bộ lọc nếu có ít nhất 1 giá trị được nhập
        const isActive = filters.title || filters.startDate || filters.endDate;
        onApplyFilter(isActive ? filters : null);
        onClose();
    };
    
    const handleClear = () => {
        const clearedFilters = { title: '', startDate: '', endDate: '' };
        setFilters(clearedFilters);
        onApplyFilter(null); // Gửi null để xóa bộ lọc
        onClose();
    };

    return (
        <div className="filter-modal-overlay">
            <div className="filter-modal-container">
                <div className="filter-modal-header">
                    <h2>Lọc Nhật Ký Nâng Cao</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="filter-modal-body">
                    <div className="form-group">
                        <label>Tên nhật ký</label>
                        <input
                            type="text"
                            name="title"
                            value={filters.title}
                            onChange={handleInputChange}
                            placeholder="Nhập tên nhật ký cần tìm..."
                        />
                    </div>
                    <div className="form-group">
                        <label>Ngày bắt đầu (từ ngày)</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Ngày kết thúc (đến ngày)</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div className="filter-modal-footer">
                    <button onClick={handleClear} className="clear-btn">Xóa bộ lọc</button>
                    <button onClick={handleApply} className="apply-btn">Áp dụng</button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
