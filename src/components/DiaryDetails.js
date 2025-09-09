import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase-config';
import PlantDataService from '../services/plant.services';
import AddDiaryForm from './AddDiaryForm';
import './DiaryDetails.css';
import DiaryStageDetails from './DiaryStageDetails';

const DiaryDetails = ({ plantId, onBackToList, diaryFilters }) => {
  const [allDiariesForPlant, setAllDiariesForPlant] = useState([]);
  const [plantInfo, setPlantInfo] = useState({ name: '', imageUrl: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDiaryId, setSelectedDiaryId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPlantInfo = async () => {
      if (plantId) {
        try {
          const plantDoc = await PlantDataService.getPlant(plantId);
          if (plantDoc.exists()) {
            const plantData = plantDoc.data();
            setPlantInfo({
              name: plantData.name,
              imageUrl: plantData.imageUrl || 'placeholder.png'
            });
          }
        } catch (err) {
          console.error("Lỗi khi lấy dữ liệu cây trồng:", err.message);
        }
      }
    };
    getPlantInfo();
  }, [plantId]);

  useEffect(() => {
    if (!plantId || !auth.currentUser) return;

    setLoading(true);
    const q = query(
      collection(db, "diaries"),
      where("plantId", "==", plantId),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const diariesData = [];
        querySnapshot.forEach((doc) => {
          diariesData.push({ ...doc.data(), id: doc.id });
        });
        setAllDiariesForPlant(diariesData);
        setLoading(false);
      },
      (error) => {
        console.error("Lỗi khi lấy dữ liệu nhật ký:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [plantId]);

  const displayedDiaries = useMemo(() => {
    if (!diaryFilters) {
      return allDiariesForPlant;
    }

    return allDiariesForPlant.filter(diary => {
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
  }, [allDiariesForPlant, diaryFilters]);

  const handleAddDiaryClick = () => setShowAddForm(true);
  const handleCloseForm = () => setShowAddForm(false);
  const handleViewDetailsClick = (diaryId) => setSelectedDiaryId(diaryId);
  const handleBackToDiaries = () => setSelectedDiaryId(null);

  if (selectedDiaryId) {
    return (
      <div className="diary-details">
        <button onClick={handleBackToDiaries} className="back-button">← Quay lại danh sách nhật ký</button>
        <DiaryStageDetails diaryId={selectedDiaryId} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="diary-details">
        <div className="diary-header">
          <button onClick={onBackToList} className="back-button">← Quay lại danh sách cây trồng</button>
        </div>
        <p>Đang tải nhật ký...</p>
      </div>
    );
  }

  return (
    <div className="diary-details">
      <div className="diary-header">
        <button onClick={onBackToList} className="back-button">← Quay lại danh sách cây trồng</button>
      </div>
      
      {plantInfo.name && <h1>Nhật ký của cây: {plantInfo.name}</h1>}

      <div className="diary-grid">
        {displayedDiaries.length > 0 ? (
          displayedDiaries.map((diary) => (
            <div key={diary.id} className="diary-card">
              <img src={plantInfo.imageUrl} alt={plantInfo.name} className="diary-card-image" />
              <div className="diary-card-content">
                <p><strong>Tên nhật ký:</strong> {diary.title}</p>
                <p><strong>Ngày trồng:</strong> {diary.createdAt?.seconds ? new Date(diary.createdAt.seconds * 1000).toLocaleDateString('vi-VN') : 'N/A'}</p>
                <p>
                  <strong>Ngày kết thúc:</strong> 
                  {diary.endDate?.seconds ? new Date(diary.endDate.seconds * 1000).toLocaleDateString('vi-VN') : 'Đang trồng'}
                </p>
                <p><strong>Trạng thái:</strong> {diary.status || 'Đang canh tác'}</p>
              </div>
              <button onClick={() => handleViewDetailsClick(diary.id)} className="view-detail-button">
                Xem chi tiết
              </button>
            </div>
          ))
        ) : (
          <p> </p>
        )}
      </div>

      <button onClick={handleAddDiaryClick} className="add-diarydetails-button">
        + Thêm nhật ký
      </button>

      {showAddForm && (
        <AddDiaryForm
          plantId={plantId}
          onSave={handleCloseForm}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

export default DiaryDetails;