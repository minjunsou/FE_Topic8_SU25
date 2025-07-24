import React, { useState } from 'react';
import { Row, Col, Card, Table, Button, Typography, Space, Badge, Tooltip, Tag, Popconfirm } from 'antd';
import {
  MedicineBoxOutlined,
  FileTextOutlined,
  AlertOutlined,
  RightOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined
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

// // Hàm helper định dạng ngày
// const formatDate = (dateArray) => {
//   if (!dateArray) return "Chưa xác định";
  
//   try {
//     // Check if date is an array [year, month, day]
//     if (Array.isArray(dateArray)) {
//       return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`;
//     }
    
//     // For string dates
//     const date = new Date(dateArray);
//     return date.toLocaleDateString('vi-VN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric'
//     });
//   } catch (error) {
//     console.error('Lỗi khi định dạng ngày:', error);
//     return "Không xác định";
//   }
// };

// Hàm chuyển đổi timingNotes sang text hiển thị thân thiện hơn
const getTimingText = (timingNote) => {
  switch (timingNote) {
    case 'sang':
      return 'Buổi sáng';
    case 'trua':
      return 'Buổi trưa';
    case 'chieu':
      return 'Buổi chiều';
    case 'toi':
      return 'Buổi tối';
    default:
      return timingNote;
  }
};

const Dashboard = ({
  medicineRequests,
  medicalIncidents,
  medicationStats,
  loading,
  handleViewDetail,
  handleViewIncidentDetail,
  onViewAllMedicineRequests,
  onViewAllMedicalIncidents,
  onViewAllMedicationSupplies,
  onRequestStatusChange,
}) => {
  const [processingRequestId, setProcessingRequestId] = useState(null);

  // Xử lý khi y tá chấp nhận yêu cầu thuốc từ dashboard
  const handleAccept = async (medicationSentId) => {
    if (onRequestStatusChange) {
      setProcessingRequestId(medicationSentId);
      try {
        await onRequestStatusChange(medicationSentId, true);
      } finally {
        setProcessingRequestId(null);
      }
    }
  };

  // Xử lý khi y tá từ chối yêu cầu thuốc từ dashboard
  const handleReject = async (medicationSentId) => {
    if (onRequestStatusChange) {
      setProcessingRequestId(medicationSentId);
      try {
        await onRequestStatusChange(medicationSentId, false);
      } finally {
        setProcessingRequestId(null);
      }
    }
  };

  // Cấu hình cột cho bảng yêu cầu thuốc
  const medicineRequestColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      width: '18%',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text || 'Không xác định'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.studentClass || 'Chưa có lớp'}
          </div>
        </div>
      ),
    },
    {
      title: 'Thông tin thuốc',
      key: 'medications',
      width: '40%',
      render: (_, record) => {
        // Kiểm tra nếu có dosages
        if (!record.dosages || record.dosages.length === 0) {
          return <Text type="secondary">Không có thông tin thuốc</Text>;
        }

        return (
          <Space direction="vertical" size={2}>
            {record.dosages.map((dosage, dIndex) => (
              <div key={`dosage-${dIndex}`}>
                <Text strong>{getTimingText(dosage.timingNotes)}</Text>: 
                {dosage.medicationItems && dosage.medicationItems.length > 0 ? (
                  <ul style={{ margin: '2px 0', paddingLeft: 20 }}>
                    {dosage.medicationItems.map((med, mIndex) => (
                      <li key={`med-${dIndex}-${mIndex}`} style={{ fontSize: '12px' }}>
                        {med.medicationName} - {med.amount} viên
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Text type="secondary"> Không có thuốc</Text>
                )}
              </div>
            ))}
          </Space>
        );
      },
    },
    // {
    //   title: 'Thời gian',
    //   key: 'time',
    //   width: '20%',
    //   render: (_, record) => (
    //     <Space direction="vertical" size={0}>
    //       <Text style={{ fontSize: '12px' }}>
    //         <CalendarOutlined style={{ marginRight: 4 }} />
    //         Yêu cầu: {formatDate(record.requestDate)}
    //       </Text>
    //       <Text style={{ fontSize: '12px' }}>
    //         <ClockCircleOutlined style={{ marginRight: 4 }} />
    //         Gửi: {formatDate(record.sentAt)}
    //       </Text>
    //     </Space>
    //   ),
    // },
    {
      title: 'Trạng thái',
      key: 'status',
      width: '12%',
      render: (_, record) => {
        if (record.isAccepted === true) {
          return <Tag color="success">Đã hoàn thành</Tag>;
        } else if (record.isAccepted === false) {
          return <Tag color="error">Đã từ chối</Tag>;
        } else {
          return <Tag color="processing">Chờ xử lý</Tag>;
        }
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_, record) => {
        const isProcessing = processingRequestId === record.medSentId;

        if (record.isAccepted === undefined) {
          return (
            <Space>
              <Button type="link" onClick={() => handleViewDetail(record.medSentId || record.id)}>
                Chi tiết
              </Button>
              <Popconfirm
                title="Xác nhận chấp nhận yêu cầu thuốc?"
                onConfirm={() => handleAccept(record.medSentId)}
                okText="Đồng ý"
                cancelText="Hủy"
                disabled={isProcessing}
              >
                <Button 
                  type="text" 
                  icon={<CheckOutlined />} 
                  style={{ color: '#52c41a' }} 
                  size="small"
                  loading={isProcessing && processingRequestId === record.medSentId}
                  disabled={isProcessing}
                />
              </Popconfirm>
              <Popconfirm
                title="Xác nhận từ chối yêu cầu thuốc?"
                onConfirm={() => handleReject(record.medSentId)}
                okText="Đồng ý"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                disabled={isProcessing}
              >
                <Button 
                  type="text" 
                  icon={<CloseOutlined />} 
                  style={{ color: '#f5222d' }} 
                  size="small"
                  loading={isProcessing && processingRequestId === record.medSentId}
                  disabled={isProcessing}
                />
              </Popconfirm>
            </Space>
          );
        }
        
        return (
          <Button type="link" onClick={() => handleViewDetail(record.medSentId || record.id)}>
            Chi tiết
          </Button>
        );
      },
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
  // const healthDeclarationColumns = [
  //   {
  //     title: 'Học sinh',
  //     dataIndex: 'studentName',
  //     key: 'studentName',
  //   },
  //   {
  //     title: 'Lớp',
  //     dataIndex: 'class',
  //     key: 'class',
  //   },
  //   {
  //     title: 'Triệu chứng',
  //     dataIndex: 'symptoms',
  //     key: 'symptoms',
  //     ellipsis: true,
  //   },
  //   {
  //     title: 'Trạng thái',
  //     dataIndex: 'status',
  //     key: 'status',
  //     render: (status) => renderStatus(status),
  //   },
  //   {
  //     title: 'Hành động',
  //     key: 'action',
  //     render: (_, record) => (
  //       <Button type="link" onClick={() => handleViewHealthDetail(record.id)}>
  //         Xem
  //       </Button>
  //     ),
  //   }
  // ];

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
  
  // Lấy ra 5 yêu cầu thuốc gần đây nhất, ưu tiên những yêu cầu đang chờ xử lý
  const recentMedicineRequests = medicineRequests
    .sort((a, b) => {
      // Ưu tiên yêu cầu chưa được xử lý (isAccepted === undefined)
      if (a.isAccepted === undefined && b.isAccepted !== undefined) return -1;
      if (a.isAccepted !== undefined && b.isAccepted === undefined) return 1;
      
      // Sau đó sắp xếp theo thời gian gửi mới nhất
      const dateA = a.sentAt ? (Array.isArray(a.sentAt) ? new Date(a.sentAt[0], a.sentAt[1] - 1, a.sentAt[2]) : new Date(a.sentAt)) : new Date(0);
      const dateB = b.sentAt ? (Array.isArray(b.sentAt) ? new Date(b.sentAt[0], b.sentAt[1] - 1, b.sentAt[2]) : new Date(b.sentAt)) : new Date(0);
      
      return dateB - dateA; // Sắp xếp giảm dần theo thời gian
    })
    .slice(0, 5);

  // const recentHealthDeclarations = healthDeclarations.slice(0, 3);
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