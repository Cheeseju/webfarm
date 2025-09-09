// src/components/EditPlantForm.js
import React, { useState, useEffect } from 'react';
import PlantDataService from "../services/plant.services";
import { uploadImage } from "../services/upload.services";
import './AddPlantForm.css'; // Sử dụng lại CSS của AddPlantForm
import { FaClock, FaTint, FaCloudSun, FaSeedling, FaTree, FaMoneyBillWave } from 'react-icons/fa';
import { auth } from '../firebase-config';
import { useNotification } from '../context/NotificationContext'; // <-- 1. Import hook

const EditPlantForm = ({ onClose, onSave, plant, plantId }) => {
  const { showNotification } = useNotification(); // <-- 2. Lấy hàm showNotification
  const [name, setName] = useState(plant.name || "");
  const [otherName, setOtherName] = useState(plant.otherName || "");
  const [description, setDescription] = useState(plant.description || "");
  const [plantingTime, setPlantingTime] = useState(plant.plantingTime || "");
  const [waterAmount, setWaterAmount] = useState(plant.waterAmount || "");
  const [weather, setWeather] = useState(plant.weather || "");
  const [season, setSeason] = useState(plant.season || "");
  const [origin, setorigin] = useState(plant.origin || "");
  const [price, setPrice] = useState(plant.price || "");
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(plant.imageUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (selectedFile) {
      const newUrl = URL.createObjectURL(selectedFile);
      setImagePreviewUrl(newUrl);
      return () => URL.revokeObjectURL(newUrl);
    } else {
      setImagePreviewUrl(plant.imageUrl || null);
    }
  }, [selectedFile, plant.imageUrl]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0] || null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setNameError("");

    if (!name.trim()) {
      setNameError("Vui lòng nhập tên cây trồng.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      showNotification('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.', 'error');
      return;
    }

    try {
      const isExist = await PlantDataService.isPlantNameExist(name, plant.type, user.uid, plantId);
      if (isExist) {
        setNameError(`Tên cây trồng "${name}" đã tồn tại trong cùng loại. Vui lòng chọn tên khác.`);
        return;
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra tên cây trồng:", err.message);
      showNotification('Có lỗi xảy ra khi kiểm tra tên cây trồng.', 'error'); // <-- 3. Thay thế alert
      return;
    }

    setIsSaving(true);
    let uploadedImageUrl = plant.imageUrl;

    if (selectedFile) {
      try {
        uploadedImageUrl = await uploadImage(selectedFile);
      } catch (err) {
        showNotification('Lỗi khi tải ảnh lên. Vui lòng thử lại.', 'error'); // <-- 3. Thay thế alert
        setIsSaving(false);
        return;
      }
    }

    const updatedPlant = {
      name,
      otherName,
      description,
      plantingTime,
      waterAmount,
      weather,
      season,
      origin,
      price,
      imageUrl: uploadedImageUrl,
    };

    try {
      await PlantDataService.updatePlant(plantId, updatedPlant);
      showNotification('Cập nhật cây trồng thành công!', 'success'); // Thêm thông báo thành công
      onSave(); // Gọi onSave trước khi đóng để danh sách được làm mới
      onClose();
    } catch (err) {
      console.error("Lỗi khi cập nhật cây trồng:", err.message);
      showNotification('Có lỗi xảy ra khi cập nhật cây trồng.', 'error'); // <-- 3. Thay thế alert
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="add-plant-form-overlay">
      <div className="add-plant-form-container">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>CHỈNH SỬA CÂY TRỒNG</h2>
        <form onSubmit={handleSave}>
          <div className="form-content">
            <div className="form-left">
              <div className="form-group">
                <label>Tên cây trồng</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError(""); 
                  }} 
                />
                {nameError && <span className="error-message">{nameError}</span>}
              </div>
              <div className="form-group">
                <label>Tên khác</label>
                <input type="text" value={otherName} onChange={(e) => setOtherName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Loại</label>
                <input type="text" value={plant.type} disabled />
              </div>
            </div>

            <div className="form-right">
              <div className="image-preview">
                {imagePreviewUrl && <img src={imagePreviewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <label htmlFor="file-upload" className="file-upload-label">
                Đổi file ảnh
              </label>
              <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
              />
            </div>
          </div>

          <h2>Thông tin</h2>
          <div className="info-grid">
           <div className="info-card">
              <FaClock className="info-icon" />
              <span className="info-label">Thời gian (ngày)</span>
             <input
                type="number"
                value={plantingTime}
                onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setPlantingTime(value >= 0 ? value : "");
               }}
               placeholder="Nhập số ngày trồng cây"
               min="0"
              />
            </div>
            <div className="info-card">
              <FaTint className="info-icon" />
              <span className="info-label">Lượng nước</span>
              <input type="text" value={waterAmount} onChange={(e) => setWaterAmount(e.target.value)} placeholder="N/A" />
            </div>
            <div className="info-card">
              <FaCloudSun className="info-icon" />
              <span className="info-label">Thời tiết</span>
              <input type="text" value={weather} onChange={(e) => setWeather(e.target.value)} placeholder="N/A" />
            </div>
            <div className="info-card">
              <FaSeedling className="info-icon" />
              <span className="info-label">Mùa vụ</span>
              <input type="text" value={season} onChange={(e) => setSeason(e.target.value)} placeholder="N/A" />
            </div>
            <div className="info-card">
              <FaTree className="info-icon" />
              <span className="info-label">Xuất xứ</span>
              <input type="text" value={origin} onChange={(e) => setorigin(e.target.value)} placeholder="N/A" />
            </div>
            <div className="info-card">
              <FaMoneyBillWave className="info-icon" />
              <span className="info-label">Giá tiền(VND)</span>
              <input type="number" value={price} onChange={(e) =>  {const value = parseInt(e.target.value, 10); setPrice(value >= 0 ? value : "")}} placeholder="N/A" min="1000" />
            </div>
          </div>

          <div className="form-group description">
            <label>Mô tả</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
          </div>

          <div className="form-buttons">
            <button className="cancel-button" type="button" onClick={onClose}>Hủy</button>
            <button className="save-button" type="submit" disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlantForm;