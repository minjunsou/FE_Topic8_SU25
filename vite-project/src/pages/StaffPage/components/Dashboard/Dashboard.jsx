import React from 'react';
import { Row, Col, Card, Table, Button, Typography, Space, Badge, Tooltip } from 'antd';
import {
  MedicineBoxOutlined,
  FileTextOutlined,
  AlertOutlined,
  RightOutlined,
  WarningOutlined,
  ClockCircleOutlined
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
  medicationStats,
  loading,
  handleViewDetail,
  handleViewHealthDetail,
  handleViewIncidentDetail,
  onViewAllMedicineRequests,
  onViewAllHealthDeclarations,
  onViewAllMedicalIncidents,
  onViewAllMedicationSupplies,
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

  // Cấu hình cột cho bảng thuốc hết hạn
  const expiredMedicationColumns = [
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => `${quantity} ${record.quantityType || 'đơn vị'}`,
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (expiryDate) => {
        if (!expiryDate) return 'Không có';
        
        // Handle different date formats
        let dateObj;
        if (Array.isArray(expiryDate)) {
          // Handle [year, month, day] format
          dateObj = new Date(expiryDate[0], expiryDate[1] - 1, expiryDate[2]);
        } else {
          // Handle string format
          dateObj = new Date(expiryDate);
        }
        
        return dateObj.toLocaleDateString('vi-VN');
      },
    },
  ];

  // Cấu hình cột cho bảng thuốc sắp hết
  const lowStockMedicationColumns = [
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => (
        <Tooltip title={quantity < 5 ? 'Số lượng thấp' : ''}>
          <span style={{ color: quantity < 5 ? '#ff4d4f' : 'inherit' }}>
            {quantity} {record.quantityType || 'đơn vị'}
          </span>
        </Tooltip>
      ),
    },
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
  
  // Lấy dữ liệu thuốc hết hạn và sắp hết
  const expiredMeds = medicationStats?.expiredMedications?.slice(0, 3) || [];
  const lowStockMeds = medicationStats?.lowStockMedications?.slice(0, 3) || [];

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
                <WarningOutlined className="icon expired" />
              </div>
              <div className="stat-info">
                <Text className="stat-title">Thuốc hết hạn</Text>
                <Title level={2} className="stat-number">{medicationStats?.expired || 0}</Title>
                <Text className="stat-highlight">{medicationStats?.lowStock || 0} sắp hết</Text>
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
        <Col xs={24} sm={24} md={12}>
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
        <Col xs={24} sm={24} md={12}>
          <Card 
            title={
              <Space>
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                <span>Thuốc đã hết hạn</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={onViewAllMedicationSupplies}>
                Xem tất cả <RightOutlined />
              </Button>
            }
          >
            <Table 
              dataSource={expiredMeds} 
              columns={expiredMedicationColumns}
              rowKey="id"
              pagination={false}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={24} md={12}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#faad14' }} />
                <span>Thuốc sắp hết</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={onViewAllMedicationSupplies}>
                Xem tất cả <RightOutlined />
              </Button>
            }
          >
            <Table 
              dataSource={lowStockMeds} 
              columns={lowStockMedicationColumns}
              rowKey="id"
              pagination={false}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12}>
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
    </div>
  );
};

export default Dashboard; 