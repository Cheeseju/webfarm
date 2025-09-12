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
const activityLogCollectionRef = collection(db, "activity_log");

class DiaryDataService {
  addDiary = async (newDiary, userEmail) => {
    const diaryWithMetadata = {
      ...newDiary,
      createdAt: new Date(),
    };

    // Ghi lại hoạt động
    try {
      await addDoc(activityLogCollectionRef, {
        userEmail: userEmail,
        action: "thêm nhật ký",
        details: newDiary.title,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Lỗi khi ghi log hoạt động:", error);
    }

    return addDoc(diaryCollectionRef, diaryWithMetadata);
  };
  
  addStageToDiary = async (diaryId, newStage, userEmail) => {
    const diaryDocRef = doc(db, "diaries", diaryId);
    const stagesCollectionRef = collection(diaryDocRef, "stages");

    // Ghi lại hoạt động
    try {
      await addDoc(activityLogCollectionRef, {
        userEmail: userEmail,
        action: "thêm giai đoạn canh tác",
        details: newStage.task, // Ghi lại tên công việc
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Lỗi khi ghi log hoạt động:", error);
    }

    return addDoc(stagesCollectionRef, newStage);
  };
  logQrCreationActivity = async (userEmail, diaryTitle) => {
    try {
      await addDoc(activityLogCollectionRef, {
        userEmail: userEmail,
        action: "tạo mã QR", // Loại hoạt động mới
        details: `cho nhật ký "${diaryTitle}"`, // Thêm chi tiết
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Lỗi khi ghi log tạo QR:", error);
    }
  };
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
  
  updateDiary = (id, updatedFields) => {
    const diaryDoc = doc(db, "diaries", id);
    return updateDoc(diaryDoc, updatedFields);
  };

  isDiaryNameExistForPlant = async (userId, diaryName, plantId, excludeDiaryId = null) => {
    try {
      const diariesRef = collection(db, "diaries");
      
      const q = query(
        diariesRef, 
        where("userId", "==", userId),
        where("plantId", "==", plantId),
        where("title", "==", diaryName)
      );
      
      const querySnapshot = await getDocs(q);
      
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