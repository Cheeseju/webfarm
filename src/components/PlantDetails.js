// src/components/PlantDetails.js
import React, { useState, useEffect } from 'react';
import PlantDataService from '../services/plant.services';
import './PlantDetails.css';
import { FaClock, FaTint, FaCloudSun, FaSeedling, FaTree, FaMoneyBillWave, FaEdit } from 'react-icons/fa';
import { auth } from '../firebase-config';

// Thêm onEditClick và refreshKey vào props
const PlantDetails = ({ plantId, onBackToList, onAddDiaryClick, onEditClick, refreshKey, userRole }) => {
    const [plant, setPlant] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser;

    useEffect(() => {
        const getPlantDetails = async () => {
            setLoading(true);
            try {
                if (plantId) {
                    const docSnap = await PlantDataService.getPlant(plantId);
                    if (docSnap.exists()) {
                        setPlant({ ...docSnap.data(), id: docSnap.id });
                    } else {
                        console.log("Không tìm thấy tài liệu với ID:", plantId);
                        setPlant(null);
                    }
                }
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu cây trồng:", err.message);
            } finally {
                setLoading(false);
            }
        };
        getPlantDetails();
    }, [plantId, refreshKey]); // Thêm refreshKey vào mảng dependency

    if (loading) {
        return (
            <div className="plant-details-container">
                <button onClick={onBackToList} className="back-button">← Quay lại danh sách</button>
                <p>Đang tải...</p>
            </div>
        );
    }

    if (!plant) {
        return (
            <div className="plant-details-container">
                <button onClick={onBackToList} className="back-button">← Quay lại danh sách</button>
                <p>Không tìm thấy dữ liệu cây trồng này.</p>
            </div>
        );
    }
    
    return (
        <div className="plant-details-container">
            <button onClick={onBackToList} className="back-button">← Quay lại danh sách</button>
       {user && plant && (plant.userId === user.uid || (userRole === 'admin' && plant.isPublic)) && (
    <button onClick={() => onEditClick(plant)} className="edit-button">
        <FaEdit /> Chỉnh sửa
    </button>
)}
            
            <div className="plant-info-header">
                <div className="plant-image-wrapper">
                    <img src={plant.imageUrl || 'https://via.placeholder.com/250'} alt={plant.name} className="plant-image" />
                </div>
                <div className="plant-header-text">
                    <h1>{plant.name.toUpperCase()}</h1>
                    <p>{plant.otherName}</p>
                    <div className="description">
                        <h4>Mô tả:</h4>
                        <p>{plant.description}</p>
                    </div>
                </div>
            </div>

            <h2>Thông tin</h2>
            
            <div className="info-grid">
                <div className="info-card">
                    <FaClock className="info-icon" />
                    <span className="info-label">Thời gian</span>
                    <span className="info-value">{plant.plantingTime || ''}</span>
                </div>
                <div className="info-card">
                    <FaTint className="info-icon" />
                    <span className="info-label">Lượng nước</span>
                    <span className="info-value">{plant.waterAmount || ''}</span>
                </div>
                <div className="info-card">
                    <FaCloudSun className="info-icon" />
                    <span className="info-label">Thời tiết</span>
                    <span className="info-value">{plant.weather || ''}</span>
                </div>
                <div className="info-card">
                    <FaSeedling className="info-icon" />
                    <span className="info-label">Mùa vụ</span>
                    <span className="info-value">{plant.season || ''}</span>
                </div>
                <div className="info-card">
                    <FaTree className="info-icon" />
                    <span className="info-label">Xuất xứ</span>
                    <span className="info-value">{plant.origin || ''}</span>
                </div>
                <div className="info-card">
                    <FaMoneyBillWave className="info-icon" />
                    <span className="info-label">Giá tiền</span>
                    <span className="info-value">{plant.price || ''}</span>
                </div>
            </div>

            <h2>Nhật ký canh tác</h2>
            <div className="diary-section">
   {/* Chỉ hiển thị nút thêm nhật ký cho farmer đã đăng nhập */}
        {user && userRole === 'farmer' && (
          <button className="add-diary-button" onClick={() => onAddDiaryClick(plantId)}>
            Thêm nhật ký của bạn
          </button>
        )}
            </div>
        </div>
    );
};

export default PlantDetails;