import React, { useState } from 'react';
import DiaryDataService from '../services/diary.services';

import './AddDiaryForm.css';
import { auth } from '../firebase-config';

const AddDiaryForm = ({ plantId, onSave, onCancel, plantImageUrl }) => {
  const user = auth.currentUser;
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [diaryData, setDiaryData] = useState({
    title: '',
    date: formattedDate,
    status: 'Đang canh tác',
  });
  
  const [titleError, setTitleError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDiaryData({
      ...diaryData,
      [name]: value,
    });
    
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (name === 'title' && value.trim() !== '') {
      setTitleError('');
    }
  };

  const handleSave = async (e) => {
  e.preventDefault();
  
  if (!diaryData.title.trim()) {
    setTitleError("Vui lòng điền tên nhật ký!");
    return;
  }
  
  setIsChecking(true);
  
  try {
    // Kiểm tra trùng tên nhật ký trong cùng cây trồng
    const isExist = await DiaryDataService.isDiaryNameExistForPlant(
      user.uid, 
      diaryData.title, 
      plantId
    );
    
    if (isExist) {
      setTitleError(`Tên nhật ký "${diaryData.title}" đã tồn tại cho cây trồng này. Vui lòng chọn tên khác.`);
      setIsChecking(false);
      return;
    }
    
    // Nếu không trùng, tiếp tục lưu nhật ký
    const newDiaryData = {
      ...diaryData,
      plantId: plantId,
      date: new Date(diaryData.date),
      userId: user.uid,
    };
    
    await DiaryDataService.addDiary(newDiaryData);
    onSave();
  } catch (err) {
    console.error("Lỗi khi thêm nhật ký:", err.message);
    setTitleError("Đã xảy ra lỗi khi lưu nhật ký. Vui lòng thử lại!");
  } finally {
    setIsChecking(false);
  }
};

  return (
    <div className="add-diary-form-overlay">
      <div className="add-diary-form-container">
        <h2>Thêm nhật ký mới</h2>
        {plantImageUrl && (
            <div className="plant-image-preview">
                <img src={plantImageUrl} alt="Plant" />
            </div>
        )}
        <form onSubmit={handleSave}>
          <label>Tên nhật ký:</label>
          <input 
            type="text" 
            name="title" 
            value={diaryData.title} 
            onChange={handleInputChange} 
            placeholder="Tên nhật ký"
            className={titleError ? 'input-error' : ''}
          />
          
          {titleError && <p className="error-message">{titleError}</p>}

          <label>Ngày trồng:</label>
          <input 
            type="text"
            name="date" 
           value={new Date(diaryData.date).toLocaleDateString('vi-VN')}
            readOnly
          />

          <div className="form-buttons">
            <button type="button" onClick={onCancel} disabled={isChecking}>
              Hủy
            </button>
            <button type="submit" disabled={isChecking}>
              {isChecking ? 'Đang kiểm tra...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDiaryForm;