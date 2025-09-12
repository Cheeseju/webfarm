// src/components/EditProductForm.js
import React, { useState } from 'react';
import shoppingService from '../services/shopping.services.js';
import './EditProductForm.css';

const EditProductForm = ({ product, onClose, onSave }) => {
    const [productName, setProductName] = useState(product.productName);
    const [price, setPrice] = useState(product.price);
    const [unit, setUnit] = useState(product.unit);
    const [description, setDescription] = useState(product.description);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!productName || !price || !unit) {
            setError('Vui lòng điền các trường bắt buộc.');
            return;
        }
        setIsSaving(true);
        setError('');

        const updatedData = {
            productName,
            price: Number(price),
            unit,
            description,
        };

        try {
            await shoppingService.updateProductDetails(product.id, updatedData);
            onSave();
        } catch (err) {
            setError('Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="list-product-form-overlay">
            <div className="list-product-form-container">
                <div className="form-header">
                    <h2>Chỉnh sửa Sản phẩm</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-body">
                        {/* ... Các ô input tương tự ListProductForm ... */}
                        <div className="form-group">
                            <label>Tên sản phẩm <span className="required">*</span></label>
                            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Giá (VND) <span className="required">*</span></label>
                                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" />
                            </div>
                            <div className="form-group">
                                <label>Đơn vị <span className="required">*</span></label>
                                <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                                    <option value="kg">kg</option>
                                    <option value="bó">bó</option>
                                    <option value="quả">quả</option>
                                    <option value="cây">cây</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Mô tả</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4"></textarea>
                        </div>
                         {error && <p className="error-message">{error}</p>}
                    </div>
                    <div className="form-footer">
                        <button type="button" className="cancel-btn" onClick={onClose} disabled={isSaving}>Hủy</button>
                        <button type="submit" className="save-btn" disabled={isSaving}>
                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductForm;