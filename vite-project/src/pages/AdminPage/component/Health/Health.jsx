import React, { useState, useEffect } from 'react';
import { Tabs, Card, Typography, Space, Button, message, Spin } from 'antd';
import { 
  HeartOutlined, 
  FileTextOutlined, 
  EyeOutlined, 
  PlusOutlined,
  ReloadOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import HealthEvents from '../HealthEvents/HealthEvents';
import HealthChecks from '../HealthChecks/HealthChecks';
import HealthCheckNotices from '../HealthCheckNotices/HealthCheckNotices';

const { Title } = Typography;
const { TabPane } = Tabs;

const Health = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const tabItems = [
    {
      key: 'events',
      label: (
        <Space>
          <HeartOutlined />
          Sự cố sức khỏe
        </Space>
      ),
      children: <HealthEvents />
    },
    {
      key: 'checks',
      label: (
        <Space>
          <EyeOutlined />
          Phiếu khám sức khỏe
        </Space>
      ),
      children: <HealthChecks />
    },
    {
      key: 'notices',
      label: (
        <Space>
          <FileTextOutlined />
          Thông báo khám
        </Space>
      ),
      children: <HealthCheckNotices />
    }
  ];

  return (
    <div className="health-management">
      <div style={{ marginBottom: 16 }}>
        <Title level={2}>
          <HeartOutlined style={{ marginRight: 8 }} />
          Quản lý Sức khỏe
        </Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setActiveTab('events')}
          >
            Tạo sự cố mới
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

export default Health; 