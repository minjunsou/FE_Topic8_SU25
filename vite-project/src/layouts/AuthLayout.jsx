import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import HeaderAfter from '../component/roots/HeaderAfter/HeaderAfter';
import AppFooter from '../component/roots/Footer/Footer';
import PageTransition from '../component/common/PageTransition/PageTransition';
import './Layout.css';

const { Content } = Layout;

const AuthLayout = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    name: 'Người dùng',
    role: 'student'
  });

  useEffect(() => {
    // Lấy thông tin người dùng từ sessionStorage
    const storedUserInfo = sessionStorage.getItem('userInfo');
    
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo({
          name: parsedUserInfo.fullName || parsedUserInfo.name || 'Người dùng',
          role: parsedUserInfo.role || 'student'
        });
        console.log('AuthLayout - User info loaded:', parsedUserInfo);
      } catch (error) {
        console.error('Lỗi khi phân tích thông tin người dùng:', error);
        navigate('/login');
      }
    } else {
      // Nếu không có thông tin người dùng, chuyển hướng đến trang đăng nhập
      console.warn('AuthLayout - No user info found, redirecting to login');
      navigate('/login');
    }
    
    // Thêm event listener để kiểm tra khi sessionStorage thay đổi
    const handleStorageChange = (event) => {
      if (event.key === 'userInfo' || event.key === null) {
        const updatedUserInfo = sessionStorage.getItem('userInfo');
        if (!updatedUserInfo) {
          navigate('/login');
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  return (
    <Layout className="layout">
      <HeaderAfter userName={userInfo.name} userRole={userInfo.role} />
      <Content className="site-content">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default AuthLayout; 