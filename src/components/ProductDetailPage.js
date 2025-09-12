// src/components/ProductDetailPage.js
import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import shoppingService from '../services/shopping.services';
import { auth } from '../firebase-config';
import QRCode from 'react-qr-code';
import './ProductDetailPage.css';

const ProductDetailPage = ({ productId, onBack, onAddToCart, onViewDiary }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { showNotification } = useNotification();
    const user = auth.currentUser;
    const [showQRCode, setShowQRCode] = useState(false);
    
    useEffect(() => {
        if (!productId) return;
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const docSnap = await shoppingService.getProductById(productId);
                if (docSnap.exists()) {
                    setProduct({ ...docSnap.data(), id: docSnap.id });
                }
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        fetchProduct();
    }, [productId]);

    const handleAddToCartClick = () => {
        if (!user) {
            showNotification('Vui lòng đăng nhập để mua hàng.', 'info');
            return;
        }
        if (quantity > product.totalStock) {
            showNotification('Số lượng mua không được lớn hơn tồn kho.', 'error');
            return;
        }
        onAddToCart(product, quantity);
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    if (loading) return <div className="detail-page-loading">Đang tải...</div>;
    if (!product) return <div className="detail-page-loading">Không tìm thấy sản phẩm.</div>;

    const diaryIdForQR = product.contributingDiaries?.[0]?.diaryId;
    const qrValue = diaryIdForQR ? `https://webcaytrong-19dc6.web.app/view-diary/${diaryIdForQR}` : '';

    return (
        <div className="product-detail-page">
            <button onClick={onBack} className="back-button">← Quay lại Chợ</button>
            <div className="product-detail-content">
                <div className="product-detail-image">
                    <img src={product.imageUrl || 'https://via.placeholder.com/500'} alt={product.productName} />
                </div>
                <div className="product-detail-info">
                    <h1>{product.productName}</h1>
                    <p className="farmer-info">Cung cấp bởi: <strong>{product.farmerEmail}</strong></p>
                    <p className="price-info">{formatPrice(product.price)} / {product.unit}</p>
                    <p className="stock-info">Tồn kho còn lại: {product.totalStock}</p>
                    <p className="description">{product.description}</p>
                    
                    <div className="actions">
                        <div className="quantity-selector">
                            <label>Số lượng:</label>
                            <input 
                                type="number" 
                                value={quantity} 
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                min="1"
                                max={product.totalStock}
                            />
                        </div>
                        <button className="add-to-cart-btn" onClick={handleAddToCartClick} disabled={product.totalStock < 1}>
                            Thêm vào giỏ
                        </button>
                    </div>

                    {diaryIdForQR && (
                        <button className="view-diary-btn" onClick={() => setShowQRCode(true)}>
                            📷 Quét QR Truy xuất Nguồn gốc
                        </button>
                    )}
                </div>
            </div>

            {showQRCode && (
                <div className="qr-code-overlay" onClick={() => setShowQRCode(false)}>
                    <div className="qr-code-container" onClick={(e) => e.stopPropagation()}>
                        <h3>Quét mã để xem nhật ký canh tác</h3>
                        <div style={{ background: 'white', padding: '16px' }}>
                            <QRCode value={qrValue} size={256} />
                        </div>
                        <button onClick={() => setShowQRCode(false)} className="close-qr-button">Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;