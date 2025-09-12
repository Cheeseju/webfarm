// src/components/AddStageForm.js
import React, { useState, useRef, useCallback } from 'react';
import { auth } from '../firebase-config';
import { uploadImage } from '../services/upload.services';
import DiaryDataService from '../services/diary.services';
import './AddStageForm.css';
import Webcam from 'react-webcam';
import { useNotification } from '../context/NotificationContext';

const MAX_IMAGE_SIZE_MB = 5; // 5MB
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_VIDEO_SIZE_MB = 20; // 20MB
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const AddStageForm = ({ diaryId, onSave, onCancel, latestPlantCount, onSyncStage }) => {
    const user = auth.currentUser;
    const [task, setTask] = useState('');
    const [plantCount, setPlantCount] = useState('');
    const [pests, setPests] = useState('');
    const [fertilizer, setFertilizer] = useState('');
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [plantCountError, setPlantCountError] = useState('');
    const [fileError, setFileError] = useState('');
    const { showNotification } = useNotification()
    const [taskError, setTaskError] = useState('');
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [mediaPreview, setMediaPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileError(''); // <-- Xóa lỗi khi người dùng chọn file
            if (file.type.startsWith('image/') && file.size > MAX_IMAGE_SIZE_BYTES) {
                showNotification(`Kích thước ảnh không được vượt quá ${MAX_IMAGE_SIZE_MB}MB.`, 'error');
                return;
            }
            if (file.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE_BYTES) {
                showNotification(`Kích thước video không được vượt quá ${MAX_VIDEO_SIZE_MB}MB.`, 'error');
                return;
            }
            setFile(file);
            setMediaPreview(URL.createObjectURL(file));
            setIsCameraOpen(false);
        }
    };

    const capturePhoto = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            fetch(imageSrc).then(res => res.blob()).then(blob => {
                const imageFile = new File([blob], "photo.jpg", { type: "image/jpeg" });
                if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
                   showNotification(`Kích thước ảnh không được vượt quá ${MAX_IMAGE_SIZE_MB}MB.`, 'error');
                    return;
                }
                setFileError(''); // <-- Xóa lỗi khi người dùng chụp ảnh
                setFile(imageFile);
                setMediaPreview(imageSrc);
                setIsCameraOpen(false);
            });
        }
    }, [webcamRef, showNotification]);

    const handleStartRecording = useCallback(() => {
        setRecordedChunks([]);
        setIsRecording(true);
        mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
            mimeType: "video/webm"
        });
        mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
            setRecordedChunks((prev) => prev.concat(event.data));
        });
        mediaRecorderRef.current.start();
    }, [webcamRef]);

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    }, [mediaRecorderRef]);

    const handleSelectVideo = useCallback(() => {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            if (blob.size > MAX_VIDEO_SIZE_BYTES) {
               showNotification(`Kích thước video không được vượt quá ${MAX_VIDEO_SIZE_MB}MB.`, 'error');
                setRecordedChunks([]);
                return;
            }
            setFileError(''); // <-- Xóa lỗi khi người dùng chọn video
            const videoFile = new File([blob], "video.webm", { type: "video/webm" });
            setFile(videoFile);
            setMediaPreview(URL.createObjectURL(blob));
            setRecordedChunks([]);
            setIsCameraOpen(false);
        }
    },  [recordedChunks, showNotification]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!task.trim()) {
        setTaskError('Vui lòng nhập tên công việc.');
        setIsUploading(false); // Dừng loading nếu có lỗi
        return;
         }

        if (!file) {
            setFileError('Vui lòng thêm một hình ảnh hoặc video cho giai đoạn này.');
            return;
        }

        setIsUploading(true);
        setPlantCountError('');
        setFileError(''); // Xóa lỗi nếu đã có file
        setTaskError(''); 

        const newPlantCount = parseInt(plantCount);
        if (latestPlantCount === null && (isNaN(newPlantCount) || newPlantCount <= 0)) {
            setPlantCountError("Số lượng cây trồng không được để trống và phải lớn hơn 0.");
            setIsUploading(false);
            return;
        }

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

            const stageRef = await DiaryDataService.addStageToDiary(diaryId, newStage, user.email);
            
            if (onSyncStage && stageRef) {
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
                <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
                    <div className="form-body-scrollable">
                        <div className="form-group">
                            <label>Công việc:</label>
                            <input 
                             type="text" value={task} onChange={(e) => {setTask(e.target.value); setTaskError('');  }} />
                                {taskError && <p className="error-message">{taskError}</p>}
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
                            <p className="form-hint">Vui lòng tải 1 ảnh hoặc video minh chứng</p>
                            
                            {isCameraOpen ? (
                                <div className="camera-container">
                                    <Webcam audio={true} ref={webcamRef} videoConstraints={{ facingMode: "environment" }} />
                                    <div className="camera-controls">
                                        <button type="button" onClick={capturePhoto} disabled={isRecording}>Chụp Ảnh</button>
                                        {isRecording ? (
                                            <button type="button" onClick={handleStopRecording}>Dừng Quay</button>
                                        ) : (
                                            <button type="button" onClick={handleStartRecording}>Bắt đầu Quay</button>
                                        )}
                                        {recordedChunks.length > 0 && !isRecording && (
                                            <button type="button" onClick={handleSelectVideo}>Chọn Video</button>
                                        )}
                                        <button type="button" onClick={() => setIsCameraOpen(false)}>Đóng</button>
                                    </div>
                                </div>
                            ) : (
                                mediaPreview && (
                                    <div className="media-preview">
                                        {file?.type.startsWith('image/') && <img src={mediaPreview} alt="Preview"/>}
                                        {file?.type.startsWith('video/') && <video src={mediaPreview} controls />}
                                    </div>
                                )
                            )}
                            
                            <div className="form-actions-media">
                                <button type="button" className="media-action-button" onClick={() => setIsCameraOpen(true)}>
                                    📷 Mở camera
                                </button>
                                <label htmlFor="file-upload-stage" className="media-action-button">
                                    📁 Tải lên
                                </label>
                                <input 
                                    id="file-upload-stage"
                                    type="file" 
                                    accept="image/*,video/*"
                                    onChange={handleFileChange} 
                                    style={{ display: 'none' }} 
                                />
                            </div>
                            {fileError && <p className="error-message">{fileError}</p>}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={isUploading}>
                            {isUploading ? 'Đang tải lên...' : 'Lưu Giai Đoạn'}
                        </button>
                        <button type="button" onClick={onCancel} disabled={isUploading}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStageForm;