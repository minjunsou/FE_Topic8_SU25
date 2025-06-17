import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Space, Dropdown, message, Drawer } from 'antd';
import { UserOutlined, HeartFilled, DownOutlined, MenuOutlined } from '@ant-design/icons';
import './HeaderAfter.css';

const { Header } = Layout;

const HeaderAfter = ({ userName = "User Name" }) => {
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
      default:
        navigate('/');
    }
  };

  // Hàm xử lý sự kiện user menu
  const handleUserMenuClick = ({ key }) => {
    setMobileMenuVisible(false);
    switch (key) {
      case '1':
        // Xử lý khi người dùng click vào Profile
        console.log('Profile clicked');
        message.info('Đang chuyển đến trang Profile');
        navigate('/profile');
        break;
      case '2':
        // Xử lý khi người dùng click vào Settings
        console.log('Settings clicked');
        message.info('Đang chuyển đến trang Settings');
        navigate('/settings');
        break;
      case '3':
        // Xử lý khi người dùng click vào Logout
        console.log('Logout clicked');
        message.info('Đang đăng xuất...');
        // Thực hiện đăng xuất
        // localStorage.removeItem('token');
        navigate('/login');
        break;
      default:
        break;
    }
  };

  // Xác định menu item nào đang được chọn dựa trên đường dẫn hiện tại
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/about') return 'about';
    if (path === '/news') return 'news';
    if (path === '/doctors') return 'doctors';
    if (path === '/career') return 'career';
    return '';
  };

  const menuItems = [
    { key: 'home', label: 'Home' },
    { key: 'about', label: 'About' },
    { key: 'news', label: 'News/Schedule' },
    { key: 'doctors', label: 'Our Doctors' },
    { key: 'career', label: 'Career' },
  ];

  const userMenuItems = [
    {
      key: '1',
      label: 'Profile',
    },
    {
      key: '2',
      label: 'Settings',
    },
    {
      key: '3',
      label: 'Logout',
    },
  ];

  return (
    <Header className="headerAfter-container">
      <div className="headerAfter-logo" onClick={() => navigate('/')}>
        <HeartFilled style={{ fontSize: '24px' }} />
        <span>SchoolMed</span>
      </div>
      
      {/* Menu cho desktop */}
      {!isMobile && (
        <Menu
          className="headerAfter-nav"
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
          className="headerAfter-mobile-menu-button"
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
        className="headerAfter-mobile-drawer"
        bodyStyle={{ padding: 0 }}
      >
        <div className="headerAfter-mobile-user">
          <Avatar icon={<UserOutlined />} size="large" />
          <span className="headerAfter-mobile-username">{userName}</span>
        </div>
        <Menu
          mode="vertical"
          items={menuItems}
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
        <div className="headerAfter-mobile-drawer-footer">
          <Menu
            mode="vertical"
            items={userMenuItems}
            onClick={handleUserMenuClick}
            style={{ border: 'none' }}
          />
        </div>
      </Drawer>
      
      {/* User section cho desktop */}
      {!isMobile && (
        <div className="headerAfter-user-section">
          <Dropdown
            menu={{ 
              items: userMenuItems,
              onClick: handleUserMenuClick
            }}
            placement="bottomRight"
            arrow
          >
            <Button type="text" className="headerAfter-user-button">
              <Space>
                <Avatar icon={<UserOutlined />} />
                <span>{userName}</span>
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </div>
      )}
    </Header>
  );
};

export default HeaderAfter; 