import React, { useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import HeaderBefore from '../component/roots/HeaderBefore/HeaderBefore';
import AppFooter from '../component/roots/Footer/Footer';
import PageTransition from '../component/common/PageTransition/PageTransition';
import './Layout.css';

const { Content } = Layout;

const GuestLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Chỉ kiểm tra và chuyển hướng nếu không phải đang ở trang login
    if (location.pathname !== '/login') {
      // Kiểm tra nếu người dùng đã đăng nhập (có token)
      const accessToken = localStorage.getItem('accessToken');
      const userInfo = localStorage.getItem('userInfo');
      
      if (accessToken && userInfo) {
        // Nếu đã đăng nhập, chuyển hướng đến trang chủ
        navigate('/', { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  return (
    <Layout className="layout">
      <HeaderBefore />
      <Content className="site-content">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </Content>
      <AppFooter />
    </Layout>
  );
};

export default GuestLayout; 