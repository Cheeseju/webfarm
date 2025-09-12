// src/components/HomePage.js
import React, { useState } from 'react';
import './HomePage.css';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import authService from '../services/authservices';
import loginImage from '../assets/login.jpg';
import { useNotification } from '../context/NotificationContext';
import QRScanner from './QRScanner';
import ActivityFeed from './ActivityFeed';

const Homepage = ({ onEnterGuestMode }) => {
    const [mode, setMode] = useState('homepage');
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();
    const [showScanner, setShowScanner] = useState(false);

    const handleLogin = async (email, password) => {
      try {
        setError(null);
        await authService.signInWithEmail(email, password);
      } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        showNotification(error.message, 'error');
      }
    };

    const handleSignup = async (email, password, role) => {
      try {
        setError(null);
        await authService.signUpWithEmail(email, password, role);
      } catch (error) {
        console.error('Lỗi khi đăng ký:', error);
        setError(error.message); // Hiển thị thông báo lỗi cho người dùng
      }
    };

    const handleCloseAuthForm = () => {
        setMode('homepage');
        setError(null);
    };
    // Hàm mới để xử lý khi click vào thẻ tính năng
    const handleFeatureClick = (page) => {
        if (onEnterGuestMode && typeof onEnterGuestMode === 'function') {
            onEnterGuestMode(page);
        }
    };

 const handleScan = (data) => {
        if (data) {
            setShowScanner(false);
            // Chuyển hướng trình duyệt đến URL đã quét được
            window.location.href = data;
        }
    };
    const renderContent = () => {
        if (mode === 'login') {
            return (
                <LoginForm
                    onLogin={handleLogin}
                    onSwitchToSignup={() => {
                        setMode('signup');
                        setError(null);
                    }}
                    onClose={handleCloseAuthForm}
                    error={error}
                   
                />
            );
        } else if (mode === 'signup') {
            return (
                <SignUpForm
                    onSignup={handleSignup}
                    onSwitchToLogin={() => {
                        setMode('login');
                        setError(null);
                    }}
                    emailErrorFromParent={error}
                    onClose={handleCloseAuthForm}
                />
            );
        } else {
            return (
                <>
                    <div className="homepage-hero">
                        <img src={loginImage} alt="Gardening illustration" className="hero-image" />
                        <div className="hero-text-overlay">
                            <h1>Chào mừng đến với FARMC</h1>
                            <p>Đây là nơi quản lý và theo dõi quá trình canh tác nông nghiệp của bạn</p>
                            <div className="homepage-buttons">
                                <button className="login-button" onClick={() => setMode('login')}>Đăng nhập</button>
                                <button className="signup-button" onClick={() => setMode('signup')}>Đăng ký</button>
                            </div>
                        </div>
                    </div>
                    <div className="features-section">
                        <h2>Tính năng</h2>
                        <div className="features-grid">
                            <div className="feature-card" onClick={() => handleFeatureClick('diaries')}>
                                <h3>Nhật ký canh tác</h3>
                                <p>Ghi lại toàn bộ quá trình trồng trọt của bạn một cách dễ dàng.</p>
                            </div>
                             <div className="feature-card" onClick={() => setShowScanner(true)}>
                                <h3>Quét mã QR</h3>
                                <p>Theo dõi nguồn gốc sản phẩm nhanh chóng bằng cách quét mã QR.</p>
                            </div>
                            <div className="feature-card">
                                <h3>Mua sắm</h3>
                                <p>Khám phá và mua các sản phẩm nông nghiệp chất lượng cao.</p>
                            </div>
                        </div>
                    </div>
                     <ActivityFeed /> 
                    <footer className="homepage-footer">
                        <div className="footer-content">
                          
                            <div className="footer-contact">
                                <h4>Thông tin liên hệ</h4>
                                <p>Email: contact@farmc.com</p>
                                <p>Điện thoại: +84 123 456 789</p>
                                <p>Địa chỉ: TP. Hồ Chí Minh, Việt Nam</p>
                            </div>
                            <div className="footer-links">
                                <h4>Liên kết hữu ích</h4>
                                <ul>
                                    <li><a href="/about">Về chúng tôi</a></li>
                                    <li><a href="/terms">Điều khoản sử dụng</a></li>
                                    <li><a href="/privacy">Chính sách bảo mật</a></li>
                                </ul>
                            </div>
                        </div>
                    </footer>
                </>
            );
        }
    };

    return (
        <div className="homepage-container">
            {renderContent()}
           {showScanner && (
                <QRScanner 
                    onClose={() => setShowScanner(false)} 
                    onScan={handleScan}
                />
            )}

        </div>
    );
};

export default Homepage;