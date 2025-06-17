import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout as AntLayout } from 'antd';
import HeaderBefore from '../component/roots/HeaderBefore';
import HeaderAfter from '../component/roots/HeaderAfter';
import Footer from '../component/roots/Footer';
import './Layout.css';

const { Content } = AntLayout;

const Layout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('User Name');
  const location = useLocation();

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    // Đây là ví dụ, bạn cần thay thế bằng logic thực tế của mình
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Lấy tên người dùng từ localStorage hoặc từ API
      const storedUserName = localStorage.getItem('userName');
      if (storedUserName) {
        setUserName(storedUserName);
      }
    }
  }, []);

  // Kiểm tra nếu đang ở trang login hoặc register thì không hiển thị header và footer
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <AntLayout className="layout">
      {!isAuthPage && (
        isLoggedIn ? <HeaderAfter userName={userName} /> : <HeaderBefore />
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