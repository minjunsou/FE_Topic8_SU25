import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Tabs, Modal, Form, Input, DatePicker, Select, message, Typography, Row, Col, List, Card, Tag, Tooltip } from 'antd';
import { PlusOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined, EditOutlined } from '@ant-design/icons';
import './HealthDeclarations.css';
import moment from 'moment';
import nurseApi from '../../../../api/nurseApi';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const HealthChecks = () => {
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState([]);
  const [confirmations, setConfirmations] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [students, setStudents] = useState([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [confirmationsModalVisible, setConfirmationsModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form] = Form.useForm();
  const [resultForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');

  // Fetch data on component mount
  useEffect(() => {
    fetchNotices();
    fetchStudents();
  }, []);

  // Fetch health check notices
  const fetchNotices = async () => {
    setLoading(true);
    try {
      const response = await nurseApi.getAllHealthCheckNotices();
      setNotices(response.map(notice => ({
        ...notice,
        key: notice.id
      })));
    } catch (error) {
      console.error('Error fetching health check notices:', error);
      message.error('Không thể lấy danh sách thông báo kiểm tra sức khỏe');
    } finally {
      setLoading(false);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      const response = await nurseApi.getAllStudents();
      setStudents(response.map(student => ({
        ...student,
        key: student.accountId
      })));
    } catch (error) {
      console.error('Error fetching students:', error);
      message.error('Không thể lấy danh sách học sinh');
    }
  };

  // Fetch confirmations for a specific notice
  const fetchConfirmations = async (noticeId) => {
    setLoading(true);
    try {
      const response = await nurseApi.getHealthCheckConfirmations(noticeId);
      setConfirmations(response.map(confirmation => ({
        ...confirmation,
        key: confirmation.id,
        studentName: students.find(s => s.accountId === confirmation.studentId)?.fullName || 'Không xác định',
        className: students.find(s => s.accountId === confirmation.studentId)?.classId || 'Không xác định'
      })));
    } catch (error) {
      console.error(`Error fetching confirmations for notice ${noticeId}:`, error);
      message.error('Không thể lấy danh sách xác nhận kiểm tra sức khỏe');
    } finally {
      setLoading(false);
    }
  };

  // Handle creating a new health check notice
  const handleCreateNotice = async (values) => {
    setLoading(true);
    try {
      const healthCheckData = {
        title: values.title,
        description: values.description,
        date: values.date.format('YYYY-MM-DD'),
        created_at: moment().format('YYYY-MM-DD')
      };

      await nurseApi.createHealthCheckNotice(healthCheckData);
      message.success('Tạo thông báo kiểm tra sức khỏe thành công');
      setCreateModalVisible(false);
      form.resetFields();
      fetchNotices();
    } catch (error) {
      console.error('Error creating health check notice:', error);
      message.error('Không thể tạo thông báo kiểm tra sức khỏe');
    } finally {
      setLoading(false);
    }
  };

  // Handle view confirmations
  const handleViewConfirmations = (notice) => {
    setSelectedNotice(notice);
    fetchConfirmations(notice.id);
    setConfirmationsModalVisible(true);
  };

  // Handle submitting health check result
  const handleSubmitResult = async (values) => {
    setLoading(true);
    try {
      const healthCheckResult = {
        studentId: selectedStudent.studentId,
        nurseId: localStorage.getItem('userId'), // Assuming nurseId is stored in localStorage
        checkNoticeId: selectedNotice.id,
        results: values.results,
        date: moment().format('YYYY-MM-DD')
      };

      await nurseApi.submitHealthCheckResult(healthCheckResult);
      message.success('Cập nhật kết quả kiểm tra sức khỏe thành công');
      setResultModalVisible(false);
      resultForm.resetFields();
    } catch (error) {
      console.error('Error submitting health check result:', error);
      message.error('Không thể cập nhật kết quả kiểm tra sức khỏe');
    } finally {
      setLoading(false);
    }
  };

  // Handle recording a result for a student
  const handleRecordResult = (student) => {
    setSelectedStudent(student);
    setResultModalVisible(true);
  };

  // Columns for notices table
  const noticesColumns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Ngày kiểm tra',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => handleViewConfirmations(record)}
        >
          Xem xác nhận
        </Button>
      ),
    },
  ];

  // Columns for confirmations table
  const confirmationsColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let text = '';
        let icon = null;
        
        switch (status) {
          case 'CONFIRMED':
            color = 'green';
            text = 'Đã xác nhận';
            icon = <CheckCircleOutlined />;
            break;
          case 'DECLINED':
            color = 'red';
            text = 'Đã từ chối';
            icon = <CloseCircleOutlined />;
            break;
          case 'PENDING':
            color = 'gold';
            text = 'Chưa xác nhận';
            icon = <QuestionCircleOutlined />;
            break;
          default:
            color = 'default';
            text = status;
        }
        
        return <Tag icon={icon} color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Ngày xác nhận',
      dataIndex: 'confirmed_at',
      key: 'confirmed_at',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => handleRecordResult(record)}
          disabled={record.status !== 'CONFIRMED'}
        >
          Nhập kết quả
        </Button>
      ),
    },
  ];

  return (
    <div className="health-checks">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Quản lý kiểm tra sức khỏe" key="1">
          <div className="staff-table-header">
            <Title level={4}>Danh sách thông báo kiểm tra sức khỏe</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setCreateModalVisible(true)}
            >
              Tạo thông báo mới
            </Button>
          </div>

          <Table 
            columns={noticesColumns} 
            dataSource={notices} 
            loading={loading}
                                                     pagination={{ pageSize: 5 }}
          />
        </TabPane>
      </Tabs>

      {/* Modal tạo thông báo kiểm tra sức khỏe mới */}
      <Modal
        title="Tạo thông báo kiểm tra sức khỏe mới"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateNotice}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tiêu đề thông báo" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả chi tiết về đợt kiểm tra sức khỏe" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày kiểm tra"
            rules={[{ required: true, message: 'Vui lòng chọn ngày kiểm tra!' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày kiểm tra" />
          </Form.Item>

          <Form.Item>
            <Row justify="end" gutter={8}>
              <Col>
                <Button onClick={() => setCreateModalVisible(false)}>
                  Hủy
                </Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Tạo thông báo
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem xác nhận kiểm tra sức khỏe */}
      <Modal
        title={`Danh sách xác nhận - ${selectedNotice?.title || ''}`}
        open={confirmationsModalVisible}
        onCancel={() => setConfirmationsModalVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setConfirmationsModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        <Table 
          columns={confirmationsColumns} 
          dataSource={confirmations} 
          loading={loading}
                                                 pagination={{ pageSize: 10 }}
        />
      </Modal>

      {/* Modal nhập kết quả kiểm tra sức khỏe */}
      <Modal
        title={`Nhập kết quả kiểm tra sức khỏe - ${selectedStudent?.studentName || ''}`}
        open={resultModalVisible}
        onCancel={() => setResultModalVisible(false)}
        footer={null}
      >
        <Form
          form={resultForm}
          layout="vertical"
          onFinish={handleSubmitResult}
        >
          <Form.Item
            name="height"
            label="Chiều cao (cm)"
            rules={[{ required: true, message: 'Vui lòng nhập chiều cao!' }]}
          >
            <Input type="number" placeholder="Nhập chiều cao (cm)" />
          </Form.Item>

          <Form.Item
            name="weight"
            label="Cân nặng (kg)"
            rules={[{ required: true, message: 'Vui lòng nhập cân nặng!' }]}
          >
            <Input type="number" placeholder="Nhập cân nặng (kg)" />
          </Form.Item>

          <Form.Item
            name="leftEye"
            label="Thị lực mắt trái"
            rules={[{ required: true, message: 'Vui lòng nhập thị lực mắt trái!' }]}
          >
            <Input placeholder="Nhập thị lực mắt trái (vd: 10/10)" />
          </Form.Item>

          <Form.Item
            name="rightEye"
            label="Thị lực mắt phải"
            rules={[{ required: true, message: 'Vui lòng nhập thị lực mắt phải!' }]}
          >
            <Input placeholder="Nhập thị lực mắt phải (vd: 10/10)" />
          </Form.Item>

          <Form.Item
            name="bloodPressure"
            label="Huyết áp"
            rules={[{ required: true, message: 'Vui lòng nhập huyết áp!' }]}
          >
            <Input placeholder="Nhập huyết áp (vd: 120/80)" />
          </Form.Item>

          <Form.Item
            name="dentalStatus"
            label="Tình trạng răng miệng"
            rules={[{ required: true, message: 'Vui lòng chọn tình trạng răng miệng!' }]}
          >
            <Select placeholder="Chọn tình trạng răng miệng">
              <Option value="Tốt">Tốt</Option>
              <Option value="Sâu răng nhẹ">Sâu răng nhẹ</Option>
              <Option value="Sâu răng nặng">Sâu răng nặng</Option>
              <Option value="Cần điều trị">Cần điều trị</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="generalHealth"
            label="Tình trạng sức khỏe tổng quát"
            rules={[{ required: true, message: 'Vui lòng chọn tình trạng sức khỏe tổng quát!' }]}
          >
            <Select placeholder="Chọn tình trạng sức khỏe tổng quát">
              <Option value="Tốt">Tốt</Option>
              <Option value="Trung bình">Trung bình</Option>
              <Option value="Cần theo dõi">Cần theo dõi</Option>
              <Option value="Cần điều trị">Cần điều trị</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="results"
            label="Kết quả tổng quát"
            rules={[{ required: true, message: 'Vui lòng nhập kết quả tổng quát!' }]}
          >
            <Select placeholder="Chọn kết quả tổng quát">
              <Option value="HEALTHY">Khỏe mạnh</Option>
              <Option value="NEEDS_ATTENTION">Cần theo dõi</Option>
              <Option value="NEEDS_TREATMENT">Cần điều trị</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="recommendations"
            label="Khuyến nghị"
          >
            <TextArea rows={4} placeholder="Nhập khuyến nghị cho học sinh" />
          </Form.Item>

          <Form.Item>
            <Row justify="end" gutter={8}>
              <Col>
                <Button onClick={() => setResultModalVisible(false)}>
                  Hủy
                </Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Lưu kết quả
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthChecks; 