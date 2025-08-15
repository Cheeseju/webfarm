// src/components/DiariesList.js
import React, { useState, useEffect } from 'react';
import PlantDataService from '../services/plant.services';
import './DiariesList.css';

const DiariesList = ({ onPlantSelect }) => {
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    getPlants();
  }, []);

  const getPlants = async () => {
    const data = await PlantDataService.getAllPlants();
    const plantsData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setPlants(plantsData);
  };
  
  const groupedPlants = plants.reduce((acc, plant) => {
    const type = plant.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(plant);
    return acc;
  }, {});

  return (
    <div className="diaries-list">
      <div className="header-bar">
       
        <div className="filter-icons">
          <i className="filter-icon"></i>
          <i className="sort-icon"></i>
        </div>
      </div>
      {Object.keys(groupedPlants).map((type) => (
        <div key={type} className="diaries-list-plant-group">
          <h2>{type}</h2>
          {groupedPlants[type].map((plant) => (
            <div key={plant.id} className="diaries-list-plant-card">
              <img src={plant.hinh_anh || 'placeholder-image.png'} alt={plant.name} className="diary-plant-image" />
              <div className="diary-plant-info">
                <h3>{plant.name}</h3>
                <p>Click để xem các nhật ký canh tác</p>
                <button onClick={() => onPlantSelect(plant.id)}>Xem chi tiết</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DiariesList;