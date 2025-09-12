// src/components/CartPage.js
import React, { useMemo } from 'react';
import './CartPage.css';

const CartPage = ({ cart, onUpdateQuantity, onRemoveItem }) => {

    const cartItems = cart?.items || [];

    const subtotal = useMemo(() => {
        // Lấy cart.items trực tiếp từ prop
        const items = cart?.items || [];
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cart?.items]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <h1>Giỏ Hàng Của Bạn</h1>
                <div className="empty-cart-message">
                    <p>Giỏ hàng của bạn đang trống.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h1>Giỏ Hàng Của Bạn</h1>
            <div className="cart-content">
                <div className="cart-items-list">
                    {cartItems.map(item => (
                        <div key={item.productId} className="cart-item">
                            <img src={item.imageUrl} alt={item.productName} className="cart-item-image" />
                            <div className="cart-item-details">
                                <h3 className="item-name">{item.productName}</h3>
                                <p className="item-price">{formatPrice(item.price)} / {item.unit}</p>
                            </div>
                            <div className="cart-item-quantity">
                                <input 
                                    type="number" 
                                    value={item.quantity}
                                    onChange={(e) => onUpdateQuantity(item.productId, Number(e.target.value))}
                                    min="1"
                                />
                            </div>
                            <div className="cart-item-total">
                                {formatPrice(item.price * item.quantity)}
                            </div>
                            <button className="cart-item-remove" onClick={() => onRemoveItem(item.productId)}>
                                &times;
                            </button>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <h2>Tóm tắt Đơn hàng</h2>
                    <div className="summary-row">
                        <span>Tạm tính</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Phí vận chuyển</span>
                        <span>Sẽ được tính sau</span>
                    </div>
                    <div className="summary-total">
                        <span>Tổng cộng</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <button className="checkout-button">
                        Tiến hành Thanh toán
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;