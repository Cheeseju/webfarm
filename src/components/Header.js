import React from 'react';
import './Header.css';
import { FaSearch, FaFilter, FaSignOutAlt } from 'react-icons/fa';
import { FaShoppingCart } from 'react-icons/fa'; 

const Header = ({ onSearch, searchQuery, user, onLogout, userRole, onFilterClick, showFilterButton , onLoginClick, cartItemCount, onPageChange }) => {
    return (
        <header className="header">
            <div className="logo">
                <h1>FARMC</h1>
            </div>
            <div className="search-bar-container">
                <div className="search-bar">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên/loại cây trồng"
                        value={searchQuery}
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
            </div>
             <div className="cart-icon-container" onClick={() => onPageChange('cart')}>
                            <FaShoppingCart />
                            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
                        </div>
            <div className="header-right">
                {user ? (
                    <>
                <div className="filter-icons">
                    {/* Nút lọc chỉ hiển thị cho farmer và khi đang ở trang DiariesList */}
                    {userRole === 'farmer' && showFilterButton && (
                        <FaFilter
                            onClick={onFilterClick}
                            style={{ cursor: 'pointer', fontSize: '20px' }}
                        />
                    )}
                </div>
              <button onClick={onLogout} className="logout-button">
                            <FaSignOutAlt />
                        </button>
                    </>
                ) : (
                    <button onClick={onLoginClick} className="header-login-button">
                        Đăng nhập / Đăng ký
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;