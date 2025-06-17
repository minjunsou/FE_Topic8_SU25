import React, { useState, useEffect } from 'react';
import { Card, Typography, Descriptions, Button, message, Skeleton, Select, Empty, Tabs, Avatar } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import './UserProfile.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ChildrenInfo = () => {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  // Giả lập lấy dữ liệu con
  useEffect(() => {
    const fetchChildrenData = async () => {
      try {
        // Giả lập API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dữ liệu mẫu
        const mockData = [
          {
            id: 1,
            name: 'Nguyễn Minh Anh',
            age: 10,
            grade: '5A',
            class: '5A1',
            school: 'Trường Tiểu học Nguyễn Bỉnh Khiêm',
            healthStatus: 'Khỏe mạnh',
            avatar: null,
            birthdate: '15/08/2014',
            bloodType: 'O+',
            allergies: 'Không',
            chronicDiseases: 'Không',
            height: 142,
            weight: 38,
            lastCheckup: '20/05/2023',
            vaccinations: [
              { name: 'Vắc-xin Sởi-Quai bị-Rubella (MMR)', date: '10/02/2018' },
              { name: 'Vắc-xin Bại liệt (IPV)', date: '15/06/2019' },
              { name: 'Vắc-xin Viêm gan B', date: '22/09/2020' }
            ]
          },
          {
            id: 2,
            name: 'Nguyễn Đức Minh',
            age: 7,
            grade: '2B',
            class: '2B3',
            school: 'Trường Tiểu học Nguyễn Bỉnh Khiêm',
            healthStatus: 'Khỏe mạnh',
            avatar: null,
            birthdate: '05/03/2017',
            bloodType: 'A+',
            allergies: 'Hải sản',
            chronicDiseases: 'Không',
            height: 125,
            weight: 28,
            lastCheckup: '15/04/2023',
            vaccinations: [
              { name: 'Vắc-xin Sởi-Quai bị-Rubella (MMR)', date: '12/05/2020' },
              { name: 'Vắc-xin Bại liệt (IPV)', date: '18/08/2021' },
              { name: 'Vắc-xin Viêm gan B', date: '25/10/2022' }
            ]
          }
        ];
        
        setChildren(mockData);
        if (mockData.length > 0) {
          setSelectedChild(mockData[0]);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        message.error('Không thể tải thông tin học sinh');
      } finally {
        setLoading(false);
      }
    };

    fetchChildrenData();
  }, []);

  const handleChildChange = (childId) => {
    const selected = children.find(child => child.id === childId);
    if (selected) {
      setSelectedChild(selected);
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
                <Descriptions.Item label="Trường">{selectedChild.school}</Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="Thông tin sức khỏe" key="2">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Tình trạng sức khỏe">{selectedChild.healthStatus}</Descriptions.Item>
                <Descriptions.Item label="Chiều cao">{selectedChild.height} cm</Descriptions.Item>
                <Descriptions.Item label="Cân nặng">{selectedChild.weight} kg</Descriptions.Item>
                <Descriptions.Item label="Nhóm máu">{selectedChild.bloodType}</Descriptions.Item>
                <Descriptions.Item label="Dị ứng">{selectedChild.allergies}</Descriptions.Item>
                <Descriptions.Item label="Bệnh mãn tính">{selectedChild.chronicDiseases}</Descriptions.Item>
                <Descriptions.Item label="Khám sức khỏe gần nhất">{selectedChild.lastCheckup}</Descriptions.Item>
              </Descriptions>
            </TabPane>
            
            <TabPane tab="Tiêm chủng" key="3">
              <div className="vaccination-list">
                {selectedChild.vaccinations.map((vaccine, index) => (
                  <div key={index} className="vaccination-item">
                    <Text strong>{vaccine.name}</Text>
                    <Text type="secondary">Ngày tiêm: {vaccine.date}</Text>
                  </div>
                ))}
              </div>
            </TabPane>
          </Tabs>
        </div>
      )}
    </Card>
  );
};

export default ChildrenInfo; 