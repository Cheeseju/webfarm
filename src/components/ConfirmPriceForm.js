// src/components/ConfirmPriceForm.js
import React, { useState } from 'react';
import './ConfirmPriceForm.css'; // Tận dụng lại CSS cũ cho gọn

const ConfirmPriceForm = ({ data, onClose, onConfirm }) => {
    const { plant } = data;
    const [price, setPrice] = useState(plant.price || '');
    const [unit, setUnit] = useState(plant.unit || 'cây');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (!price || Number(price) <= 0) {
            setError('Vui lòng nhập một mức giá hợp lệ.');
            return;
        }
        // Gọi lại hàm cha với dữ liệu giá và đơn vị mới
        onConfirm({ price: Number(price), unit });
    };

    return (
        <div className="list-product-form-overlay">
            <div className="list-product-form-container">
                <div className="form-header">
                    <h2>Xác nhận giá bán</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="form-body">
                    <div className="product-info-preview">
                        <img src={plant.imageUrl} alt={plant.name} />
                        <h4>Sản phẩm: "{plant.name}"</h4>
                    </div>
                    <p>Vui lòng xác nhận giá và đơn vị tính trước khi hoàn thành nhật ký</p>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Giá (VND) <span className="required">*</span></label>
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" />
                        </div>
                        <div className="form-group">
                            <label>Đơn vị <span className="required">*</span></label>
                            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                                <option value="cây">cây</option>
                                <option value="kg">kg</option>
                                <option value="bó">bó</option>
                                <option value="quả">quả</option>
                            </select>
                        </div>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                </div>
                <div className="form-footer">
                    <button type="button" className="cancel-btn" onClick={onClose}>Hủy</button>
                    <button type="button" className="save-btn" onClick={handleConfirm}>
                        Xác nhận & Cập nhật Kho
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmPriceForm;