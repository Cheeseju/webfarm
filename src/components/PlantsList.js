// src/components/PlantsList.js

import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, onSnapshot, query } from 'firebase/firestore';
import './PlantsList.css';

const PlantsList = ({ getPlantId, onAddButtonClick, refreshKey, onCardClick  }) => {
  const [plants, setPlants] = useState([]);
  const [groupedPlants, setGroupedPlants] = useState({});

  useEffect(() => {
    const q = query(collection(db, 'plants'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const plantsArray = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setPlants(plantsArray);
    });

    return () => unsubscribe();
  }, [refreshKey]);

  useEffect(() => {
    const group = plants.reduce((acc, plant) => {
      const type = plant.type || 'Khác';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(plant);
      return acc;
    }, {});
    setGroupedPlants(group);
  }, [plants]);


  return (
    <div className="plants-list-container">
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
      <button className="add-plant-button" onClick={onAddButtonClick}> + Thêm cây trồng</button>
    </div>
  );
};

export default PlantsList;