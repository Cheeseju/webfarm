// src/components/PlantsList.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './PlantsList.css';
import { auth } from '../firebase-config';

const PlantsList = ({ onAddButtonClick, refreshKey, onCardClick, searchQuery, userRole }) => {
    const [plants, setPlants] = useState([]);
    const [filteredPlants, setFilteredPlants] = useState([]);
    const [groupedPlants, setGroupedPlants] = useState({});
    const [loading, setLoading] = useState(true); 
    const user = auth.currentUser;
 useEffect(() => {
    const fetchPlants = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            let combinedPlants = [];
            const plantsRef = collection(db, 'plants');

            if (userRole === 'farmer') {
                const publicQuery = query(plantsRef, where('isPublic', '==', true));
                const privateQuery = query(plantsRef, where('userId', '==', user.uid));
                const [publicSnapshot, privateSnapshot] = await Promise.all([
                    getDocs(publicQuery),
                    getDocs(privateQuery)
                ]);
                const publicPlants = publicSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                const privatePlants = privateSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                const plantMap = new Map();
                [...publicPlants, ...privatePlants].forEach(plant => plantMap.set(plant.id, plant));
                combinedPlants = Array.from(plantMap.values());
            } else {
                const publicQuery = query(plantsRef, where('isPublic', '==', true));
                const publicSnapshot = await getDocs(publicQuery);
                combinedPlants = publicSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            }
            setPlants(combinedPlants);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu cây trồng:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchPlants();
  }, [refreshKey, user, userRole]);


    // Lọc danh sách cây trồng dựa trên từ khóa tìm kiếm
    useEffect(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const filtered = plants.filter(plant =>
            plant.name.toLowerCase().includes(lowerCaseQuery) ||
            (plant.type && plant.type.toLowerCase().includes(lowerCaseQuery))
        );
        setFilteredPlants(filtered);
    }, [searchQuery, plants]);

    // Nhóm danh sách cây trồng đã lọc theo loại
    useEffect(() => {
        const group = filteredPlants.reduce((acc, plant) => {
            const type = plant.type || 'Khác';
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(plant);
            return acc;
        }, {});
        setGroupedPlants(group);
    }, [filteredPlants]);
 if (loading) {
        return <div className="plants-list-container">Đang tải danh sách cây trồng...</div>;
    }
    return (
        <div className="plants-list-container">
            <div className="plants-list-header">
                {user && (userRole === 'farmer'|| userRole === 'admin') && (
                    <button onClick={onAddButtonClick} className="add-plant-button">
                        + Thêm cây trồng
                    </button>
                )}
            </div>
            {Object.keys(groupedPlants).map((type) => (
                <div key={type} className="plants-section">
                    <h3>{type.toUpperCase()}</h3>
                    <div className="plants-grid">
                        {groupedPlants[type].map((plant) => (
                            <div key={plant.id} className="plant-card" onClick={() => onCardClick(plant.id)}>
                                {plant.imageUrl && (
                                    <img src={plant.imageUrl} alt={plant.name} className="plant-image-background" />
                                )}
                                <div className="plant-name-overlay">{plant.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PlantsList;