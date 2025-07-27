import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Input, 
  Badge, 
  Tag, 
  Select,
  Drawer,
  Typography,
  Row,
  Col,
  Tabs,
  Modal, 
  Form,
  Empty,
  message,
  DatePicker,
  Spin,
  Popconfirm,
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  AlertOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import moment from 'moment';
import nurseApi from '../../../../api/nurseApi';
import HealthEventStatistics from './HealthEventStatistics';
import './MedicalIncidents.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const MedicalIncidents = () => {
  const [healthEvents, setHealthEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [form] = Form.useForm();
  const [isEdit, setIsEdit] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  // Fetch data on component mount
  useEffect(() => {
    fetchHealthEvents();
    fetchStudents();
  }, []);

  // Fetch health events from API
  const fetchHealthEvents = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const nurseId = userInfo.accountId;
      
      let events;
      if (nurseId) {
        events = await nurseApi.getHealthEventsByNurse(nurseId);
      } else {
        events = await nurseApi.getAllHealthEvents();
      }
      
      // Ensure events is an array and add key for table
      const formattedEvents = Array.isArray(events) ? events.map(event => ({
        ...event,
        key: event.eventId?.toString() || Math.random().toString(),
        // Map backend fields to frontend display fields
        id: event.eventId,
        studentName: event.studentName || 'Không xác định',
        class: event.student?.classId || 'Không xác định',
        incidentDate: event.eventDate,
        incidentType: event.eventType,
        description: event.description,
        solution: event.solution,
        note: event.note,
        status: event.status || 'new',
        severity: event.priority?.toLowerCase() || 'medium',
        priority: event.priority,
        parentApprovalStatus: event.parentApprovalStatus,
        requiresHomeCare: event.requiresHomeCare,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      })) : [];
      
      setHealthEvents(formattedEvents);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sự cố y tế:', error);
      message.error('Không thể tải danh sách sự cố y tế');
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for form
  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const studentsData = await nurseApi.getAllStudents();
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách học sinh:', error);
      message.error('Không thể tải danh sách học sinh');
    } finally {
      setStudentsLoading(false);
    }
  };

  // Filter data based on search and filters
  const filteredData = healthEvents.filter(item => {
    const matchSearch = 
      item.studentName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.class?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.incidentType?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchPriority = filterPriority === 'all' || item.priority === filterPriority;
    
    return matchSearch && matchStatus && matchPriority;
  });

  // Render status badge
  const renderStatus = (status) => {
    const statusConfig = {
      new: { color: 'gold', text: 'Mới' },
      processing: { color: 'blue', text: 'Đang xử lý' },
      closed: { color: 'green', text: 'Đã đóng' },
      pending: { color: 'orange', text: 'Chờ phê duyệt' },
      approved: { color: 'green', text: 'Đã phê duyệt' },
      rejected: { color: 'red', text: 'Đã từ chối' }
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Badge color={config.color} text={config.text} />;
  };

  // Render priority tag
  const renderPriority = (priority) => {
    const priorityConfig = {
      LOW: { color: 'blue', text: 'Thấp' },
      MEDIUM: { color: 'orange', text: 'Trung bình' },
      HIGH: { color: 'red', text: 'Cao' },
      CRITICAL: { color: 'red', text: 'Khẩn cấp' }
    };

    const config = priorityConfig[priority] || { color: 'default', text: priority };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Format date for display
  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    try {
      let parsedDate;
      if (Array.isArray(dateInput) && dateInput.length === 3) {
        const [year, month, day] = dateInput;
        parsedDate = moment([year, month - 1, day]);
      } else if (typeof dateInput === 'string') {
        parsedDate = moment(dateInput);
      } else {
        parsedDate = moment(dateInput);
      }
      return parsedDate.isValid() ? parsedDate.format('DD/MM/YYYY') : 'N/A';
    } catch (error) {
      console.error('Error parsing date:', dateInput, error);
      return 'N/A';
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>
          {text}
        </a>
      ),
    },
    {
      title: 'Lớp',
      dataIndex: 'class',
      key: 'class',
      width: 100,
    },
    {
      title: 'Ngày xảy ra',
      dataIndex: 'incidentDate',
      key: 'incidentDate',
      width: 130,
      render: (date) => formatDate(date),
    },
    {
      title: 'Loại sự cố',
      dataIndex: 'incidentType',
      key: 'incidentType',
    },
    {
      title: 'Mức độ',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => renderPriority(priority),
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatus(status),
      width: 150,
    },
    {
      title: 'Phê duyệt',
      dataIndex: 'parentApprovalStatus',
      key: 'parentApprovalStatus',
      render: (status) => renderStatus(status?.toLowerCase()),
      width: 120,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary" 
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="default" 
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa sự cố này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button 
                type="default" 
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Handle view detail
  const handleViewDetail = (record) => {
    setSelectedEvent(record);
    setDrawerVisible(true);
  };

  // Handle edit
  const handleEdit = (record) => {
    setSelectedEvent(record);
    setIsEdit(true);
    form.setFieldsValue({
      studentId: record.student?.accountId,
      eventDate: record.incidentDate ? moment(record.incidentDate) : null,
      eventType: record.incidentType,
      description: record.description,
      solution: record.solution,
      note: record.note,
      status: record.status,
      priority: record.priority,
      requiresHomeCare: record.requiresHomeCare
    });
    setModalVisible(true);
  };

  // Handle delete
  const handleDelete = async (eventId) => {
    try {
      await nurseApi.deleteHealthEvent(eventId);
      message.success('Xóa sự cố y tế thành công');
      fetchHealthEvents();
    } catch (error) {
      console.error('Lỗi khi xóa sự cố y tế:', error);
      message.error('Không thể xóa sự cố y tế');
    }
  };

  // Handle create new
  const handleCreate = () => {
    setSelectedEvent(null);
    setIsEdit(false);
    form.resetFields();
    setModalVisible(true);
  };

  // Handle form submit
  const handleFormSubmit = async (values) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const nurseId = userInfo.accountId;
      
      const healthEventData = {
        eventDate: values.eventDate?.format('YYYY-MM-DD'),
        eventType: values.eventType,
        description: values.description,
        solution: values.solution,
        note: values.note,
        status: values.status,
        priority: values.priority,
        requiresHomeCare: values.requiresHomeCare
      };

      if (isEdit && selectedEvent) {
        await nurseApi.updateHealthEvent(selectedEvent.id, healthEventData);
        message.success('Cập nhật sự cố y tế thành công');
      } else {
        await nurseApi.createHealthEvent(values.studentId, nurseId, healthEventData);
        message.success('Tạo sự cố y tế thành công');
      }
      
      setModalVisible(false);
      fetchHealthEvents();
    } catch (error) {
      console.error('Lỗi khi lưu sự cố y tế:', error);
      message.error('Không thể lưu sự cố y tế');
    }
  };

  return (
    <div className="medical-incidents-container">
      <Card
        title={
          <Space>
            <AlertOutlined />
            <span>Quản lý sự cố y tế</span>
          </Space>
        }
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Tạo sự cố mới
            </Button>
            <Button 
              icon={<BarChartOutlined />}
              onClick={() => setActiveTab(activeTab === 'list' ? 'statistics' : 'list')}
            >
              {activeTab === 'list' ? 'Thống kê' : 'Danh sách'}
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchHealthEvents}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        }
      >
        {activeTab === 'statistics' ? (
          <HealthEventStatistics />
        ) : (
          <>
        {/* Search and Filter */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input
              placeholder="Tìm kiếm sự cố..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="new">Mới</Option>
              <Option value="processing">Đang xử lý</Option>
              <Option value="closed">Đã đóng</Option>
              <Option value="pending">Chờ phê duyệt</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Mức độ"
              value={filterPriority}
              onChange={setFilterPriority}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="LOW">Thấp</Option>
              <Option value="MEDIUM">Trung bình</Option>
              <Option value="HIGH">Cao</Option>
              <Option value="CRITICAL">Khẩn cấp</Option>
            </Select>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sự cố`
          }}
          locale={{
            emptyText: <Empty description="Không có sự cố y tế nào" />
          }}
        />
          </>
        )}
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title="Chi tiết sự cố y tế"
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedEvent && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Title level={5}>Thông tin cơ bản</Title>
                <Paragraph><strong>ID:</strong> {selectedEvent.id}</Paragraph>
                <Paragraph><strong>Học sinh:</strong> {selectedEvent.studentName}</Paragraph>
                <Paragraph><strong>Lớp:</strong> {selectedEvent.class}</Paragraph>
                <Paragraph><strong>Ngày xảy ra:</strong> {formatDate(selectedEvent.incidentDate)}</Paragraph>
                <Paragraph><strong>Loại sự cố:</strong> {selectedEvent.incidentType}</Paragraph>
              </Col>
              <Col span={12}>
                <Title level={5}>Trạng thái</Title>
                <Paragraph><strong>Mức độ:</strong> {renderPriority(selectedEvent.priority)}</Paragraph>
                <Paragraph><strong>Trạng thái:</strong> {renderStatus(selectedEvent.status)}</Paragraph>
                <Paragraph><strong>Phê duyệt:</strong> {renderStatus(selectedEvent.parentApprovalStatus?.toLowerCase())}</Paragraph>
                <Paragraph><strong>Cần chăm sóc tại nhà:</strong> {selectedEvent.requiresHomeCare ? 'Có' : 'Không'}</Paragraph>
              </Col>
            </Row>
            
            <Title level={5}>Mô tả</Title>
            <Paragraph>{selectedEvent.description}</Paragraph>
            
            <Title level={5}>Giải pháp</Title>
            <Paragraph>{selectedEvent.solution}</Paragraph>
            
            {selectedEvent.note && (
              <>
                <Title level={5}>Ghi chú</Title>
                <Paragraph>{selectedEvent.note}</Paragraph>
              </>
            )}
          </div>
        )}
      </Drawer>

      {/* Create/Edit Modal */}
      <Modal
        title={isEdit ? "Chỉnh sửa sự cố y tế" : "Tạo sự cố y tế mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="studentId"
                label="Học sinh"
                rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
              >
                <Select
                  placeholder="Chọn học sinh"
                  loading={studentsLoading}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {students.map(student => (
                    <Option key={student.accountId} value={student.accountId}>
                      {student.fullName} - {student.classId || 'N/A'}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="eventDate"
                label="Ngày xảy ra"
                rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="eventType"
                label="Loại sự cố"
                rules={[{ required: true, message: 'Vui lòng nhập loại sự cố!' }]}
              >
                <Input placeholder="Ví dụ: Sốt cao, Chấn thương, Dị ứng..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Mức độ"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
              >
                <Select placeholder="Chọn mức độ">
                  <Option value="LOW">Thấp</Option>
                  <Option value="MEDIUM">Trung bình</Option>
                  <Option value="HIGH">Cao</Option>
                  <Option value="CRITICAL">Khẩn cấp</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea rows={3} placeholder="Mô tả chi tiết sự cố..." />
          </Form.Item>

          <Form.Item
            name="solution"
            label="Giải pháp"
            rules={[{ required: true, message: 'Vui lòng nhập giải pháp!' }]}
          >
            <TextArea rows={3} placeholder="Giải pháp xử lý..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="new">Mới</Option>
                  <Option value="processing">Đang xử lý</Option>
                  <Option value="closed">Đã đóng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="requiresHomeCare"
                label="Cần chăm sóc tại nhà"
                valuePropName="checked"
              >
                <Select placeholder="Chọn">
                  <Option value={true}>Có</Option>
                  <Option value={false}>Không</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="note"
            label="Ghi chú"
          >
            <TextArea rows={2} placeholder="Ghi chú bổ sung..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {isEdit ? 'Cập nhật' : 'Tạo'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicalIncidents; 