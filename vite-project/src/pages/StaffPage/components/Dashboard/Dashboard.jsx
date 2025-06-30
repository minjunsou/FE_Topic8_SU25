import React from 'react';
import { Row, Col, Card, Table, Button, Typography, Space, Badge } from 'antd';
import {
  MedicineBoxOutlined,
  FileTextOutlined,
  AlertOutlined,
  RightOutlined
} from '@ant-design/icons';
import './Dashboard.css';

const { Title, Text } = Typography;

// Hàm helper để hiển thị trạng thái
const renderStatus = (status) => {
  const statusColors = {
    pending: 'orange',
    approved: 'blue',
    completed: 'green',
    rejected: 'red',
    new: 'gold',
    reviewed: 'green',
    processing: 'blue',
    closed: 'gray',
  };
  
  const statusTexts = {
    pending: 'Đang chờ',
    approved: 'Đã duyệt',
    completed: 'Đã hoàn thành',
    rejected: 'Từ chối',
    new: 'Mới',
    reviewed: 'Đã xem',
    processing: 'Đang xử lý',
    closed: 'Đã đóng',
  };
  
  return (
    <Badge color={statusColors[status]} text={statusTexts[status]} />
  );
};

const Dashboard = ({
  medicineRequests,
  healthDeclarations,
  medicalIncidents,
  loading,
  handleViewDetail,
  handleViewHealthDetail,
  handleViewIncidentDetail,
  onViewAllMedicineRequests,
  onViewAllHealthDeclarations,
  onViewAllMedicalIncidents,
}) => {
  // Cấu hình cột cho bảng yêu cầu thuốc
  const medicineRequestColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Lớp',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Thuốc',
      dataIndex: 'medicineName',
      key: 'medicineName',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatus(status),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewDetail(record.id)}>
          Xem
        </Button>
      ),
    }
  ];

  // Cấu hình cột cho bảng khai báo sức khoẻ
  const healthDeclarationColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Lớp',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Triệu chứng',
      dataIndex: 'symptoms',
      key: 'symptoms',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatus(status),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewHealthDetail(record.id)}>
          Xem
        </Button>
      ),
    }
  ];

  // Cấu hình cột cho bảng sự kiện y tế
  const medicalIncidentColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Lớp',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Loại sự kiện',
      dataIndex: 'incidentType',
      key: 'incidentType',
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        const severityColors = {
          low: 'blue',
          medium: 'orange',
          high: 'red',
        };
        const severityTexts = {
          low: 'Thấp',
          medium: 'Trung bình',
          high: 'Cao',
        };
        return (
          <Badge color={severityColors[severity]} text={severityTexts[severity]} />
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatus(status),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewIncidentDetail(record.id)}>
          Xem
        </Button>
      ),
    }
  ];
  
  const recentMedicineRequests = medicineRequests.slice(0, 3);
  const recentHealthDeclarations = healthDeclarations.slice(0, 3);
  const recentMedicalIncidents = medicalIncidents?.slice(0, 3) || [];

  return (
    <div className="dashboard-container">
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={24} md={8}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-card-content">
              <div className="stat-icon-container">
                <MedicineBoxOutlined className="icon medicine" />
              </div>
              <div className="stat-info">
                <Text className="stat-title">Yêu cầu thuốc</Text>
                <Title level={2} className="stat-number">{medicineRequests.length}</Title>
                <Text className="stat-highlight">{medicineRequests.filter(item => item.status === 'pending').length} đang chờ</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-card-content">
              <div className="stat-icon-container">
                <FileTextOutlined className="icon declaration" />
              </div>
              <div className="stat-info">
                <Text className="stat-title">Khai báo sức khỏe</Text>
                <Title level={2} className="stat-number">{healthDeclarations.length}</Title>
                <Text className="stat-highlight">{healthDeclarations.filter(item => item.status === 'new').length} mới</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card className="stat-card" bordered={false}>
            <div className="stat-card-content">
              <div className="stat-icon-container">
                <AlertOutlined className="icon incident" />
              </div>
              <div className="stat-info">
                <Text className="stat-title">Sự kiện y tế</Text>
                <Title level={2} className="stat-number">{medicalIncidents?.length || 0}</Title>
                <Text className="stat-highlight">{medicalIncidents?.filter(item => item.status === 'new').length || 0} mới</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <AlertOutlined style={{ color: '#ff4d4f' }} />
                <span>Sự kiện y tế gần đây</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={onViewAllMedicalIncidents}>
                Xem tất cả <RightOutlined />
              </Button>
            }
          >
            <Table 
              dataSource={recentMedicalIncidents} 
              columns={medicalIncidentColumns}
              rowKey="id"
              pagination={false}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card 
            title={
              <Space>
                <MedicineBoxOutlined style={{ color: '#1890ff' }} />
                <span>Yêu cầu thuốc gần đây</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={onViewAllMedicineRequests}>
                Xem tất cả <RightOutlined />
              </Button>
            }
          >
            <Table 
              dataSource={recentMedicineRequests} 
              columns={medicineRequestColumns}
              rowKey="id"
              pagination={false}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title={
              <Space>
                <FileTextOutlined style={{ color: '#52c41a' }} />
                <span>Khai báo sức khỏe gần đây</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={onViewAllHealthDeclarations}>
                Xem tất cả <RightOutlined />
              </Button>
            }
          >
            <Table 
              dataSource={recentHealthDeclarations} 
              columns={healthDeclarationColumns}
              rowKey="id"
              pagination={false}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 