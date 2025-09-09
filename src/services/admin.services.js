// src/services/admin.services.js

import { 
  collection, getDocs, query, where,
  doc, updateDoc, deleteDoc, orderBy
} from 'firebase/firestore';
import { db } from '../firebase-config';

class AdminDataService {
  getUsersByRole = async (role) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', role));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      throw error;
    }
  };

  getAllUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('email'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        isDisabled: doc.data().isDisabled || false
      }));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      throw error;
    }
  };

  updateUserRole = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật vai trò:', error);
      throw error;
    }
  };

  toggleUserStatus = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isDisabled: !currentStatus });
      return true;
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái người dùng:', error);
      throw error;
    }
  };

  deleteUser = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      throw error;
    }
  };

  getFarmersStats = async () => {
    try {
      const farmers = await this.getUsersByRole('farmer');
      const stats = [];
      for (const farmer of farmers) {
        const plantsQuery = query(collection(db, 'plants'), where('userId', '==', farmer.id));
        const plantsSnapshot = await getDocs(plantsQuery);
        const diariesQuery = query(collection(db, 'diaries'), where('userId', '==', farmer.id));
        const diariesSnapshot = await getDocs(diariesQuery);
        let joinedDate = new Date();
        if (farmer.createdAt && typeof farmer.createdAt.toDate === 'function') {
          joinedDate = farmer.createdAt.toDate();
        }
        stats.push({
          id: farmer.id,
          email: farmer.email,
          plantCount: plantsSnapshot.size,
          diaryCount: diariesSnapshot.size,
          joinedDate
        });
      }
      return stats;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê nông dân:', error);
      throw error;
    }
  };

  // Duyệt cây trồng thành public - Vẫn giữ lại phòng khi bạn cần sau này
  approvePlant = async (plantId) => {
    try {
      const plantRef = doc(db, 'plants', plantId);
      await updateDoc(plantRef, {
        isPublic: true,
        approvedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi duyệt cây trồng:', error);
      throw error;
    }
  };
}

const adminDataService = new AdminDataService();
export default adminDataService;