import React, { useState, useEffect } from 'react';
import PlantDataService from "../services/plant.services";
import { uploadImage } from "../services/upload.services";
import './AddPlantForm.css';
import { FaClock, FaTint, FaCloudSun, FaSeedling, FaTree, FaMoneyBillWave } from 'react-icons/fa';
import { auth } from '../firebase-config';
import { useNotification } from '../context/NotificationContext';
import authService from '../services/authservices';
import { normalizeString } from '../utils/textUtils';
import Webcam from 'react-webcam';
  
  const MAX_IMAGE_SIZE_MB = 5; // Giới hạn 5MB cho ảnh
  const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const AddPlantForm = ({ onClose, onSave }) => {
  const { showNotification } = useNotification();
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
  // State để lưu nội dung người dùng gõ vào ô tìm kiếm
  const [typeSearch, setTypeSearch] = useState(""); 
  // State để lưu danh sách gợi ý (sẽ được lọc từ plantTypes)
  const [typeSuggestions, setTypeSuggestions] = useState([]); 
   // State để quản lý việc ẩn/hiện danh sách gợi ý
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const [typeError, setTypeError] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = React.useRef(null);


  const capturePhoto = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Chuyển base64 sang File để kiểm tra size và upload
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "captured_photo.jpg", { type: "image/jpeg" });
            if (file.size > MAX_IMAGE_SIZE_BYTES) {
              showNotification(`Kích thước ảnh không được vượt quá ${MAX_IMAGE_SIZE_MB}MB.`, 'error');
              return;
            }
            setSelectedFile(file); // Cập nhật file để upload
            setImagePreviewUrl(imageSrc); // Dùng base64 để xem trước
            setIsCameraOpen(false); // Đóng camera
          });
      }
    }
  }, [webcamRef, showNotification]);

  
  // State để xác định vai trò người dùng hiện tại
  const [userRole, setUserRole] = useState(null);
  useEffect(() => {
    const normalizedSearch = typeSearch.toLowerCase();
    // Lọc các loại cây có sẵn dựa trên nội dung tìm kiếm
    const filtered = plantTypes.filter(pt =>
        pt.toLowerCase().includes(normalizedSearch)
    );
    setTypeSuggestions(filtered);
    }, [typeSearch, plantTypes]); // Chạy lại khi người dùng gõ hoặc khi plantTypes thay đổi

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const role = await authService.getUserRole(user.uid);
        setUserRole(role);
        const types = await PlantDataService.getPlantTypes(user.uid);
        setPlantTypes(types);
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      setImagePreviewUrl(URL.createObjectURL(selectedFile));
    }
  }, [selectedFile]);

 //iểm tra kích thước
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        showNotification(`Kích thước ảnh không được vượt quá ${MAX_IMAGE_SIZE_MB}MB.`, 'error');
        return;
      }
      setSelectedFile(file);
      // Reset trạng thái camera nếu người dùng chọn upload file
      setIsCameraOpen(false);
    }
  };
  
  const handleSave = async (e) => {
    e.preventDefault();
    setNameError("");
    setTypeError("");

    if (!name.trim()) {
      setNameError("Vui lòng nhập tên cây trồng.");
      return;
    }
    
  if (!type.trim()) {
        setTypeError("Vui lòng chọn hoặc nhập loại cây trồng.");
        return;
    }

    const user = auth.currentUser;
    if (!user) {
      showNotification('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.', 'error');
      return;
    }
     // Chuẩn hóa loại cây người dùng vừa nhập
    const normalizedNewType = normalizeString(type);
     // Tìm xem có loại cây nào đã tồn tại mà sau khi chuẩn hóa lại giống hệt không
    const existingTypeMatch = plantTypes.find(pt => normalizeString(pt) === normalizedNewType);
      // Nếu tìm thấy một loại trùng khớp VÀ loại người dùng nhập không giống hệt (ví dụ: nhập "nhan" khi đã có "Nhãn")
    if (existingTypeMatch && existingTypeMatch.toLowerCase() !== type.toLowerCase()) {
        setTypeError(`Loại "${type}" đã tồn tại dưới dạng "${existingTypeMatch}". Vui lòng chọn loại đã có trong danh sách.`);
        return; // Dừng việc lưu lại
    }
     try {
        const finalType = existingTypeMatch || type; // Ưu tiên dùng loại đã có để giữ đúng định dạng
        const isExist = await PlantDataService.isPlantNameExist(name, finalType, user.uid);
        if (isExist) {
            setNameError(`Tên cây trồng "${name}" với loại "${finalType}" đã tồn tại. Vui lòng chọn tên khác.`);
            return;
        }
    } catch (err) {
      console.error("Lỗi khi kiểm tra tên cây trồng:", err.message);
      showNotification('Có lỗi xảy ra khi kiểm tra tên cây trồng.', 'error');
      return;
    }

    setIsSaving(true);
    let uploadedImageUrl = "";

    if (selectedFile) {
      try {
        uploadedImageUrl = await uploadImage(selectedFile);
      } catch (err) {
        showNotification('Lỗi khi tải ảnh lên. Vui lòng thử lại.', 'error');
        setIsSaving(false);
        return;
      }
    }

  const finalType = existingTypeMatch || type; // Dùng lại biến này
    const newPlant = {
        name,
        otherName,
        type: finalType, // Lưu loại cây với định dạng đúng đã tồn tại
        description,
        imageUrl: uploadedImageUrl,
        plantingTime,
        waterAmount,
        weather,
        season,
        origin,
        price,
        userId: user.uid,
        isPublic: userRole === 'admin',
    };
    
    try {
      await PlantDataService.addPlant(newPlant);
      showNotification('Thêm cây trồng mới thành công!', 'success');
      onSave();
      onClose();
    } catch (err) {
      console.error("Lỗi khi thêm cây trồng:", err.message);
      showNotification('Có lỗi xảy ra khi thêm cây trồng.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="add-plant-form-overlay">
      <div className="add-plant-form-container">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>THÊM CÂY TRỒNG MỚI</h2>
        <form onSubmit={handleSave}>
          <div className="form-content">
            <div className="form-left">
              <div className="form-group">
                <label>Tên cây trồng</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => { setName(e.target.value); setNameError(""); }} 
                />
                {nameError && <span className="error-message">{nameError}</span>}
              </div>
              <div className="form-group">
                <label>Tên khác</label>
                <input type="text" value={otherName} onChange={(e) => setOtherName(e.target.value)} />
              </div>
              <div className="form-group type-search-group">
    <label>Loại</label>
    <input
        type="text"
        value={typeSearch}
        onChange={(e) => {
            // Cập nhật cả nội dung tìm kiếm và giá trị cuối cùng
            setTypeSearch(e.target.value);
            setType(e.target.value); 
            setTypeError("");
        }}
        // Khi nhấp vào ô input
        onFocus={() => setIsDropdownOpen(true)}
        // Khi rời khỏi ô input (có setTimeout để kịp xử lý click vào gợi ý)
        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
        placeholder="Tìm hoặc nhập loại cây mới"
        autoComplete="off"
    />
    
    {/* DANH SÁCH GỢI Ý CHỈ HIỂN THỊ KHI isDropdownOpen LÀ TRUE */}
    {isDropdownOpen && (
        <ul className="type-suggestions-list">
            {/* Nếu ô tìm kiếm trống, hiển thị toàn bộ danh sách */}
            {typeSearch === "" && plantTypes.map((plantType) => (
                 <li key={plantType} onMouseDown={() => {
                     setType(plantType);
                     setTypeSearch(plantType);
                     setIsDropdownOpen(false);
                 }}>
                     {plantType}
                 </li>
            ))}

            {/* Nếu đang tìm kiếm, chỉ hiển thị kết quả lọc */}
            {typeSearch !== "" && typeSuggestions.map((suggestion) => (
                <li key={suggestion} onMouseDown={() => {
                    setType(suggestion);
                    setTypeSearch(suggestion);
                    setIsDropdownOpen(false);
                }}>
                    {suggestion}
                </li>
            ))}
             
            {/* Thông báo nếu không có kết quả */}
            {typeSearch !== "" && typeSuggestions.length === 0 && (
                <li className="no-suggestion">Không tìm thấy. Bạn có thể thêm mới loại này.</li>
            )}
        </ul>
    )}
    {typeError && <span className="error-message">{typeError}</span>}
</div>
            </div>
           <div className="form-right">
  {isCameraOpen ? (
    <div className="camera-container">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width="100%"
        videoConstraints={{ facingMode: "environment" }} // Ưu tiên camera sau
      />
      <div className="camera-controls">
        <button type="button" onClick={capturePhoto}>Chụp Ảnh</button>
        <button type="button" onClick={() => setIsCameraOpen(false)}>Đóng</button>
      </div>
    </div>
  ) : (
    <div className="image-preview">
      {imagePreviewUrl ? (
        <img src={imagePreviewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span>Chưa có ảnh</span>
      )}
    </div>
  )}

  <div className="form-actions-media">
    <button type="button" className="media-button" onClick={() => setIsCameraOpen(true)}>
      📷 Mở camera
    </button>
    <label htmlFor="file-upload-plant" className="media-button">
      📁 Tải ảnh lên
                </label>
                  <input
                  id="file-upload-plant"
                  type="file"
                  accept="image/*" // Chỉ chấp nhận ảnh
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                   />
                </div>
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

export default AddPlantForm;