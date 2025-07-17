import React, { useState, useEffect } from 'react';
import { Card, Typography, Descriptions, Button, message, Skeleton, Select, Empty, Tabs, Avatar, Spin } from 'antd';
import { UserOutlined, TeamOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { parentApi } from '../../api';
import './UserProfile.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ChildrenInfo = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [medicalProfile, setMedicalProfile] = useState(null);
  const [loadingMedical, setLoadingMedical] = useState(false);

  // Lấy danh sách con từ API
  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        setLoading(true);
        
        // Lấy accountId từ localStorage
        const storedUserInfo = localStorage.getItem('userInfo');
        if (!storedUserInfo) {
          message.error('Không tìm thấy thông tin người dùng');
          setLoading(false);
          return;
        }
        
        const parsedUserInfo = JSON.parse(storedUserInfo);
        const userAccountId = parsedUserInfo.accountId;
        
        if (!userAccountId) {
          message.error('Không tìm thấy ID người dùng');
          setLoading(false);
          return;
        }
        
        console.log('Đang lấy danh sách con cho phụ huynh ID:', userAccountId);
        
        // Gọi API để lấy danh sách con
        const childrenData = await parentApi.getParentChildren(userAccountId);
        console.log('Danh sách con từ API:', childrenData);
        
        if (!childrenData || childrenData.length === 0) {
          console.log('Không có dữ liệu con');
          setChildren([]);
          setLoading(false);
          return;
        }
        
        // Định dạng lại dữ liệu con
        const formattedChildren = childrenData.map(child => ({
          id: child.childId || child.accountId || child.id,
          name: child.fullName || child.name,
          age: calculateAge(child.dob),
          grade: child.classId || 'N/A',
          class: child.className || child.classId || 'N/A',
          healthStatus: child.healthStatus || 'Chưa cập nhật',
          avatar: null,
          birthdate: formatDate(child.dob) || 'Chưa cập nhật',
          dob: child.dob || ''
        }));
        
        console.log('Dữ liệu con đã định dạng:', formattedChildren);
        setChildren(formattedChildren);
        
        // Chọn học sinh đầu tiên nếu có
        if (formattedChildren.length > 0) {
          const firstChild = formattedChildren[0];
          setSelectedChild(firstChild);
          
          // Lấy thông tin sức khỏe của học sinh đầu tiên
          fetchMedicalProfile(firstChild.id);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu con:', error);
        message.error('Không thể tải thông tin học sinh');
      } finally {
        setLoading(false);
      }
    };

    fetchChildrenData();
  }, []);

  // Hàm lấy thông tin sức khỏe của học sinh
  const fetchMedicalProfile = async (childId) => {
    if (!childId) {
      console.warn('Không có childId để lấy thông tin sức khỏe');
      return;
    }
    
    try {
      setLoadingMedical(true);
      console.log(`Đang gọi API để lấy thông tin sức khỏe của học sinh ID: ${childId}`);
      
      // Gọi API lấy thông tin sức khỏe
      const medicalData = await parentApi.getMedicalProfile(childId);
      console.log('Thông tin sức khỏe từ API:', medicalData);
      
      if (!medicalData) {
        console.log('Không có dữ liệu sức khỏe');
        setMedicalProfile(null);
        return;
      }
      
      setMedicalProfile(medicalData);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin sức khỏe:', error);
      message.error('Không thể tải thông tin sức khỏe');
      setMedicalProfile(null);
    } finally {
      setLoadingMedical(false);
    }
  };

  // Hàm tính tuổi từ ngày sinh
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error('Lỗi khi tính tuổi:', error);
      return 'N/A';
    }
  };

  // Hàm định dạng ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Lỗi khi định dạng ngày tháng:', error);
      return null;
    }
  };

  const handleChildChange = (childId) => {
    const selected = children.find(child => child.id === childId);
    if (selected) {
      setSelectedChild(selected);
      fetchMedicalProfile(childId);
    }
  };

  if (loading) {
    return (
      <Card className="user-profile-card">
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (children.length === 0) {
    return (
      <Card 
        className="user-profile-card"
        title={
          <div className="user-profile-header">
            <TeamOutlined className="user-profile-icon" />
            <Title level={4} className="user-profile-title">Thông tin học sinh</Title>
          </div>
        }
      >
        <Empty 
          description="Không có thông tin học sinh" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      </Card>
    );
  }

  return (
    <Card 
      className="user-profile-card"
      title={
        <div className="user-profile-header">
          <TeamOutlined className="user-profile-icon" />
          <Title level={4} className="user-profile-title">Thông tin học sinh</Title>
        </div>
      }
      extra={
        <Select
          style={{ width: 200 }}
          placeholder="Chọn học sinh"
          value={selectedChild?.id}
          onChange={handleChildChange}
        >
          {children.map(child => (
            <Option key={child.id} value={child.id}>{child.name}</Option>
          ))}
        </Select>
      }
    >
      {selectedChild && (
        <div className="child-info-container">
          <div className="child-info-header">
            <Avatar 
              size={80} 
              icon={<UserOutlined />} 
              src={selectedChild.avatar} 
              className="child-avatar"
            />
            <div className="child-basic-info">
              <Title level={4}>{selectedChild.name}</Title>
              <Text>Lớp {selectedChild.grade} - {selectedChild.class}</Text>
              <Text type="secondary">{selectedChild.school}</Text>
            </div>
          </div>

          <Tabs defaultActiveKey="1" className="child-info-tabs">
            <TabPane tab="Thông tin cơ bản" key="1">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Họ và tên">{selectedChild.name}</Descriptions.Item>
                <Descriptions.Item label="Tuổi">{selectedChild.age}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">{selectedChild.birthdate}</Descriptions.Item>
                <Descriptions.Item label="Lớp">{`${selectedChild.grade} - ${selectedChild.class}`}</Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="Thông tin sức khỏe" key="2">
              {loadingMedical ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <Spin size="large" tip="Đang tải thông tin sức khỏe..." />
                </div>
              ) : medicalProfile ? (
                <Descriptions bordered column={1}>
                  {/* <Descriptions.Item label="Tình trạng sức khỏe">{medicalProfile.healthStatus || 'Chưa cập nhật'}</Descriptions.Item> */}
                  <Descriptions.Item label="Dị ứng">{medicalProfile.allergies || 'Không'}</Descriptions.Item>
                  <Descriptions.Item label="Bệnh mãn tính">{medicalProfile.chronicDiseases || 'Không'}</Descriptions.Item>
                  <Descriptions.Item label="Tình trạng thính giác">{medicalProfile.hearingStatus || 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Thị lực (mắt trái)">{medicalProfile.visionStatusLeft || 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Thị lực (mắt phải)">{medicalProfile.visionStatusRight || 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Tình trạng tiêm chủng">{medicalProfile.immunizationStatus || 'Chưa cập nhật'}</Descriptions.Item>
                  <Descriptions.Item label="Điều trị trước đây">{medicalProfile.pastTreatments || 'Không'}</Descriptions.Item>
                  {/* <Descriptions.Item label="Cập nhật lần cuối">{medicalProfile.lastUpdated ? formatDate(medicalProfile.lastUpdated) : 'Chưa cập nhật'}</Descriptions.Item> */}
                </Descriptions>
              ) : (
                <Empty description="Không có thông tin sức khỏe" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </TabPane>
            
            <TabPane tab="Tiêm chủng" key="3">
              {loadingMedical ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <Spin size="large" tip="Đang tải thông tin tiêm chủng..." />
                </div>
              ) : medicalProfile && medicalProfile.immunizationStatus === "Complete" ? (
                <div className="vaccination-info">
                  <div className="vaccination-status-complete">
                    <MedicineBoxOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                    <Text strong style={{ marginLeft: '10px', fontSize: '16px' }}>Đã hoàn thành tất cả các mũi tiêm chủng cần thiết</Text>
                  </div>
                </div>
              ) : (
                <Empty description="Không có thông tin tiêm chủng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </TabPane>
          </Tabs>
        </div>
      )}
    </Card>
  );
};

export default ChildrenInfo; 