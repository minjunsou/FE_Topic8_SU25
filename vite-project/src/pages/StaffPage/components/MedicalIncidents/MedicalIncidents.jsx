import React, { useState } from 'react';
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
  Empty
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  AlertOutlined,
  FilterOutlined
} from '@ant-design/icons';
import NewMedicalIncidentForm from './NewMedicalIncidentForm';
import './MedicalIncidents.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const MedicalIncidents = ({ 
  medicalIncidents, 
  handleViewIncidentDetail,
  loading 
}) => {
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [newIncidentModalVisible, setNewIncidentModalVisible] = useState(false);

  // Lọc dữ liệu theo tìm kiếm và trạng thái
  const filteredData = medicalIncidents
    .filter(item => {
      const matchSearch = 
        item.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.class.toLowerCase().includes(searchText.toLowerCase()) ||
        item.incidentType.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase());
      
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      
      return matchSearch && matchStatus;
    });

  // Hàm hiển thị trạng thái
  const renderStatus = (status) => {
    const statusConfig = {
      new: {
        color: 'gold',
        text: 'Mới'
      },
      processing: {
        color: 'blue',
        text: 'Đang xử lý'
      },
      closed: {
        color: 'green',
        text: 'Đã đóng'
      }
    };

    return <Badge color={statusConfig[status].color} text={statusConfig[status].text} />;
  };

  // Hàm hiển thị mức độ nghiêm trọng
  const renderSeverity = (severity) => {
    const severityConfig = {
      low: {
        color: 'blue',
        text: 'Thấp'
      },
      medium: {
        color: 'orange',
        text: 'Trung bình'
      },
      high: {
        color: 'red',
        text: 'Cao'
      }
    };

    return <Tag color={severityConfig[severity].color}>{severityConfig[severity].text}</Tag>;
  };

  // Cấu hình cột cho bảng
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
        <a onClick={() => handleViewDetail(record.id)}>
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
      title: 'Ngày ghi nhận',
      dataIndex: 'incidentDate',
      key: 'incidentDate',
      width: 130,
    },
    {
      title: 'Loại sự kiện',
      dataIndex: 'incidentType',
      key: 'incidentType',
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => renderSeverity(severity),
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
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleViewDetail(record.id)}
          >
            Chi tiết
          </Button>
          <Button 
            type={record.status === 'new' ? 'default' : 'primary'} 
            size="small"
            ghost={record.status !== 'new'}
            onClick={() => handleViewDetail(record.id)}
          >
            {record.status === 'new' ? 'Xử lý' : 'Cập nhật'}
          </Button>
        </Space>
      ),
    },
  ];

  // Xử lý khi click vào xem chi tiết
  const handleViewDetail = (id) => {
    setDrawerVisible(true);
    handleViewIncidentDetail(id);
  };

  // Xử lý tạo sự kiện y tế mới
  const handleNewIncident = () => {
    setNewIncidentModalVisible(true);
  };

  // Xử lý khi submit form tạo sự kiện mới
  const handleFormSubmit = (values) => {
    console.log('New medical incident:', values);
    setNewIncidentModalVisible(false);
    // Thêm logic gọi API tạo sự kiện mới ở đây
  };

  // Lấy dữ liệu chi tiết sự kiện (giả lập)
  const getIncidentDetail = (id) => {
    return medicalIncidents.find(incident => incident.id === id) || {};
  };

  const incidentDetail = drawerVisible && medicalIncidents.length > 0 
    ? getIncidentDetail(1) // Giả lập lấy chi tiết incident đầu tiên
    : {};

  return (
    <div className="medical-incidents-container">
      <Card
        title={
          <Space>
            <AlertOutlined style={{ color: '#ff4d4f' }} />
            <Title level={4} style={{ margin: 0 }}>Quản lý sự kiện y tế</Title>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleNewIncident}
          >
            Sự kiện mới
          </Button>
        }
      >
        <div className="filter-section">
          <Input
            placeholder="Tìm kiếm học sinh, lớp, loại sự kiện..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300, marginRight: 16 }}
            allowClear
          />
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            onChange={value => setFilterStatus(value)}
            prefix={<FilterOutlined />}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="new">Mới</Option>
            <Option value="processing">Đang xử lý</Option>
            <Option value="closed">Đã đóng</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sự kiện`
          }}
        />
      </Card>

      {/* Drawer hiển thị chi tiết sự kiện y tế */}
      <Drawer
        title={`Chi tiết sự kiện #${incidentDetail.id}`}
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {drawerVisible && (
          <div className="incident-detail">
            <Tabs defaultActiveKey="1">
              <TabPane tab="Thông tin chung" key="1">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Card className="detail-card" bordered={false}>
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Text type="secondary">Học sinh:</Text>
                          <div><strong>{incidentDetail.studentName}</strong></div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">Lớp:</Text>
                          <div><strong>{incidentDetail.class}</strong></div>
                        </Col>
                      </Row>
                      
                      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col span={12}>
                          <Text type="secondary">Ngày ghi nhận:</Text>
                          <div><strong>{incidentDetail.incidentDate}</strong></div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">Trạng thái:</Text>
                          <div>{renderStatus(incidentDetail.status)}</div>
                        </Col>
                      </Row>

                      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col span={12}>
                          <Text type="secondary">Loại sự kiện:</Text>
                          <div><strong>{incidentDetail.incidentType}</strong></div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">Mức độ:</Text>
                          <div>{renderSeverity(incidentDetail.severity)}</div>
                        </Col>
                      </Row>

                      <Row style={{ marginTop: 16 }}>
                        <Col span={24}>
                          <Text type="secondary">Mô tả:</Text>
                          <div><strong>{incidentDetail.description}</strong></div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              </TabPane>
              
              <TabPane tab="Hành động đã thực hiện" key="2">
                <Card className="detail-card" bordered={false}>
                  {incidentDetail.actions?.length ? (
                    <ul className="action-list">
                      {incidentDetail.actions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  ) : (
                    <Empty description="Chưa có hành động nào được ghi nhận" />
                  )}
                </Card>
              </TabPane>
              
              <TabPane tab="Thuốc đã dùng" key="3">
                <Card className="detail-card" bordered={false}>
                  {incidentDetail.medicinesUsed?.length ? (
                    <ul className="medicines-list">
                      {incidentDetail.medicinesUsed.map((medicine, index) => (
                        <li key={index}>{medicine}</li>
                      ))}
                    </ul>
                  ) : (
                    <Empty description="Chưa có thuốc nào được sử dụng" />
                  )}
                </Card>
              </TabPane>
            </Tabs>

            <div className="drawer-footer">
              <Space>
                <Button onClick={() => setDrawerVisible(false)}>Đóng</Button>
                <Button type="primary">
                  {incidentDetail.status === 'new' ? 'Bắt đầu xử lý' : 
                   incidentDetail.status === 'processing' ? 'Cập nhật' : 'Tạo báo cáo'}
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>

      {/* Modal tạo sự kiện y tế mới */}
      <Modal
        title={
          <Space>
            <AlertOutlined style={{ color: '#ff4d4f' }} />
            <span>Tạo sự kiện y tế mới</span>
          </Space>
        }
        open={newIncidentModalVisible}
        onCancel={() => setNewIncidentModalVisible(false)}
        footer={null}
        width={700}
      >
        <NewMedicalIncidentForm 
          onSubmit={handleFormSubmit} 
          onCancel={() => setNewIncidentModalVisible(false)} 
        />
      </Modal>
    </div>
  );
};

export default MedicalIncidents; 