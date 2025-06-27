import React, { useState } from 'react';
import { Tabs, Row, Col } from 'antd';
import { UserOutlined, TeamOutlined, KeyOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import UserInfo from './UserInfo';
import ChildrenInfo from './ChildrenInfo';
import ChangePassword from './ChangePassword';
import MedicalServices from './MedicalServices';
import './UserProfile.css';

const { TabPane } = Tabs;

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('1');

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={6}>
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              tabPosition="left"
              className="user-profile-tabs"
              items={[
                {
                  key: '1',
                  label: (
                    <span>
                      <UserOutlined />
                      Thông tin cá nhân
                    </span>
                  ),
                },
                {
                  key: '2',
                  label: (
                    <span>
                      <TeamOutlined />
                      Thông tin học sinh
                    </span>
                  ),
                },
                {
                  key: '4',
                  label: (
                    <span>
                      <MedicineBoxOutlined />
                      Dịch vụ y tế
                    </span>
                  ),
                },
                {
                  key: '3',
                  label: (
                    <span>
                      <KeyOutlined />
                      Đổi mật khẩu
                    </span>
                  ),
                },
              ]}
            />
          </Col>
          
          <Col xs={24} md={18}>
            <div className="user-profile-content">
              {activeTab === '1' && <UserInfo />}
              {activeTab === '2' && <ChildrenInfo />}
              {activeTab === '3' && <ChangePassword />}
              {activeTab === '4' && <MedicalServices />}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default UserProfile; 