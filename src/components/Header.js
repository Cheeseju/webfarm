import React from 'react';
import './Header.css';
import { FaSearch, FaFilter, FaSort } from 'react-icons/fa'; // Giữ lại icons nếu cần

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        {/* Bạn có thể đặt ảnh logo vào đây hoặc dùng text */}
        <h1>FARMC</h1>
      </div>
      <div className="search-bar-container">
        <div className="search-bar">
          <FaSearch />
          <input type="text" placeholder="Tìm kiếm theo tên/loại cây trồng" />
        </div>
      </div>
      <div className="filter-icons">
        <FaSort />
        <FaFilter />
      </div>
    </header>
  );
};

export default Header;