// src/services/shopping.services.js
import { db } from "../firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { normalizeString } from '../utils/textUtils';

const productsCollectionRef = collection(db, "products");

class ShoppingService {
    // Hàm để nông dân đăng bán một sản phẩm mới
    addProduct = (productData) => {
        const productWithMetadata = {
            ...productData,
            // Thêm các trường chuẩn hóa để tìm kiếm và lọc
            productName_normalized: normalizeString(productData.productName),
            plantType_normalized: normalizeString(productData.plantType),
            isPublished: true, // Mặc định là hiển thị ngay
            createdAt: serverTimestamp(), // Dùng timestamp của server
        };
        return addDoc(productsCollectionRef, productWithMetadata);
    };
}

const shoppingService = new ShoppingService();
export default shoppingService;