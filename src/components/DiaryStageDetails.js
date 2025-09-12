// src/components/DiaryStageDetails.js
import React, { useState, useEffect, useCallback } from 'react';
import DiaryDataService from '../services/diary.services';
import AddStageForm from './AddStageForm';
import './DiaryStageDetails.css';
import QRCode from 'react-qr-code';
import { db,auth } from '../firebase-config';
import { doc, setDoc } from 'firebase/firestore';
import { useNotification } from '../context/NotificationContext'; // <-- 1. Import hook
import PlantDataService from '../services/plant.services';   
import shoppingService from '../services/shopping.services';
import ConfirmPriceForm from './ConfirmPriceForm'; 
const DiaryStageDetails = ({ diaryId }) => {
  const { showNotification } = useNotification(); // <-- 2. Lấy hàm showNotification
  const [showQRCode, setShowQRCode] = useState(false);
  const [stages, setStages] = useState([]);
  const [diaryTitle, setDiaryTitle] = useState('');
  const [showAddStageForm, setShowAddStageForm] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [status, setStatus] = useState("Đang canh tác");
  const [latestPlantCount, setLatestPlantCount] = useState(null); 
  const [qrValue, setQrValue] = useState('');
 const [isInventoried, setIsInventoried] = useState(false);
    const [showPriceForm, setShowPriceForm] = useState(false); // <-- State mới để mở form giá
    const [dataForPricing, setDataForPricing] = useState(null); 
    
    
const handleCompletionToggle = async (newCompletionStatus) => {
    if (stages.length === 0 && newCompletionStatus) {
        showNotification('Không thể hoàn thành nhật ký chưa có giai đoạn nào.', 'error');
        return;
    }

    try {
        const diaryDoc = await DiaryDataService.getDiary(diaryId);
        if (!diaryDoc.exists()) {
            showNotification('Không tìm thấy nhật ký này.', 'error');
            return;
        }

        const plantId = diaryDoc.data().plantId;

        // BƯỚC KIỂM TRA QUAN TRỌNG ĐƯỢC THÊM VÀO
        if (!plantId) {
            showNotification('Nhật ký này không được liên kết với cây trồng nào. Không thể cập nhật kho.', 'error');
            console.error("Lỗi dữ liệu: Nhật ký không có plantId. Diary ID:", diaryId);
            return;
        }

        const plantDoc = await PlantDataService.getPlant(plantId);
        if (!plantDoc.exists()) {
            showNotification('Không tìm thấy cây trồng được liên kết với nhật ký này.', 'error');
            return;
        }
        
        const plantData = { id: plantDoc.id, ...plantDoc.data() };
        
        if (!newCompletionStatus) {
            await processInventoryUpdate(false, plantData, { id: diaryDoc.id, ...diaryDoc.data() });
        } else {
              const user = auth.currentUser;
    if (!user) {
        showNotification('Không thể xác thực người dùng, vui lòng thử lại.', 'error');
        return;
    }
    // Sửa lại thành dòng này, dùng hàm mới
    const productAlreadyExists = await shoppingService.productExistsForFarmer(plantData.id, user.uid);
            if (productAlreadyExists) {
                await processInventoryUpdate(true, plantData, { id: diaryDoc.id, ...diaryDoc.data() });
            } else {
                setDataForPricing({ plant: plantData, diary: { id: diaryDoc.id, ...diaryDoc.data() } });
                setShowPriceForm(true);
            }
        }
    } catch (error) {
        showNotification('Có lỗi xảy ra, vui lòng thử lại.', 'error');
        console.error("Lỗi trong handleCompletionToggle:", error);
    }
};
    // HÀM XỬ LÝ CẬP NHẬT KHO: được gọi tự động hoặc từ form giá
    const processInventoryUpdate = async (isAdding, plantData, diaryData, priceInfo = null) => {
        try {
            // Nếu không có priceInfo (trường hợp tự động), dùng giá mặc định của cây
            const finalPriceInfo = priceInfo || { price: plantData.price, unit: plantData.unit || 'cây' };

            await shoppingService.updateInventoryFromDiary(plantData, diaryData, latestPlantCount, isAdding, finalPriceInfo);
            
            const newStatus = isAdding ? "Đã hoàn thành" : "Đang canh tác";
            await DiaryDataService.updateDiary(diaryId, {
                isCompleted: isAdding,
                status: newStatus,
                endDate: isAdding ? new Date() : null,
                isInventoried: isAdding
            });
            
            setIsCompleted(isAdding);
            setIsInventoried(isAdding);
            setStatus(newStatus);
            setShowPriceForm(false); // Đóng form giá nếu nó đang mở
            showNotification('Cập nhật trạng thái và kho hàng thành công!', 'success');
        } catch (error) {
            console.error("Lỗi khi cập nhật kho:", error);
            showNotification('Có lỗi xảy ra, vui lòng thử lại.', 'error');
        }
    };
  
  const copyDiaryToPublic = async () => {
    try {
      const diaryDoc = await DiaryDataService.getDiary(diaryId);
      if (!diaryDoc.exists()) {
        throw new Error('Không tìm thấy nhật ký');
      }
      
      const diaryData = diaryDoc.data();
      
      await setDoc(doc(db, 'publicDiaries', diaryId), {
        ...diaryData,
        originalDiaryId: diaryId,
        publicSince: new Date()
      });
      
      const stagesData = await DiaryDataService.getStagesByDiaryId(diaryId);
      for (const stageDoc of stagesData.docs) {
        const stageData = stageDoc.data();
        await setDoc(doc(db, 'publicDiaries', diaryId, 'publicStages', stageDoc.id), stageData);
      }
      
      return true;
    } catch (error) {
      console.error('Lỗi khi sao chép nhật ký sang công khai:', error);
      throw error;
    }
  };

  const getStages = useCallback(async () => {
    if (diaryId) {
      try {
        const stagesData = await DiaryDataService.getStagesByDiaryId(diaryId);
        const stagesList = stagesData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        stagesList.sort((a, b) => a.date.seconds - b.date.seconds);
        setStages(stagesList);
        if (stagesList.length > 0) {
          setLatestPlantCount(stagesList[stagesList.length - 1].plantCount);
        } else {
          setLatestPlantCount(null); // Reset nếu không có stage nào
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu giai đoạn:", err.message);
      }
    }
  }, [diaryId]);

  useEffect(() => {
    const getDiaryData = async () => {
      try {
        const diaryDoc = await DiaryDataService.getDiary(diaryId);
        if (diaryDoc.exists()) {
          const data = diaryDoc.data();
          setDiaryTitle(data.title);
          setIsCompleted(data.isCompleted || false);
          setStatus(data.status || "Đang canh tác");
          setIsInventoried(data.isInventoried || false);
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu nhật ký:", err.message);
      }
    };
    getDiaryData();
    getStages();
  }, [diaryId, getStages]);

  const handleAddStageClick = () => setShowAddStageForm(true);

  const handleCloseForm = () => {
    setShowAddStageForm(false);
    getStages(); // Tải lại các giai đoạn sau khi lưu
  };

  const handleShowQRCode = async () => {
    const user = auth.currentUser; // Lấy thông tin người dùng hiện tại

    try {
      await copyDiaryToPublic();
      
      // THÊM LỆNH GHI LOG VÀO ĐÂY
      if (user) {
        // Gọi hàm service mới với email và tiêu đề nhật ký
        await DiaryDataService.logQrCreationActivity(user.email, diaryTitle);
      }
      
      const publicUrl = `https://webcaytrong-19dc6.web.app/view-diary/${diaryId}`;
      setQrValue(publicUrl);
      setShowQRCode(true);
      showNotification('Tạo mã QR thành công!', 'success');
    } catch (error) {
      console.error('Lỗi khi tạo QR code:', error);
      showNotification('Có lỗi xảy ra khi tạo QR code.', 'error');
    }
  };
  const handleHideQRCode = () => setShowQRCode(false);
  


  return (
    <div className="diary-stage-details">
      <div className="header-stage">
        <span className="breadcrumb">Nhật ký &gt; Giai đoạn</span>
      </div>
      <h2>Giai đoạn canh tác của Nhật ký: {diaryTitle}</h2>
      <div className="stage-table-container">
        <table className="stage-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Công việc</th>
              <th>Số lượng cây trồng</th>
              <th>Sâu bệnh</th>
              <th>Phân thuốc</th>
              <th>Ghi chú</th>
              <th>Hình ảnh/Video</th>
            </tr>
          </thead>
          <tbody>
            {stages.length > 0 ? (
              stages.map((stage) => (
                <tr key={stage.id}>
                  <td>{new Date(stage.date.seconds * 1000).toLocaleDateString('vi-VN')}</td>
                  <td>{stage.task}</td>
                  <td>{stage.plantCount}</td>
                  <td>{stage.pests}</td>
                  <td>{stage.fertilizer}</td>
                  <td>{stage.notes}</td>
                  <td>
                    {stage.imageUrl && (
                      <a href={stage.imageUrl} target="_blank" rel="noopener noreferrer">Xem file</a>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">Chưa có giai đoạn nào được ghi lại.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

             <div className="status-and-completion">
                <p><strong>Trạng thái:</strong> {status}</p>
                <div className="completion-checkbox">
                    <input
                        type="checkbox"
                        id="isCompleted"
                        checked={isCompleted}
                            onChange={(e) => handleCompletionToggle(e.target.checked)}
                    />
                    <label htmlFor="isCompleted">Đã hoàn thành nhật ký</label>
                </div>
                {isInventoried && <p className="inventory-status">✔️ Đã cập nhật vào kho hàng.</p>}
                 {stages.length === 0 && (
                    <p className="warning-message">
                        ⚠️ Không thể đánh dấu hoàn thành khi chưa có giai đoạn nào.
                    </p>
                )}
            </div>
      
      <button 
        onClick={handleAddStageClick} 
        className="add-stage-button"
        disabled={isCompleted}
      >
        Thêm giai đoạn
      </button>

      <button 
        onClick={handleShowQRCode} 
        className="add-qr-button"
        disabled={!isCompleted}
      >
        Tạo QR code
      </button>

      {showQRCode && (
        <div className="qr-code-overlay" onClick={handleHideQRCode}>
          <div className="qr-code-container" onClick={(e) => e.stopPropagation()}>
            <h3>Quét mã để xem nhật ký công khai</h3>
            <QRCode value={qrValue} size={256} />
            <p className="qr-url">{qrValue}</p>
            <button onClick={handleHideQRCode} className="close-qr-button">Đóng</button>
          </div>
        </div>
      )}

      {showAddStageForm && (
        <AddStageForm
          diaryId={diaryId}
          onSave={handleCloseForm}
          onCancel={handleCloseForm}
          latestPlantCount={latestPlantCount}
    
        />
      )}
       {showPriceForm && (
                <ConfirmPriceForm 
                    data={dataForPricing}
                    onClose={() => setShowPriceForm(false)}
                    onConfirm={(priceInfo) => {
                          processInventoryUpdate(true, dataForPricing.plant, dataForPricing.diary, priceInfo);
                    }}
                />
            )}
    </div>
  );
};

export default DiaryStageDetails;