import React, { useState, useEffect } from 'react';
import { Tabs, Card, Typography, Space, Button, message, Spin } from 'antd';
import { 
  MedicineBoxOutlined, 
  FileTextOutlined, 
  EyeOutlined, 
  PlusOutlined,
  ReloadOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import VaccinationDashboard from '../VaccinationDashboard/VaccinationDashboard';
import Vaccine from '../Vaccine/Vaccine';
import VaccinationNotices from '../VaccinationNotices/VaccinationNotices';
import VaccinationRecords from '../VaccinationRecords/VaccinationRecords';

const { Title } = Typography;
const { TabPane } = Tabs;

const Vaccination = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const tabItems = [
    {
      key: 'dashboard',
      label: (
        <Space>
          <DashboardOutlined />
          Dashboard
        </Space>
      ),
      children: <VaccinationDashboard />
    },
    {
      key: 'vaccines',
      label: (
        <Space>
          <MedicineBoxOutlined />
          Quản lý Vaccine
        </Space>
      ),
      children: <Vaccine />
    },
    {
      key: 'notices',
      label: (
        <Space>
          <FileTextOutlined />
          Thông báo tiêm chủng
        </Space>
      ),
      children: <VaccinationNotices />
    },
    {
      key: 'records',
      label: (
        <Space>
          <EyeOutlined />
          Phiếu tiêm chủng
        </Space>
      ),
      children: <VaccinationRecords />
    }
  ];

  return (
    <div className="vaccination-management">
      <div style={{ marginBottom: 16 }}>
        <Title level={2}>
          <MedicineBoxOutlined style={{ marginRight: 8 }} />
          Quản lý Tiêm chủng
        </Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setActiveTab('notices')}
          >
            Tạo thông báo mới
          </Button>
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          type="card"
          size="large"
        >
          {tabItems.map(item => (
            <TabPane tab={item.label} key={item.key}>
              <Spin spinning={loading}>
                {item.children}
              </Spin>
            </TabPane>
          ))}
        </Tabs>
      </Card>
    </div>
  );
};

export default Vaccination; 