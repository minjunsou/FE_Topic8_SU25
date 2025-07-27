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
  Button,
  List,
  Avatar,
  Tag,
  Badge,
  Divider
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
  EyeOutlined
} from '@ant-design/icons';
import nurseApi from '../../../../api/nurseApi';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;

const HealthEventDashboard = ({ onViewDetails }) => {
  const [statistics, setStatistics] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch statistics
      const statsData = await nurseApi.getHealthEventStatistics();
      setStatistics(statsData);

      // Fetch recent events (last 5)
      const allEvents = await nurseApi.getAllHealthEvents();
      const recent = allEvents.slice(0, 5);
      setRecentEvents(recent);

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
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
      CRITICAL: { text: 'Khẩn cấp', color: 'red', class: 'critical' },
      HIGH: { text: 'Cao', color: 'orange', class: 'high' },
      MEDIUM: { text: 'Trung bình', color: 'gold', class: 'medium' },
      LOW: { text: 'Thấp', color: 'blue', class: 'low' }
    };
    return priorityMap[priority] || { text: priority, color: 'default', class: '' };
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING: { text: 'Chờ xử lý', color: 'orange' },
      IN_PROGRESS: { text: 'Đang xử lý', color: 'blue' },
      COMPLETED: { text: 'Hoàn thành', color: 'green' },
      CANCELLED: { text: 'Đã hủy', color: 'red' }
    };
    return statusMap[status] || { text: status, color: 'default' };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>Đang tải dashboard...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ margin: '16px' }}
      />
    );
  }

  return (
    <div className="health-event-dashboard">
      <Title level={2}>
        <Space>
          <AlertOutlined />
          Dashboard Sự Cố Y Tế
        </Space>
      </Title>

      {/* Key Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng sự cố"
              value={statistics?.total || 0}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Chờ phê duyệt"
              value={statistics?.pending || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={statistics?.completed || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khẩn cấp"
              value={statistics?.critical || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Priority Breakdown */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Phân bố theo mức độ">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Thấp"
                  value={statistics?.low || 0}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Trung bình"
                  value={statistics?.medium || 0}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Cao"
                  value={statistics?.high || 0}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Khẩn cấp"
                  value={statistics?.critical || 0}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Thông tin bổ sung">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Cần chăm sóc tại nhà"
                  value={statistics?.requiresHomeCare || 0}
                  prefix={<HomeOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Có thuốc"
                  value={statistics?.medications || 0}
                  prefix={<MedicineBoxOutlined />}
                  valueStyle={{ color: '#13c2c2' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Recent Events */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                Sự cố gần đây
              </Space>
            }
            extra={
              <Button 
                type="primary" 
                icon={<EyeOutlined />}
                onClick={onViewDetails}
              >
                Xem tất cả
              </Button>
            }
          >
            {recentEvents.length === 0 ? (
              <Alert
                message="Chưa có sự cố nào"
                description="Chưa có sự cố y tế nào được ghi nhận."
                type="info"
                showIcon
              />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={recentEvents}
                renderItem={(event) => (
                  <List.Item
                    actions={[
                      <Button 
                        type="link" 
                        icon={<EyeOutlined />}
                        onClick={() => onViewDetails(event)}
                      >
                        Xem chi tiết
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<UserOutlined />} 
                          style={{ backgroundColor: '#1890ff' }}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{event.studentName}</Text>
                          <Tag className={`priority-tag ${getPriorityInfo(event.priority).class}`}>
                            {getPriorityInfo(event.priority).text}
                          </Tag>
                          <Badge 
                            color={getStatusInfo(event.status).color} 
                            text={getStatusInfo(event.status).text} 
                          />
                        </Space>
                      }
                      description={
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Text>{event.description}</Text>
                          <Space>
                            <Text type="secondary">
                              <CalendarOutlined /> {formatDate(event.eventDate)}
                            </Text>
                            <Text type="secondary">
                              Y tá: {event.nurseName}
                            </Text>
                            {event.requiresHomeCare && (
                              <Tag color="purple" icon={<HomeOutlined />}>
                                Cần chăm sóc tại nhà
                              </Tag>
                            )}
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          {statistics?.critical > 0 && (
            <Alert
              message="Có sự cố khẩn cấp cần xử lý"
              description={`Hiện có ${statistics.critical} sự cố khẩn cấp cần được xử lý ngay lập tức.`}
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}
          
          {statistics?.pending > 5 && (
            <Alert
              message="Nhiều sự cố đang chờ phê duyệt"
              description={`Có ${statistics.pending} sự cố đang chờ phê duyệt từ phụ huynh.`}
              type="warning"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}
          
          {statistics?.total > 0 && statistics?.completed / statistics?.total >= 0.8 && (
            <Alert
              message="Hiệu suất xử lý tốt"
              description={`Tỷ lệ hoàn thành đạt ${Math.round((statistics.completed / statistics.total) * 100)}%. Tiếp tục duy trì hiệu suất này.`}
              type="success"
              showIcon
            />
          )}
        </Col>
      </Row>
    </div>
  );
};

export default HealthEventDashboard; 