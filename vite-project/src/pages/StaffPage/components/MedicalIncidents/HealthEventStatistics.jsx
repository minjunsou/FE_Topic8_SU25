import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Spin,
  Alert,
  Progress,
  Divider,
  Timeline,
  List,
  Avatar,
  Tag,
  Badge,
  Empty,
  Select,
  DatePicker,
  Button
} from 'antd';
import {
  AlertOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
  CalendarOutlined,
  EyeOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import nurseApi from '../../../../api/nurseApi';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const HealthEventStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch statistics
      const statsData = await nurseApi.getHealthEventStatistics();
      setStatistics(statsData);

      // Fetch recent events (last 10)
      const allEvents = await nurseApi.getAllHealthEvents();
      const recent = allEvents.slice(0, 10);
      setRecentEvents(recent);

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    try {
      return moment(dateString).format('DD/MM/YYYY');
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

  const getApprovalStatusInfo = (status) => {
    const statusMap = {
      PENDING: { text: 'Chờ phê duyệt', color: 'orange', icon: <ClockCircleOutlined /> },
      APPROVED: { text: 'Đã phê duyệt', color: 'green', icon: <CheckCircleOutlined /> },
      REJECTED: { text: 'Từ chối', color: 'red', icon: <CloseCircleOutlined /> },
      NOT_REQUIRED: { text: 'Không cần', color: 'default', icon: <InfoCircleOutlined /> }
    };
    return statusMap[status] || { text: status, color: 'default', icon: <InfoCircleOutlined /> };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>Đang tải thống kê...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi tải dữ liệu"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" danger onClick={fetchDashboardData}>
            Thử lại
          </Button>
        }
      />
    );
  }

  if (!statistics) {
    return (
      <Empty
        description="Không có dữ liệu thống kê"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  // Calculate percentages
  const total = statistics.total || 0;
  const pendingPercent = total > 0 ? Math.round((statistics.pending / total) * 100) : 0;
  const completedPercent = total > 0 ? Math.round((statistics.completed / total) * 100) : 0;
  const criticalPercent = total > 0 ? Math.round((statistics.critical / total) * 100) : 0;

  return (
    <div className="health-event-statistics">
      {/* Header */}
      <div className="header-section">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} className="page-title">
              <BarChartOutlined /> Thống kê sự cố y tế
            </Title>
          </Col>
          <Col>
            <Space>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 120 }}
              >
                <Option value="week">Tuần này</Option>
                <Option value="month">Tháng này</Option>
                <Option value="quarter">Quý này</Option>
                <Option value="year">Năm nay</Option>
              </Select>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder={['Từ ngày', 'Đến ngày']}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchDashboardData}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Overview Statistics */}
      <Row gutter={[16, 16]} className="statistics-section">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card total">
            <Statistic
              title="Tổng sự cố"
              value={statistics.total}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={100} showInfo={false} strokeColor="#1890ff" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card pending">
            <Statistic
              title="Chờ xử lý"
              value={statistics.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <Progress percent={pendingPercent} showInfo={false} strokeColor="#faad14" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card completed">
            <Statistic
              title="Hoàn thành"
              value={statistics.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress percent={completedPercent} showInfo={false} strokeColor="#52c41a" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card critical">
            <Statistic
              title="Khẩn cấp"
              value={statistics.critical}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Progress percent={criticalPercent} showInfo={false} strokeColor="#ff4d4f" />
          </Card>
        </Col>
      </Row>

      {/* Detailed Statistics */}
      <Row gutter={[16, 16]} className="detailed-statistics">
        <Col xs={24} lg={12}>
          <Card title="Phân loại theo mức độ" className="stat-card">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Cao"
                  value={statistics.high}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Trung bình"
                  value={statistics.medium}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Thấp"
                  value={statistics.low}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Cần chăm sóc tại nhà"
                  value={statistics.requiresHomeCare}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Tỷ lệ hoàn thành" className="stat-card">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Progress
                type="circle"
                percent={completedPercent}
                format={percent => `${percent}%`}
                strokeColor="#52c41a"
                size={120}
              />
              <div style={{ marginTop: '16px' }}>
                <Text strong>Hoàn thành: {statistics.completed}/{statistics.total}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Events Timeline */}
      <Card title="Sự cố gần đây" className="recent-events-card">
        {recentEvents.length === 0 ? (
          <Empty description="Không có sự cố gần đây" />
        ) : (
          <Timeline>
            {recentEvents.map((event, index) => {
              const priorityInfo = getPriorityInfo(event.priority);
              const statusInfo = getStatusInfo(event.status);
              const approvalInfo = getApprovalStatusInfo(event.parentApprovalStatus);

              return (
                <Timeline.Item
                  key={event.eventId}
                  dot={priorityInfo.icon}
                  color={priorityInfo.color}
                >
                  <div className="timeline-item">
                    <div className="timeline-header">
                      <Space>
                        <Text strong>{event.studentName}</Text>
                        <Tag className={`priority-tag ${priorityInfo.class}`}>
                          {priorityInfo.text}
                        </Tag>
                        <Badge color={statusInfo.color} text={statusInfo.text} />
                        <Badge color={approvalInfo.color} text={approvalInfo.text} />
                      </Space>
                    </div>
                    <div className="timeline-content">
                      <Text>{event.eventType}</Text>
                      <br />
                      <Text type="secondary">{event.description}</Text>
                      <br />
                      <Text type="secondary">
                        <CalendarOutlined /> {formatDate(event.eventDate)}
                      </Text>
                    </div>
                  </div>
                </Timeline.Item>
              );
            })}
          </Timeline>
        )}
      </Card>

      {/* Quick Actions */}
      <Card title="Thao tác nhanh" className="quick-actions-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" className="action-card">
              <div className="action-content">
                <AlertOutlined className="action-icon critical" />
                <div className="action-text">
                  <Text strong>Sự cố khẩn cấp</Text>
                  <br />
                  <Text type="secondary">{statistics.critical} sự cố</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" className="action-card">
              <div className="action-content">
                <ClockCircleOutlined className="action-icon pending" />
                <div className="action-text">
                  <Text strong>Chờ phê duyệt</Text>
                  <br />
                  <Text type="secondary">{statistics.pending} sự cố</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" className="action-card">
              <div className="action-content">
                <HomeOutlined className="action-icon home" />
                <div className="action-text">
                  <Text strong>Cần chăm sóc tại nhà</Text>
                  <br />
                  <Text type="secondary">{statistics.requiresHomeCare} sự cố</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" className="action-card">
              <div className="action-content">
                <CheckCircleOutlined className="action-icon completed" />
                <div className="action-text">
                  <Text strong>Đã hoàn thành</Text>
                  <br />
                  <Text type="secondary">{statistics.completed} sự cố</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default HealthEventStatistics; 