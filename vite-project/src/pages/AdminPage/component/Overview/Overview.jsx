import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Typography, Button, Space, Tag, Spin, Alert, Divider, Badge, Tooltip, Empty } from 'antd';
import { 
  UserOutlined, 
  MedicineBoxOutlined, 
  HeartOutlined, 
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  SettingOutlined,
  WarningOutlined,
  SafetyOutlined,
  TeamOutlined,
  CalendarOutlined,
  DashboardOutlined,
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { 
  getAccounts, 
  getAllMedications, 
  getAllHealthEvents, 
  getAllVaccinationNotices,
  getAllVaccinationRecords,
  getLowStockMedications
} from '../../../../api/adminApi';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;

const Overview = () => {
  const [loading, setLoading] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    overall: 'good',
    alerts: []
  });

  // Thêm navigation function
  const navigateToSection = (section) => {
    localStorage.setItem('adminActiveTab', section);
    window.location.reload();
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      // Sử dụng API cơ bản để lấy dữ liệu thực tế
      const [
        accountsRes,
        medicationsRes,
        healthEventsRes,
        vaccinationNoticesRes,
        vaccinationRecordsRes,
        lowStockRes
      ] = await Promise.all([
        getAccounts({ size: 1000 }),
        getAllMedications(),
        getAllHealthEvents(),
        getAllVaccinationNotices(),
        getAllVaccinationRecords(),
        getLowStockMedications(10)
      ]);

      // Xử lý response data chính xác
      const accounts = accountsRes.data?.accounts || [];
      const medications = Array.isArray(medicationsRes) ? medicationsRes : 
                        Array.isArray(medicationsRes.data) ? medicationsRes.data : 
                        Array.isArray(medicationsRes.data?.data) ? medicationsRes.data.data : [];
      const healthEvents = Array.isArray(healthEventsRes) ? healthEventsRes : 
                          Array.isArray(healthEventsRes.data) ? healthEventsRes.data : 
                          Array.isArray(healthEventsRes.data?.data) ? healthEventsRes.data.data : [];
      const vaccinationNotices = Array.isArray(vaccinationNoticesRes) ? vaccinationNoticesRes : 
                                Array.isArray(vaccinationNoticesRes.data) ? vaccinationNoticesRes.data : 
                                Array.isArray(vaccinationNoticesRes.data?.data) ? vaccinationNoticesRes.data.data : [];
      const vaccinationRecords = Array.isArray(vaccinationRecordsRes) ? vaccinationRecordsRes : 
                                Array.isArray(vaccinationRecordsRes.data) ? vaccinationRecordsRes.data : 
                                Array.isArray(vaccinationRecordsRes.data?.data) ? vaccinationRecordsRes.data.data : [];

      // Lọc dữ liệu theo role
      const students = accounts.filter(acc => acc.roleId === 1);
      const staff = accounts.filter(acc => acc.roleId === 3);
      
      // Lọc theo status
      const pendingHealthEvents = healthEvents.filter(event => event.status === 'PENDING' || event.status === 'NEW');
      const pendingVaccinations = vaccinationRecords.filter(record => record.status === 'PENDING' || record.status === 'CONFIRMED');
      
      // Xử lý low stock medications
      const lowStockData = Array.isArray(lowStockRes) ? lowStockRes : 
                          Array.isArray(lowStockRes.data) ? lowStockRes.data : 
                          Array.isArray(lowStockRes.data?.data) ? lowStockRes.data.data : [];

      // Tính toán system health
      const alerts = [];
      if (lowStockData.length > 0) {
        alerts.push({
          type: 'warning',
          message: `${lowStockData.length} loại thuốc sắp hết hàng`,
          action: 'medications'
        });
      }
      if (pendingHealthEvents.length > 0) {
        alerts.push({
          type: 'error',
          message: `${pendingHealthEvents.length} sự cố sức khỏe chờ xử lý`,
          action: 'health'
        });
      }
      if (pendingVaccinations.length > 0) {
        alerts.push({
          type: 'info',
          message: `${pendingVaccinations.length} tiêm chủng chờ xác nhận`,
          action: 'vaccination'
        });
      }

      const overall = alerts.length === 0 ? 'excellent' : 
                     alerts.filter(a => a.type === 'error').length > 0 ? 'critical' :
                     alerts.filter(a => a.type === 'warning').length > 0 ? 'warning' : 'good';

      setSystemHealth({ overall, alerts });

      setLowStockItems(lowStockData);
      
      // Tạo recent activities từ các data với thông tin chi tiết hơn
      const activities = [
        ...(Array.isArray(healthEvents) ? healthEvents.slice(0, 5).map(event => ({
          id: event.eventId || event.id,
          type: 'health',
          title: `Sự cố sức khỏe: ${event.description || event.title || 'Không có mô tả'}`,
          subtitle: `Học sinh: ${event.studentName || 'Không xác định'}`,
          date: event.eventDate || event.date || event.createdAt,
          status: event.status || 'UNKNOWN',
          priority: event.status === 'PENDING' ? 'high' : 'normal'
        })) : []),
        ...(Array.isArray(vaccinationRecords) ? vaccinationRecords.slice(0, 5).map(record => ({
          id: record.recordId || record.id,
          type: 'vaccination',
          title: `Tiêm chủng: ${record.vaccineName || record.vaccine || 'Không xác định'}`,
          subtitle: `Học sinh: ${record.studentName || 'Không xác định'}`,
          date: record.date || record.vaccinationDate || record.createdAt,
          status: record.status || 'UNKNOWN',
          priority: record.status === 'PENDING' ? 'high' : 'normal'
        })) : [])
      ].filter(activity => activity.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

      setRecentActivities(activities);

      console.log('Overview Data:', {
        accounts: accounts.length,
        students: students.length,
        staff: staff.length,
        medications: medications.length,
        healthEvents: healthEvents.length,
        vaccinationNotices: vaccinationNotices.length,
        vaccinationRecords: vaccinationRecords.length,
        lowStock: lowStockData.length
      });

    } catch (error) {
      console.error('Lỗi khi tải dữ liệu overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'COMPLETED': return 'green';
      case 'CONFIRMED': return 'blue';
      case 'DECLINED': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'DECLINED': return 'Đã từ chối';
      default: return status;
    }
  };

  const getPriorityIcon = (priority) => {
    return priority === 'high' ? <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> : null;
  };

  const activityColumns = [
    {
      title: 'Hoạt động',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <Space>
            {record.type === 'health' ? <HeartOutlined style={{ color: '#ff4d4f' }} /> : 
             record.type === 'vaccination' ? <MedicineBoxOutlined style={{ color: '#52c41a' }} /> : 
             <FileTextOutlined style={{ color: '#1890ff' }} />}
            <Text strong>{text}</Text>
            {getPriorityIcon(record.priority)}
          </Space>
          {record.subtitle && (
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>{record.subtitle}</Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      render: (date) => {
        if (!date) return 'N/A';
        try {
          // Xử lý trường hợp date là array [year, month, day]
          if (Array.isArray(date) && date.length === 3) {
            const [year, month, day] = date;
            const momentDate = moment([year, month - 1, day]);
            return momentDate.format('DD/MM/YYYY');
          }
          const momentDate = moment.utc(date).local();
          return momentDate.format('DD/MM/YYYY');
        } catch (error) {
          return 'Invalid Date';
        }
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    }
  ];

  const lowStockColumns = [
    { 
      title: 'Tên thuốc', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    { 
      title: 'Số lượng hiện tại', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (quantity) => (
        <Text type={quantity < 10 ? 'danger' : 'secondary'}>
          {quantity}
        </Text>
      )
    },
    { title: 'Đơn vị', dataIndex: 'quantityType', key: 'quantityType' },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.quantity < 5 ? 'red' : record.quantity < 10 ? 'orange' : 'green'}>
          {record.quantity < 5 ? 'Nguy cấp' : record.quantity < 10 ? 'Cảnh báo' : 'Bình thường'}
        </Tag>
      )
    }
  ];

  const quickActions = [
    {
      title: 'Quản lý tài khoản',
      icon: <TeamOutlined />,
      description: 'Thêm, sửa, xóa tài khoản',
      action: 'accounts',
      color: '#1890ff'
    },
    {
      title: 'Quản lý thuốc',
      icon: <MedicineBoxOutlined />,
      description: 'Kiểm tra tồn kho, thêm thuốc mới',
      action: 'medications',
      color: '#52c41a'
    },
    {
      title: 'Tiêm chủng',
      icon: <SafetyOutlined />,
      description: 'Quản lý lịch tiêm chủng',
      action: 'vaccination',
      color: '#722ed1'
    },
    {
      title: 'Sự cố sức khỏe',
      icon: <HeartOutlined />,
      description: 'Theo dõi và xử lý sự cố',
      action: 'health',
      color: '#ff4d4f'
    }
  ];

  return (
    <div className="overview-dashboard">
      <Title level={2}>
        <DashboardOutlined /> Tổng quan hệ thống
      </Title>

      {/* System Health Status */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <Badge 
                status={systemHealth.overall === 'excellent' ? 'success' : 
                       systemHealth.overall === 'critical' ? 'error' : 
                       systemHealth.overall === 'warning' ? 'warning' : 'processing'} 
                text={
                  <Text strong>
                    {systemHealth.overall === 'excellent' ? 'Tuyệt vời' :
                     systemHealth.overall === 'critical' ? 'Cần chú ý' :
                     systemHealth.overall === 'warning' ? 'Cảnh báo' : 'Tốt'}
                  </Text>
                }
              />
            </div>
          </Col>
          <Col span={18}>
            {systemHealth.alerts.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {systemHealth.alerts.map((alert, index) => (
                  <Alert
                    key={index}
                    message={alert.message}
                    type={alert.type}
                    showIcon
                    action={
                      <Button size="small" type="link" onClick={() => navigateToSection(alert.action)}>
                        Xem chi tiết
                      </Button>
                    }
                  />
                ))}
              </Space>
            ) : (
              <Alert message="Hệ thống hoạt động bình thường" type="success" showIcon />
            )}
          </Col>
        </Row>
      </Card>

      {/* Quick Actions */}
      <Card title="Thao tác nhanh" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          {quickActions.map((action, index) => (
            <Col span={6} key={index}>
              <Card
                hoverable
                style={{ textAlign: 'center', cursor: 'pointer' }}
                onClick={() => navigateToSection(action.action)}
              >
                <div style={{ fontSize: '32px', color: action.color, marginBottom: 8 }}>
                  {action.icon}
                </div>
                <Title level={5}>{action.title}</Title>
                <Text type="secondary">{action.description}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Recent Activities and Alerts */}
      <Row gutter={16}>
        <Col span={16}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                Hoạt động gần đây
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigateToSection('health')}>
                Xem tất cả
              </Button>
            }
          >
            <Spin spinning={loading}>
              <Table
                columns={activityColumns}
                dataSource={Array.isArray(recentActivities) ? recentActivities : []}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ y: 300 }}
              />
            </Spin>
          </Card>
        </Col>
        <Col span={8}>
          <Card 
            title={
              <Space>
                <WarningOutlined />
                Cảnh báo tồn kho
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigateToSection('medications')}>
                Xem tất cả
              </Button>
            }
          >
            <Spin spinning={loading}>
              {lowStockItems.length > 0 ? (
                <Table
                  columns={lowStockColumns}
                  dataSource={Array.isArray(lowStockItems) ? lowStockItems : []}
                  rowKey="medicationId"
                  pagination={false}
                  size="small"
                  scroll={{ y: 300 }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Không có thuốc nào sắp hết</Text>
                  </div>
                </div>
              )}
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Overview; 