import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Space, Dropdown, message, Drawer, Badge, List, Popover } from 'antd';
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
  ExperimentOutlined,
  BellOutlined
} from '@ant-design/icons';
import { authApi, parentApi } from '../../../api';
import './HeaderAfter.css';
import { Link } from 'react-router-dom';

const { Header } = Layout;

const HeaderAfter = ({ userName = "Người dùng", userRole = "2" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  
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

  // Lấy thông báo khi component được render (chỉ cho phụ huynh)
  useEffect(() => {
    if (Number(userRole) === 2) {
      fetchNotifications();
    }
  }, [userRole]);

  // Hàm lấy danh sách thông báo
  const fetchNotifications = async () => {
    if (Number(userRole) !== 2) return;
    
    setNotificationLoading(true);
    try {
      // Lấy thông tin người dùng từ localStorage
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) return;
      
      const userInfo = JSON.parse(userInfoStr);
      const parentId = userInfo.accountId;
      
      if (!parentId) {
        console.error('Không tìm thấy ID phụ huynh trong thông tin người dùng');
        return;
      }
      
      // Sử dụng API mới để lấy thông báo kiểm tra sức khỏe cho tất cả con
      const healthCheckNotifications = await parentApi.getHealthCheckNotificationsForAllChildren(parentId);
      console.log('Health check notifications for all children:', healthCheckNotifications);
      
      // Chuyển đổi các thông báo thành định dạng hiển thị
      const formattedNotifications = healthCheckNotifications.map(notification => {
        let content = '';
        
        // Tạo nội dung thông báo dựa trên trạng thái
        if (notification.status === 'confirmed') {
          content = `${notification.studentName}: Bạn đã xác nhận tham gia kiểm tra sức khỏe "${notification.title}" vào ngày ${notification.formattedDate}`;
        } else if (notification.status === 'declined' || notification.status === 'cancelled') {
          // Không hiển thị thông báo đã từ chối/hủy
          return null;
        } else {
          content = `${notification.studentName}: Nhà trường tổ chức kiểm tra sức khỏe "${notification.title}" vào ngày ${notification.formattedDate}. Vui lòng xác nhận tham gia.`;
        }
        
        return {
          ...notification,
          content: content
        };
      });
      
      // Lọc bỏ các thông báo null (từ chối/hủy)
      const filteredNotifications = formattedNotifications.filter(notification => notification !== null);

      // Sắp xếp thông báo theo ID, lớn nhất lên đầu
      const sortedNotifications = filteredNotifications.sort((a, b) => 
        Number(b.id) - Number(a.id)
      );
      
      setNotifications(sortedNotifications);
      
      // Đếm số thông báo chưa đọc
      const unreadCount = sortedNotifications.filter(notification => !notification.isRead).length;
      setNotificationCount(unreadCount);
      
    } catch (error) {
      console.error('Lỗi khi lấy thông báo:', error);
      
      // Fallback to mock data if error
      const mockNotifications = [
        {
          id: 2,
          title: 'Kiểm tra thị lực',
          content: 'Kết quả kiểm tra thị lực của học sinh đã được cập nhật',
          type: 'HEALTH_CHECK_RESULT',
          createdAt: new Date(2025, 7, 17, 14, 15).toISOString(),
          isRead: false,
          sourceId: 102
        },
        {
          id: 1,
          title: 'Kiểm tra sức khỏe định kỳ',
          content: 'Nhà trường tổ chức kiểm tra sức khỏe định kỳ cho học sinh vào ngày 25/08/2025',
          type: 'HEALTH_CHECK',
          createdAt: new Date(2025, 7, 18, 9, 30).toISOString(),
          isRead: false,
          sourceId: 101
        }
      ];
      
      setNotifications(mockNotifications);
      setNotificationCount(mockNotifications.filter(notification => !notification.isRead).length);
    } finally {
      setNotificationLoading(false);
    }
  };
  
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
      case 'admin-dashboard':
        navigate('/dashboard');
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

  // Hàm xử lý khi click vào icon thông báo
  const handleNotificationClick = () => {
    // Có thể thêm logic để điều hướng đến trang thông báo hoặc hiển thị popup thông báo
  };

  // Hàm xử lý khi click vào một thông báo
  const handleNotificationItemClick = async (notification) => {
    try {
      // Mô phỏng đánh dấu thông báo đã đọc cho testing
      const updatedNotifications = notifications.map(item => 
        item.id === notification.id ? { ...item, isRead: true } : item
      );
      setNotifications(updatedNotifications);
      
      // Cập nhật số thông báo chưa đọc
      const unreadCount = updatedNotifications.filter(item => !item.isRead).length;
      setNotificationCount(unreadCount);
      
      // Đóng popover
      setNotificationVisible(false);
      
      // Điều hướng dựa vào loại thông báo
      if (notification.type === 'HEALTH_CHECK') {
        message.success('Đang chuyển đến trang kiểm tra sức khỏe');
        
        // Lưu thông tin thông báo đã chọn và thông tin học sinh vào localStorage để trang health-check có thể sử dụng
        localStorage.setItem('selectedHealthCheckNotice', JSON.stringify({
          checkNoticeId: notification.checkNoticeId,
          title: notification.title,
          description: notification.description,
          date: notification.date,
          status: notification.status,
          studentId: notification.studentId,
          studentName: notification.studentName,
          className: notification.className
        }));
        
        navigate('/health-check');
      } else if (notification.type === 'HEALTH_CHECK_RESULT') {
        message.success('Đang chuyển đến trang kết quả kiểm tra sức khỏe');
        navigate('/health-check');
      } else if (notification.type === 'VACCINATION') {
        message.success('Đang chuyển đến trang tiêm chủng');
        navigate('/vaccination');
      } else if (notification.type === 'MEDICINE_REQUEST') {
        message.success('Đang chuyển đến trang yêu cầu thuốc');
        navigate('/medicine-request');
      } else {
        message.info('Đã đọc thông báo');
      }
    } catch (error) {
      console.error('Lỗi khi xử lý thông báo:', error);
      message.error('Không thể xử lý thông báo');
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

  // Map roleId từ API sang role name
  const getRoleByRoleId = (roleId) => {
    const roleIdNum = Number(roleId);
    switch (roleIdNum) {
      case 5: return 'admin';   // Admin
      case 3: return 'nurse';   // Y tá trường
      case 2: return 'parent';  // Phụ huynh
      case 1: return 'student'; // Học sinh
      default: return 'student';
    }
  };

  // Tạo menu items dựa trên vai trò người dùng
  const getMenuItems = () => {
    const baseItems = [
      { key: '/', label: 'Trang chủ', icon: <HomeOutlined /> },
      { key: '/health-declaration', label: 'Khai báo y tế', icon: <FileTextOutlined /> },
      { key: '/medicine-request', label: 'Yêu cầu thuốc', icon: <MedicineBoxOutlined /> },
    ];

    // Chuyển đổi roleId thành role name
    const role = getRoleByRoleId(userRole);
    console.log('Current user role:', role, 'from roleId:', userRole);

    // Thêm các menu item dựa trên vai trò
    switch (role) {
      case 'student':
        // Học sinh chỉ xem được thông tin cơ bản
        return baseItems;
      case 'parent':
        // Phụ huynh có thể xem thông tin sức khỏe, tiêm chủng và gửi thuốc
        return [
          ...baseItems,
          { key: '/vaccination', label: 'Tiêm chủng', icon: <MedicineBoxOutlined /> },
          // { key: '/health-check', label: 'Kiểm tra sức khỏe', icon: <ExperimentOutlined /> },
          // { key: '/medical-incidents', label: 'Sự kiện y tế', icon: <SolutionOutlined /> },
          // { key: '/health-history', label: 'Lịch sử sức khỏe', icon: <HistoryOutlined /> },
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
      case 'admin':
        // Admin có thêm dashboard và trang quản lý
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
    ...(Number(userRole) === 5 ? [{
      key: 'admin-dashboard',
      label: 'Dashboard',
    }] : []),
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

  // Hiển thị tên người dùng phù hợp
  const displayName = userName || "Người dùng";

  // Nội dung của popover thông báo
  const notificationContent = (
    <div className="notification-popover">
      <div className="notification-header">
        <h3>Thông báo</h3>
        {notifications.length > 0 && (
          <Button 
            type="link" 
            size="small"
            onClick={() => {
              // Đánh dấu tất cả thông báo là đã đọc
              const updatedNotifications = notifications.map(item => ({ ...item, isRead: true }));
              setNotifications(updatedNotifications);
              setNotificationCount(0);
              message.success('Đã đánh dấu tất cả thông báo là đã đọc');
            }}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>
      
      <List
        className="notification-list"
        loading={notificationLoading}
        itemLayout="horizontal"
        dataSource={notifications}
        locale={{ emptyText: 'Không có thông báo' }}
        renderItem={(item) => (
          <List.Item 
            className={`notification-item ${!item.isRead ? 'unread' : ''}`}
            onClick={() => handleNotificationItemClick(item)}
          >
            <List.Item.Meta
              avatar={
                <Avatar icon={<BellOutlined />} style={{ backgroundColor: item.isRead ? '#d9d9d9' : '#1890ff' }} />
              }
              title={<span style={{ fontWeight: item.isRead ? 'normal' : 'bold' }}>{item.title}</span>}
              description={
                <div>
                  <div>{item.content}</div>
                  <div className="notification-time">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
      
      {notifications.length > 0 && (
        <div className="notification-footer">
          <Button 
            type="link" 
            block 
            onClick={() => {
              message.info('Chức năng xem tất cả thông báo đang được phát triển');
              setNotificationVisible(false);
            }}
          >
            Xem tất cả
          </Button>
        </div>
      )}
    </div>
  );

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
          type="text" 
          icon={<MenuOutlined style={{ fontSize: '24px', color: '#fff' }} />} 
          onClick={showDrawer}
          className="headerAfter-mobile-menu-button"
        />
      )}
      
      {/* Notification icon for parent users */}
      {Number(userRole) === 2 && (
        <div className="headerAfter-notification">
          <Popover
            content={notificationContent}
            title={null}
            trigger="click"
            open={notificationVisible}
            onOpenChange={setNotificationVisible}
            placement="bottomRight"
            overlayClassName="notification-popover-container"
          >
            <Badge count={notificationCount} size="small">
              <BellOutlined 
                className="notification-icon" 
                onClick={handleNotificationClick}
                style={{ 
                  fontSize: '20px', 
                  color: '#fff',
                  cursor: 'pointer',
                  marginRight: '16px'
                }} 
              />
            </Badge>
          </Popover>
        </div>
      )}
      
      {/* User dropdown menu */}
      <Dropdown 
        menu={{ 
          items: userMenuItems,
          onClick: handleUserMenuClick
        }} 
        placement="bottomRight"
        className="headerAfter-user-dropdown"
      >
        <a onClick={(e) => e.preventDefault()}>
          <Space className="headerAfter-user-info">
            <Avatar icon={<UserOutlined />} />
            <span className="headerAfter-username">{displayName}</span>
            <DownOutlined />
          </Space>
        </a>
      </Dropdown>
      
      {/* Drawer cho menu mobile */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={onClose}
        open={mobileMenuVisible}
        className="headerAfter-mobile-drawer"
      >
        <Menu
          mode="vertical"
          items={menuItems}
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
        />
        
        <div className="mobile-drawer-footer">
          <Button type="primary" icon={<UserOutlined />} onClick={() => { navigate('/profile'); onClose(); }}>
            Hồ sơ
          </Button>
          <Button type="default" icon={<SettingOutlined />} onClick={() => { navigate('/settings'); onClose(); }}>
            Cài đặt
          </Button>
          <Button type="default" danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>
      </Drawer>
    </Header>
  );
};

export default HeaderAfter; 