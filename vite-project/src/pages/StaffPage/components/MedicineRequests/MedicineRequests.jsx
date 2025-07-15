import React, { useState, useEffect } from 'react';
import { Table, Button, Tooltip, Space, Tag, Typography, Spin, Empty, Modal, Row, Col, Divider, Card } from 'antd';
import { CalendarOutlined, MedicineBoxOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import './MedicineRequests.css';
import nurseApi from '../../../../api/nurseApi';

const { Text, Title } = Typography;

const MedicineRequests = ({ medicineRequests, handleViewDetail, loading }) => {
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingParents, setLoadingParents] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch student and parent data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const studentsData = await nurseApi.getAllStudents();
        console.log('Students loaded:', studentsData);
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoadingStudents(false);
      }
    };

    const fetchParents = async () => {
      try {
        setLoadingParents(true);
        const parentsData = await nurseApi.getAllParents();
        console.log('Parents loaded:', parentsData);
        setParents(parentsData);
      } catch (error) {
        console.error('Error fetching parents:', error);
      } finally {
        setLoadingParents(false);
      }
    };

    fetchStudents();
    fetchParents();
  }, []);

  // Helper function to find student name by ID
  const getStudentName = (studentId) => {
    if (!studentId) return 'Không có thông tin';
    
    const student = students.find(s => s.accountId === studentId);
    if (student) {
      return student.fullName;
    }
    
    // Fallback: display partial ID
    return `ID: ${studentId.substring(0, 8)}...`;
  };

  // Helper function to find parent name by ID
  const getParentName = (parentId) => {
    if (!parentId) return 'Không có thông tin';
    
    const parent = parents.find(p => p.accountId === parentId);
    if (parent) {
      return parent.fullName;
    }
    
    // Fallback: display partial ID
    return `ID: ${parentId.substring(0, 8)}...`;
  };

  // Hàm định dạng ngày
  const formatDate = (dateArray) => {
    if (!dateArray) return "Chưa xác định";
    
    try {
      // Check if date is an array [year, month, day]
      if (Array.isArray(dateArray)) {
        return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`;
      }
      
      // For string dates
      const date = new Date(dateArray);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Lỗi khi định dạng ngày:', error);
      return "Không xác định";
    }
  };

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

  // Hàm mở modal chi tiết
  const showDetailModal = (record) => {
    const enrichedRecord = {
      ...record,
      studentName: getStudentName(record.studentId),
      parentName: getParentName(record.parentId),
      formattedRequestDate: formatDate(record.requestDate),
      formattedSentDate: formatDate(record.sentAt),
      formattedDosages: record.dosages ? record.dosages.map(dosage => ({
        ...dosage,
        timingText: getTimingText(dosage.timingNotes)
      })) : []
    };
    
    setSelectedRequest(enrichedRecord);
    setDetailModalVisible(true);
    
    // Cũng gọi hàm handleViewDetail nếu cần thiết
    if (handleViewDetail) {
      handleViewDetail(enrichedRecord);
    }
  };

  // Cấu hình cột cho bảng yêu cầu thuốc
  const medicineRequestColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentId',
      key: 'studentId',
      width: '20%',
      render: (studentId) => (
        <Tooltip title={studentId}>
          <span>{getStudentName(studentId)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Phụ huynh',
      dataIndex: 'parentId',
      key: 'parentId',
      width: '20%',
      render: (parentId) => (
        <Tooltip title={parentId}>
          <Tag icon={<UserOutlined />} color="blue">
            {getParentName(parentId)}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Thuốc và liều lượng',
      key: 'medications',
      width: '30%',
      render: (_, record) => {
        // Kiểm tra nếu có dosages
        if (!record.dosages || record.dosages.length === 0) {
          return <Text type="secondary">Không có thông tin thuốc</Text>;
        }

        return (
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            {record.dosages.map((dosage, dIndex) => (
              <div key={`dosage-${dIndex}`} className="dosage-item">
                <Text strong>{getTimingText(dosage.timingNotes)}</Text>
                <div className="medication-list">
                  {dosage.medicationItems && dosage.medicationItems.length > 0 ? (
                    <ul style={{ marginTop: 4, marginBottom: 0, paddingLeft: 20 }}>
                      {dosage.medicationItems.map((med, mIndex) => (
                        <li key={`med-${dIndex}-${mIndex}`}>
                          {med.medicationName} - {med.amount} viên
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Text type="secondary">Không có thuốc</Text>
                  )}
                </div>
              </div>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Thời gian',
      key: 'timeInfo',
      width: '15%',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            <CalendarOutlined />
            <span>Yêu cầu: {formatDate(record.requestDate)}</span>
          </Space>
          <Space>
            <ClockCircleOutlined />
            <span>Gửi: {formatDate(record.sentAt)}</span>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<MedicineBoxOutlined />}
          size="small" 
          onClick={() => showDetailModal(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Check if data is still loading
  const isLoading = loading || loadingStudents || loadingParents;
  const hasData = Array.isArray(medicineRequests) && medicineRequests.length > 0;

  return (
    <div className="medicine-requests">
      <div className="staff-table-container">
        {isLoading ? (
          <div className="loading-container">
            <Spin size="large" />
            <p>Đang tải dữ liệu yêu cầu thuốc...</p>
          </div>
        ) : !hasData ? (
          <Empty 
            description="Không có yêu cầu thuốc nào" 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            className="empty-container"
          />
        ) : (
          <Table 
            columns={medicineRequestColumns} 
            dataSource={medicineRequests} 
            rowKey={record => record.medSentId || record.key}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Tổng số ${total} yêu cầu`
            }}
          />
        )}
      </div>

      {/* Modal hiển thị chi tiết yêu cầu thuốc */}
      <Modal
        title={
          <div className="modal-title">
            <MedicineBoxOutlined className="modal-icon" /> 
            <span>Chi tiết yêu cầu thuốc</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
        className="medication-detail-modal"
      >
        {selectedRequest && (
          <div className="medication-detail-content">
            <Card className="detail-card">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={4}>Thông tin chung</Title>
                </Col>
                
                <Col xs={24} md={12}>
                  <div className="detail-item">
                    <Text strong>Học sinh:</Text>
                    <Text>{selectedRequest.studentName}</Text>
                  </div>
                  
                  <div className="detail-item">
                    <Text strong>Phụ huynh:</Text>
                    <Text>{selectedRequest.parentName}</Text>
                  </div>
                </Col>
                
                <Col xs={24} md={12}>
                  <div className="detail-item">
                    <Text strong>Ngày yêu cầu:</Text>
                    <Text>{selectedRequest.formattedRequestDate}</Text>
                  </div>
                  
                  <div className="detail-item">
                    <Text strong>Ngày gửi:</Text>
                    <Text>{selectedRequest.formattedSentDate}</Text>
                  </div>
                </Col>
                
                <Col span={24}>
                  <Divider />
                  <Title level={4}>Thông tin thuốc</Title>
                  
                  {selectedRequest.formattedDosages && selectedRequest.formattedDosages.length > 0 ? (
                    <div className="medication-timing-container">
                      {selectedRequest.formattedDosages.map((dosage, index) => (
                        <div key={`dosage-${index}`} className="medication-timing-card">
                          <div className="timing-header">
                            <MedicineBoxOutlined className="timing-icon" />
                            <span className="timing-title">{dosage.timingText}</span>
                          </div>
                          
                          {dosage.medicationItems && dosage.medicationItems.length > 0 ? (
                            <div className="medication-items-container">
                              {dosage.medicationItems.map((med, medIndex) => (
                                <div key={`med-${index}-${medIndex}`} className="medication-item">
                                  <div className="medication-name">{med.medicationName}</div>
                                  <div className="medication-amount">{med.amount} viên</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="no-medication">
                              <Text type="secondary">Không có thuốc</Text>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty description="Không có thông tin thuốc" />
                  )}
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicineRequests; 