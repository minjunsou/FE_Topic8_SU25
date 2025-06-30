import React from 'react';
import { Tabs, Badge } from 'antd';
import { 
  DashboardOutlined, 
  MedicineBoxOutlined, 
  FileTextOutlined,
  AlertOutlined,
  MedicineBoxTwoTone,
  KeyOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;

const StaffTabs = ({ 
  activeTab, 
  handleTabChange, 
  medicineRequests, 
  healthDeclarations,
  medicalIncidents
}) => {
  return (
    <div className="staff-tabs-container">
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        className="staff-tabs"
      >
        <TabPane 
          tab={
            <span>
              <DashboardOutlined />
              Tổng quan
            </span>
          } 
          key="overview" 
        />
        <TabPane 
          tab={
            <span>
              <AlertOutlined />
              Sự kiện y tế
              <Badge 
                count={medicalIncidents?.filter(i => i.status === 'new').length || 0} 
                style={{ marginLeft: 8 }}
              />
            </span>
          } 
          key="medical-incidents" 
        />
        <TabPane 
          tab={
            <span>
              <MedicineBoxOutlined />
              Yêu cầu thuốc
              <Badge 
                count={medicineRequests.filter(r => r.status === 'pending').length} 
                style={{ marginLeft: 8 }}
              />
            </span>
          } 
          key="medicine-requests" 
        />
        <TabPane 
          tab={
            <span>
              <MedicineBoxTwoTone />
              Thuốc & Vật tư
            </span>
          } 
          key="medicine-supplies" 
        />
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              Khai báo sức khỏe
              <Badge 
                count={healthDeclarations.filter(d => d.status === 'new').length} 
                style={{ marginLeft: 8 }}
              />
            </span>
          } 
          key="health-declarations" 
        />
        <TabPane 
          tab={
            <span>
              <KeyOutlined />
              Đổi mật khẩu
            </span>
          } 
          key="change-password" 
        />
      </Tabs>
    </div>
  );
};

export default StaffTabs; 