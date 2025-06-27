import React from 'react';
import { Layout, Menu, Button, Divider } from 'antd';
import { 
  UserOutlined, 
  MedicineBoxOutlined, 
  FileTextOutlined, 
  DashboardOutlined,
  CalendarOutlined,
  AlertOutlined,
  MedicineBoxTwoTone,
  LogoutOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const StaffSidebar = ({ 
  collapsed, 
  setCollapsed, 
  getSelectedKey, 
  onMenuClick, 
  onNavigate,
  onLogout
}) => {
  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      className="staff-sider"
      width={240}
    >
      <div className="staff-logo">
        {collapsed ? 'SM' : 'SchoolMed'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={[
          {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Tổng quan',
            onClick: () => onMenuClick('overview')
          },
          {
            key: 'medical-incidents',
            icon: <AlertOutlined />,
            label: 'Sự kiện y tế',
            onClick: () => onMenuClick('medical-incidents')
          },
          {
            key: 'medicine-requests',
            icon: <MedicineBoxOutlined />,
            label: 'Yêu cầu thuốc',
            onClick: () => onMenuClick('medicine-requests')
          },
          {
            key: 'medicine-supplies',
            icon: <MedicineBoxTwoTone />,
            label: 'Thuốc & Vật tư',
            onClick: () => onMenuClick('medicine-supplies')
          },
          {
            key: 'health-declarations',
            icon: <FileTextOutlined />,
            label: 'Khai báo sức khỏe',
            onClick: () => onMenuClick('health-declarations')
          },
          {
            key: 'students',
            icon: <UserOutlined />,
            label: 'Quản lý học sinh',
            onClick: () => onNavigate('/staff/students')
          },
          
        ]}
      />
      <div className="sidebar-footer">
        <Divider style={{ margin: '10px 0', borderColor: 'rgba(255,255,255,0.1)' }} />
        <Button 
          type="primary" 
          danger 
          icon={<LogoutOutlined />} 
          onClick={onLogout}
          style={{ width: '100%' }}
        >
          {!collapsed && 'Đăng xuất'}
        </Button>
      </div>
    </Sider>
  );
};

export default StaffSidebar; 