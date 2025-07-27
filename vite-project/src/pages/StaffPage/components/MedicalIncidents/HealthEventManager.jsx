import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Badge,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Typography,
  Row,
  Col,
  Statistic,
  Alert,
  Popconfirm,
  Tooltip,
  Divider,
  Spin,
  Drawer,
  Descriptions,
  List,
  Avatar,
  Empty,
  Tabs,
  Progress,
  Timeline,
  Collapse,
  notification
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  AlertOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  FileTextOutlined,
  FilterOutlined,
  ReloadOutlined,
  BellOutlined,
  HeartOutlined,
  SafetyOutlined,
  HomeOutlined
} from '@ant-design/icons';
import moment from 'moment';
import nurseApi from '../../../../api/nurseApi';
import HealthEventForm from './HealthEventForm';
import HealthEventDetail from './HealthEventDetail';
import HealthEventStatistics from './HealthEventStatistics';
import HealthEventApproval from './HealthEventApproval';
import HealthEventFollowUp from './HealthEventFollowUp';
import './HealthEventManager.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const HealthEventManager = () => {
  // State management
  const [healthEvents, setHealthEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    requiresHomeCare: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    searchText: '',
    status: 'all',
    priority: 'all',
    approvalStatus: 'all',
    dateRange: null
  });

  // Form instance
  const [form] = Form.useForm();

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch all initial data
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchHealthEvents(),
        fetchStudents(),
        fetchStatistics()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      notification.error({
        message: 'Lỗi tải dữ liệu',
        description: 'Không thể tải dữ liệu sự cố y tế. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch health events
  const fetchHealthEvents = async () => {
    try {
      const data = await nurseApi.getAllHealthEvents();
      setHealthEvents(data || []);
    } catch (error) {
      console.error('Error fetching health events:', error);
      throw error;
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const studentsData = await nurseApi.getStudents();
      if (studentsData && Array.isArray(studentsData)) {
        setStudents(studentsData);
      } else {
        // Fallback mock data
        setStudents([
          {
            accountId: '550e8400-e29b-41d4-a716-446655440001',
            firstName: 'Nguyễn',
            lastName: 'Văn A',
            fullName: 'Nguyễn Văn A',
            studentCode: 'ST001'
          },
          {
            accountId: '550e8400-e29b-41d4-a716-446655440002',
            firstName: 'Trần',
            lastName: 'Thị B',
            fullName: 'Trần Thị B',
            studentCode: 'ST002'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // Use mock data as fallback
      setStudents([
        {
          accountId: '550e8400-e29b-41d4-a716-446655440001',
          firstName: 'Nguyễn',
          lastName: 'Văn A',
          fullName: 'Nguyễn Văn A',
          studentCode: 'ST001'
        }
      ]);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const stats = await nurseApi.getHealthEventStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Calculate statistics from current data
      const stats = calculateStatistics(healthEvents);
      setStatistics(stats);
    }
  };

  // Calculate statistics from events
  const calculateStatistics = (events) => {
    return {
      total: events.length,
      pending: events.filter(e => e.status === 'PENDING').length,
      completed: events.filter(e => e.status === 'COMPLETED').length,
      critical: events.filter(e => e.priority === 'CRITICAL').length,
      high: events.filter(e => e.priority === 'HIGH').length,
      medium: events.filter(e => e.priority === 'MEDIUM').length,
      low: events.filter(e => e.priority === 'LOW').length,
      requiresHomeCare: events.filter(e => e.requiresHomeCare).length
    };
  };

  // Get current nurse info
  const getCurrentNurseInfo = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return {
      nurseId: userInfo.accountId,
      nurseName: userInfo.fullName || 'Y tá hiện tại'
    };
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    try {
      return moment(dateString).format('DD/MM/YYYY HH:mm');
    } catch (error) {
      return "Không xác định";
    }
  };

  // Get priority info
  const getPriorityInfo = (priority) => {
    const priorityMap = {
      CRITICAL: { text: 'Khẩn cấp', color: 'red', class: 'critical', icon: <ExclamationCircleOutlined /> },
      HIGH: { text: 'Cao', color: 'orange', class: 'high', icon: <AlertOutlined /> },
      MEDIUM: { text: 'Trung bình', color: 'gold', class: 'medium', icon: <InfoCircleOutlined /> },
      LOW: { text: 'Thấp', color: 'blue', class: 'low', icon: <CheckCircleOutlined /> }
    };
    return priorityMap[priority] || { text: priority, color: 'default', class: '', icon: <InfoCircleOutlined /> };
  };

  // Get approval status info
  const getApprovalStatusInfo = (status) => {
    const statusMap = {
      PENDING: { text: 'Chờ phê duyệt', color: 'orange', icon: <ClockCircleOutlined /> },
      APPROVED: { text: 'Đã phê duyệt', color: 'green', icon: <CheckCircleOutlined /> },
      REJECTED: { text: 'Từ chối', color: 'red', icon: <CloseCircleOutlined /> },
      NOT_REQUIRED: { text: 'Không cần', color: 'default', icon: <InfoCircleOutlined /> }
    };
    return statusMap[status] || { text: status, color: 'default', icon: <InfoCircleOutlined /> };
  };

  // Filter data
  const filteredData = healthEvents.filter(event => {
    const matchesSearch = !filters.searchText || 
      event.studentName?.toLowerCase().includes(filters.searchText.toLowerCase()) ||
      event.eventType?.toLowerCase().includes(filters.searchText.toLowerCase()) ||
      event.description?.toLowerCase().includes(filters.searchText.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || event.status === filters.status;
    const matchesPriority = filters.priority === 'all' || event.priority === filters.priority;
    const matchesApproval = filters.approvalStatus === 'all' || event.parentApprovalStatus === filters.approvalStatus;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesApproval;
  });

  // Handle form submit
  const handleFormSubmit = async (values) => {
    try {
      const nurseInfo = getCurrentNurseInfo();
      
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

      if (selectedEvent) {
        // Update existing event
        await nurseApi.updateHealthEvent(selectedEvent.eventId, healthEventData);
        message.success('Cập nhật sự cố y tế thành công');
      } else {
        // Create new event
        await nurseApi.createHealthEvent(values.studentId, nurseInfo.nurseId, healthEventData);
        message.success('Tạo sự cố y tế thành công');
      }

      setFormVisible(false);
      setSelectedEvent(null);
      form.resetFields();
      fetchHealthEvents();
      fetchStatistics();
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  // Handle delete
  const handleDelete = async (eventId) => {
    try {
      await nurseApi.deleteHealthEvent(eventId);
      message.success('Xóa sự cố y tế thành công');
      fetchHealthEvents();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting health event:', error);
      message.error('Không thể xóa sự cố y tế');
    }
  };

  // Handle view detail
  const handleViewDetail = (record) => {
    setSelectedEvent(record);
    setDetailVisible(true);
  };

  // Handle edit
  const handleEdit = (record) => {
    setSelectedEvent(record);
    form.setFieldsValue({
      eventDate: moment(record.eventDate),
      eventType: record.eventType,
      description: record.description,
      solution: record.solution,
      note: record.note,
      status: record.status,
      priority: record.priority,
      requiresHomeCare: record.requiresHomeCare
    });
    setFormVisible(true);
  };

  // Handle create new
  const handleCreate = () => {
    setSelectedEvent(null);
    form.resetFields();
    setFormVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 150,
      render: (text, record) => (
        <div className="student-info">
          <Avatar icon={<UserOutlined />} size="small" />
          <div className="student-details">
            <Text strong>{text}</Text>
            <Text type="secondary" className="student-id">
              {record.studentID?.slice(0, 8)}...
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Loại sự cố',
      dataIndex: 'eventType',
      key: 'eventType',
      width: 120,
      render: (text) => (
        <Tag color="blue" icon={<FileTextOutlined />}>
          {text || 'N/A'}
        </Tag>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis className="description-text">
            {text}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Ngày xảy ra',
      dataIndex: 'eventDate',
      key: 'eventDate',
      width: 120,
      render: (dateString) => (
        <div className="date-info">
          <CalendarOutlined />
          <Text>{formatDate(dateString)}</Text>
        </div>
      )
    },
    {
      title: 'Mức độ',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => {
        const priorityInfo = getPriorityInfo(priority);
        return (
          <Tag className={`priority-tag ${priorityInfo.class}`} icon={priorityInfo.icon}>
            {priorityInfo.text}
          </Tag>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusMap = {
          PENDING: { text: 'Chờ xử lý', color: 'orange', icon: <ClockCircleOutlined /> },
          IN_PROGRESS: { text: 'Đang xử lý', color: 'blue', icon: <InfoCircleOutlined /> },
          COMPLETED: { text: 'Hoàn thành', color: 'green', icon: <CheckCircleOutlined /> },
          CANCELLED: { text: 'Đã hủy', color: 'red', icon: <CloseCircleOutlined /> }
        };
        const statusInfo = statusMap[status] || { text: status, color: 'default', icon: <InfoCircleOutlined /> };
        return (
          <Badge color={statusInfo.color} text={statusInfo.text} />
        );
      }
    },
    {
      title: 'Phê duyệt',
      dataIndex: 'parentApprovalStatus',
      key: 'parentApprovalStatus',
      width: 120,
      render: (status) => {
        const statusInfo = getApprovalStatusInfo(status);
        return (
          <Badge color={statusInfo.color} text={statusInfo.text} />
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              className="action-button"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="action-button"
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            description="Hành động này không thể hoàn tác"
            onConfirm={() => handleDelete(record.eventId)}
            okText="Có"
            cancelText="Không"
            placement="left"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                className="action-button"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="health-event-manager">
      {/* Header */}
      <div className="header-section">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} className="page-title">
              <SafetyOutlined /> Quản lý sự cố y tế
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchInitialData}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Thêm sự cố
              </Button>
            </Space>
          </Col>
        </Row>
      </div>



      {/* Filter Section */}
      <Card className="filter-section">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Input.Search
              placeholder="Tìm kiếm sự cố..."
              value={filters.searchText}
              onChange={(e) => setFilters({...filters, searchText: e.target.value})}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Trạng thái"
              value={filters.status}
              onChange={(value) => setFilters({...filters, status: value})}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="PENDING">Chờ xử lý</Option>
              <Option value="IN_PROGRESS">Đang xử lý</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Mức độ"
              value={filters.priority}
              onChange={(value) => setFilters({...filters, priority: value})}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="CRITICAL">Khẩn cấp</Option>
              <Option value="HIGH">Cao</Option>
              <Option value="MEDIUM">Trung bình</Option>
              <Option value="LOW">Thấp</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Phê duyệt"
              value={filters.approvalStatus}
              onChange={(value) => setFilters({...filters, approvalStatus: value})}
              style={{ width: '100%' }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="PENDING">Chờ phê duyệt</Option>
              <Option value="APPROVED">Đã phê duyệt</Option>
              <Option value="REJECTED">Từ chối</Option>
              <Option value="NOT_REQUIRED">Không cần</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilters({
                searchText: '',
                status: 'all',
                priority: 'all',
                approvalStatus: 'all',
                dateRange: null
              })}
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Card className="main-content">
        <Tabs defaultActiveKey="list" className="content-tabs">
          <TabPane tab="Danh sách sự cố" key="list">
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="eventId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} sự cố`
              }}
              scroll={{ x: 1200 }}
              locale={{
                emptyText: (
                  <Empty
                    description="Không có sự cố y tế nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )
              }}
            />
          </TabPane>
          <TabPane tab="Thống kê" key="statistics">
            <HealthEventStatistics />
          </TabPane>
          <TabPane tab="Phê duyệt" key="approval">
            <HealthEventApproval />
          </TabPane>
        </Tabs>
      </Card>

      {/* Health Event Form Modal */}
      <HealthEventForm
        visible={formVisible}
        onCancel={() => {
          setFormVisible(false);
          setSelectedEvent(null);
          form.resetFields();
        }}
        onSubmit={handleFormSubmit}
        selectedEvent={selectedEvent}
        students={students}
        studentsLoading={studentsLoading}
        form={form}
      />

      {/* Health Event Detail Drawer */}
      <HealthEventDetail
        visible={detailVisible}
        event={selectedEvent}
        onClose={() => {
          setDetailVisible(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
};

export default HealthEventManager; 