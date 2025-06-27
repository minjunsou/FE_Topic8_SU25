import React, { useState } from 'react';
import { Card, Typography, Table, Button, Tag, Modal, Form, Select, Radio, Divider, message, Tabs, Row, Col, Alert } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import './HealthCheckPage.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const HealthCheckPage = () => {
  const [form] = Form.useForm();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedHealthCheck, setSelectedHealthCheck] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Danh sách học sinh của phụ huynh
  const studentList = [
    { id: 1, name: 'Nguyễn Văn An', class: '10A1' },
    { id: 2, name: 'Nguyễn Thị Bình', class: '7B2' },
  ];

  // Dữ liệu mẫu cho các đợt kiểm tra sức khỏe sắp tới
  const upcomingHealthChecksData = [
    {
      key: '1',
      id: 'HC001',
      name: 'Kiểm tra sức khỏe định kỳ học kỳ 1',
      date: '10/09/2025',
      location: 'Phòng y tế trường',
      status: 'pending',
      description: 'Kiểm tra sức khỏe tổng quát, đo chiều cao, cân nặng, thị lực, và khám răng miệng',
      deadline: '05/09/2025',
    },
    {
      key: '2',
      id: 'HC002',
      name: 'Kiểm tra sức khỏe chuyên khoa mắt',
      date: '15/10/2025',
      location: 'Phòng y tế trường',
      status: 'pending',
      description: 'Kiểm tra thị lực và sức khỏe mắt cho học sinh các lớp 6-12',
      deadline: '10/10/2025',
    },
  ];

  // Dữ liệu mẫu cho lịch sử kiểm tra sức khỏe
  const healthCheckHistoryData = [
    {
      key: '1',
      id: 'HC001',
      name: 'Kiểm tra sức khỏe định kỳ học kỳ 2',
      date: '15/02/2025',
      location: 'Phòng y tế trường',
      status: 'completed',
      student: 'Nguyễn Văn An',
      result: {
        height: 165,
        weight: 55,
        bmi: 20.2,
        bmiStatus: 'Bình thường',
        leftEye: '10/10',
        rightEye: '10/10',
        bloodPressure: '110/70',
        dentalStatus: 'Tốt',
        generalHealth: 'Tốt',
        recommendations: 'Không có khuyến nghị đặc biệt'
      }
    },
    {
      key: '2',
      id: 'HC002',
      name: 'Kiểm tra sức khỏe răng miệng',
      date: '20/03/2025',
      location: 'Phòng y tế trường',
      status: 'completed',
      student: 'Nguyễn Văn An',
      result: {
        dentalStatus: 'Cần điều trị sâu răng nhẹ',
        recommendations: 'Nên đến nha sĩ để điều trị sâu răng ở răng hàm dưới bên phải'
      }
    },
    {
      key: '3',
      id: 'HC003',
      name: 'Kiểm tra sức khỏe định kỳ học kỳ 2',
      date: '15/02/2025',
      location: 'Phòng y tế trường',
      status: 'completed',
      student: 'Nguyễn Thị Bình',
      result: {
        height: 155,
        weight: 45,
        bmi: 18.7,
        bmiStatus: 'Bình thường',
        leftEye: '8/10',
        rightEye: '9/10',
        bloodPressure: '100/65',
        dentalStatus: 'Tốt',
        generalHealth: 'Tốt',
        recommendations: 'Nên kiểm tra thị lực định kỳ'
      }
    },
  ];

  // Cột cho bảng các đợt kiểm tra sức khỏe sắp tới
  const upcomingColumns = [
    {
      title: 'Tên đợt kiểm tra',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ngày kiểm tra',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Hạn xác nhận',
      dataIndex: 'deadline',
      key: 'deadline',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let text = 'Chưa xác nhận';
        let icon = <ClockCircleOutlined />;
        
        if (status === 'confirmed') {
          color = 'green';
          text = 'Đã xác nhận';
          icon = <CheckCircleOutlined />;
        } else if (status === 'declined') {
          color = 'red';
          text = 'Đã từ chối';
          icon = <ExclamationCircleOutlined />;
        }
        
        return <Tag icon={icon} color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => showConfirmModal(record)}
          disabled={record.status === 'confirmed' || record.status === 'declined'}
        >
          Xác nhận tham gia
        </Button>
      ),
    },
  ];

  // Cột cho bảng lịch sử kiểm tra sức khỏe
  const historyColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
    },
    {
      title: 'Tên đợt kiểm tra',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ngày kiểm tra',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let text = 'Đã hoàn thành';
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Kết quả',
      key: 'result',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => showDetailModal(record)}
        >
          Xem kết quả
        </Button>
      ),
    },
  ];

  // Hiển thị modal xác nhận tham gia kiểm tra sức khỏe
  const showConfirmModal = (healthCheck) => {
    setSelectedHealthCheck(healthCheck);
    setConfirmModalVisible(true);
    form.resetFields();
  };

  // Hiển thị modal chi tiết kết quả kiểm tra sức khỏe
  const showDetailModal = (record) => {
    setSelectedResult(record);
    setDetailModalVisible(true);
  };

  // Xử lý khi xác nhận tham gia kiểm tra sức khỏe
  const handleConfirm = () => {
    form.validateFields()
      .then(values => {
        setLoading(true);
        
        // Giả lập gửi dữ liệu
        setTimeout(() => {
          console.log('Form values:', values);
          console.log('Selected health check:', selectedHealthCheck);
          
          message.success('Đã xác nhận tham gia kiểm tra sức khỏe thành công!');
          setConfirmModalVisible(false);
          setLoading(false);
          
          // Cập nhật trạng thái của đợt kiểm tra sức khỏe
          const updatedData = upcomingHealthChecksData.map(item => {
            if (item.key === selectedHealthCheck.key) {
              return { ...item, status: values.confirmStatus === 'yes' ? 'confirmed' : 'declined' };
            }
            return item;
          });
          
          // Trong thực tế, bạn sẽ cần cập nhật state hoặc gọi API để cập nhật dữ liệu
          // setUpcomingHealthChecksData(updatedData);
        }, 1000);
      })
      .catch(info => {
        console.log('Validate failed:', info);
      });
  };

  return (
    <div className="health-check-page">
      <div className="health-check-container">
        <Card className="health-check-card">
          <Title level={2} className="health-check-title">
            <MedicineBoxOutlined /> Quản lý kiểm tra sức khỏe
          </Title>
          <Paragraph className="health-check-description">
            Quản lý thông tin kiểm tra sức khỏe của học sinh, xác nhận tham gia các đợt kiểm tra sắp tới và xem kết quả kiểm tra.
          </Paragraph>

          <Tabs activeKey={activeTab} onChange={setActiveTab} className="health-check-tabs">
            <TabPane tab="Đợt kiểm tra sắp tới" key="upcoming">
              <Table 
                columns={upcomingColumns} 
                dataSource={upcomingHealthChecksData} 
                rowKey="key"
                expandable={{
                  expandedRowRender: (record) => (
                    <p style={{ margin: 0 }}>
                      <strong>Mô tả:</strong> {record.description}
                    </p>
                  ),
                }}
              />
            </TabPane>
            <TabPane tab="Lịch sử kiểm tra" key="history">
              <Table 
                columns={historyColumns} 
                dataSource={healthCheckHistoryData} 
                rowKey="key" 
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>

      {/* Modal xác nhận tham gia kiểm tra sức khỏe */}
      <Modal
        title="Xác nhận tham gia kiểm tra sức khỏe"
        open={confirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setConfirmModalVisible(false)}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading} 
            onClick={handleConfirm}
          >
            Xác nhận
          </Button>,
        ]}
      >
        {selectedHealthCheck && (
          <>
            <div className="health-check-info">
              <Title level={5}>Thông tin đợt kiểm tra sức khỏe</Title>
              <p><strong>Tên:</strong> {selectedHealthCheck.name}</p>
              <p><strong>Ngày kiểm tra:</strong> {selectedHealthCheck.date}</p>
              <p><strong>Địa điểm:</strong> {selectedHealthCheck.location}</p>
              <p><strong>Mô tả:</strong> {selectedHealthCheck.description}</p>
            </div>

            <Divider />

            <Form form={form} layout="vertical">
              <Form.Item
                name="studentId"
                label="Chọn học sinh tham gia"
                rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
              >
                <Select placeholder="Chọn học sinh">
                  {studentList.map(student => (
                    <Option key={student.id} value={student.id}>
                      {student.name} - Lớp {student.class}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="confirmStatus"
                label="Xác nhận tham gia"
                rules={[{ required: true, message: 'Vui lòng chọn xác nhận!' }]}
              >
                <Radio.Group>
                  <Radio value="yes">Đồng ý cho con tham gia kiểm tra sức khỏe</Radio>
                  <Radio value="no">Không đồng ý cho con tham gia kiểm tra sức khỏe</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="note"
                label="Ghi chú (nếu có)"
              >
                <Select placeholder="Chọn lý do (nếu không đồng ý)">
                  <Option value="sick">Con tôi đang bị bệnh</Option>
                  <Option value="absent">Con tôi sẽ vắng mặt vào ngày kiểm tra</Option>
                  <Option value="checked">Con tôi đã được kiểm tra sức khỏe gần đây</Option>
                  <Option value="other">Lý do khác</Option>
                </Select>
              </Form.Item>

              <Alert
                message="Lưu ý"
                description="Việc kiểm tra sức khỏe định kỳ rất quan trọng để đảm bảo sức khỏe của học sinh. Nếu không thể tham gia vào ngày đã định, vui lòng liên hệ với nhà trường để sắp xếp lịch kiểm tra bổ sung."
                type="info"
                showIcon
              />
            </Form>
          </>
        )}
      </Modal>

      {/* Modal chi tiết kết quả kiểm tra sức khỏe */}
      <Modal
        title="Kết quả kiểm tra sức khỏe"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="back" type="primary" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedResult && (
          <div className="health-check-result">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Thông tin chung" className="result-card">
                  <p><strong>Học sinh:</strong> {selectedResult.student}</p>
                  <p><strong>Tên đợt kiểm tra:</strong> {selectedResult.name}</p>
                  <p><strong>Ngày kiểm tra:</strong> {selectedResult.date}</p>
                  <p><strong>Địa điểm:</strong> {selectedResult.location}</p>
                </Card>
              </Col>

              {selectedResult.result.height && (
                <Col xs={24} sm={12}>
                  <Card title="Chỉ số cơ thể" className="result-card">
                    <p><strong>Chiều cao:</strong> {selectedResult.result.height} cm</p>
                    <p><strong>Cân nặng:</strong> {selectedResult.result.weight} kg</p>
                    <p><strong>BMI:</strong> {selectedResult.result.bmi}</p>
                    <p><strong>Đánh giá BMI:</strong> {selectedResult.result.bmiStatus}</p>
                  </Card>
                </Col>
              )}

              {selectedResult.result.leftEye && (
                <Col xs={24} sm={12}>
                  <Card title="Thị lực" className="result-card">
                    <p><strong>Mắt trái:</strong> {selectedResult.result.leftEye}</p>
                    <p><strong>Mắt phải:</strong> {selectedResult.result.rightEye}</p>
                  </Card>
                </Col>
              )}

              {selectedResult.result.dentalStatus && (
                <Col xs={24} sm={12}>
                  <Card title="Răng miệng" className="result-card">
                    <p><strong>Tình trạng:</strong> {selectedResult.result.dentalStatus}</p>
                  </Card>
                </Col>
              )}

              {selectedResult.result.bloodPressure && (
                <Col xs={24} sm={12}>
                  <Card title="Huyết áp" className="result-card">
                    <p><strong>Huyết áp:</strong> {selectedResult.result.bloodPressure} mmHg</p>
                  </Card>
                </Col>
              )}

              <Col span={24}>
                <Card title="Đánh giá chung và khuyến nghị" className="result-card">
                  <p><strong>Sức khỏe tổng quát:</strong> {selectedResult.result.generalHealth || 'Không có thông tin'}</p>
                  <p><strong>Khuyến nghị:</strong> {selectedResult.result.recommendations || 'Không có khuyến nghị'}</p>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HealthCheckPage; 