import React from 'react';
import { Layout, Menu, Button, Divider } from 'antd';
import { 
  MedicineBoxOutlined, 
  FileTextOutlined, 
  DashboardOutlined,

  AlertOutlined,
  MedicineBoxTwoTone,
  LogoutOutlined,
  KeyOutlined,
  ProfileOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { Badge } from 'antd';

const { Sider } = Layout;

const StaffSidebar = ({ 
  collapsed, 
  setCollapsed, 
  getSelectedKey, 
  onMenuClick, 
  onLogout,
  unreadIncidents,
  pendingRequests
}) => {
  const menuItems = [
      {
        key: 'overview',
        icon: <DashboardOutlined />,
        label: 'Tổng quan',
        onClick: () => onMenuClick('overview')
      },
      {
        key: 'medical-incidents',
        icon: <AlertOutlined />,
        label: (
          <span>
            Sự kiện y tế
            <Badge 
              count={unreadIncidents} 
              style={{ marginLeft: 8 }}
            />
          </span>
        ),
        onClick: () => onMenuClick('medical-incidents')
      },
      {
        key: 'medicine-requests',
        icon: <MedicineBoxOutlined />,
        label: (
          <span>
            Yêu cầu thuốc
            <Badge 
              count={pendingRequests} 
              style={{ marginLeft: 8 }}
            />
          </span>
        ),
        onClick: () => onMenuClick('medicine-requests')
      },
      {
        key: 'medicine-supplies',
        icon: <MedicineBoxTwoTone />,
        label: 'Thuốc & Vật tư',
        onClick: () => onMenuClick('medicine-supplies')
      },
      // {
      //   key: 'health-declarations',
      //   icon: <FileTextOutlined />,
      //   label: (
      //     <span>
      //       Khai báo y tế
      //       <Badge 
      //         count={unreadDeclarations} 
      //         style={{ marginLeft: 8 }}
      //       />
      //     </span>
      //   ),
      //   onClick: () => onMenuClick('health-declarations')
      // },
      {
        key: 'health-checks',
        icon: <ExperimentOutlined />,
        label: 'Kiểm tra sức khỏe',
        onClick: () => onMenuClick('health-checks')
      },
    {
      key: 'profiles',
      icon: <ProfileOutlined />,
      label: 'Quản lý hồ sơ',
      onClick: () => onMenuClick('profiles')
    },
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: 'Đổi mật khẩu',
      onClick: () => onMenuClick('change-password')
    },
    {
      key: 'vaccine',
      icon: <KeyOutlined />,
      label: 'Vaccine',
      onClick: () => onMenuClick('vaccine')
    },
    {
      key: 'consultationSchedule',
      label: 'Lịch khám',
      onClick: () => onMenuClick('consultationSchedule')
    },
  ];

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
        items={menuItems}
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