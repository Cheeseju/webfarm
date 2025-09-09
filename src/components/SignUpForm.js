import React, { useState, useEffect } from 'react';
import './AuthForm.css';
import authService from '../services/authservices';

const SignUpForm = ({ onSignup, onSwitchToLogin, emailErrorFromParent, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [role, setRole] = useState('farmer'); 
    const [emailError, setEmailError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState(null);
    const [authError, setAuthError] = useState(null); // State mới cho lỗi auth

    useEffect(() => {
        if (emailErrorFromParent) {
            setEmailError(emailErrorFromParent);
        }
    }, [emailErrorFromParent]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (emailError) setEmailError(null);
        if (authError) setAuthError(null); // Reset auth error khi thay đổi email
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (passwordError) setPasswordError(null);
        if (authError) setAuthError(null);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        if (confirmPasswordError) setConfirmPasswordError(null);
        if (authError) setAuthError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setEmailError(null);
        setPasswordError(null);
        setConfirmPasswordError(null);
        setAuthError(null);

        // Kiểm tra email
        if (!email.trim()) {
            setEmailError("Vui lòng nhập email.");
            return;
        }
        
        if (!authService.validateEmail(email)) {
            setEmailError("Email không hợp lệ. Vui lòng kiểm tra lại.");
            return;
        }

        // Kiểm tra mật khẩu
        if (!password.trim()) {
            setPasswordError("Vui lòng nhập mật khẩu.");
            return;
        }
        
        if (!authService.validatePassword(password)) {
            setPasswordError("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.");
            return;
        }

        // Kiểm tra mật khẩu xác nhận
        if (!confirmPassword.trim()) {
            setConfirmPasswordError("Vui lòng xác nhận mật khẩu.");
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Mật khẩu xác nhận không khớp.');
            return;
        }

        try {
            await onSignup(email, password, role);
        } catch (error) {
            setAuthError(error.message);
        }
    };

    return (
        <div className="auth-form-container">
            <button className="close-button" onClick={onClose}>&times;</button>
            <h2>Đăng ký</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Email"
                    required
                    className={emailError ? 'input-error' : ''}
                />
                {emailError && <p className="error-message">{emailError}</p>}
                
                <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Mật khẩu"
                    required
                    className={passwordError ? 'input-error' : ''}
                />
                {passwordError && <p className="error-message">{passwordError}</p>}
                
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Nhập lại mật khẩu"
                    required
                    className={confirmPasswordError ? 'input-error' : ''}
                />
                {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
                
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="farmer">Nông dân</option>
                    <option value="buyer">Người mua hàng</option>
                </select>
                
                <button type="submit">Đăng ký</button>
                {authError && <p className="error-message">{authError}</p>} {/* Hiển thị lỗi auth */}
            </form>
            <p>
                Đã có tài khoản? <span className="link" onClick={onSwitchToLogin}>Đăng nhập</span>
            </p>
        </div>
    );
};

export default SignUpForm;