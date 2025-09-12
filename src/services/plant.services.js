// src/services/plant.services.js

import { db } from "../firebase-config";
import {
  collection, getDocs, addDoc, doc,
  getDoc, query, where, updateDoc
} from "firebase/firestore";
import { normalizeString } from '../utils/textUtils';

class PlantDataService {

  addPlant = (newPlant) => {
    const plantCollectionRef = collection(db, "plants");
    const plantWithMetadata = {
      ...newPlant,
      createdAt: new Date(),
      // Thêm các trường đã được chuẩn hóa để tìm kiếm hiệu quả
      name_normalized: normalizeString(newPlant.name),
      type_normalized: normalizeString(newPlant.type),
    };
    return addDoc(plantCollectionRef, plantWithMetadata);
  };

  updatePlant = (id, updatedPlant) => {
    const plantDoc = doc(db, "plants", id);
    const dataToUpdate = {
      ...updatedPlant,
      // Cập nhật trường chuẩn hóa khi tên cây thay đổi
      name_normalized: normalizeString(updatedPlant.name),
    };
    return updateDoc(plantDoc, dataToUpdate);
  };

  isPlantNameExist = async (name, type, userId, excludeId = null) => {
    if (!userId) return false;
    const plantsRef = collection(db, "plants");
    
    // Chuẩn hóa dữ liệu đầu vào để so sánh
    const normalizedName = normalizeString(name);
    const normalizedType = normalizeString(type);

    // Truy vấn chỉ dựa trên các trường đã chuẩn hóa để kiểm tra tất cả trường hợp
    const publicQuery = query(
      plantsRef,
      where("name_normalized", "==", normalizedName),
      where("type_normalized", "==", normalizedType),
      where("isPublic", "==", true)
    );

    const privateQuery = query(
      plantsRef,
      where("name_normalized", "==", normalizedName),
      where("type_normalized", "==", normalizedType),
      where("userId", "==", userId)
    );

    const [publicSnapshot, privateSnapshot] = await Promise.all([
      getDocs(publicQuery),
      getDocs(privateQuery),
    ]);
    
    const allMatches = [...publicSnapshot.docs, ...privateSnapshot.docs];
    const uniqueIds = new Set(allMatches.map(doc => doc.id));
    
    if (excludeId) {
      uniqueIds.delete(excludeId);
    }
    
    return uniqueIds.size > 0;
  };

  getPlantTypes = async (userId) => {
    try {
      const plantsRef = collection(db, "plants");
      const publicQuery = query(plantsRef, where("isPublic", "==", true));
      const privateQuery = query(plantsRef, where("userId", "==", userId));
      
      const [publicSnapshot, privateSnapshot] = await Promise.all([
        getDocs(publicQuery),
        getDocs(privateQuery)
      ]);

      const publicTypes = publicSnapshot.docs.map(doc => doc.data().type);
      const privateTypes = privateSnapshot.docs.map(doc => doc.data().type);
      
      const allTypes = [...publicTypes, ...privateTypes];
      const uniqueTypes = [...new Set(allTypes)].filter(type => type).sort();
      
      return uniqueTypes;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách loại cây trồng:", error);
      return [];
    }
  };

  getPlant = (id) => {
    const plantDoc = doc(db, "plants", id);
    return getDoc(plantDoc);
  };
}

const plantDataService = new PlantDataService();
export default plantDataService;