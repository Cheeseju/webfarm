// src/App.js
import './App.css';
import { useState } from "react";
import PlantsList from './components/PlantsList';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AddPlantForm from './components/AddPlantForm';
import DiariesList from './components/DiariesList';
import DiaryDetails from './components/DiaryDetails';
import PlantDetails from './components/PlantDetails'; 
import AddDiaryForm from './components/AddDiaryForm'; // Import AddDiaryForm

function App() {
  const [currentPage, setCurrentPage] = useState('plants'); 
  const [selectedPlantId, setSelectedPlantId] = useState(null); 
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddDiaryForm, setShowAddDiaryForm] = useState(false); // Thêm trạng thái mới
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedPlantId(null);
    setShowAddForm(false);
    setShowAddDiaryForm(false); // Đặt lại trạng thái khi chuyển trang
  };
  
  const handlePlantSelect = (id) => {
    setSelectedPlantId(id);
    setCurrentPage('diaryDetails');
  };

  const handleBackToList = () => {
    setCurrentPage('diaries');
    setSelectedPlantId(null);
  };

  const handleBackToPlantsList = () => {
    setCurrentPage('plants');
    setSelectedPlantId(null);
  };

  const handlePlantAdded = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Hàm mới để xử lý khi bấm nút Thêm nhật ký
  const handleAddDiaryClick = (plantId) => {
    setSelectedPlantId(plantId);
    setShowAddDiaryForm(true);
  };

  // Hàm mới để xử lý khi thêm nhật ký thành công
  const handleDiaryAdded = () => {
    setShowAddDiaryForm(false); // Đóng form
    setCurrentPage('diaryDetails'); // Quay lại trang chi tiết nhật ký
  };


  return (
    <div className="App">
      <Header />
      <div className="main-content">
        <Sidebar onPageChange={handlePageChange} currentPage={currentPage} />
        <div className="content-area">
          {showAddForm && <AddPlantForm onClose={() => setShowAddForm(false)} onSave={handlePlantAdded} />} 
          
          {currentPage === 'plants' && (
            <PlantsList 
                onCardClick={(id) => {
                    setSelectedPlantId(id);
                    setCurrentPage('plantDetails'); 
                }}
                onAddButtonClick={() => setShowAddForm(true)} 
                refreshKey={refreshKey} 
            />
          )}

          {currentPage === 'plantDetails' && (
             <PlantDetails 
                 plantId={selectedPlantId} 
                 onBackToList={handleBackToPlantsList} 
                 onAddDiaryClick={handleAddDiaryClick} // Truyền hàm mới vào PlantDetails
            />
          )}

          {currentPage === 'diaries' && (
            <DiariesList 
                onPlantSelect={handlePlantSelect} 
            />
          )}

          {currentPage === 'diaryDetails' && (
            <DiaryDetails 
                plantId={selectedPlantId} 
                onBackToList={handleBackToList} 
            />
          )}

          {/* Hiển thị AddDiaryForm khi trạng thái showAddDiaryForm là true */}
          {showAddDiaryForm && (
            <AddDiaryForm
              plantId={selectedPlantId}
              onSave={handleDiaryAdded}
              onCancel={() => setShowAddDiaryForm(false)}
            />
          )}

        </div>
      </div>
    </div>
  );
}

export default App;