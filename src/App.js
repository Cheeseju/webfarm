import './App.css';
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { auth, db } from './firebase-config';
import authService from './services/authservices';
import Homepage from './components/HomePage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PlantsList from './components/PlantsList';
import PlantDetails from './components/PlantDetails';
import DiariesList from './components/DiariesList';
import AdminDashboard from './components/AdminDashboard';
import AddPlantForm from './components/AddPlantForm';
import EditPlantForm from './components/EditPlantForm';
import AddDiaryForm from './components/AddDiaryForm';
import ViewDiary from './components/ViewDiary';
import ResetPassword from './components/ResetPassword';
import DiaryDetails from './components/DiaryDetails';
import FilterModal from './components/FilterModal';
import { onSnapshot, doc } from 'firebase/firestore';
import MyProductsStore from './components/MyProductsStore';
import ProductListPage from './components/ProductListPage';
import shoppingService from './services/shopping.services';
import ProductDetailPage from './components/ProductDetailPage'; // <-- THÊM DÒNG NÀY
import CartPage from './components/CartPage'; // <-- THÊM DÒNG NÀY

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('plants');
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [plantToEdit, setPlantToEdit] = useState(null);
  const [showAddDiaryForm, setShowAddDiaryForm] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');  
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [diaryFilters, setDiaryFilters] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [cart, setCart] = useState({ items: [] }); 
  const { showNotification } = useNotification();
  const navigate = useNavigate();
 const [selectedProductId, setSelectedProductId] = useState(null);
    // Lấy giỏ hàng khi người dùng đăng nhập
    useEffect(() => {
        if (user) {
            const unsubscribe = onSnapshot(doc(db, "carts", user.uid), (doc) => {
                if (doc.exists()) {
                    setCart(doc.data());
                } else {
                    setCart({ items: [] });
                }
            });
            return () => unsubscribe();
        } else {
            setCart({ items: [] }); // Reset giỏ hàng khi đăng xuất
        }
    }, [user]);

 const handleAddToCart = async (product, quantity) => {
    if (!user) {
        showNotification('Vui lòng đăng nhập để thêm vào giỏ hàng.', 'info');
        return;
    }
    const numQuantity = Number(quantity);
    if (numQuantity <= 0) {
        showNotification('Số lượng phải lớn hơn 0.', 'error');
        return;
    }

    // Dòng sửa lỗi quan trọng nhất
    const newCartItems = [...(cart?.items || [])];
    const itemIndex = newCartItems.findIndex(item => item.productId === product.id);

    if (itemIndex > -1) {
        newCartItems[itemIndex].quantity += numQuantity;
    } else {
        newCartItems.push({
            productId: product.id,
           productName: product.productName || product.plantName,
            price: product.price,
            unit: product.unit,
            imageUrl: product.imageUrl,
            quantity: numQuantity
        });
    }
    try {
        await shoppingService.updateCart(user.uid, newCartItems);
        showNotification('Thêm vào giỏ hàng thành công!', 'success');
    } catch (error) {
        console.error("Lỗi khi cập nhật giỏ hàng:", error);
        showNotification('Không thể thêm vào giỏ hàng!', 'error');
    }
};
     // Xử lý thay đổi số lượng trong giỏ hàng
    const handleUpdateCartQuantity = async (productId, newQuantity) => {
        const updatedItems = cart.items.map(item => 
            item.productId === productId ? { ...item, quantity: newQuantity } : item
        );
        // Lọc ra những sản phẩm có số lượng lớn hơn 0
        const finalItems = updatedItems.filter(item => item.quantity > 0);
        try {
            await shoppingService.updateCart(user.uid, finalItems);
        } catch (error) {
            showNotification('Không thể cập nhật giỏ hàng!', 'error');
        }
    };

    // Xóa một sản phẩm khỏi giỏ hàng
    const handleRemoveFromCart = async (productId) => {
        const updatedItems = cart.items.filter(item => item.productId !== productId);
        try {
            await shoppingService.updateCart(user.uid, updatedItems);
            showNotification('Đã xóa sản phẩm khỏi giỏ hàng.', 'success');
        } catch (error) {
            showNotification('Không thể xóa sản phẩm!', 'error');
        }
    };
    
  // THÊM STATE ĐỂ QUẢN LÝ VIỆC THU GỌN SIDEBAR TRÊN DESKTOP
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const handleProductCardClick = (productId) => {
        // Logic để mở trang chi tiết sản phẩm sẽ ở đây
        console.log("Xem chi tiết sản phẩm ID:", productId);
        setSelectedProductId(productId);
         setCurrentPage('productDetail');
    };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuestMode(false); 
        const role = await authService.getUserRole(currentUser.uid);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
   const handleEnterGuestMode = (page) => {
      setIsGuestMode(true);
      setCurrentPage(page);
  };
   const handleGoToLogin = () => {
      setIsGuestMode(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedPlantId(null);
    setDiaryFilters(null); 
    setIsSidebarOpen(false); 
  };

   const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Hàm này của bạn đã đúng, giờ nó sẽ hoạt động vì state đã được khai báo
   const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  const handleApplyFilter = (filters) => {
    setDiaryFilters(filters);
  };

  const handlePlantSelect = (id) => {
    setSelectedPlantId(id);
    setCurrentPage('diaryDetails');
  };

  const handleBackToList = () => {
    setCurrentPage('diaries');
    setSelectedPlantId(null);
  };

  const handleBackToPlantsList = () => {
    setCurrentPage('plants');
    setSelectedPlantId(null);
    setSearchQuery('');
  };
  
  const handlePlantAdded = () => {
    setShowAddForm(false);
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  const handlePlantUpdated = () => {
    setShowEditForm(false);
    setPlantToEdit(null);
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  const handleEditClick = (plant) => {
    setPlantToEdit(plant);
    setShowEditForm(true);
  };

  const handleAddDiaryClick = (plantId) => {
    setSelectedPlantId(plantId);
    setShowAddDiaryForm(true);
  };

  const handleDiaryAdded = () => {
    setShowAddDiaryForm(false);
    setCurrentPage('diaryDetails');
  };
  
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
 const handleLogout = async () => {
    try {
      await authService.signOutUser();
      setIsGuestMode(false);
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };
 if (!user && !isGuestMode) {
    return <Homepage onEnterGuestMode={handleEnterGuestMode} />;
  }

  return (
    // SỬA LỖI 2: SỬA LẠI TÊN CLASS CỦA DIV CHA VÀ THÊM CLASS ĐỘNG
    // Đổi "main-content" thành "main-container" và thêm class động
    <div className={`main-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      <Sidebar
        onPageChange={handlePageChange}
        currentPage={currentPage}
        userRole={userRole}
        isOpen={isSidebarOpen} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse} 
      />
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        user={user}
        onLogout={handleLogout}
        userRole={userRole}
        onFilterClick={() => setShowFilterModal(true)}
        showFilterButton={currentPage === 'diaries'}
        onLoginClick={handleGoToLogin}
        onToggleSidebar={toggleSidebar}
        cartItemCount={cart.items?.length || 0}
        onPageChange={handlePageChange} 
      />
      <div className="content-area">
        {/* Phần nội dung bên trong giữ nguyên, không thay đổi */}
        {showFilterModal && userRole === 'farmer' && (
            <FilterModal 
                onClose={() => setShowFilterModal(false)}
                onApplyFilter={handleApplyFilter}
            />
        )}
        {showAddForm && <AddPlantForm onClose={() => setShowAddForm(false)} onSave={handlePlantAdded} />}
        {showEditForm && plantToEdit && (
          <EditPlantForm
            onClose={() => setShowEditForm(false)}
            onSave={handlePlantUpdated}
            plant={plantToEdit}
            plantId={plantToEdit.id}
          />
        )}
        {showAddDiaryForm && (
          <AddDiaryForm
            plantId={selectedPlantId}
            onSave={handleDiaryAdded}
            onCancel={() => setShowAddDiaryForm(false)}
          />
        )}
        {currentPage === 'admin' && userRole === 'admin' && <AdminDashboard />}
        {currentPage === 'plants' && (
          <PlantsList
            onCardClick={(id) => {
              setSelectedPlantId(id);
              setCurrentPage('plantDetails');
            }}
            onAddButtonClick={() => setShowAddForm(true)}
            refreshKey={refreshKey}
            searchQuery={searchQuery}
            userRole={userRole}
            filterType="all"
          />
        )}
        {currentPage === 'plantDetails' && (
          <PlantDetails
            plantId={selectedPlantId}
            onBackToList={handleBackToPlantsList}
            onAddDiaryClick={handleAddDiaryClick}
            onEditClick={handleEditClick}
            refreshKey={refreshKey}
            userRole={userRole}
          />
        )}
        {currentPage === 'diaries' && (
          <DiariesList 
            onPlantSelect={handlePlantSelect}  
            searchQuery={searchQuery}
            userRole={userRole}
            filterType="all"
            diaryFilters={diaryFilters}
          />
        )}
        {currentPage === 'diaryDetails' && userRole === 'farmer' && (
          <DiaryDetails 
            plantId={selectedPlantId} 
            onBackToList={handleBackToList} 
            userRole={userRole}
            diaryFilters={diaryFilters}
          />
        )}
        {currentPage === 'myStore' && userRole === 'farmer' && <MyProductsStore />}
        {currentPage === 'marketplace' && <ProductListPage onProductSelect={handleProductCardClick} searchQuery={searchQuery} />}
         {currentPage === 'productDetail' && (
                <ProductDetailPage 
                    productId={selectedProductId} 
                    onBack={() => setCurrentPage('marketplace')}
                    onAddToCart={handleAddToCart}
                    onViewDiary={(diaryId) => navigate(`/view-diary/${diaryId}`)}
                />
            )}
            {currentPage === 'cart' && (
                    <CartPage 
                        cart={cart}
                        onUpdateQuantity={handleUpdateCartQuantity}
                        onRemoveItem={handleRemoveFromCart}
                    />
                )}
      </div>
    </div>
  );
};

function App() {
  return (
    <NotificationProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/view-diary/:diaryId" element={<ViewDiary />} />
          </Routes>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;