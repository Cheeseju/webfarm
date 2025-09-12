// src/services/shopping.services.js
import { db, auth } from "../firebase-config";
import {
    collection, doc, getDoc, setDoc, updateDoc,
    serverTimestamp, arrayUnion, arrayRemove, increment,
    getDocs, query, where, orderBy,addDoc
} from "firebase/firestore";
import { normalizeString } from '../utils/textUtils';

const productsCollectionRef = collection(db, "products");

class ShoppingService {

productExistsForFarmer = async (plantId, farmerId) => {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("plantId", "==", plantId), where("farmerId", "==", farmerId));
    const querySnapshot = await getDocs(q);
    // Trả về true nếu tìm thấy bất kỳ tài liệu nào
    return !querySnapshot.empty;
};

updateInventoryFromDiary = async (plant, diary, quantity, isAdding, priceInfo) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    // BƯỚC 1: Tìm kiếm sản phẩm của nông dân này cho loại cây này
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("plantId", "==", plant.id), where("farmerId", "==", user.uid));

    const querySnapshot = await getDocs(q);

    const diaryContribution = {
        diaryId: diary.id,
        diaryTitle: diary.title || 'Không có tiêu đề',
        quantity: quantity || 0,
    };

    if (!querySnapshot.empty) {
        // NẾU TÌM THẤY SẢN PHẨM ĐÃ CÓ -> CẬP NHẬT
        const productDoc = querySnapshot.docs[0]; // Lấy tài liệu đầu tiên tìm thấy
        const productRef = doc(db, "products", productDoc.id);

        await updateDoc(productRef, {
            initialStock: increment(isAdding ? quantity : -quantity),
            totalStock: increment(isAdding ? quantity : -quantity),
            contributingDiaries: isAdding ? arrayUnion(diaryContribution) : arrayRemove(diaryContribution)
        });

    } else if (isAdding && priceInfo) {
        // NẾU KHÔNG TÌM THẤY -> TẠO MỚI SẢN PHẨM
        const productData = {
            plantId: plant.id, // QUAN TRỌNG: Lưu lại ID của cây trồng gốc
            plantName: plant.name || 'Không có tên',
            productName: plant.name || 'Không có tên', // Thống nhất dùng productName
            imageUrl: plant.imageUrl || '',
            plantType: plant.type || 'Không xác định',
            farmerId: user.uid,
            farmerEmail: user.email,
            description: plant.description || '',
            isPublished: true,
            initialStock: quantity || 0,
            totalStock: quantity || 0,
            soldOnline: 0,
            soldOffline: 0,
            contributingDiaries: [diaryContribution],
            createdAt: serverTimestamp(),
            productName_normalized: normalizeString(plant.name || ''),
            plantType_normalized: normalizeString(plant.type || ''),
            price: priceInfo.price,
            unit: priceInfo.unit,
        };
        // Dùng addDoc để Firestore tự tạo ID mới
        await addDoc(collection(db, "products"), productData);
    }
};
    recordOfflineSale = (plantId, quantitySold) => {
        const productRef = doc(db, "products", plantId);
        return updateDoc(productRef, {
            soldOffline: increment(Number(quantitySold)),
            totalStock: increment(-Number(quantitySold))
        });
    };

    getProductsByFarmer = (farmerId) => {
        const q = query(
            productsCollectionRef,
            where("farmerId", "==", farmerId),
            orderBy("createdAt", "desc")
        );
        return getDocs(q);
    };

    toggleProductVisibility = (productId, currentStatus) => {
        const productDoc = doc(db, "products", productId);
        return updateDoc(productDoc, {
            isPublished: !currentStatus
        });
    };

    updateProductDetails = (productId, newData) => {
        const productDoc = doc(db, "products", productId);
        const dataToUpdate = {
            ...newData,
            productName_normalized: normalizeString(newData.productName)
        };
        return updateDoc(productDoc, dataToUpdate);
    };

    getPublishedProducts = () => {
        const q = query(
            productsCollectionRef,
            where("isPublished", "==", true),
            where("totalStock", ">", 0),
            orderBy("createdAt", "desc")
        );
        return getDocs(q);
    };

    getProductById = (productId) => {
        const productRef = doc(db, "products", productId);
        return getDoc(productRef);
    };

    updateCart = (userId, items) => {
        const cartRef = doc(db, "carts", userId);
        return setDoc(cartRef, { userId, items, updatedAt: serverTimestamp() }, { merge: true });
    };

    getUserCart = (userId) => {
        const cartRef = doc(db, "carts", userId);
        return getDoc(cartRef);
    };
}

const shoppingService = new ShoppingService();
export default shoppingService;