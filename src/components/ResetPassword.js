import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper,
  Alert
} from '@mui/material';
import authService from '../services/authservices';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyResetCode = async () => {
      if (oobCode) {
        try {
          const userEmail = await authService.verifyPasswordResetCode(oobCode);
          setEmail(userEmail);
          setIsVerified(true);
        } catch (error) {
          setError('Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
        }
      } else {
        setError('Không tìm thấy mã đặt lại mật khẩu.');
      }
    };

    verifyResetCode();
  }, [oobCode]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    if (!authService.validatePassword(newPassword)) {
      setError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số');
      return;
    }
    
    try {
      await authService.confirmPasswordReset(oobCode, newPassword);
      setMessage('Mật khẩu đã được đặt lại thành công. Bây giờ bạn có thể đăng nhập.');
      
      // Chuyển hướng về trang đăng nhập sau 3 giây
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            Đặt Lại Mật Khẩu
          </Typography>
          
          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
          {message && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{message}</Alert>}
          
          {isVerified ? (
            <>
              <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
                Đặt lại mật khẩu cho: <strong>{email}</strong>
              </Typography>
              
              <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="newPassword"
                  label="Mật khẩu mới"
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Đặt Lại Mật Khẩu
                </Button>
              </Box>
            </>
          ) : (
            !error && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Đang xác minh mã đặt lại mật khẩu...
              </Typography>
            )
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword;