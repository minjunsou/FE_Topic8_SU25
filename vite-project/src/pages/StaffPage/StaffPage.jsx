import React, { useState, useEffect } from 'react';
import { Layout, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

// Import các component đã tách
import Dashboard from './components/Dashboard/Dashboard';
import MedicineRequests from './components/MedicineRequests/MedicineRequests';
import HealthDeclarations from './components/HealthDeclarations/HealthDeclarations';
import MedicalIncidents from './components/MedicalIncidents/MedicalIncidents';
import MedicineSupplies from './components/MedicineSupplies/MedicineSupplies';
import StaffSidebar from './components/common/StaffSidebar';
import StaffTabs from './components/common/StaffTabs';
import LoadingIndicator from './components/common/LoadingIndicator';

import './StaffPage.css';

const { Content } = Layout;

// Dữ liệu mẫu cho yêu cầu thuốc
const mockMedicineRequests = [
  {
    id: 1,
    studentName: 'Nguyễn Văn A',
    class: '10A1',
    medicineName: 'Paracetamol',
    requestDate: '2025-06-18',
    status: 'pending',
  },
  {
    id: 2,
    studentName: 'Trần Thị B',
    class: '11B2',
    medicineName: 'Vitamin C',
    requestDate: '2025-06-17',
    status: 'approved',
  },
  {
    id: 3,
    studentName: 'Lê Văn C',
    class: '12C3',
    medicineName: 'Ibuprofen',
    requestDate: '2025-06-16',
    status: 'completed',
  },
  {
    id: 4,
    studentName: 'Phạm Thị D',
    class: '10A2',
    medicineName: 'Amoxicillin',
    requestDate: '2025-06-15',
    status: 'pending',
  },
  {
    id: 5,
    studentName: 'Hoàng Văn E',
    class: '11B1',
    medicineName: 'Cetirizine',
    requestDate: '2025-06-14',
    status: 'rejected',
  },
];

// Dữ liệu mẫu cho khai báo sức khỏe
const mockHealthDeclarations = [
  {
    id: 1,
    studentName: 'Nguyễn Văn A',
    class: '10A1',
    declarationDate: '2025-06-18',
    symptoms: 'Sốt, ho',
    status: 'new',
  },
  {
    id: 2,
    studentName: 'Trần Thị B',
    class: '11B2',
    declarationDate: '2025-06-17',
    symptoms: 'Đau đầu',
    status: 'reviewed',
  },
  {
    id: 3,
    studentName: 'Lê Văn C',
    class: '12C3',
    declarationDate: '2025-06-16',
    symptoms: 'Không có triệu chứng',
    status: 'reviewed',
  },
];

// Dữ liệu mẫu cho sự kiện y tế
const mockMedicalIncidents = [
  {
    id: 1,
    studentName: 'Nguyễn Văn A',
    class: '10A1',
    incidentDate: '2025-06-18',
    incidentType: 'Sốt cao',
    description: 'Học sinh bị sốt cao khi đang ở lớp',
    status: 'new',
    severity: 'medium',
    actions: [],
    medicinesUsed: []
  },
  {
    id: 2,
    studentName: 'Trần Thị B',
    class: '11B2',
    incidentDate: '2025-06-17',
    incidentType: 'Chấn thương nhẹ',
    description: 'Té ngã trong giờ thể dục',
    status: 'processing',
    severity: 'low',
    actions: ['Sơ cứu', 'Báo phụ huynh'],
    medicinesUsed: ['Băng cá nhân', 'Dung dịch sát khuẩn']
  },
  {
    id: 3,
    studentName: 'Lê Văn C',
    class: '12C3',
    incidentDate: '2025-06-16',
    incidentType: 'Dị ứng',
    description: 'Phát ban và khó thở nhẹ sau khi ăn trưa',
    status: 'closed',
    severity: 'high',
    actions: ['Dùng thuốc dị ứng', 'Gọi phụ huynh đến đón'],
    medicinesUsed: ['Cetirizine']
  },
];

const StaffPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [medicineRequests, setMedicineRequests] = useState([]);
  const [healthDeclarations, setHealthDeclarations] = useState([]);
  const [medicalIncidents, setMedicalIncidents] = useState([]);

  // Giả lập tải dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Giả lập gọi API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMedicineRequests(mockMedicineRequests);
        setHealthDeclarations(mockHealthDeclarations);
        setMedicalIncidents(mockMedicalIncidents);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Xác định menu item nào đang được chọn
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('medicine-requests')) return 'medicine-requests';
    if (path.includes('health-declarations')) return 'health-declarations';
    if (path.includes('medical-incidents')) return 'medical-incidents';
    if (path.includes('medicine-supplies')) return 'medicine-supplies';
    if (path.includes('students')) return 'students';
    return 'dashboard';
  };

  // Xử lý xem chi tiết yêu cầu thuốc
  const handleViewDetail = (id) => {
    message.info(`Xem chi tiết yêu cầu thuốc #${id}`);
    // navigate(`/staff/medicine-requests/${id}`);
  };

  // Xử lý xem chi tiết khai báo sức khỏe
  const handleViewHealthDetail = (id) => {
    message.info(`Xem chi tiết khai báo sức khỏe #${id}`);
    // navigate(`/staff/health-declarations/${id}`);
  };

  // Xử lý xem chi tiết sự kiện y tế
  const handleViewIncidentDetail = (id) => {
    message.info(`Xem chi tiết sự kiện y tế #${id}`);
    // navigate(`/staff/medical-incidents/${id}`);
  };
  
  // Xử lý đăng xuất
  const handleLogout = () => {
    // Thêm logic xử lý đăng xuất ở đây
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
    message.success('Đăng xuất thành công!');
    // Chuyển về trang đăng nhập
    navigate('/login');
  };

  // Xử lý thay đổi tab
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Hiển thị nội dung dựa trên tab đang chọn
  const renderTabContent = () => {
    switch (activeTab) {
      case 'medicine-requests':
        return (
          <MedicineRequests 
            medicineRequests={medicineRequests}
            handleViewDetail={handleViewDetail}
            loading={loading} 
          />
        );
      case 'health-declarations':
        return (
          <HealthDeclarations 
            healthDeclarations={healthDeclarations}
            handleViewHealthDetail={handleViewHealthDetail}
            loading={loading} 
          />
        );
      case 'medical-incidents':
        return (
          <MedicalIncidents 
            medicalIncidents={medicalIncidents}
            handleViewIncidentDetail={handleViewIncidentDetail}
            loading={loading} 
          />
        );
      case 'medicine-supplies':
        return (
          <MedicineSupplies 
            loading={loading} 
          />
        );
      case 'overview':
      default:
        return (
          <Dashboard 
            medicineRequests={medicineRequests}
            healthDeclarations={healthDeclarations}
            medicalIncidents={medicalIncidents}
            loading={loading}
            handleViewDetail={handleViewDetail}
            handleViewHealthDetail={handleViewHealthDetail}
            handleViewIncidentDetail={handleViewIncidentDetail}
            onViewAllMedicineRequests={() => setActiveTab('medicine-requests')}
            onViewAllHealthDeclarations={() => setActiveTab('health-declarations')}
            onViewAllMedicalIncidents={() => setActiveTab('medical-incidents')}
          />
        );
    }
  };

  return (
    <Layout className="staff-layout">
      <StaffSidebar 
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        getSelectedKey={getSelectedKey}
        onMenuClick={setActiveTab}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
      <Layout className="staff-content-layout">
        <Content className="staff-content">
          <div className="staff-content-container">
            {loading ? (
              <LoadingIndicator />
            ) : (
              <>
                <StaffTabs 
                  activeTab={activeTab}
                  handleTabChange={handleTabChange}
                  medicineRequests={medicineRequests}
                  healthDeclarations={healthDeclarations}
                  medicalIncidents={medicalIncidents}
                />
                {renderTabContent()}
              </>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffPage;