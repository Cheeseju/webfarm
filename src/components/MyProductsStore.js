// src/components/MyProductsStore.js
import React, { useState, useEffect, useCallback } from 'react';
import shoppingService from '../services/shopping.services';
import { auth } from '../firebase-config';
import { useNotification } from '../context/NotificationContext';
import './MyProductsStore.css';
import EditProductForm from './EditProductForm'; // Import form sửa sản phẩm

const MyProductsStore = () => {
    const [myProducts, setMyProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser;
    const { showNotification } = useNotification();
    const [saleQuantities, setSaleQuantities] = useState({});
    const [expandedProductId, setExpandedProductId] = useState(null);

    // State cho việc chỉnh sửa sản phẩm
    const [showEditForm, setShowEditForm] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);

    const fetchMyProducts = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await shoppingService.getProductsByFarmer(user.uid);
            const productList = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setMyProducts(productList);
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error);
            showNotification('Không thể tải danh sách sản phẩm.', 'error');
        } finally {
            setLoading(false);
        }
    }, [user, showNotification]);

    useEffect(() => {
        fetchMyProducts();
    }, [fetchMyProducts]);

    const handleSaleQuantityChange = (productId, value) => {
        setSaleQuantities(prev => ({ ...prev, [productId]: value }));
    };

    const handleRecordSale = async (productId) => {
        const quantity = saleQuantities[productId];
        if (!quantity || Number(quantity) <= 0) {
            showNotification('Vui lòng nhập số lượng hợp lệ.', 'error');
            return;
        }
        try {
            await shoppingService.recordOfflineSale(productId, quantity);
            showNotification('Ghi nhận bán trực tiếp thành công!', 'success');
            setSaleQuantities(prev => ({ ...prev, [productId]: '' }));
            fetchMyProducts();
        } catch (error) {
             console.error("Chi tiết lỗi khi ghi nhận bán trực tiếp:", error);
            showNotification('Có lỗi xảy ra khi ghi nhận.', 'error');
        }
    };

    const handleToggleVisibility = async (product) => {
        try {
            await shoppingService.toggleProductVisibility(product.id, product.isPublished);
            showNotification(`Đã ${product.isPublished ? 'ẩn' : 'hiển thị'} sản phẩm!`, 'success');
            fetchMyProducts();
        } catch (error) {
            showNotification('Lỗi khi cập nhật sản phẩm.', 'error');
        }
    };

    const toggleDetails = (productId) => {
        setExpandedProductId(prevId => (prevId === productId ? null : productId));
    };

    // Hàm xử lý cho form sửa
    const handleOpenEditForm = (product) => {
        setProductToEdit(product);
        setShowEditForm(true);
    };

    const handleProductUpdated = () => {
        setShowEditForm(false);
        setProductToEdit(null);
        showNotification('Cập nhật sản phẩm thành công!', 'success');
        fetchMyProducts();
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (loading) return <div className="my-store-container">Đang tải...</div>;

    return (
        <div className="my-store-container">
            <h1>Cửa hàng của tôi</h1>
            <p>Quản lý các sản phẩm và kho hàng của bạn.</p>

            <div className="products-table-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Giá</th>
                            <th>Bán Online</th>
                            <th>Bán Trực tiếp</th>
                            <th>Còn lại</th>
                            <th className="offline-sale-header">Bán Trực tiếp (Nhập SL)</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myProducts.length > 0 ? (
                            myProducts.map(product => (
                                <React.Fragment key={product.id}>
                                    <tr>
                                        <td>
                                            <div className="product-info-cell">
                                                <img src={product.imageUrl || 'https://via.placeholder.com/150'} alt={product.productName} />
                                                <div>
                                                    <span>{product.productName}</span>
                                                    <span className="product-type">{product.plantType}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{formatPrice(product.price)} / {product.unit}</td>
                                        <td>{product.soldOnline || 0}</td>
                                        <td>{product.soldOffline || 0}</td>
                                        <td className="stock-remaining">{product.totalStock || 0}</td>
                                        <td>
                                            <div className="offline-sale-cell">
                                                <input
                                                    type="number"
                                                    placeholder="SL"
                                                    value={saleQuantities[product.id] || ''}
                                                    onChange={(e) => handleSaleQuantityChange(product.id, e.target.value)}
                                                />
                                                <button onClick={() => handleRecordSale(product.id)}>Lưu</button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="toggle-btn" onClick={() => handleToggleVisibility(product)}>
                                                    {product.isPublished ? 'Ẩn' : 'Hiện'}
                                                </button>
                                                <button className="edit-btn" onClick={() => handleOpenEditForm(product)}>Sửa</button>
                                                <button className="details-btn" onClick={() => toggleDetails(product.id)}>
                                                    {expandedProductId === product.id ? '▲' : '▼'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedProductId === product.id && (
                                        <tr className="details-row">
                                            <td colSpan="7">
                                                <div className="contribution-details">
                                                    <strong>Các nhật ký đã hoàn thành cho cây trồng:</strong>
                                                    <ul>
                                                        {product.contributingDiaries?.map(diary => (
                                                            <li key={diary.diaryId}>
                                                                 Tên nhật ký: <strong>{diary.diaryTitle}</strong> (số lượng cây trồng sau gieo trồng là {diary.quantity})
                                                             </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr><td colSpan="7">Bạn chưa có sản phẩm nào trong kho.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showEditForm && (
                <EditProductForm 
                    product={productToEdit}
                    onClose={() => setShowEditForm(false)}
                    onSave={handleProductUpdated}
                />
            )}
        </div>
    );
};

export default MyProductsStore;