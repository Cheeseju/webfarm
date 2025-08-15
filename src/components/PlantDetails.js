// src/components/PlantDetails.js
import React, { useState, useEffect } from 'react';
import PlantDataService from '../services/plant.services';
import './PlantDetails.css';
import { FaClock, FaTint, FaCloudSun, FaSeedling, FaTree, FaMoneyBillWave } from 'react-icons/fa';

// Thêm onAddDiaryClick vào props
const PlantDetails = ({ plantId, onBackToList, onAddDiaryClick }) => {
    const [plant, setPlant] = useState(null);

    useEffect(() => {
        const getPlantDetails = async () => {
            try {
                if (plantId) {
                    const docSnap = await PlantDataService.getPlant(plantId);
                    if (docSnap.exists()) {
                        setPlant(docSnap.data());
                    } else {
                        console.log("Không tìm thấy tài liệu với ID:", plantId);
                        setPlant(null);
                    }
                }
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu cây trồng:", err.message);
            }
        };
        getPlantDetails();
    }, [plantId]);

    if (!plant) {
        return (
            <div className="plant-details-container">
                <button onClick={onBackToList} className="back-button">← Quay lại danh sách</button>
                <p>Đang tải hoặc không tìm thấy dữ liệu...</p>
            </div>
        );
    }
    
    return (
        <div className="plant-details-container">
            <button onClick={onBackToList} className="back-button">← Quay lại danh sách</button>
            
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
                <button className="add-diary-button" onClick={() => onAddDiaryClick(plantId)}> Thêm nhật ký của bạn </button>
            </div>
        </div>
    );
};

export default PlantDetails;