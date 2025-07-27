import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Space, Tag } from 'antd';
import { 
  AlertOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  UserOutlined 
} from '@ant-design/icons';
import nurseApi from '../../../../api/nurseApi';

const { Title, Text } = Typography;

const HealthEventStatistics = () => {
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    processing: 0,
    closed: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    requiresHomeCare: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
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
      
      if (Array.isArray(events)) {
        const statistics = {
          total: events.length,
          new: events.filter(e => e.status === 'new').length,
          processing: events.filter(e => e.status === 'processing').length,
          closed: events.filter(e => e.status === 'closed').length,
          critical: events.filter(e => e.priority === 'CRITICAL').length,
          high: events.filter(e => e.priority === 'HIGH').length,
          medium: events.filter(e => e.priority === 'MEDIUM').length,
          low: events.filter(e => e.priority === 'LOW').length,
          pendingApproval: events.filter(e => e.parentApprovalStatus === 'PENDING').length,
          approved: events.filter(e => e.parentApprovalStatus === 'APPROVED').length,
          rejected: events.filter(e => e.parentApprovalStatus === 'REJECTED').length,
          requiresHomeCare: events.filter(e => e.requiresHomeCare === true).length
        };
        setStats(statistics);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thống kê sự cố y tế:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusPercentage = (count) => {
    return stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      CRITICAL: 'red',
      HIGH: 'orange',
      MEDIUM: 'blue',
      LOW: 'green'
    };
    return colors[priority] || 'default';
  };

  return (
    <div className="health-event-statistics">
      <Title level={4}>Thống kê sự cố y tế</Title>
      
      <Row gutter={[16, 16]}>
        {/* Tổng quan */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số sự cố"
              value={stats.total}
              prefix={<AlertOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Sự cố mới"
              value={stats.new}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              loading={loading}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={stats.processing}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
              loading={loading}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={stats.closed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Theo mức độ ưu tiên */}
        <Col xs={24} sm={12}>
          <Card title="Theo mức độ ưu tiên">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Space>
                  <Tag color="red">Khẩn cấp</Tag>
                  <Text>{stats.critical} sự cố ({getStatusPercentage(stats.critical)}%)</Text>
                </Space>
                <Progress percent={getStatusPercentage(stats.critical)} strokeColor="red" />
              </div>
              
              <div>
                <Space>
                  <Tag color="orange">Cao</Tag>
                  <Text>{stats.high} sự cố ({getStatusPercentage(stats.high)}%)</Text>
                </Space>
                <Progress percent={getStatusPercentage(stats.high)} strokeColor="orange" />
              </div>
              
              <div>
                <Space>
                  <Tag color="blue">Trung bình</Tag>
                  <Text>{stats.medium} sự cố ({getStatusPercentage(stats.medium)}%)</Text>
                </Space>
                <Progress percent={getStatusPercentage(stats.medium)} strokeColor="blue" />
              </div>
              
              <div>
                <Space>
                  <Tag color="green">Thấp</Tag>
                  <Text>{stats.low} sự cố ({getStatusPercentage(stats.low)}%)</Text>
                </Space>
                <Progress percent={getStatusPercentage(stats.low)} strokeColor="green" />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Theo trạng thái phê duyệt */}
        <Col xs={24} sm={12}>
          <Card title="Theo trạng thái phê duyệt">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Space>
                  <Tag color="orange">Chờ phê duyệt</Tag>
                  <Text>{stats.pendingApproval} sự cố</Text>
                </Space>
                <Progress 
                  percent={stats.total > 0 ? Math.round((stats.pendingApproval / stats.total) * 100) : 0} 
                  strokeColor="orange" 
                />
              </div>
              
              <div>
                <Space>
                  <Tag color="green">Đã phê duyệt</Tag>
                  <Text>{stats.approved} sự cố</Text>
                </Space>
                <Progress 
                  percent={stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0} 
                  strokeColor="green" 
                />
              </div>
              
              <div>
                <Space>
                  <Tag color="red">Đã từ chối</Tag>
                  <Text>{stats.rejected} sự cố</Text>
                </Space>
                <Progress 
                  percent={stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0} 
                  strokeColor="red" 
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Thông tin bổ sung */}
        <Col xs={24} sm={12}>
          <Card title="Thông tin bổ sung">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Cần chăm sóc tại nhà"
                  value={stats.requiresHomeCare}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tỷ lệ hoàn thành"
                  value={stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card title="Tóm tắt">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>
                <strong>Tổng số sự cố:</strong> {stats.total}
              </Text>
              <Text>
                <strong>Sự cố cần xử lý ngay:</strong> {stats.new + stats.processing}
              </Text>
              <Text>
                <strong>Sự cố khẩn cấp:</strong> {stats.critical}
              </Text>
              <Text>
                <strong>Chờ phê duyệt:</strong> {stats.pendingApproval}
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HealthEventStatistics; 