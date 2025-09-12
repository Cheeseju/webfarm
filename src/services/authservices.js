// src/services/authservices.js
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 

} from 'firebase/firestore'; 
import { auth, db } from '../firebase-config';

class AuthService {
  // Hàm đăng nhập bằng Google và lưu vai trò
  signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: user.email,
        role: 'farmer',
      }, { merge: true });
      return user;
    } catch (error) {
      console.error('Lỗi khi đăng nhập bằng Google:', error);
      throw error;
    }
  };

  // Hàm đăng ký bằng email và mật khẩu
  signUpWithEmail = async (email, password, role) => {
    try {
      // Kiểm tra xem email đã tồn tại trong Authentication chưa
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        throw new Error('Email này đã được đăng ký. Vui lòng sử dụng một email khác hoặc đăng nhập.');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: user.email,
        role: role,
        createdAt: new Date() 
      });
      return user;
    } catch (error) {
      console.error('Lỗi khi đăng ký bằng email:', error);
      
      // Cung cấp thông báo lỗi cụ thể bằng tiếng Việt
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email này đã được đăng ký. Vui lòng sử dụng một email khác hoặc đăng nhập.');
      } else {
        throw error;
      }
    }
  };

  // Hàm đăng nhập bằng email và mật khẩu
 
 signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // **BƯỚC KIỂM TRA QUAN TRỌNG**
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data().isDisabled === true) {
        // Nếu bị vô hiệu hóa, đăng xuất và báo lỗi
        await signOut(auth);
        throw new Error('Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.');
      }

      if (!userDocSnap.exists()) {
        // Nếu đã xóa hồ sơ, không cho đăng nhập
        await signOut(auth);
        throw new Error('Tài khoản không tồn tại trong hệ thống.');
      }

      return user;
    } catch (error) {
      console.error('Lỗi khi đăng nhập bằng email:', error);
      
      // Nếu lỗi là do tài khoản bị vô hiệu hóa, ưu tiên hiển thị thông báo đó
      if (error.message.includes('vô hiệu hóa')) {
          throw new Error(error.message);
      }

      // Ngược lại, xử lý các lỗi đăng nhập thông thường
      let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Email hoặc mật khẩu không chính xác.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Không tìm thấy tài khoản với email này.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Mật khẩu không chính xác.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email này đã được đăng ký. Vui lòng sử dụng một email khác hoặc đăng nhập.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // Hàm đăng xuất
  signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      throw error;
    }
  };

  // Hàm lấy vai trò của người dùng từ Firestore
  getUserRole = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        return userDocSnap.data().role;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi lấy vai trò người dùng:', error);
      throw error;
    }
  };
  // Hàm kiểm tra nếu user là admin
isAdmin = async (userId) => {
  try {
    const role = await this.getUserRole(userId);
    return role === 'admin';
  } catch (error) {
    console.error('Lỗi khi kiểm tra admin:', error);
    return false;
  }
};

  // Hàm kiểm tra định dạng email
  validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Hàm kiểm tra độ mạnh mật khẩu
  validatePassword = (password) => {
    // Ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
  };

  // Hàm gửi email đặt lại mật khẩu
  sendPasswordResetEmail = async (email) => {
  try {
    // Remove the email existence check since it only checks Authentication
    // Firebase will handle non-existent emails securely
    await sendPasswordResetEmail(auth, email);
    
    return true;
  } catch (error) {
    console.error('Lỗi khi gửi email đặt lại mật khẩu:', error);
    
    let errorMessage = 'Không thể gửi email đặt lại mật khẩu.';
    if (error.code === 'auth/invalid-email') {
      errorMessage = 'Địa chỉ email không hợp lệ.';
    }
    // Firebase will not reveal if email exists for security reasons
    
    throw new Error(errorMessage);
  }
};
  // Hàm xác minh mã reset và trả về email
  verifyPasswordResetCode = async (oobCode) => {
    try {
      const email = await verifyPasswordResetCode(auth, oobCode);
      return email;
    } catch (error) {
      console.error('Lỗi khi xác minh mã reset:', error);
      
      let errorMessage = 'Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.';
      if (error.code === 'auth/expired-action-code') {
        errorMessage = 'Mã đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu gửi lại email.';
      } else if (error.code === 'auth/invalid-action-code') {
        errorMessage = 'Mã đặt lại mật khẩu không hợp lệ.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Tài khoản đã bị vô hiệu hóa.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Không tìm thấy tài khoản người dùng.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // Hàm xác nhận đặt lại mật khẩu
  confirmPasswordReset = async (oobCode, newPassword) => {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      return true;
    } catch (error) {
      console.error('Lỗi khi xác nhận đặt lại mật khẩu:', error);
      
      let errorMessage = 'Không thể đặt lại mật khẩu.';
      if (error.code === 'auth/expired-action-code') {
        errorMessage = 'Mã đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu gửi lại email.';
      } else if (error.code === 'auth/invalid-action-code') {
        errorMessage = 'Mã đặt lại mật khẩu không hợp lệ.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Tài khoản đã bị vô hiệu hóa.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Không tìm thấy tài khoản người dùng.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.';
      }
      
      throw new Error(errorMessage);
    }
  };
}

const authService = new AuthService();
export default authService;