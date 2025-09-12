import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode'; // SỬA: Import lõi của thư viện
import './QRScanner.css';

const QRScanner = ({ onClose, onScan }) => {
  const scannerRef = useRef(null); // Dùng để lưu instance của scanner
  const containerRef = useRef(null); // Dùng để tham chiếu đến div chứa camera
  const [isScanning, setIsScanning] = useState(false);

  // Hàm để dừng camera một cách an toàn
  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        setIsScanning(false);
      }).catch(err => {
        console.error("Lỗi khi dừng camera:", err);
        setIsScanning(false);
      });
    }
  };

  useEffect(() => {
    // Chỉ khởi tạo scanner một lần
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(containerRef.current.id);
    }
    const scanner = scannerRef.current;

    // Dọn dẹp: Dừng camera khi component bị đóng
    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop();
      }
    };
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần

  // Hàm xử lý khi nhấn nút "Bắt đầu quét"
  const startScanning = async () => {
    if (scannerRef.current) {
      try {
        setIsScanning(true);
        await scannerRef.current.start(
          { facingMode: "environment" }, // Ưu tiên camera sau
          {
            qrbox: { width: 250, height: 250 },
            fps: 10,
          },
          (decodedText, decodedResult) => {
            // Xử lý khi quét thành công
            stopScanner();
            onScan(decodedText);
          },
          (errorMessage) => { /* Bỏ qua lỗi */ }
        );
      } catch (err) {
        console.error("Lỗi khi khởi động camera:", err);
        alert("Không thể khởi động camera. Vui lòng cấp quyền truy cập và đảm bảo trang web đang chạy trên HTTPS.");
        setIsScanning(false);
      }
    }
  };

  // Hàm xử lý khi chọn file ảnh để quét
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && scannerRef.current) {
      try {
        const decodedText = await scannerRef.current.scanFile(file, false);
        onScan(decodedText);
      } catch (err) {
        console.error('Lỗi khi quét file ảnh:', err);
        alert('Không thể quét mã QR từ file ảnh này.');
      }
    }
  };

  return (
    <div className="qr-scanner-overlay" onClick={onClose}>
      <div className="qr-scanner-container" onClick={(e) => e.stopPropagation()}>
        <h3>Di chuyển camera đến mã QR</h3>
        <div className="qr-reader-wrapper">
          <div id="qr-reader-container" ref={containerRef}></div>
          {!isScanning && (
             <div className="scanner-placeholder">
                <p>Nhấn "Bắt đầu quét" để mở camera</p>
             </div>
          )}
        </div>

        <div className="scanner-controls">
          {!isScanning ? (
            <button onClick={startScanning} className="control-btn start-btn">
              Bắt đầu quét
            </button>
          ) : (
            <button onClick={stopScanner} className="control-btn stop-btn">
              Dừng quét
            </button>
          )}
          <label htmlFor="qr-file-input" className="control-btn file-label">
            Quét từ ảnh
          </label>
          <input
            id="qr-file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
        <button onClick={onClose} className="close-scanner-btn">Đóng</button>
      </div>
    </div>
  );
};

export default QRScanner;

