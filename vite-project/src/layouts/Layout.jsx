import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import HeaderBefore from '../component/roots/HeaderBefore';
import HeaderAfter from '../component/roots/HeaderAfter';
import Footer from '../component/roots/Footer';
import { authApi } from '../api';
import './Layout.css';

const { Content } = AntLayout;

const Layout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Người dùng',
    role: 'student'
  });
  const location = useLocation();

  // Hàm lấy thông tin người dùng từ API
  const fetchUserInfo = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response && response.data) {
        const userData = response.data;
        setUserInfo({
          name: userData.fullName || userData.name || 'Người dùng',
          role: userData.role || 'student',
          ...userData
        });
        console.log('User info fetched from API:', userData);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    }
  };

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken');
      console.log('Checking auth, accessToken:', accessToken ? 'exists' : 'not found');
      
      if (accessToken) {
        setIsLoggedIn(true);
        
        // Lấy thông tin người dùng từ localStorage
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          try {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            setUserInfo({
              name: parsedUserInfo.fullName || parsedUserInfo.name || 'Người dùng',
              role: parsedUserInfo.role || 'student',
              ...parsedUserInfo
            });
            console.log('User info loaded from localStorage:', parsedUserInfo);
          } catch (error) {
            console.error('Lỗi khi phân tích thông tin người dùng:', error);
          }
        } else {
          // Nếu không có thông tin trong localStorage, lấy từ API
          fetchUserInfo();
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    // Kiểm tra khi component được mount và khi location thay đổi
    checkAuth();

    // Thêm event listener để kiểm tra khi localStorage thay đổi
    const handleStorageChange = (event) => {
      if (event.key === 'accessToken' || event.key === 'userInfo' || event.key === null) {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location.pathname]); // Thêm location.pathname để kiểm tra lại khi chuyển trang

  // Kiểm tra nếu đang ở trang login hoặc register thì không hiển thị header và footer
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  console.log('Layout render - isLoggedIn:', isLoggedIn, 'userInfo:', userInfo);

  return (
    <AntLayout className="layout">
      {!isAuthPage && (
        isLoggedIn ? <HeaderAfter userName={userInfo.name} userRole={userInfo.role} /> : <HeaderBefore />
      )}
      <Content className="layout-content">
        <div className="layout-container">
          <Outlet />
        </div>
      </Content>
      {!isAuthPage && <Footer />}
    </AntLayout>
  );
};

export default Layout; 