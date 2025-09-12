// src/components/ProductCard.js
import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="product-card">
            <img src={product.imageUrl} alt={product.productName} className="product-card-image" />
            <div className="product-card-content">
               <h3 className="product-card-name">{product.productName || product.plantName}</h3>
                <p className="product-card-farmer">{product.farmerEmail}</p>
                <div className="product-card-footer">
                    <span className="product-card-price">{formatPrice(product.price)} / {product.unit}</span>
                    <button className="product-card-button">Xem Chi tiết</button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;