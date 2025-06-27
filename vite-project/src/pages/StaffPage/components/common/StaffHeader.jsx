import React from 'react';
import { Layout, Badge, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';

const { Header } = Layout;

const StaffHeader = ({ activeTab, notifications }) => {
  return (
    <Header className="staff-header">
      <div className="staff-header-title">
        {activeTab === 'overview' && 'Tổng quan'}
        {activeTab === 'medicine-requests' && 'Quản lý yêu cầu thuốc'}
        {activeTab === 'health-declarations' && 'Quản lý khai báo sức khỏe'}
      </div>
      <div className="staff-header-actions">
        <Badge count={notifications.filter(n => !n.read).length}>
          <Button 
            type="text" 
            icon={<BellOutlined />} 
            size="large"
            className="notification-button"
          />
        </Badge>
      </div>
    </Header>
  );
};

export default StaffHeader; 