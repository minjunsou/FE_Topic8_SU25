import React, { useState, useEffect } from 'react';
import { Layout, message, Card, Typography, Form, Input, Button, Alert } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { LockOutlined, KeyOutlined } from '@ant-design/icons';
import { authApi } from '../../api';
import nurseApi from '../../api/nurseApi';

// Import các component đã tách
import Dashboard from './components/Dashboard/Dashboard';
import MedicineRequests from './components/MedicineRequests/MedicineRequests';
import HealthDeclarations from './components/HealthDeclarations/HealthDeclarations';
import MedicalIncidents from './components/MedicalIncidents/MedicalIncidents';
import MedicineSupplies from './components/MedicineSupplies/MedicineSupplies';
import ProfileManagement from './components/ProfileManagement/ProfileManagement';
import StaffSidebar from './components/common/StaffSidebar';
import StaffTabs from './components/common/StaffTabs';
import LoadingIndicator from './components/common/LoadingIndicator';
import HealthChecks from './components/HealthChecks/HealthChecks';

import './StaffPage.css';

const { Content } = Layout;
const { Title } = Typography;

// Component đổi mật khẩu cho y tá
const StaffChangePassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  // Lấy thông tin người dùng từ localStorage khi component được render
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
      } catch (error) {
        console.error('Lỗi khi phân tích thông tin người dùng:', error);
        message.error('Không thể lấy thông tin người dùng');
      }
    } else {
      message.warning('Vui lòng đăng nhập để sử dụng tính năng này');
    }
  }, []);

  const onFinish = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Gọi API thay đổi mật khẩu
      const passwordData = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      };
      
      // Gọi API thay đổi mật khẩu từ authApi
      const response = await authApi.changePassword(passwordData);
      
      console.log('Change password response:', response);
      
      // Hiển thị thông báo thành công
      setSuccess(true);
      message.success(response.message || 'Đổi mật khẩu thành công');
      form.resetFields();
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      
      // Hiển thị thông báo lỗi
      const errorMessage = error.message || 'Đã xảy ra lỗi khi đổi mật khẩu';
      setError(errorMessage);
      message.error(errorMessage);
      
      // Xử lý các lỗi cụ thể
      if (error.status === 401) {
        setError('Mật khẩu hiện tại không đúng');
      } else if (error.status === 400) {
        setError('Vui lòng kiểm tra lại thông tin mật khẩu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị thông báo nếu không có thông tin người dùng
  if (!userInfo?.accountId) {
    return (
      <Card 
        className="staff-card"
        title={
          <div className="staff-card-header">
            <KeyOutlined className="staff-card-icon" />
            <Title level={4} className="staff-card-title">Đổi mật khẩu</Title>
          </div>
        }
      >
        <Alert
          message="Không thể thay đổi mật khẩu"
          description="Vui lòng đăng nhập để sử dụng tính năng này hoặc tài khoản của bạn không có accountId."
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card 
      className="staff-card"
      title={
        <div className="staff-card-header">
          <KeyOutlined className="staff-card-icon" />
          <Title level={4} className="staff-card-title">Đổi mật khẩu</Title>
        </div>
      }
    >
      {success && (
        <Alert
          message="Đổi mật khẩu thành công"
          description="Mật khẩu của bạn đã được cập nhật."
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
      
      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
      
      <Form
        form={form}
        name="staff_change_password"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="Nhập mật khẩu hiện tại" 
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 8, message: 'Mật khẩu mới phải có ít nhất 8 ký tự' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              message: 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
            }
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="Nhập mật khẩu mới" 
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp với mật khẩu mới'));
              },
            }),
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="Xác nhận mật khẩu mới" 
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            className="change-password-button"
            block
          >
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>
      
      <div className="password-requirements">
        <Title level={5}>Yêu cầu mật khẩu:</Title>
        <ul>
          <li>Ít nhất 8 ký tự</li>
          <li>Ít nhất 1 chữ hoa</li>
          <li>Ít nhất 1 chữ thường</li>
          <li>Ít nhất 1 số</li>
          <li>Ít nhất 1 ký tự đặc biệt (@$!%*?&)</li>
        </ul>
      </div>
    </Card>
  );
};

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
  const [studentsMap, setStudentsMap] = useState({});

  // Tải dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy danh sách học sinh để mapping
        const studentsData = await nurseApi.getAllStudents();
        console.log('Danh sách học sinh:', studentsData);
        
        // Tạo map từ ID học sinh đến thông tin học sinh
        const studentsMapping = {};
        if (Array.isArray(studentsData)) {
          studentsData.forEach(student => {
            if (student.accountId) {
              studentsMapping[student.accountId] = student;
            }
          });
        }
        setStudentsMap(studentsMapping);
        
        // Lấy danh sách yêu cầu thuốc
        const medicationRequestsData = await nurseApi.getAllActiveMedicationRequests();
        console.log('Yêu cầu thuốc:', medicationRequestsData);
        
        // Kết hợp dữ liệu yêu cầu thuốc với thông tin học sinh
        const enrichedRequests = Array.isArray(medicationRequestsData) 
          ? medicationRequestsData.map(request => {
              const studentInfo = studentsMapping[request.studentId] || {};
              return {
                ...request,
                studentName: studentInfo.fullName || 'Không xác định',
                studentClass: studentInfo.classId || 'Không xác định',
                key: request.medSentId || Math.random().toString()
              };
            })
          : [];
        
        setMedicineRequests(enrichedRequests);
        
        // Giữ nguyên dữ liệu mẫu cho các loại dữ liệu khác
        setHealthDeclarations(mockHealthDeclarations);
        setMedicalIncidents(mockMedicalIncidents);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        
        // Dùng dữ liệu mẫu trong trường hợp lỗi
        setMedicineRequests(mockMedicineRequests);
        setHealthDeclarations(mockHealthDeclarations);
        setMedicalIncidents(mockMedicalIncidents);
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
    if (path.includes('health-checks')) return 'health-checks';
    if (path.includes('medical-incidents')) return 'medical-incidents';
    if (path.includes('medicine-supplies')) return 'medicine-supplies';
    if (path.includes('profiles')) return 'profiles';
    if (activeTab === 'change-password') return 'change-password';
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
            studentsMap={studentsMap}
          />
        );
      case 'health-declarations':
        return (
          <HealthDeclarations />
        );

      case 'health-checks':
        return (
          <HealthChecks />
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
      case 'profiles':
        return (
          <ProfileManagement />
        );
      case 'change-password':
        return <StaffChangePassword />;
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
        unreadIncidents={medicalIncidents?.filter(i => i.status === 'new').length || 0}
        pendingRequests={medicineRequests.filter(r => r.status === 'pending').length || 0}
        unreadDeclarations={healthDeclarations.filter(d => d.status === 'new').length || 0}
      />
      <Layout className="staff-content-layout">
        <Content className="staff-content">
          <div className="staff-content-container">
            {loading && activeTab === 'overview' ? (
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