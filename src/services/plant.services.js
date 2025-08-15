// src/services/plant.services.js

import { db } from "../firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";

class PlantDataService {
  getAllPlants = () => {
    const plantCollectionRef = collection(db, "plants");
    return getDocs(plantCollectionRef);
  };
  
  addPlant = (newPlant) => {
    const plantCollectionRef = collection(db, "plants");
    return addDoc(plantCollectionRef, newPlant);
  };
  
  getPlantTypes = async () => {
    const plantCollectionRef = collection(db, "plants");
    const data = await getDocs(plantCollectionRef);
    const allTypes = data.docs.map(doc => doc.data().type);
    const uniqueTypes = [...new Set(allTypes)].filter(type => type);
    return uniqueTypes;
  };

  getPlant = (id) => {
      const plantDoc = doc(db, "plants", id);
      return getDoc(plantDoc);
  };

  isPlantNameExist = async (name) => {
    const plantCollectionRef = collection(db, "plants");
    const q = query(plantCollectionRef, where("name", "==", name));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };
}

export default new PlantDataService();