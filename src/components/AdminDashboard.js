// src/components/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import './AdminDashboard.css';
import AdminDataService from '../services/admin.services';
import { auth } from '../firebase-config';
import authService from '../services/authservices';
import { useNotification } from '../context/NotificationContext'; // <-- Sửa 1: Import đúng hook

const AdminDashboard = () => {
  const { showNotification } = useNotification(); // <-- Sửa 2: Gọi hook
  const [activeTab, setActiveTab] = useState('stats');
  const [farmersStats, setFarmersStats] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const adminTabs = [
    { id: 'stats', label: 'Thống kê' },
    { id: 'users', label: 'Quản lý người dùng' }
  ];

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const adminStatus = await authService.isAdmin(user.uid);
        setIsAdmin(adminStatus);
        if (!adminStatus) setError('Bạn không có quyền truy cập trang quản trị.');
      } else {
        setError('Vui lòng đăng nhập để truy cập trang quản trị.');
      }
    };
    checkAdminStatus();
  }, []);

  // Sửa 3: Dùng useCallback để ổn định hàm và dùng cho cả useEffect lẫn nút "Thử lại"
  const loadData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const stats = await AdminDataService.getFarmersStats();
      setFarmersStats(stats);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu admin:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu thống kê!');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]); 

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, loadData]); // Thêm loadData vào dependency array để tuân thủ ESLint


  const loadUsers = async () => {
    try {
      const usersData = await AdminDataService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error);
      setError('Có lỗi xảy ra khi tải danh sách người dùng!');
    }
  };

  useEffect(() => {
    if (isAdmin && activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, isAdmin]);


  const handleRoleChange = async (userId, newRole) => {
    try {
      await AdminDataService.updateUserRole(userId, newRole);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      showNotification('Cập nhật vai trò thành công!', 'success');
    } catch (error) {
      console.error('Lỗi khi cập nhật vai trò:', error);
      showNotification('Có lỗi xảy ra khi cập nhật vai trò!', 'error');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await AdminDataService.toggleUserStatus(userId, currentStatus);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, isDisabled: !currentStatus } : user
        )
      );
      // Sửa 4: Thay thế alert
      showNotification(currentStatus ? 'Đã kích hoạt người dùng!' : 'Đã vô hiệu hóa người dùng!', 'success');
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái:', error);
      showNotification('Có lỗi xảy ra khi thay đổi trạng thái!', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) {
      try {
        await AdminDataService.deleteUser(userId);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        showNotification('Đã xóa người dùng thành công!', 'success'); // Sửa 4: Thay thế alert
      } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        showNotification('Có lỗi xảy ra khi xóa người dùng!', 'error'); // Sửa 4: Thay thế alert
      }
    }
  };

  if (loading) return <div className="admin-dashboard loading">Đang tải dữ liệu...</div>;
  if (error) return (
      <div className="admin-dashboard">
        <h1>Bảng điều khiển Quản trị viên</h1>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadData}>Thử lại</button>
        </div>
      </div>
    );

  return (
    <div className="admin-dashboard">
      <h1>Bảng điều khiển Quản trị viên</h1>
      <div className="admin-tabs">
        {adminTabs.map(tab => (
          <button 
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {activeTab === 'stats' && (
        <div className="stats-section">
          <h2>Thống kê Nông dân</h2>
          <div className="stats-summary">
            <div className="stat-card">
              <h3>{farmersStats.length}</h3>
              <p>Tổng số nông dân</p>
            </div>
            <div className="stat-card">
              <h3>{farmersStats.reduce((acc, curr) => acc + curr.plantCount, 0)}</h3>
              <p>Tổng số cây trồng</p>
            </div>
            <div className="stat-card">
              <h3>{farmersStats.reduce((acc, curr) => acc + curr.diaryCount, 0)}</h3>
              <p>Tổng số nhật ký</p>
            </div>
          </div>
          <div className="table-container">
          <table className="farmers-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Số cây trồng</th>
                <th>Số nhật ký</th>
                <th>Ngày tham gia</th>
              </tr>
            </thead>
            <tbody>
              {farmersStats.map(farmer => (
                <tr key={farmer.id}>
                  <td>{farmer.email}</td>
                  <td>{farmer.plantCount}</td>
                  <td>{farmer.diaryCount}</td>
                  <td>{farmer.joinedDate.toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-section">
          <h2>Quản lý Người dùng</h2>
          <table className="farmers-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="role-select"
                    >
                      <option value="farmer">Nông dân</option>
                      <option value="buyer">Người mua</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isDisabled ? 'disabled' : 'active'}`}>
                      {user.isDisabled ? 'Đã vô hiệu hóa' : 'Đang hoạt động'}
                    </span>
                  </td>
                  <td>
                    <div className="user-actions">
                      <button 
                        className={`status-btn ${user.isDisabled ? 'activate-btn' : 'disable-btn'}`}
                        onClick={() => handleToggleStatus(user.id, user.isDisabled)}
                      >
                        {user.isDisabled ? 'Kích hoạt' : 'Vô hiệu hóa'}
                      </button>
                      <button 
                        className="delete-user-btn"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;