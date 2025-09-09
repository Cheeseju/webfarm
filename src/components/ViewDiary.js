// src/components/ViewDiary.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase-config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import './ViewDiary.css';

const ViewDiary = () => {
  const { diaryId } = useParams();
  const [diary, setDiary] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDiaryData = async () => {
      if (!diaryId) {
        setError('Không tìm thấy mã nhật ký');
        setLoading(false);
        return;
      }

      try {
        // Lấy thông tin nhật ký từ publicDiaries
        const publicDiaryRef = doc(db, 'publicDiaries', diaryId);
        const publicDiaryDoc = await getDoc(publicDiaryRef);
        
        if (publicDiaryDoc.exists()) {
          const diaryData = publicDiaryDoc.data();
          setDiary({
            id: publicDiaryDoc.id,
            title: diaryData.title || 'Không có tiêu đề',
            plantId: diaryData.plantId,
            userId: diaryData.userId,
            createdAt: diaryData.createdAt,
            publicSince: diaryData.publicSince
          });
          
          // Lấy các giai đoạn từ publicStages
          const stagesCollection = collection(db, 'publicDiaries', diaryId, 'publicStages');
          const stagesSnapshot = await getDocs(stagesCollection);
          const stagesList = stagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Sắp xếp theo thời gian
          stagesList.sort((a, b) => {
            const dateA = a.date?.seconds || 0;
            const dateB = b.date?.seconds || 0;
            return dateA - dateB;
          });
          
          setStages(stagesList);
        } else {
          setError('Nhật ký không tồn tại hoặc chưa được công khai.');
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu nhật ký:", err);
        setError('Đã xảy ra lỗi khi tải nhật ký. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchDiaryData();
  }, [diaryId]);

  if (loading) {
    return (
      <div className="view-diary-container">
        <div className="loading-spinner">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-diary-container">
        <div className="error-message">
          <h3>Lỗi</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!diary) {
    return (
      <div className="view-diary-container">
        <div className="not-found">
          <h3>Không tìm thấy nhật ký</h3>
          <p>Nhật ký bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-diary-container">
      <header className="diary-header">
        <h1>Nhật ký canh tác: {diary.title}</h1>
        {diary.publicSince && (
          <p className="public-date">
            Được công khai vào: {new Date(diary.publicSince.seconds * 1000).toLocaleDateString('vi-VN')}
          </p>
        )}
      </header>

      <div className="stages-list">
        {stages.length > 0 ? (
          stages.map((stage) => (
            <div key={stage.id} className="stage-card">
              <div className="stage-header">
                <h3>Ngày: {stage.date?.seconds ? new Date(stage.date.seconds * 1000).toLocaleDateString('vi-VN') : 'N/A'}</h3>
              </div>
              
              <div className="stage-content">
                <div className="stage-info">
                  <p><strong>Công việc:</strong> {stage.task || 'Không có thông tin'}</p>
                  <p><strong>Số lượng cây:</strong> {stage.plantCount || 'N/A'}</p>
                  <p><strong>Sâu bệnh:</strong> {stage.pests || 'Không có'}</p>
                  <p><strong>Phân thuốc:</strong> {stage.fertilizer || 'Không có'}</p>
                </div>
                
                {stage.notes && (
                  <div className="stage-notes">
                    <strong>Ghi chú:</strong>
                    <p>{stage.notes}</p>
                  </div>
                )}
                
                {stage.imageUrl && (
                  <div className="stage-media">
                    <a 
                      href={stage.imageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="media-link"
                    >
                      📷 Xem hình ảnh/video
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-stages">
            <p>Chưa có giai đoạn nào được ghi lại trong nhật ký này.</p>
          </div>
        )}
      </div>

      <footer className="diary-footer">
        <p>Đây là nhật ký canh tác công khai. Chỉ có thể xem, không thể chỉnh sửa.</p>
      </footer>
    </div>
  );
};

export default ViewDiary;