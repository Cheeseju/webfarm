// src/services/plant.services.js

import { db } from "../firebase-config";
import {
  collection, getDocs, addDoc, doc,
  getDoc, query, where, updateDoc
} from "firebase/firestore";

class PlantDataService {

addPlant = (newPlant) => {
    const plantCollectionRef = collection(db, "plants");
    const plantWithMetadata = {
      ...newPlant, // newPlant đã chứa sẵn isPublic: true hoặc false
      name_lowercase: newPlant.name.toLowerCase(),
      createdAt: new Date(),
    };
    return addDoc(plantCollectionRef, plantWithMetadata);
};

  updatePlant = (id, updatedPlant) => {
    const plantDoc = doc(db, "plants", id);
    const dataToUpdate = {
      ...updatedPlant,
      name_lowercase: updatedPlant.name.toLowerCase()
    };
    return updateDoc(plantDoc, dataToUpdate);
  };

  isPlantNameExist = async (name, type, userId, excludeId = null) => {
    if (!userId) return false;
    const plantsRef = collection(db, "plants");
    const lowerCaseName = name.toLowerCase();

    const publicQuery = query(
      plantsRef,
      where("name_lowercase", "==", lowerCaseName),
      where("type", "==", type),
      where("isPublic", "==", true)
    );

    const privateQuery = query(
      plantsRef,
      where("name_lowercase", "==", lowerCaseName),
      where("type", "==", type),
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

  // HÀM GÂY LỖI NẰM Ở ĐÂY, ĐẢM BẢO NÓ CÓ TÊN CHÍNH XÁC LÀ 'getPlant'
  getPlant = (id) => {
    const plantDoc = doc(db, "plants", id);
    return getDoc(plantDoc);
  };
}

const plantDataService = new PlantDataService();
export default plantDataService;