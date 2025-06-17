import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Space, Dropdown, message, Drawer } from 'antd';
import { UserOutlined, HeartFilled, DownOutlined, MenuOutlined } from '@ant-design/icons';
import { authApi } from '../../../api';
import './HeaderAfter.css';

const { Header } = Layout;

const HeaderAfter = ({ userName = "Người dùng", userRole = "student" }) => {
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
      case 'healthInfo':
        navigate('/health-info');
        break;
      case 'vaccination':
        navigate('/vaccination');
        break;
      case 'healthCheck':
        navigate('/health-check');
        break;
      case 'medicine':
        navigate('/medicine');
        break;
      case 'dashboard':
        navigate('/dashboard');
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
        message.info('Đang chuyển đến trang hồ sơ');
        navigate('/profile');
        break;
      case '2':
        // Xử lý khi người dùng click vào Settings
        console.log('Settings clicked');
        message.info('Đang chuyển đến trang cài đặt');
        navigate('/settings');
        break;
      case '3':
        // Xử lý khi người dùng click vào Logout
        console.log('Logout clicked');
        handleLogout();
        break;
      default:
        break;
    }
  };

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    try {
      message.loading('Đang đăng xuất...', 1);
      
      // Gọi API đăng xuất
      await authApi.logout();
      
      message.success('Đăng xuất thành công');
      
      // Chuyển hướng đến trang đăng nhập
      navigate('/login');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      
      // Hiển thị thông báo lỗi
      if (error.message) {
        message.error(error.message);
      } else {
        message.error('Đã xảy ra lỗi khi đăng xuất');
      }
      
      // Chuyển hướng đến trang đăng nhập ngay cả khi có lỗi
      navigate('/login');
    }
  };

  // Xác định menu item nào đang được chọn dựa trên đường dẫn hiện tại
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/about') return 'about';
    if (path === '/health-info') return 'healthInfo';
    if (path === '/vaccination') return 'vaccination';
    if (path === '/health-check') return 'healthCheck';
    if (path === '/medicine') return 'medicine';
    if (path === '/dashboard') return 'dashboard';
    return '';
  };

  // Tạo menu items dựa trên vai trò người dùng
  const getMenuItems = () => {
    const baseItems = [
      { key: 'home', label: 'Trang chủ' },
      { key: 'about', label: 'Giới thiệu' },
      { key: 'healthInfo', label: 'Thông tin sức khỏe' },
    ];

    // Thêm các menu item dựa trên vai trò
    switch (userRole) {
      case 'student':
        // Học sinh chỉ xem được thông tin cơ bản
        return baseItems;
      case 'parent':
        // Phụ huynh có thể xem thông tin sức khỏe, tiêm chủng và gửi thuốc
        return [
          ...baseItems,
          { key: 'vaccination', label: 'Tiêm chủng' },
          { key: 'healthCheck', label: 'Khám sức khỏe' },
          { key: 'medicine', label: 'Gửi thuốc' },
        ];
      case 'nurse':
        // Y tá trường có thể truy cập tất cả các chức năng
        return [
          ...baseItems,
          { key: 'vaccination', label: 'Tiêm chủng' },
          { key: 'healthCheck', label: 'Khám sức khỏe' },
          { key: 'medicine', label: 'Quản lý thuốc' },
        ];
      case 'manager':
      case 'admin':
        // Quản lý và admin có thêm dashboard
        return [
          ...baseItems,
          { key: 'vaccination', label: 'Tiêm chủng' },
          { key: 'healthCheck', label: 'Khám sức khỏe' },
          { key: 'medicine', label: 'Quản lý thuốc' },
          { key: 'dashboard', label: 'Báo cáo & Thống kê' },
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  const userMenuItems = [
    {
      key: '1',
      label: 'Hồ sơ cá nhân',
    },
    {
      key: '2',
      label: 'Cài đặt',
    },
    {
      key: '3',
      label: 'Đăng xuất',
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
          <span className="headerAfter-mobile-role">({userRole === 'student' ? 'Học sinh' : 
            userRole === 'parent' ? 'Phụ huynh' : 
            userRole === 'nurse' ? 'Y tá trường' : 
            userRole === 'manager' ? 'Quản lý' : 
            userRole === 'admin' ? 'Quản trị viên' : 'Người dùng'})</span>
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
                <span className="headerAfter-user-role">
                  ({userRole === 'student' ? 'Học sinh' : 
                    userRole === 'parent' ? 'Phụ huynh' : 
                    userRole === 'nurse' ? 'Y tá trường' : 
                    userRole === 'manager' ? 'Quản lý' : 
                    userRole === 'admin' ? 'Quản trị viên' : 'Người dùng'})
                </span>
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