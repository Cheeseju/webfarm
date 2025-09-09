// src/components/AddStageForm.js
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import { uploadImage } from '../services/upload.services';
import './AddStageForm.css';

const AddStageForm = ({ diaryId, onSave, onCancel, latestPlantCount, onSyncStage }) => {
    const [task, setTask] = useState('');
    const [plantCount, setPlantCount] = useState('');
    const [pests, setPests] = useState('');
    const [fertilizer, setFertilizer] = useState('');
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [plantCountError, setPlantCountError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        setPlantCountError('');

        // Thêm điều kiện kiểm tra bắt buộc số lượng cây trồng cho giai đoạn đầu tiên
        const newPlantCount = parseInt(plantCount);
        if (latestPlantCount === null && (isNaN(newPlantCount) || newPlantCount <= 0)) {
            setPlantCountError("Số lượng cây trồng không được để trống và phải lớn hơn 0.");
            setIsUploading(false);
            return;
        }

        // Kiểm tra số lượng cây trồng so với số lượng gần nhất
        if (latestPlantCount !== null && newPlantCount > latestPlantCount) {
            setPlantCountError(`Số lượng cây trồng không được lớn hơn số lượng cây của giai đoạn gần nhất (${latestPlantCount} cây).`);
            setIsUploading(false);
            return;
        }
        
        try {
            const fileUrl = await uploadImage(file);

            const newStage = {
                date: new Date(),
                task,
                plantCount: newPlantCount || 0,
                pests,
                fertilizer,
                notes,
                imageUrl: fileUrl,
            };

            // Thêm stage vào private collection
            const stageRef = await addDoc(
                collection(db, 'diaries', diaryId, 'stages'), 
                newStage
            );
            
            // Đồng bộ sang public collection nếu có hàm callback
            if (onSyncStage) {
                await onSyncStage(stageRef.id, newStage);
            }
            
            console.log("Thêm giai đoạn thành công!");
            onSave();
        } catch (error) {
            console.error("Lỗi khi thêm giai đoạn:", error);
            setPlantCountError("Đã xảy ra lỗi khi thêm giai đoạn. Vui lòng thử lại.");
        } finally {
            setIsUploading(false);
        }
    };
    
    const handlePlantCountChange = (e) => {
        const value = e.target.value;
        setPlantCount(value);
        if (plantCountError) {
            setPlantCountError('');
        }
    };

    return (
        <div className="add-stage-form-overlay">
            <div className="add-stage-form-container">
                <h3>Thêm Giai Đoạn Canh Tác Mới</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Công việc:</label>
                        <input type="text" value={task} onChange={(e) => setTask(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Số lượng cây trồng:</label>
                        <input type="number" value={plantCount} onChange={handlePlantCountChange} />
                        {plantCountError && <p className="error-message">{plantCountError}</p>}
                    </div>
                    <div className="form-group">
                        <label>Sâu bệnh:</label>
                        <input type="text" value={pests} onChange={(e) => setPests(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Phân thuốc:</label>
                        <input type="text" value={fertilizer} onChange={(e) => setFertilizer(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Ghi chú:</label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
                    </div>
                    <div className="form-group">
                        <label>Hình ảnh/Video:</label>
                        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                    </div>
                    <div className="form-actions">
                        <button type="submit" disabled={isUploading}>
                            {isUploading ? 'Đang tải lên...' : 'Lưu Giai Đoạn'}
                        </button>
                        <button type="button" onClick={onCancel}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStageForm;