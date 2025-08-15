// src/components/DiaryDetails.js
import React, { useState, useEffect } from 'react';
import DiaryDataService from '../services/diary.services';
import PlantDataService from '../services/plant.services';
import AddDiaryForm from './AddDiaryForm'; // Import component AddDiaryForm
import './DiaryDetails.css';

const DiaryDetails = ({ plantId, onBackToList }) => {
  const [diaries, setDiaries] = useState([]);
  const [plantInfo, setPlantInfo] = useState({ name: '', imageUrl: '' });
  const [showAddForm, setShowAddForm] = useState(false); // Trạng thái mới

  const getDiaryData = async () => {
    if (plantId) {
      try {
        const plantDoc = await PlantDataService.getPlant(plantId);
        if (plantDoc.exists()) {
          const plantData = plantDoc.data();
          setPlantInfo({
            name: plantData.name,
            imageUrl: plantData.hinh_anh || 'placeholder.png'
          });
        }

        const diaryData = await DiaryDataService.getDiariesByPlantId(plantId);
        const diariesData = diaryData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setDiaries(diariesData);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu nhật ký:", err.message);
      }
    }
  };

  useEffect(() => {
    getDiaryData();
  }, [plantId]);

  const handleAddDiaryClick = () => {
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    getDiaryData(); // Tải lại dữ liệu sau khi thêm
  };

  return (
    <div className="diary-details">
      <div className="diary-header">
        <button onClick={onBackToList} className="back-button">← Quay lại danh sách </button>
      </div>
      {plantInfo.name && <h1>{plantInfo.name}</h1>}

      <div className="diary-grid">
        {diaries.length > 0 ? (
          diaries.map((diary) => (
            <div key={diary.id} className="diary-card">
              <img src={plantInfo.imageUrl} alt={plantInfo.name} className="diary-card-image" />
              <div className="diary-card-content">
                <p><strong>Tên nhật ký:</strong> {diary.title}</p>
                <p><strong>Ngày trồng:</strong> {new Date(diary.date.seconds * 1000).toLocaleDateString()}</p>
                <p><strong>Ngày kết thúc:</strong> {diary.endDate ? new Date(diary.endDate.seconds * 1000).toLocaleDateString() : 'Đang trồng'}</p>
                <p><strong>Trạng thái:</strong> {diary.status || 'Đang canh tác'}</p>
              </div>
              <button className="view-detail-button">Xem chi tiết</button>
            </div>
          ))
        ) : (
          <p>Chưa có nhật ký nào cho cây trồng này.</p>
        )}
      </div>

      <button onClick={handleAddDiaryClick} className="add-diarydetails-button">+ Thêm nhật ký</button>

      {/* Hiển thị form thêm nhật ký */}
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