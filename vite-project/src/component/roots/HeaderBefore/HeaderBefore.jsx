import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Space, Drawer } from 'antd';
import { HeartFilled, MenuOutlined } from '@ant-design/icons';
import './HeaderBefore.css';

const { Header } = Layout;
const HeaderBefore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Kiểm tra kích thước màn hình khi component được render
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Kiểm tra lần đầu
    checkIsMobile();
    
    // Thêm event listener để kiểm tra khi thay đổi kích thước màn hình
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup event listener khi component unmount
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  // Hàm xử lý sự kiện menu
  const handleMenuClick = ({ key }) => {
    console.log('Menu clicked:', key);
    setMobileMenuVisible(false);
    switch (key) {
      case 'home':
        navigate('/');
        break;
      case 'about':
        navigate('/about');
        break;
      case 'news':
        navigate('/news');
        break;
      case 'doctors':
        navigate('/doctors');
        break;
      case 'career':
        navigate('/career');
        break;
      // case 'healthDeclaration':
      //   navigate('/health-declaration');
      //   break;
      // case 'medicineRequest':
      //   navigate('/medicine-request');
      //   break;
      default:
        navigate('/');
    }
  };

  // Hàm xử lý đăng nhập
  const handleSignIn = () => {
    console.log('Sign In clicked');
    setMobileMenuVisible(false);
    navigate('/login');
  };

  // Xác định menu item nào đang được chọn dựa trên đường dẫn hiện tại
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/about') return 'about';
    if (path === '/news') return 'news';
    if (path === '/doctors') return 'doctors';
    if (path === '/career') return 'career';
    // if (path === '/health-declaration') return 'healthDeclaration';
    // if (path === '/medicine-request') return 'medicineRequest';
    return '';
  };

  const menuItems = [
    { key: 'home', label: 'Home' },
    { key: 'about', label: 'About' },
    // { key: 'healthDeclaration', label: 'Health Declaration' },
    // { key: 'medicineRequest', label: 'Medicine Request' },
    { key: 'news', label: 'News/Schedule' },
    { key: 'doctors', label: 'Our Doctors' },
    { key: 'career', label: 'Career' },
  ];

  return (
    <Header className="headerBefore-container">
      <div className="headerBefore-logo" onClick={() => navigate('/')}>
        <HeartFilled style={{ fontSize: '24px' }} />
        <span>SchoolMed</span>
      </div>
      
      {/* Menu cho desktop */}
      {!isMobile && (
        <Menu
          className="headerBefore-nav"
          mode="horizontal"
          items={menuItems}
          selectedKeys={[getSelectedKey()]}
          theme="dark"
          style={{ background: 'transparent', border: 'none' }}
          onClick={handleMenuClick}
        />
      )}
      
      {/* Nút menu cho mobile */}
      {isMobile && (
        <Button 
          className="headerBefore-mobile-menu-button"
          type="text"
          icon={<MenuOutlined style={{ fontSize: '24px', color: 'white' }} />}
          onClick={() => setMobileMenuVisible(true)}
        />
      )}
      
      {/* Drawer menu cho mobile */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        className="headerBefore-mobile-drawer"
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="vertical"
          items={menuItems}
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
        <div className="headerBefore-mobile-drawer-footer">
          <Button 
            type="primary" 
            onClick={handleSignIn}
            block
          >
            Login
          </Button>
        </div>
      </Drawer>
      
      {/* Auth section cho desktop */}
      {!isMobile && (
        <div className="headerBefore-auth-section">
          <Space>
            <Button 
              className="headerBefore-signin-button" 
              onClick={handleSignIn}
              ghost
            >
              Login
            </Button>
          </Space>
        </div>
      )}
    </Header>
  );
};

export default HeaderBefore; 