import React, { useState, useEffect } from 'react';
import { Card, Typography, Descriptions, Button, message, Skeleton, Select, Empty, Tabs, Avatar, Spin, Tag, List } from 'antd';
import { UserOutlined, TeamOutlined, MedicineBoxOutlined, AlertOutlined, BugOutlined, MedicineBoxTwoTone } from '@ant-design/icons';
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
  const [allergens, setAllergens] = useState([]);
  const [syndromes, setSyndromes] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loadingReference, setLoadingReference] = useState(false);

  // Lấy dữ liệu tham chiếu (dị ứng, hội chứng, bệnh)
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        setLoadingReference(true);
        
        // Lấy danh sách dị ứng
        const allergensData = await parentApi.getAllergens();
        setAllergens(allergensData);
        console.log('Danh sách dị ứng:', allergensData);
        
        // Lấy danh sách hội chứng
        const syndromesData = await parentApi.getSyndromes();
        setSyndromes(syndromesData);
        console.log('Danh sách hội chứng:', syndromesData);
        
        // Lấy danh sách bệnh
        const diseasesData = await parentApi.getDiseases();
        setDiseases(diseasesData);
        console.log('Danh sách bệnh:', diseasesData);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu tham chiếu:', error);
      } finally {
        setLoadingReference(false);
      }
    };
    
    fetchReferenceData();
  }, []);

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

  // Hàm lấy tên dị ứng từ ID
  const getAllergenName = (allergenId) => {
    const allergen = allergens.find(a => a.allergenId === allergenId);
    return allergen ? allergen.name : 'Không xác định';
  };

  // Hàm lấy tên hội chứng từ ID
  const getConditionName = (conditionId) => {
    const syndrome = syndromes.find(s => s.conditionId === conditionId);
    return syndrome ? syndrome.name : 'Không xác định';
  };

  // Hàm lấy tên bệnh từ ID
  const getDiseaseName = (diseaseId) => {
    const disease = diseases.find(d => d.diseaseId === diseaseId);
    return disease ? disease.name : 'Không xác định';
  };

  // Hàm render danh sách dị ứng
  const renderAllergies = () => {
    if (!medicalProfile || !medicalProfile.allergies || medicalProfile.allergies.length === 0) {
      return <Empty description="Không có dị ứng" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    
    return (
      <List
        itemLayout="horizontal"
        dataSource={medicalProfile.allergies}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<AlertOutlined style={{ color: '#f5222d', fontSize: '24px' }} />}
              title={item.allergenName || getAllergenName(item.allergenId)}
              description={
                <div>
                  <div>Mức độ: {item.severity === 1 ? 'Nhẹ' : item.severity === 2 ? 'Trung bình' : 'Nặng'}</div>
                  {item.reaction && <div>Phản ứng: {item.reaction}</div>}
                  {item.lifeThreatening && <Tag color="red">Nguy hiểm đến tính mạng</Tag>}
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  // Hàm render danh sách hội chứng
  const renderConditions = () => {
    if (!medicalProfile || !medicalProfile.conditions || medicalProfile.conditions.length === 0) {
      return <Empty description="Không có hội chứng" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    
    return (
      <List
        itemLayout="horizontal"
        dataSource={medicalProfile.conditions}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<BugOutlined style={{ color: '#722ed1', fontSize: '24px' }} />}
              title={item.conditionName || getConditionName(item.conditionId)}
              description={item.note && <div>Ghi chú: {item.note}</div>}
            />
          </List.Item>
        )}
      />
    );
  };

  // Hàm render danh sách bệnh
  const renderDiseases = () => {
    if (!medicalProfile || !medicalProfile.diseases || medicalProfile.diseases.length === 0) {
      return <Empty description="Không có bệnh" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    
    return (
      <List
        itemLayout="horizontal"
        dataSource={medicalProfile.diseases}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<MedicineBoxTwoTone twoToneColor="#eb2f96" style={{ fontSize: '24px' }} />}
              title={item.diseaseName || getDiseaseName(item.diseaseId)}
              description={
                <div>
                  <div>Từ ngày: {item.sinceDate}</div>
                  <div>Mức độ: {item.severity === 1 ? 'Nhẹ' : item.severity === 2 ? 'Trung bình' : 'Nặng'}</div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  // Hàm render thông tin sức khỏe cơ bản
  const renderBasicHealthData = () => {
    if (!medicalProfile || !medicalProfile.basicHealthData) {
      return <Empty description="Không có thông tin sức khỏe cơ bản" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    
    const basicData = medicalProfile.basicHealthData;
    
    return (
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Chiều cao">{basicData.heightCm} cm</Descriptions.Item>
        <Descriptions.Item label="Cân nặng">{basicData.weightKg} kg</Descriptions.Item>
        <Descriptions.Item label="Thị lực (mắt trái)">{basicData.visionLeft}</Descriptions.Item>
        <Descriptions.Item label="Thị lực (mắt phải)">{basicData.visionRight}</Descriptions.Item>
        <Descriptions.Item label="Tình trạng thính giác">
          {basicData.hearingStatus === 'normal' ? 'Bình thường' : 'Suy giảm'}
        </Descriptions.Item>
        <Descriptions.Item label="Giới tính">
          {basicData.gender === 'male' ? 'Nam' : 'Nữ'}
        </Descriptions.Item>
        <Descriptions.Item label="Nhóm máu">{basicData.bloodType}</Descriptions.Item>
        <Descriptions.Item label="Cập nhật lần cuối">{basicData.lastMeasured}</Descriptions.Item>
      </Descriptions>
    );
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
                <Tabs defaultActiveKey="basic" type="card">
                  <TabPane tab="Thông tin cơ bản" key="basic">
                    {renderBasicHealthData()}
                  </TabPane>
                  <TabPane tab="Vấn đề sức khỏe" key="healthIssues">
                    <div className="health-issues-container">
                      <div className="health-issues-section">
                        <Title level={5}>Dị ứng</Title>
                        {renderAllergies()}
                      </div>
                      <div className="health-issues-section">
                        <Title level={5}>Hội chứng</Title>
                        {renderConditions()}
                      </div>
                      <div className="health-issues-section">
                        <Title level={5}>Bệnh</Title>
                        {renderDiseases()}
                      </div>
                    </div>
                  </TabPane>
                </Tabs>
              ) : (
                <Empty description="Không có thông tin sức khỏe" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </TabPane>
            
            <TabPane tab="Tiêm chủng" key="3">
              {loadingMedical ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <Spin size="large" tip="Đang tải thông tin tiêm chủng..." />
                </div>
              ) : medicalProfile && medicalProfile.active ? (
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