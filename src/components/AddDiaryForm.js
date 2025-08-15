// src/components/AddDiaryForm.js

import React, { useState } from 'react';
import DiaryDataService from '../services/diary.services';
import './AddDiaryForm.css';

const AddDiaryForm = ({ plantId, onSave, onCancel, plantImageUrl }) => {
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [diaryData, setDiaryData] = useState({
    title: '',
    date: formattedDate,
    status: 'Đang canh tác',
  });
  
  // 1. Thêm state mới để quản lý thông báo lỗi
  const [titleError, setTitleError] = useState('');

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
    
    // 2. Thay đổi cách xử lý lỗi, sử dụng state thay vì alert
    if (!diaryData.title) {
      setTitleError("Vui lòng điền tên nhật ký!");
      return;
    }
    
    // Xóa lỗi nếu dữ liệu hợp lệ
    setTitleError('');

    try {
      await DiaryDataService.addDiary({
        ...diaryData,
        plantId: plantId, 
        imageUrl: plantImageUrl, 
        date: new Date(diaryData.date), 
        createdAt: new Date(),
      });
      onSave(); 
    } catch (err) {
      console.error("Lỗi khi lưu nhật ký:", err.message);
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
            className={titleError ? 'input-error' : ''} // Thêm class CSS khi có lỗi
          />
          
          {/* 3. Hiển thị thông báo lỗi trực tiếp dưới input */}
          {titleError && <p className="error-message">{titleError}</p>}

          <label>Ngày trồng:</label>
          <input 
            type="text"
            name="date" 
            value={new Date(diaryData.date).toLocaleDateString()}
            readOnly
          />

          <label>Trạng thái:</label>
          <select 
            name="status" 
            value={diaryData.status} 
            onChange={handleInputChange}
          >
            <option value="Đang canh tác">Đang canh tác</option>
            <option value="Đã thu hoạch">Đã thu hoạch</option>
          </select>

          <div className="form-buttons">
            <button type="button" onClick={onCancel}>Hủy</button>
            <button type="submit">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDiaryForm;