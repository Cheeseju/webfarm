// src/services/diary.services.js
import { db } from "../firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc // Import doc để tạo tham chiếu
} from "firebase/firestore";

const diaryCollectionRef = collection(db, "diaries");

class DiaryDataService {
  addDiary = (newDiary) => {
    return addDoc(diaryCollectionRef, newDiary);
  };
  
  getDiariesByPlantId = (plantId) => {
    const q = query(diaryCollectionRef, where("plantId", "==", plantId));
    return getDocs(q);
  };
  
  // Hàm mới để thêm một giai đoạn vào subcollection
  addStageToDiary = (diaryId, newStage) => {
    const diaryDocRef = doc(db, "diaries", diaryId);
    const stagesCollectionRef = collection(diaryDocRef, "stages");
    return addDoc(stagesCollectionRef, newStage);
  };
}

export default new DiaryDataService();