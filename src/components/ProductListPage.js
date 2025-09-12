import React, { useState, useEffect, useMemo } from 'react';
import shoppingService from '../services/shopping.services';
import ProductCard from './ProductCard';
import './ProductListPage.css';
import { normalizeString } from '../utils/textUtils';

const ProductListPage = ({ onProductSelect, searchQuery }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const data = await shoppingService.getPublishedProducts();
                const productList = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setProducts(productList);
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);
    const filteredProducts = useMemo(() => {
        if (!searchQuery) {
            return products;
        }
        // Chuẩn hóa từ khóa tìm kiếm
        const normalizedQuery = normalizeString(searchQuery);

        return products.filter(product => {
            // Chuẩn hóa tên sản phẩm và loại cây trồng
            const productName = normalizeString(product.productName || product.plantName || '');
            const plantType = normalizeString(product.plantType || '');
            
            // So sánh các chuỗi đã được chuẩn hóa
            return productName.includes(normalizedQuery) || plantType.includes(normalizedQuery);
        });
    }, [products, searchQuery]);

    if (loading) {
        return <div className="product-list-page">Đang tải sản phẩm...</div>;
    }

    return (
        <div className="product-list-page">
            <h1>Chợ Nông Sản</h1>
            <p>Khám phá các sản phẩm sạch được canh tác minh bạch.</p>
            <div className="product-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <div key={product.id} onClick={() => onProductSelect(product.id)}>
                            <ProductCard product={product} />
                        </div>
                    ))
                ) : (
                    <p>Hiện chưa có sản phẩm nào được đăng bán phù hợp với tìm kiếm của bạn.</p>
                )}
            </div>
        </div>
    );
};

export default ProductListPage;