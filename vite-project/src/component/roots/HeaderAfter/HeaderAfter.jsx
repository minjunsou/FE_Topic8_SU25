import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Space, Dropdown, message, Drawer } from 'antd';
import { 
  UserOutlined, 
  HeartFilled, 
  DownOutlined, 
  MenuOutlined, 
  FormOutlined, 
  MedicineBoxOutlined, 
  DashboardOutlined,
  AlertOutlined,
  HistoryOutlined,
  HomeOutlined,
  LogoutOutlined,
  SettingOutlined,
  FileTextOutlined,
  SolutionOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { authApi } from '../../../api';
import './HeaderAfter.css';
import { Link } from 'react-router-dom';

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
      case '/':
        navigate('/');
        break;
      case '/health-declaration':
        navigate('/health-declaration');
        break;
      case '/vaccination':
        navigate('/vaccination');
        break;
      case '/health-check':
        navigate('/health-check');
        break;
      case '/medicine-request':
        navigate('/medicine-request');
        break;
      case '/medical-incidents':
        navigate('/medical-incidents');
        break;
      case '/health-history':
        navigate('/health-history');
        break;
      case '/staff':
        navigate('/staff');
        break;
      case '/dashboard':
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
      case 'profile':
        // Xử lý khi người dùng click vào Profile
        console.log('Profile clicked');
        message.info('Đang chuyển đến trang hồ sơ');
        navigate('/profile');
        break;
      case 'settings':
        // Xử lý khi người dùng click vào Settings
        console.log('Settings clicked');
        message.info('Đang chuyển đến trang cài đặt');
        navigate('/settings');
        break;
      case 'logout':
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
    if (path === '/') return '/';
    if (path === '/health-declaration') return '/health-declaration';
    if (path === '/vaccination') return '/vaccination';
    if (path === '/health-check') return '/health-check';
    if (path === '/medicine-request') return '/medicine-request';
    if (path === '/medical-incidents') return '/medical-incidents';
    if (path === '/health-history') return '/health-history';
    if (path === '/staff') return '/staff';
    if (path === '/dashboard') return '/dashboard';
    return '/';
  };

  // Tạo menu items dựa trên vai trò người dùng
  const getMenuItems = () => {
    const baseItems = [
      { key: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
      { key: '/health-declaration', label: 'Khai báo y tế', icon: <FileTextOutlined /> },
      { key: '/medicine-request', label: 'Yêu cầu thuốc', icon: <MedicineBoxOutlined /> },
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
          { key: '/vaccination', label: 'Tiêm chủng', icon: <MedicineBoxOutlined /> },
          { key: '/health-check', label: 'Kiểm tra sức khỏe', icon: <ExperimentOutlined /> },
          { key: '/medical-incidents', label: 'Sự kiện y tế', icon: <SolutionOutlined /> },
          { key: '/health-history', label: 'Lịch sử sức khỏe', icon: <HistoryOutlined /> },
        ];
      case 'nurse':
        // Y tá trường có thể truy cập tất cả các chức năng và trang quản lý
        return [
          ...baseItems,
          { key: '/vaccination', label: 'Tiêm chủng', icon: <MedicineBoxOutlined /> },
          { key: '/health-check', label: 'Kiểm tra sức khỏe', icon: <ExperimentOutlined /> },
          { key: '/medical-incidents', label: 'Sự kiện y tế', icon: <SolutionOutlined /> },
          { key: '/health-history', label: 'Lịch sử sức khỏe', icon: <HistoryOutlined /> },
          { key: '/staff', label: 'Trang Y tá', icon: <MedicineBoxOutlined /> },
        ];
      case 'manager':
      case 'admin':
        // Quản lý và admin có thêm dashboard và trang quản lý
        return [
          ...baseItems,
          { key: '/vaccination', label: 'Tiêm chủng', icon: <MedicineBoxOutlined /> },
          { key: '/health-check', label: 'Kiểm tra sức khỏe', icon: <ExperimentOutlined /> },
          { key: '/medical-incidents', label: 'Sự kiện y tế', icon: <SolutionOutlined /> },
          { key: '/health-history', label: 'Lịch sử sức khỏe', icon: <HistoryOutlined /> },
          { key: '/staff', label: 'Trang Y tá', icon: <MedicineBoxOutlined /> },
          { key: '/dashboard', label: 'Báo cáo & Thống kê', icon: <DashboardOutlined /> },
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Hồ sơ',
    },
    {
      key: 'settings',
      label: 'Cài đặt',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
    },
  ];

  const showDrawer = () => {
    setMobileMenuVisible(true);
  };

  const onClose = () => {
    setMobileMenuVisible(false);
  };

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
          onClick={showDrawer}
        />
      )}
      
      {/* Drawer menu cho mobile */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={onClose}
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
        <Menu
          mode="vertical"
          items={userMenuItems}
          onClick={handleUserMenuClick}
          style={{ border: 'none', borderTop: '1px solid #f0f0f0' }}
        />
      </Drawer>
      
      {/* User section cho desktop */}
      {!isMobile && (
        <div className="headerAfter-user-section">
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
            arrow
          >
            <Space className="headerAfter-user-dropdown">
              <Avatar icon={<UserOutlined />} />
              <span className="headerAfter-username">{userName}</span>
              <DownOutlined />
            </Space>
          </Dropdown>
        </div>
      )}
    </Header>
  );
};

export default HeaderAfter; 