// src/components/AddPlantForm.js
import React, { useState, useEffect } from 'react';
import PlantDataService from "../services/plant.services";
import { uploadImage } from "../services/upload.services";
import './AddPlantForm.css';
import { FaClock, FaTint, FaCloudSun, FaSeedling, FaTree, FaMoneyBillWave } from 'react-icons/fa';

const AddPlantForm = ({ onClose, onSave }) => {
  const [name, setName] = useState("");
  const [otherName, setOtherName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [plantTypes, setPlantTypes] = useState([]);
  const [plantingTime, setPlantingTime] = useState("");
  const [waterAmount, setWaterAmount] = useState("");
  const [weather, setWeather] = useState("");
  const [season, setSeason] = useState("");
  const [origin, setorigin] = useState("");
  const [price, setPrice] = useState("");
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newType, setNewType] = useState("");
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [nameError, setNameError] = useState("");
  const [typeError, setTypeError] = useState("");

  useEffect(() => {
    const fetchPlantTypes = async () => {
      try {
        const types = await PlantDataService.getPlantTypes();
        setPlantTypes(types);
      } catch (err) {
        console.error("Lỗi khi lấy loại cây trồng:", err.message);
      }
    };
    fetchPlantTypes();
  }, []);
//Chọn file ảnh và tạo URL xem trước
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setImagePreviewUrl(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setNameError("");
    setTypeError("");

    const finalType = isAddingNewType ? newType.trim() : type;

    let hasError = false;
    if (!name.trim()) {
        setNameError("Vui lòng nhập tên cây trồng.");
        hasError = true;
    }
    if (!finalType) {
        setTypeError("Vui lòng chọn hoặc nhập loại cây trồng.");
        hasError = true;
    }
    
    if (hasError) {
        return;
    }

    try {
        const isExist = await PlantDataService.isPlantNameExist(name); //
        if (isExist) {
            setNameError(`Tên cây trồng "${name}" đã tồn tại. Vui lòng chọn tên khác.`);
            return;
        }
    } catch (err) {
        console.error("Lỗi khi kiểm tra tên cây trồng:", err.message);
        alert("Có lỗi xảy ra khi kiểm tra tên cây trồng. Vui lòng thử lại.");
        return;
    }

    setIsSaving(true);
    let uploadedImageUrl = "";

    if (selectedFile) {
        try {
            uploadedImageUrl = await uploadImage(selectedFile);
        } catch (err) {
            alert("Lỗi khi tải ảnh lên. Vui lòng thử lại.");
            setIsSaving(false);
            return;
        }
    }

    const newPlant = {
      name,
      otherName,
      type: finalType,
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
      await PlantDataService.addPlant(newPlant);
      console.log("Cây trồng đã được thêm thành công!");
      onClose();
      onSave();
    } catch (err) {
      console.error("Lỗi khi thêm cây trồng:", err.message);
      alert("Có lỗi xảy ra khi thêm cây trồng. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="add-plant-form-overlay">
      <div className="add-plant-form-container">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>THÊM CÂY TRỒNG</h2>
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
                {!isAddingNewType ? (
                  <select 
                    value={type} 
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      if (selectedValue === "addNewType") {
                          setIsAddingNewType(true);
                          setType("");
                          setTypeError("");
                      } else {
                          setIsAddingNewType(false);
                          setType(selectedValue);
                          setTypeError("");
                      }
                    }}>
                    <option value="">Chọn loại</option>
                    <option value="addNewType">Thêm mới</option>
                    {plantTypes.map((plantType, index) => (
                      <option key={index} value={plantType}>{plantType}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newType}
                    onChange={(e) => {
                      setNewType(e.target.value);
                      setTypeError(""); 
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newType.trim() !== "") {
                        e.preventDefault();
                        const newTypeTrimmed = newType.trim();
                        if (!plantTypes.includes(newTypeTrimmed)) {
                          setPlantTypes([...plantTypes, newTypeTrimmed]);
                        }
                        setType(newTypeTrimmed);
                        setIsAddingNewType(false);
                        setNewType("");
                      }
                    }}
                    placeholder="Nhập loại mới và nhấn Enter"
                    autoFocus
                  />
                )}
                {typeError && <span className="error-message">{typeError}</span>}
              </div>
            </div>

            <div className="form-right">
              <div className="image-preview">
                {imagePreviewUrl && <img src={imagePreviewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <label htmlFor="file-upload" className="file-upload-label">
                Chọn file ảnh/video
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
              <span className="info-label">Thời gian</span>
              <input type="text" value={plantingTime} onChange={(e) => setPlantingTime(e.target.value)} placeholder="N/A" />
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
              <span className="info-label">Giá tiền</span>
              <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="N/A" />
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

export default AddPlantForm;