import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Descriptions,
  Typography,
  Space,
  Badge,
  Tag,
  Avatar,
  Divider,
  Timeline,
  Card,
  List,
  Button,
  Row,
  Col,
  Alert,
  Spin,
  Empty,
  Tabs,
  Collapse,
  Statistic,
  Progress
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  AlertOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
  BellOutlined,
  FileTextOutlined,
  HeartOutlined,
  SafetyOutlined,
  EditOutlined,
  EyeOutlined
} from '@ant-design/icons';
import moment from 'moment';
import nurseApi from '../../../../api/nurseApi';
import HealthEventFollowUp from './HealthEventFollowUp';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const HealthEventDetail = ({ visible, event, onClose }) => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && event) {
      fetchMedications();
    }
  }, [visible, event]);

  const fetchMedications = async () => {
    if (!event?.eventId) return;
    
    setLoading(true);
    try {
      const data = await nurseApi.getMedicationsByHealthEvent(event.eventId);
      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
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

  const getApprovalStatusInfo = (status) => {
    const statusMap = {
      PENDING: { text: 'Chờ phê duyệt', color: 'orange', icon: <ClockCircleOutlined /> },
      APPROVED: { text: 'Đã phê duyệt', color: 'green', icon: <CheckCircleOutlined /> },
      REJECTED: { text: 'Từ chối', color: 'red', icon: <CloseCircleOutlined /> },
      NOT_REQUIRED: { text: 'Không cần', color: 'default', icon: <InfoCircleOutlined /> }
    };
    return statusMap[status] || { text: status, color: 'default', icon: <InfoCircleOutlined /> };
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

  if (!event) {
    return (
      <Drawer
        title="Chi tiết sự cố y tế"
        placement="right"
        width={600}
        onClose={onClose}
        open={visible}
      >
        <Empty description="Không có dữ liệu" />
      </Drawer>
    );
  }

  const priorityInfo = getPriorityInfo(event.priority);
  const approvalStatusInfo = getApprovalStatusInfo(event.parentApprovalStatus);
  const statusInfo = getStatusInfo(event.status);

  return (
    <Drawer
      title={
        <Space>
          <SafetyOutlined />
          Chi tiết sự cố y tế
        </Space>
      }
      placement="right"
      width={700}
      onClose={onClose}
      open={visible}
      className="health-event-detail-drawer"
    >
      <Spin spinning={loading}>
        <div className="detail-content">
          {/* Header with priority alert */}
          {event.priority === 'CRITICAL' && (
            <Alert
              message="Sự cố khẩn cấp"
              description="Sự cố này được đánh dấu là khẩn cấp và cần được xử lý ngay lập tức."
              type="error"
              showIcon
              icon={<ExclamationCircleOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Basic Information */}
          <Card title="Thông tin cơ bản" size="small" className="detail-section">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="info-item">
                  <Space>
                    <UserOutlined />
                    <Text strong>Học sinh:</Text>
                  </Space>
                  <div className="student-info">
                    <Avatar icon={<UserOutlined />} size="small" />
                    <Text>{event.studentName}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      ID: {event.studentID?.slice(0, 8)}...
                    </Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="info-item">
                  <Space>
                    <UserOutlined />
                    <Text strong>Y tá:</Text>
                  </Space>
                  <Text>{event.nurseName}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="info-item">
                  <Space>
                    <CalendarOutlined />
                    <Text strong>Ngày xảy ra:</Text>
                  </Space>
                  <Text>{formatDate(event.eventDate)}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="info-item">
                  <Space>
                    <FileTextOutlined />
                    <Text strong>Loại sự cố:</Text>
                  </Space>
                  <Tag color="blue">{event.eventType}</Tag>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Status and Priority */}
          <Card title="Trạng thái và phân loại" size="small" className="detail-section">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div className="status-item">
                  <Text strong>Mức độ:</Text>
                  <Tag className={`priority-tag ${priorityInfo.class}`} icon={priorityInfo.icon}>
                    {priorityInfo.text}
                  </Tag>
                </div>
              </Col>
              <Col span={8}>
                <div className="status-item">
                  <Text strong>Trạng thái:</Text>
                  <Badge color={statusInfo.color} text={statusInfo.text} />
                </div>
              </Col>
              <Col span={8}>
                <div className="status-item">
                  <Text strong>Phê duyệt:</Text>
                  <Badge color={approvalStatusInfo.color} text={approvalStatusInfo.text} />
                </div>
              </Col>
              <Col span={12}>
                <div className="status-item">
                  <Space>
                    <HomeOutlined />
                    <Text strong>Cần chăm sóc tại nhà:</Text>
                  </Space>
                  <Text>{event.requiresHomeCare ? 'Có' : 'Không'}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="status-item">
                  <Space>
                    <CalendarOutlined />
                    <Text strong>Tạo lúc:</Text>
                  </Space>
                  <Text>{formatDate(event.createdAt)}</Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Event Details */}
          <Card title="Chi tiết sự cố" size="small" className="detail-section">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Mô tả">
                <Paragraph>{event.description}</Paragraph>
              </Descriptions.Item>
              {event.solution && (
                <Descriptions.Item label="Giải pháp">
                  <Paragraph>{event.solution}</Paragraph>
                </Descriptions.Item>
              )}
              {event.note && (
                <Descriptions.Item label="Ghi chú">
                  <Paragraph>{event.note}</Paragraph>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Medications */}
          {medications.length > 0 && (
            <Card title="Thuốc sử dụng" size="small" className="detail-section">
              <List
                dataSource={medications}
                renderItem={(med, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<MedicineBoxOutlined />} />}
                      title={`${med.medicationName}`}
                      description={
                        <Space direction="vertical" size="small">
                          <Text>Liều lượng: {med.dosageAmount} {med.dosageUnit}</Text>
                          <Text>Tần suất: {med.frequency}</Text>
                          <Text>Thời gian: {med.duration}</Text>
                          {med.administrationNotes && (
                            <Text>Ghi chú: {med.administrationNotes}</Text>
                          )}
                          <Text type="secondary">
                            Sử dụng: {formatDate(med.usageDate)} {med.usageTime}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Approval Information */}
          {event.parentApprovalStatus !== 'NOT_REQUIRED' && (
            <Card title="Thông tin phê duyệt" size="small" className="detail-section">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Trạng thái phê duyệt">
                  <Badge color={approvalStatusInfo.color} text={approvalStatusInfo.text} />
                </Descriptions.Item>
                {event.approvedByParentName && (
                  <Descriptions.Item label="Phê duyệt bởi">
                    <Text>{event.approvedByParentName}</Text>
                  </Descriptions.Item>
                )}
                {event.parentApprovalDate && (
                  <Descriptions.Item label="Ngày phê duyệt">
                    <Text>{formatDate(event.parentApprovalDate)}</Text>
                  </Descriptions.Item>
                )}
                {event.parentApprovalReason && (
                  <Descriptions.Item label="Lý do">
                    <Text>{event.parentApprovalReason}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}

          {/* Timeline */}
          <Card title="Lịch sử sự cố" size="small" className="detail-section">
            <Timeline>
              <Timeline.Item dot={<CalendarOutlined style={{ fontSize: '16px' }} />}>
                <Text strong>Tạo sự cố</Text>
                <br />
                <Text type="secondary">{formatDate(event.createdAt)}</Text>
              </Timeline.Item>
              {event.updatedAt && event.updatedAt !== event.createdAt && (
                <Timeline.Item dot={<EditOutlined style={{ fontSize: '16px' }} />}>
                  <Text strong>Cập nhật</Text>
                  <br />
                  <Text type="secondary">{formatDate(event.updatedAt)}</Text>
                </Timeline.Item>
              )}
              {event.parentApprovalDate && (
                <Timeline.Item dot={<CheckCircleOutlined style={{ fontSize: '16px' }} />}>
                  <Text strong>Phê duyệt</Text>
                  <br />
                  <Text type="secondary">{formatDate(event.parentApprovalDate)}</Text>
                </Timeline.Item>
              )}
            </Timeline>
          </Card>

          {/* Follow-up Section */}
          <Card title="Theo dõi và chăm sóc" size="small" className="detail-section">
            <HealthEventFollowUp healthEventId={event.eventId} />
          </Card>
        </div>
      </Spin>
    </Drawer>
  );
};

export default HealthEventDetail; 