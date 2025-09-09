// src/components/ForgotPassword.js
import React, { useState } from 'react';
import authService from '../services/authservices';
import './AuthForm.css';

const ForgotPassword = ({ onBackToLogin, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

const handleSendResetEmail = async (e) => {
  e.preventDefault();
  setError('');
  
  if (!email) {
    setError('Vui lòng nhập email');
    return;
  }
  
  if (!authService.validateEmail(email)) {
    setError('Email không hợp lệ');
    return;
  }
  
  try {
    await authService.sendPasswordResetEmail(email);
    setMessage('Nếu email tồn tại trong hệ thống, liên kết đặt lại mật khẩu sẽ được gửi đến hộp thư của bạn.');
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <div className="auth-form-container">
      <button className="close-button" onClick={onClose}>&times;</button>
      
      <h2>Quên mật khẩu</h2>
      
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSendResetEmail}>
        <p>Nhập email để nhận liên kết đặt lại mật khẩu</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email của bạn"
          required
          className={error ? 'input-error' : ''}
        />
        <button type="submit">Gửi email đặt lại</button>
        <button type="button" onClick={onBackToLogin} className="secondary-button">
          Quay lại đăng nhập
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;