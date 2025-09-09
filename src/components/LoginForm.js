// src/components/LoginForm.js
import React, { useState } from 'react';
import './AuthForm.css';
import ForgotPassword from './ForgotPassword';

const LoginForm = ({ onLogin, onSwitchToSignup, onClose, error }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(email, password);
    };

    if (showForgotPassword) {
        return (
            <ForgotPassword 
                onBackToLogin={() => setShowForgotPassword(false)}
                onClose={onClose}
            />
        );
    }

    return (
        <div className="auth-form-container">
            <button className="close-button" onClick={onClose}>&times;</button>
            <h2>Đăng nhập</h2>
            
            {/* Hiển thị lỗi nếu có */}
            {error && <p className="error-message">{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className={error ? 'input-error' : ''}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu"
                    required
                    className={error ? 'input-error' : ''}
                />
                <button type="submit">Đăng nhập</button>
            </form>
            
            <p className="forgot-password-link" onClick={() => setShowForgotPassword(true)}>
                Quên mật khẩu?
            </p>
            
            <p>
                Chưa có tài khoản? <span className="link" onClick={onSwitchToSignup}>Đăng ký ngay</span>
            </p>
        </div>
    );
};

export default LoginForm;