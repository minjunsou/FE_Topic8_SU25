import React, { useState, useEffect } from 'react';
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
  message,
  Typography,
  Row,
  Col,
  Alert,
  Popconfirm,
  Tooltip,
  Descriptions,
  Avatar,
  Divider,
  Select,
  Empty,
  Spin,
  Timeline,
  Statistic
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  BellOutlined,
  SafetyOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
  AlertOutlined
} from '@ant-design/icons';
import nurseApi from '../../../../api/nurseApi';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const HealthEventApproval = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [approvalForm] = Form.useForm();
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      // Get current user info (parent)
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const parentId = userInfo.accountId;
      
      if (!parentId) {
        message.error('Không tìm thấy thông tin phụ huynh');
        return;
      }

      const data = await nurseApi.getHealthEventsPendingApproval(parentId);
      console.log('Pending approvals:', data);
      setPendingEvents(data || []);

      // Calculate statistics
      const stats = {
        total: data?.length || 0,
        pending: data?.filter(e => e.parentApprovalStatus === 'PENDING').length || 0,
        approved: data?.filter(e => e.parentApprovalStatus === 'APPROVED').length || 0,
        rejected: data?.filter(e => e.parentApprovalStatus === 'REJECTED').length || 0
      };
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      message.error('Không thể tải danh sách chờ phê duyệt');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedEvent(record);
    setDetailModalVisible(true);
  };

  const handleApprove = (record) => {
    setSelectedEvent(record);
    approvalForm.resetFields();
    setApprovalModalVisible(true);
  };

  const handleApprovalSubmit = async (values) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const parentId = userInfo.accountId;

      const approvalData = {
        eventId: selectedEvent.eventId,
        parentId: parentId,
        approvalStatus: values.approvalStatus,
        reason: values.reason
      };

      await nurseApi.approveHealthEvent(approvalData);
      message.success('Phê duyệt thành công');
      setApprovalModalVisible(false);
      setSelectedEvent(null);
      fetchPendingApprovals();
    } catch (error) {
      console.error('Error approving health event:', error);
      message.error('Có lỗi xảy ra khi phê duyệt');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    try {
      return moment(dateString).format('DD/MM/YYYY HH:mm');
    } catch (error) {
      return "Không xác định";
    }
  };

  const getPriorityInfo = (priority) => {
    const priorityMap = {
      CRITICAL: { text: 'Khẩn cấp', color: 'red', class: 'critical', icon: <ExclamationCircleOutlined /> },
      HIGH: { text: 'Cao', color: 'orange', class: 'high', icon: <AlertOutlined /> },
      MEDIUM: { text: 'Trung bình', color: 'gold', class: 'medium', icon: <InfoCircleOutlined /> },
      LOW: { text: 'Thấp', color: 'blue', class: 'low', icon: <CheckCircleOutlined /> }
    };
    return priorityMap[priority] || { text: priority, color: 'default', class: '', icon: <InfoCircleOutlined /> };
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING: { text: 'Chờ xử lý', color: 'orange', icon: <ClockCircleOutlined /> },
      IN_PROGRESS: { text: 'Đang xử lý', color: 'blue', icon: <InfoCircleOutlined /> },
      COMPLETED: { text: 'Hoàn thành', color: 'green', icon: <CheckCircleOutlined /> },
      CANCELLED: { text: 'Đã hủy', color: 'red', icon: <CloseCircleOutlined /> }
    };
    return statusMap[status] || { text: status, color: 'default', icon: <InfoCircleOutlined /> };
  };

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
        const statusInfo = getStatusInfo(status);
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
          <Tooltip title="Phê duyệt">
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record)}
            >
              Phê duyệt
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="health-event-approval">
      {/* Header */}
      <div className="header-section">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} className="page-title">
              <BellOutlined /> Phê duyệt sự cố y tế
            </Title>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchPendingApprovals}
              loading={loading}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="statistics-section">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card total">
            <Statistic
              title="Tổng sự cố"
              value={statistics.total}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card pending">
            <Statistic
              title="Chờ phê duyệt"
              value={statistics.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card approved">
            <Statistic
              title="Đã phê duyệt"
              value={statistics.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card rejected">
            <Statistic
              title="Đã từ chối"
              value={statistics.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card title="Danh sách sự cố chờ phê duyệt" className="main-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Đang tải dữ liệu...</Text>
            </div>
          </div>
        ) : pendingEvents.length === 0 ? (
          <Empty
            description="Không có sự cố nào chờ phê duyệt"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={pendingEvents}
            rowKey="eventId"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} sự cố`
            }}
            scroll={{ x: 1200 }}
          />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <SafetyOutlined />
            Chi tiết sự cố y tế
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedEvent(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="approve"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              handleApprove(selectedEvent);
            }}
          >
            Phê duyệt
          </Button>
        ]}
        width={800}
      >
        {selectedEvent && (
          <div>
            <Alert
              message="Sự cố cần phê duyệt"
              description="Vui lòng xem xét kỹ thông tin sự cố trước khi phê duyệt hoặc từ chối."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Descriptions title="Thông tin cơ bản" bordered column={2}>
              <Descriptions.Item label="Học sinh">
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <Text strong>{selectedEvent.studentName}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Y tá">
                <Text>{selectedEvent.nurseName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày xảy ra">
                <Text>{formatDate(selectedEvent.eventDate)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Loại sự cố">
                <Text>{selectedEvent.eventType}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mức độ">
                {(() => {
                  const priorityInfo = getPriorityInfo(selectedEvent.priority);
                  return (
                    <Tag className={`priority-tag ${priorityInfo.class}`} icon={priorityInfo.icon}>
                      {priorityInfo.text}
                    </Tag>
                  );
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {(() => {
                  const statusInfo = getStatusInfo(selectedEvent.status);
                  return (
                    <Badge color={statusInfo.color} text={statusInfo.text} />
                  );
                })()}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Descriptions title="Chi tiết sự cố" bordered column={1}>
              <Descriptions.Item label="Mô tả">
                <Paragraph>{selectedEvent.description}</Paragraph>
              </Descriptions.Item>
              {selectedEvent.solution && (
                <Descriptions.Item label="Giải pháp">
                  <Paragraph>{selectedEvent.solution}</Paragraph>
                </Descriptions.Item>
              )}
              {selectedEvent.note && (
                <Descriptions.Item label="Ghi chú">
                  <Paragraph>{selectedEvent.note}</Paragraph>
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedEvent.medications && selectedEvent.medications.length > 0 && (
              <>
                <Divider />
                <Descriptions title="Thuốc sử dụng" bordered column={1}>
                  {selectedEvent.medications.map((med, index) => (
                    <Descriptions.Item key={index} label={`Thuốc ${index + 1}`}>
                      <Space direction="vertical">
                        <Text strong>{med.medicationName}</Text>
                        <Text>Liều lượng: {med.dosageAmount} {med.dosageUnit}</Text>
                        <Text>Tần suất: {med.frequency}</Text>
                        <Text>Thời gian: {med.duration}</Text>
                        {med.administrationNotes && (
                          <Text>Ghi chú: {med.administrationNotes}</Text>
                        )}
                      </Space>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined />
            Phê duyệt sự cố y tế
          </Space>
        }
        open={approvalModalVisible}
        onCancel={() => {
          setApprovalModalVisible(false);
          setSelectedEvent(null);
          approvalForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={approvalForm}
          layout="vertical"
          onFinish={handleApprovalSubmit}
          initialValues={{
            approvalStatus: 'APPROVED'
          }}
        >
          <Alert
            message="Thông tin sự cố"
            description={
              <div>
                <Text strong>Học sinh:</Text> {selectedEvent?.studentName}<br />
                <Text strong>Loại sự cố:</Text> {selectedEvent?.eventType}<br />
                <Text strong>Mô tả:</Text> {selectedEvent?.description}
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="approvalStatus"
            label="Quyết định"
            rules={[{ required: true, message: 'Vui lòng chọn quyết định' }]}
          >
            <Select placeholder="Chọn quyết định">
              <Option value="APPROVED">
                <Space>
                  <CheckCircleOutlined />
                  Phê duyệt
                </Space>
              </Option>
              <Option value="REJECTED">
                <Space>
                  <CloseCircleOutlined />
                  Từ chối
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập lý do phê duyệt hoặc từ chối..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Xác nhận
              </Button>
              <Button onClick={() => {
                setApprovalModalVisible(false);
                setSelectedEvent(null);
                approvalForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthEventApproval; 