// src/services/diary.services.js

import { db } from "../firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";


const diaryCollectionRef = collection(db, "diaries");

class DiaryDataService {
  // Sửa phương thức addDiary để thêm trường userId
  addDiary = (newDiary) => {
    const diaryWithMetadata = {
      ...newDiary,
      createdAt: new Date(),
    };
    return addDoc(diaryCollectionRef, diaryWithMetadata);
  };
  
  // Thêm phương thức mới
  getDiariesByUser = (userId) => {
    const q = query(diaryCollectionRef, where("userId", "==", userId));
    return getDocs(q);
  };

  getDiariesByPlantId = (plantId) => {
    const q = query(diaryCollectionRef, where("plantId", "==", plantId));
    return getDocs(q);
  };
  
  getDiary = (diaryId) => {
    const diaryDoc = doc(db, "diaries", diaryId);
    return getDoc(diaryDoc);
  };
  
  getStagesByDiaryId = (diaryId) => {
    const stagesCollectionRef = collection(db, "diaries", diaryId, "stages");
    return getDocs(stagesCollectionRef);
  };
  
  addStageToDiary = (diaryId, newStage) => {
    const diaryDocRef = doc(db, "diaries", diaryId);
    const stagesCollectionRef = collection(diaryDocRef, "stages");
    return addDoc(stagesCollectionRef, newStage);
  };
  
  // Giữ tick DiaryDetails
  updateDiary = (id, updatedFields) => {
    const diaryDoc = doc(db, "diaries", id);
    return updateDoc(diaryDoc, updatedFields);
  };

  // Thêm hàm kiểm tra trùng tên nhật ký
 isDiaryNameExistForPlant = async (userId, diaryName, plantId, excludeDiaryId = null) => {
  try {
    const diariesRef = collection(db, "diaries");
    
    // Query diaries có cùng userId, plantId và title
    const q = query(
      diariesRef, 
      where("userId", "==", userId),
      where("plantId", "==", plantId),
      where("title", "==", diaryName)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Nếu có excludeDiaryId (khi chỉnh sửa), lọc bỏ diary đó
    if (excludeDiaryId) {
      const filteredDocs = querySnapshot.docs.filter(doc => doc.id !== excludeDiaryId);
      return filteredDocs.length > 0;
    }
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Lỗi khi kiểm tra trùng tên nhật ký:", error);
    throw error;
  }
};
}

const diaryDataService = new DiaryDataService();
export default diaryDataService;