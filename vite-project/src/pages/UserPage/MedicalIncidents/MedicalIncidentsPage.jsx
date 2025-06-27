import React, { useState } from 'react';
import { Card, Typography, Table, Button, Tag, Modal, Timeline, Tabs, Descriptions, Badge, Row, Col } from 'antd';
import { MedicineBoxOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import './MedicalIncidentsPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const MedicalIncidentsPage = () => {
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  // Dữ liệu mẫu cho các sự kiện y tế đang xử lý
  const activeIncidentsData = [
    {
      key: '1',
      id: 'MI001',
      student: 'Nguyễn Văn An',
      class: '10A1',
      type: 'Bệnh',
      description: 'Sốt cao, ho',
      date: '05/07/2025',
      status: 'processing',
      severity: 'medium',
      details: {
        reportedBy: 'Giáo viên chủ nhiệm',
        location: 'Lớp học',
        initialSymptoms: 'Sốt 38.5°C, ho, mệt mỏi',
        initialTreatment: 'Đưa đến phòng y tế, cho uống thuốc hạ sốt',
        notes: 'Học sinh có tiền sử viêm phổi',
        timeline: [
          {
            time: '05/07/2025 08:30',
            action: 'Phát hiện triệu chứng',
            by: 'Giáo viên chủ nhiệm',
          },
          {
            time: '05/07/2025 08:45',
            action: 'Đưa đến phòng y tế',
            by: 'Nhân viên y tế',
          },
          {
            time: '05/07/2025 09:00',
            action: 'Liên hệ phụ huynh',
            by: 'Nhân viên y tế',
          },
          {
            time: '05/07/2025 09:30',
            action: 'Phụ huynh đến đón',
            by: 'Phụ huynh',
          },
        ],
      },
    },
    {
      key: '2',
      id: 'MI002',
      student: 'Nguyễn Thị Bình',
      class: '7B2',
      type: 'Chấn thương',
      description: 'Trẹo chân khi chơi thể thao',
      date: '10/07/2025',
      status: 'processing',
      severity: 'low',
      details: {
        reportedBy: 'Giáo viên thể dục',
        location: 'Sân thể thao',
        initialSymptoms: 'Đau và sưng nhẹ ở mắt cá chân phải',
        initialTreatment: 'Băng chườm đá, nẹp cố định',
        notes: 'Không có dấu hiệu gãy xương',
        timeline: [
          {
            time: '10/07/2025 14:15',
            action: 'Xảy ra chấn thương',
            by: 'Giáo viên thể dục',
          },
          {
            time: '10/07/2025 14:20',
            action: 'Sơ cứu ban đầu',
            by: 'Giáo viên thể dục',
          },
          {
            time: '10/07/2025 14:30',
            action: 'Đưa đến phòng y tế',
            by: 'Nhân viên y tế',
          },
          {
            time: '10/07/2025 14:45',
            action: 'Liên hệ phụ huynh',
            by: 'Nhân viên y tế',
          },
        ],
      },
    },
  ];

  // Dữ liệu mẫu cho lịch sử sự kiện y tế
  const historyIncidentsData = [
    {
      key: '1',
      id: 'MI003',
      student: 'Nguyễn Văn An',
      class: '10A1',
      type: 'Bệnh',
      description: 'Cảm cúm',
      date: '15/05/2025',
      status: 'completed',
      severity: 'low',
      details: {
        reportedBy: 'Phụ huynh',
        location: 'Nhà',
        initialSymptoms: 'Ho, sổ mũi, đau họng',
        initialTreatment: 'Nghỉ học, uống thuốc theo chỉ định bác sĩ',
        notes: 'Nghỉ học 3 ngày',
        timeline: [
          {
            time: '15/05/2025 07:30',
            action: 'Phụ huynh báo cáo',
            by: 'Phụ huynh',
          },
          {
            time: '15/05/2025 - 17/05/2025',
            action: 'Nghỉ học điều trị',
            by: 'Học sinh',
          },
          {
            time: '18/05/2025',
            action: 'Quay lại trường học',
            by: 'Học sinh',
          },
        ],
        resolution: 'Đã khỏi bệnh hoàn toàn',
      },
    },
    {
      key: '2',
      id: 'MI004',
      student: 'Nguyễn Thị Bình',
      class: '7B2',
      type: 'Dị ứng',
      description: 'Dị ứng thức ăn',
      date: '20/04/2025',
      status: 'completed',
      severity: 'medium',
      details: {
        reportedBy: 'Nhân viên căng tin',
        location: 'Căng tin trường',
        initialSymptoms: 'Phát ban, ngứa, khó thở nhẹ',
        initialTreatment: 'Dùng thuốc kháng histamine, theo dõi',
        notes: 'Học sinh có tiền sử dị ứng với hải sản',
        timeline: [
          {
            time: '20/04/2025 12:15',
            action: 'Xuất hiện triệu chứng',
            by: 'Học sinh',
          },
          {
            time: '20/04/2025 12:20',
            action: 'Đưa đến phòng y tế',
            by: 'Nhân viên căng tin',
          },
          {
            time: '20/04/2025 12:30',
            action: 'Sơ cứu và dùng thuốc',
            by: 'Nhân viên y tế',
          },
          {
            time: '20/04/2025 13:00',
            action: 'Liên hệ phụ huynh',
            by: 'Nhân viên y tế',
          },
          {
            time: '20/04/2025 13:30',
            action: 'Phụ huynh đến đón',
            by: 'Phụ huynh',
          },
        ],
        resolution: 'Triệu chứng dị ứng đã hết sau 24 giờ',
      },
    },
  ];

  // Cột cho bảng các sự kiện y tế đang xử lý
  const activeColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
    },
    {
      title: 'Lớp',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Loại sự kiện',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Ngày xảy ra',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        let color = 'green';
        let text = 'Nhẹ';
        
        if (severity === 'medium') {
          color = 'orange';
          text = 'Trung bình';
        } else if (severity === 'high') {
          color = 'red';
          text = 'Nghiêm trọng';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'processing';
        let text = 'Đang xử lý';
        let icon = <ClockCircleOutlined />;
        
        return <Badge status={color} text={text} />;
      },
    },
    {
      title: 'Chi tiết',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => showDetailModal(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Cột cho bảng lịch sử sự kiện y tế
  const historyColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
    },
    {
      title: 'Lớp',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Loại sự kiện',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Ngày xảy ra',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        let color = 'green';
        let text = 'Nhẹ';
        
        if (severity === 'medium') {
          color = 'orange';
          text = 'Trung bình';
        } else if (severity === 'high') {
          color = 'red';
          text = 'Nghiêm trọng';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'success';
        let text = 'Đã xử lý';
        
        return <Badge status={color} text={text} />;
      },
    },
    {
      title: 'Chi tiết',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => showDetailModal(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Hiển thị modal chi tiết sự kiện y tế
  const showDetailModal = (incident) => {
    setSelectedIncident(incident);
    setDetailModalVisible(true);
  };

  return (
    <div className="medical-incidents-page">
      <div className="medical-incidents-container">
        <Card className="medical-incidents-card">
          <Title level={2} className="medical-incidents-title">
            <MedicineBoxOutlined /> Quản lý sự kiện y tế
          </Title>
          <Paragraph className="medical-incidents-description">
            Theo dõi và quản lý các sự kiện y tế của học sinh như bệnh, chấn thương, dị ứng và các vấn đề sức khỏe khác.
          </Paragraph>

          <Tabs activeKey={activeTab} onChange={setActiveTab} className="medical-incidents-tabs">
            <TabPane tab="Sự kiện đang xử lý" key="active">
              <Table 
                columns={activeColumns} 
                dataSource={activeIncidentsData} 
                rowKey="key" 
              />
            </TabPane>
            <TabPane tab="Lịch sử sự kiện" key="history">
              <Table 
                columns={historyColumns} 
                dataSource={historyIncidentsData} 
                rowKey="key" 
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>

      {/* Modal chi tiết sự kiện y tế */}
      <Modal
        title={
          <span>
            <MedicineBoxOutlined /> Chi tiết sự kiện y tế
          </span>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="back" type="primary" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedIncident && (
          <div className="incident-detail">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Thông tin chung" className="detail-card">
                  <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="Mã sự kiện">{selectedIncident.id}</Descriptions.Item>
                    <Descriptions.Item label="Ngày xảy ra">{selectedIncident.date}</Descriptions.Item>
                    <Descriptions.Item label="Học sinh">{selectedIncident.student}</Descriptions.Item>
                    <Descriptions.Item label="Lớp">{selectedIncident.class}</Descriptions.Item>
                    <Descriptions.Item label="Loại sự kiện">{selectedIncident.type}</Descriptions.Item>
                    <Descriptions.Item label="Mức độ">
                      {selectedIncident.severity === 'low' && <Tag color="green">Nhẹ</Tag>}
                      {selectedIncident.severity === 'medium' && <Tag color="orange">Trung bình</Tag>}
                      {selectedIncident.severity === 'high' && <Tag color="red">Nghiêm trọng</Tag>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      {selectedIncident.status === 'processing' && <Badge status="processing" text="Đang xử lý" />}
                      {selectedIncident.status === 'completed' && <Badge status="success" text="Đã xử lý" />}
                    </Descriptions.Item>
                    <Descriptions.Item label="Người báo cáo">{selectedIncident.details.reportedBy}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Chi tiết sự kiện" className="detail-card">
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="Địa điểm xảy ra">{selectedIncident.details.location}</Descriptions.Item>
                    <Descriptions.Item label="Triệu chứng ban đầu">{selectedIncident.details.initialSymptoms}</Descriptions.Item>
                    <Descriptions.Item label="Xử lý ban đầu">{selectedIncident.details.initialTreatment}</Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">{selectedIncident.details.notes}</Descriptions.Item>
                    {selectedIncident.details.resolution && (
                      <Descriptions.Item label="Kết quả xử lý">{selectedIncident.details.resolution}</Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Tiến trình xử lý" className="detail-card">
                  <Timeline>
                    {selectedIncident.details.timeline.map((item, index) => (
                      <Timeline.Item key={index}>
                        <p><strong>{item.time}</strong>: {item.action}</p>
                        <p>Người thực hiện: {item.by}</p>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalIncidentsPage; 