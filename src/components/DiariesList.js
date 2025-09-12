import React, { useState, useEffect, useMemo } from 'react';
import './DiariesList.css';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase-config';
import { useNotification } from '../context/NotificationContext';


const DiariesList = ({ onPlantSelect, userRole, searchQuery, diaryFilters }) => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const user = auth.currentUser;
  const [allFarmerDiaries] = useState([]);

 useEffect(() => {
    const getPlants = async () => {
      setLoading(true);
      
      try {
        let plantsData = [];
        const plantsRef = collection(db, 'plants');

        // Nếu là farmer, lấy cả public và private
        if (user && userRole === 'farmer') {
          const publicQuery = query(plantsRef, where("isPublic", "==", true));
          const privateQuery = query(plantsRef, where("userId", "==", user.uid));

          const [publicSnapshot, privateSnapshot] = await Promise.all([
            getDocs(publicQuery),
            getDocs(privateQuery)
          ]);

          const publicPlants = publicSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          const privatePlants = privateSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

          const plantMap = new Map();
          [...publicPlants, ...privatePlants].forEach(plant => plantMap.set(plant.id, plant));
          plantsData = Array.from(plantMap.values());
        } else { 
            // Ngược lại (là buyer hoặc guest), chỉ lấy public
            const publicQuery = query(plantsRef, where("isPublic", "==", true));
            const querySnapshot = await getDocs(publicQuery);
            plantsData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        }
        
        setPlants(plantsData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu cây trồng cho nhật ký:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getPlants();
  }, [user, userRole]);

  const filteredPlants = useMemo(() => {
    let finalPlants = [...plants];

    if (userRole === 'farmer' && diaryFilters) {
        const matchingDiaries = allFarmerDiaries.filter(diary => {
            const diaryDate = diary.createdAt?.toDate();
            if(!diaryDate) return false;

            const titleMatch = !diaryFilters.title || diary.title.toLowerCase().includes(diaryFilters.title.toLowerCase());
            // 1. Tạo bản sao của ngày tháng từ bộ lọc
            let startDateFilter = diaryFilters.startDate ? new Date(diaryFilters.startDate) : null;
            let endDateFilter = diaryFilters.endDate ? new Date(diaryFilters.endDate) : null;
            
            // 2. Thay đổi giờ trên bản sao, không phải bản gốc
            if (startDateFilter) startDateFilter.setHours(0, 0, 0, 0);
            if (endDateFilter) endDateFilter.setHours(23, 59, 59, 999);

            const startDateMatch = !startDateFilter || diaryDate >= startDateFilter;
            const endDateMatch = !endDateFilter || diaryDate <= endDateFilter;
            
            return titleMatch && startDateMatch && endDateMatch;
        });
        const matchingPlantIds = new Set(matchingDiaries.map(d => d.plantId));
        finalPlants = finalPlants.filter(plant => matchingPlantIds.has(plant.id));
    }

    // Luôn áp dụng bộ lọc tìm kiếm chung
    return finalPlants.filter(plant => {
        return !searchQuery || plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (plant.type && plant.type.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [plants, searchQuery, diaryFilters, allFarmerDiaries, userRole]);

  const handlePlantClick = (plant) => {
    if (userRole !== 'farmer') {
      showNotification('Vui lòng sử dụng tài khoản nông dân để xem và quản lý nhật ký chi tiết.', 'info');
      return;
    }
    onPlantSelect(plant.id);
  };

  if (loading) return <div className="loading-container">Đang tải...</div>;
  
  const groupedPlants = filteredPlants.reduce((acc, plant) => {
    const type = plant.type || 'Khác';
    if (!acc[type]) acc[type] = [];
    acc[type].push(plant);
    return acc;
  }, {});

  return (
    <div className="diaries-list">
      <div className="diaries-list-header">
          <h2>CHỌN CÂY TRỒNG ĐỂ XEM NHẬT KÝ</h2>
          <p>Tính năng xem và quản lý nhật ký chi tiết dành cho tài khoản nông dân</p>
      </div>

      {Object.keys(groupedPlants).length > 0 ? (
        Object.keys(groupedPlants).map((type) => (
          <div key={type} className="diaries-list-plant-group">
            <h3>{type}</h3>
            {groupedPlants[type].map((plant) => (
              <div 
                key={plant.id} 
                className="diaries-list-plant-card" 
                onClick={() => handlePlantClick(plant)}
              >
                <img src={plant.imageUrl || 'placeholder-image.png'} alt={plant.name} className="diary-plant-image" />
                <div className="diary-plant-info">
                  <h3>{plant.name}</h3>
                  <p>Click để xem các nhật ký canh tác</p>
                  <button>Xem chi tiết</button>
                </div>
              </div>
            ))}
          </div>
        ))
      ) : (
        <p className="no-results-message">Không tìm thấy cây trồng nào phù hợp với điều kiện lọc.</p>
      )}
    </div>
  );
};

export default DiariesList;