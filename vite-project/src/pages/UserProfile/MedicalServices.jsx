import React from 'react';
import { Card, Typography, Row, Col, Button } from 'antd';
import { 
  MedicineBoxOutlined, 
  ExperimentOutlined, 
  SolutionOutlined, 
  HistoryOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const { Title, Paragraph } = Typography;

const MedicalServices = () => {
  const navigate = useNavigate();

  // Danh sách các dịch vụ y tế
  const medicalServices = [
    {
      title: 'Tiêm chủng',
      description: 'Xem thông tin và đăng ký tiêm chủng cho học sinh',
      icon: <MedicineBoxOutlined />,
      path: '/vaccination',
      color: '#1890ff'
    },
    {
      title: 'Kiểm tra sức khỏe',
      description: 'Xem lịch và đăng ký kiểm tra sức khỏe định kỳ',
      icon: <ExperimentOutlined />,
      path: '/health-check',
      color: '#52c41a'
    },
    {
      title: 'Sự kiện y tế',
      description: 'Theo dõi các sự kiện y tế của học sinh',
      icon: <SolutionOutlined />,
      path: '/medical-incidents',
      color: '#fa8c16'
    },
    {
      title: 'Lịch sử sức khỏe',
      description: 'Xem lịch sử sức khỏe và phát triển của học sinh',
      icon: <HistoryOutlined />,
      path: '/health-history',
      color: '#722ed1'
    },
    {
      title: 'Yêu cầu thuốc',
      description: 'Gửi yêu cầu cấp thuốc cho học sinh',
      icon: <MedicineBoxOutlined />,
      path: '/medicine-request',
      color: '#eb2f96'
    },
    {
      title: 'Khai báo y tế',
      description: 'Khai báo thông tin y tế cho học sinh',
      icon: <FileTextOutlined />,
      path: '/health-declaration',
      color: '#13c2c2'
    }
  ];

  // Xử lý khi click vào dịch vụ
  const handleServiceClick = (path) => {
    navigate(path);
  };

  return (
    <Card 
      className="user-profile-card"
      title={
        <div className="user-profile-header">
          <MedicineBoxOutlined className="service-icon" />
          <Title level={4} className="user-profile-title">Dịch vụ y tế</Title>
        </div>
      }
    >
      <Paragraph className="service-intro">
        Truy cập nhanh các dịch vụ y tế trường học dành cho phụ huynh và học sinh
      </Paragraph>

      <Row gutter={[16, 16]} className="service-grid">
        {medicalServices.map((service, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card 
              className="service-card"
              hoverable
              onClick={() => handleServiceClick(service.path)}
            >
              <div className="service-icon-wrapper" style={{ backgroundColor: service.color }}>
                {service.icon}
              </div>
              <div className="service-content">
                <Title level={5}>{service.title}</Title>
                <Paragraph className="service-description">{service.description}</Paragraph>
                <Button type="primary" size="small">
                  Truy cập
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default MedicalServices; 