// src/components/DiaryStageDetails.js
import React, { useState, useEffect, useCallback } from 'react';
import DiaryDataService from '../services/diary.services';
import AddStageForm from './AddStageForm';
import './DiaryStageDetails.css';
import QRCode from 'react-qr-code';
import { db } from '../firebase-config';
import { doc, setDoc } from 'firebase/firestore';
import { useNotification } from '../context/NotificationContext'; // <-- 1. Import hook

const DiaryStageDetails = ({ diaryId }) => {
  const { showNotification } = useNotification(); // <-- 2. Lấy hàm showNotification
  const [showQRCode, setShowQRCode] = useState(false);
  const [stages, setStages] = useState([]);
  const [diaryTitle, setDiaryTitle] = useState('');
  const [showAddStageForm, setShowAddStageForm] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [status, setStatus] = useState("Đang canh tác");
  const [showWarning, setShowWarning] = useState(false); 
  const [latestPlantCount, setLatestPlantCount] = useState(null); 
  const [qrValue, setQrValue] = useState('');

  const updateCompletionStatus = async (isCompleted) => {
    const newStatus = isCompleted ? "Đã hoàn thành" : "Đang canh tác";
    const updatedFields = {
      isCompleted: isCompleted,
      status: newStatus
    };

    if (isCompleted) {
      updatedFields.endDate = new Date();
    } else {
      updatedFields.endDate = null;
    }

    try {
      await DiaryDataService.updateDiary(diaryId, updatedFields);
      setIsCompleted(isCompleted);
      setStatus(newStatus);
      showNotification('Cập nhật trạng thái nhật ký thành công!', 'success');
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err.message);
      showNotification('Lỗi khi cập nhật trạng thái!', 'error');
    }
  };

  const syncStageToPublic = async (stageId, stageData) => {
    try {
      const publicStageRef = doc(db, 'publicDiaries', diaryId, 'publicStages', stageId);
      await setDoc(publicStageRef, stageData);
    } catch (error) {
      console.error('Lỗi khi đồng bộ stage:', error);
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
    try {
      await copyDiaryToPublic();
      const publicUrl = `https://webcaytrong-19dc6.web.app/view-diary/${diaryId}`;
      setQrValue(publicUrl);
      setShowQRCode(true);
      showNotification('Tạo mã QR thành công!', 'success');
    } catch (error) {
      console.error('Lỗi khi tạo QR code:', error);
      showNotification('Có lỗi xảy ra khi tạo QR code.', 'error'); // <-- 3. Thay thế alert
    }
  };

  const handleHideQRCode = () => setShowQRCode(false);
  
  const handleCheckboxChange = (e) => {
    if (stages.length === 0 && e.target.checked) {
      setShowWarning(true);
      e.target.checked = false; // Ngăn không cho tick
      return;
    }
    setShowWarning(false); 
    updateCompletionStatus(e.target.checked);
  };

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
            onChange={handleCheckboxChange}
          />
          <label htmlFor="isCompleted">Đã hoàn thành nhật ký</label>
        </div>
        {showWarning && (
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
          onSyncStage={syncStageToPublic}
        />
      )}
    </div>
  );
};

export default DiaryStageDetails;