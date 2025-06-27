import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Descriptions, 
  Badge, 
  Button, 
  Tabs, 
  Row, 
  Col, 
  Timeline, 
  Input, 
  Form, 
  Select,
  Space,
  message,
  List,
  Divider,
  Tag,
  Modal,
  Empty
} from 'antd';
import { 
  AlertOutlined, 
  MedicineBoxOutlined, 
  FileTextOutlined, 
  PlusOutlined,
  CheckOutlined,
  BellOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import './MedicalIncidentDetail.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// Mock data thuốc
const medicineOptions = [
  { value: 'paracetamol', label: 'Paracetamol' },
  { value: 'ibuprofen', label: 'Ibuprofen' },
  { value: 'vitamin_c', label: 'Vitamin C' },
  { value: 'amoxicillin', label: 'Amoxicillin' },
  { value: 'cetirizine', label: 'Cetirizine' },
  { value: 'bandage', label: 'Băng cá nhân' },
  { value: 'antiseptic', label: 'Dung dịch sát khuẩn' },
];

const MedicalIncidentDetail = ({ 
  incident, 
  onUpdate, 
  onClose,
  onFinish
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [actionForm] = Form.useForm();
  const [medicineForm] = Form.useForm();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showActionForm, setShowActionForm] = useState(false);
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  // Lấy mã màu dựa trên mức độ nghiêm trọng
  const getSeverityColor = (severity) => {
    const severityColors = {
      low: 'blue',
      medium: 'orange',
      high: 'red'
    };
    return severityColors[severity] || 'blue';
  };
  
  // Lấy nhãn hiển thị của mức độ
  const getSeverityLabel = (severity) => {
    const severityLabels = {
      low: 'Thấp',
      medium: 'Trung bình',
      high: 'Cao'
    };
    return severityLabels[severity] || 'Không xác định';
  };

  // Hàm xử lý khi thêm hành động mới
  const handleAddAction = (values) => {
    console.log('New action:', values);
    message.success('Đã thêm hành động mới');
    setShowActionForm(false);
    actionForm.resetFields();
    // Gọi API cập nhật hành động ở đây
  };

  // Hàm xử lý khi thêm thuốc mới
  const handleAddMedicine = (values) => {
    console.log('New medicine:', values);
    message.success('Đã thêm thuốc mới');
    setShowMedicineForm(false);
    medicineForm.resetFields();
    // Gọi API cập nhật thuốc ở đây
  };

  // Hàm xử lý khi cập nhật trạng thái
  const handleUpdateStatus = (newStatus) => {
    setUpdatingStatus(true);
    
    // Giả lập gọi API
    setTimeout(() => {
      const updatedIncident = {
        ...incident,
        status: newStatus
      };
      message.success(`Đã cập nhật trạng thái thành ${newStatus}`);
      onUpdate(updatedIncident);
      setUpdatingStatus(false);
    }, 1000);
  };

  // Hàm xử lý khi hoàn thành sự kiện
  const handleFinishIncident = () => {
    setUpdatingStatus(true);
    
    // Giả lập gọi API
    setTimeout(() => {
      message.success('Đã đóng sự kiện y tế');
      onFinish(incident.id);
      setUpdatingStatus(false);
    }, 1000);
  };

  // Hàm xử lý khi thông báo cho phụ huynh
  const handleNotifyParent = (values) => {
    console.log('Notify parent:', values);
    message.success('Đã gửi thông báo cho phụ huynh');
    setShowNotifyModal(false);
    // Gọi API gửi thông báo ở đây
  };

  // Lịch sử hoạt động (giả lập)
  const activities = [
    {
      date: '2025-06-18 08:30',
      user: 'Y tá Nguyễn Thị A',
      action: 'Đã tạo sự kiện y tế',
      description: 'Ghi nhận học sinh bị sốt cao khi đang ở lớp'
    },
    {
      date: '2025-06-18 08:35',
      user: 'Y tá Nguyễn Thị A',
      action: 'Đã thực hiện kiểm tra',
      description: 'Đo nhiệt độ: 38.5°C, kiểm tra các biểu hiện khác'
    },
    {
      date: '2025-06-18 08:40',
      user: 'Y tá Nguyễn Thị A',
      action: 'Đã sử dụng thuốc',
      description: 'Sử dụng Paracetamol 500mg'
    },
  ];

  return (
    <div className="medical-incident-detail">
      <div className="incident-header">
        <div className="incident-title">
          <AlertOutlined className="icon-alert" />
          <Title level={4}>
            Sự kiện y tế #{incident.id}: {incident.incidentType}
            <Tag 
              color={getSeverityColor(incident.severity)} 
              style={{ marginLeft: 8 }}
            >
              Mức độ: {getSeverityLabel(incident.severity)}
            </Tag>
          </Title>
        </div>
        <div className="incident-actions">
          <Space>
            <Button icon={<PrinterOutlined />}>In báo cáo</Button>
            <Button 
              icon={<BellOutlined />}
              onClick={() => setShowNotifyModal(true)}
            >
              Thông báo phụ huynh
            </Button>
            {incident.status !== 'closed' && (
              <Button 
                type="primary" 
                icon={<CheckOutlined />}
                onClick={handleFinishIncident}
                loading={updatingStatus}
              >
                Hoàn thành sự kiện
              </Button>
            )}
            <Button onClick={onClose}>Đóng</Button>
          </Space>
        </div>
      </div>

      <div className="incident-status">
        <Badge
          status={
            incident.status === 'new' ? 'processing' :
            incident.status === 'processing' ? 'warning' : 
            'success'
          }
          text={
            incident.status === 'new' ? 'Mới' :
            incident.status === 'processing' ? 'Đang xử lý' :
            'Đã đóng'
          }
        />
        {incident.status === 'new' && (
          <Button 
            type="link" 
            onClick={() => handleUpdateStatus('processing')}
            loading={updatingStatus}
          >
            Bắt đầu xử lý
          </Button>
        )}
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="incident-tabs"
      >
        <TabPane 
          tab={<span><FileTextOutlined />Thông tin chung</span>} 
          key="overview"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Thông tin học sinh" className="info-card">
                <Descriptions column={1}>
                  <Descriptions.Item label="Tên học sinh">{incident.studentName}</Descriptions.Item>
                  <Descriptions.Item label="Lớp">{incident.class}</Descriptions.Item>
                  <Descriptions.Item label="Ngày sinh">01/01/2010</Descriptions.Item>
                  <Descriptions.Item label="Thông tin liên hệ">
                    <div>Phụ huynh: Nguyễn Văn X</div>
                    <div>SĐT: 0987654321</div>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card title="Thông tin sự kiện" className="info-card">
                <Descriptions column={1}>
                  <Descriptions.Item label="Loại sự kiện">{incident.incidentType}</Descriptions.Item>
                  <Descriptions.Item label="Thời gian xảy ra">{incident.incidentDate}</Descriptions.Item>
                  <Descriptions.Item label="Mức độ">{getSeverityLabel(incident.severity)}</Descriptions.Item>
                  <Descriptions.Item label="Mô tả">{incident.description}</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane 
          tab={<span><AlertOutlined />Hành động đã thực hiện</span>} 
          key="actions"
        >
          <Card 
            title="Các hành động đã thực hiện" 
            className="actions-card"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setShowActionForm(true)}
                disabled={incident.status === 'closed'}
              >
                Thêm hành động
              </Button>
            }
          >
            {showActionForm && (
              <div className="action-form">
                <Form
                  form={actionForm}
                  layout="vertical"
                  onFinish={handleAddAction}
                >
                  <Form.Item
                    name="action"
                    label="Hành động thực hiện"
                    rules={[{ required: true, message: 'Vui lòng nhập hành động' }]}
                  >
                    <Input placeholder="Nhập hành động" />
                  </Form.Item>
                  
                  <Form.Item
                    name="description"
                    label="Mô tả chi tiết"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                  >
                    <TextArea rows={3} placeholder="Mô tả chi tiết hành động thực hiện" />
                  </Form.Item>
                  
                  <Form.Item>
                    <Space>
                      <Button htmlType="submit" type="primary">
                        Lưu
                      </Button>
                      <Button onClick={() => setShowActionForm(false)}>
                        Hủy
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </div>
            )}
            
            {!showActionForm && (
              incident.actions?.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={incident.actions}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="Chưa có hành động nào được ghi nhận" />
              )
            )}
          </Card>
        </TabPane>
        
        <TabPane 
          tab={<span><MedicineBoxOutlined />Thuốc đã sử dụng</span>} 
          key="medicines"
        >
          <Card 
            title="Thuốc đã sử dụng" 
            className="medicines-card"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setShowMedicineForm(true)}
                disabled={incident.status === 'closed'}
              >
                Thêm thuốc
              </Button>
            }
          >
            {showMedicineForm && (
              <div className="medicine-form">
                <Form
                  form={medicineForm}
                  layout="vertical"
                  onFinish={handleAddMedicine}
                >
                  <Row gutter={16}>
                    <Col span={16}>
                      <Form.Item
                        name="medicine"
                        label="Thuốc"
                        rules={[{ required: true, message: 'Vui lòng chọn thuốc' }]}
                      >
                        <Select 
                          placeholder="Chọn thuốc" 
                          options={medicineOptions}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="quantity"
                        label="Liều lượng"
                        rules={[{ required: true, message: 'Vui lòng nhập liều lượng' }]}
                      >
                        <Input placeholder="Nhập liều lượng" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item
                    name="notes"
                    label="Ghi chú"
                  >
                    <TextArea rows={2} placeholder="Ghi chú về việc sử dụng thuốc" />
                  </Form.Item>
                  
                  <Form.Item>
                    <Space>
                      <Button htmlType="submit" type="primary">
                        Lưu
                      </Button>
                      <Button onClick={() => setShowMedicineForm(false)}>
                        Hủy
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </div>
            )}
            
            {!showMedicineForm && (
              incident.medicinesUsed?.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={incident.medicinesUsed}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="Chưa có thuốc nào được sử dụng" />
              )
            )}
          </Card>
        </TabPane>
        
        <TabPane 
          tab={<span><FileTextOutlined />Nhật ký hoạt động</span>} 
          key="activity"
        >
          <Card title="Lịch sử hoạt động" className="activity-card">
            <Timeline>
              {activities.map((activity, index) => (
                <Timeline.Item key={index}>
                  <div className="activity-item">
                    <div className="activity-title">
                      <strong>{activity.action}</strong>
                      <span className="activity-date">{activity.date}</span>
                    </div>
                    <div className="activity-user">{activity.user}</div>
                    <div className="activity-description">{activity.description}</div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </TabPane>
      </Tabs>
      
      {/* Modal thông báo phụ huynh */}
      <Modal
        title="Thông báo cho phụ huynh"
        open={showNotifyModal}
        onCancel={() => setShowNotifyModal(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleNotifyParent}>
          <Form.Item
            name="notifyType"
            label="Hình thức thông báo"
            initialValue="sms"
          >
            <Select>
              <Option value="sms">Tin nhắn SMS</Option>
              <Option value="app">Thông báo qua ứng dụng</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="message"
            label="Nội dung thông báo"
            initialValue={`Trường thông báo: Học sinh ${incident.studentName} ${
              incident.severity === 'high' ? 'đang gặp vấn đề sức khỏe nghiêm trọng' : 
              'đang được theo dõi bởi y tế trường'
            }. Phụ huynh vui lòng liên hệ với nhà trường.`}
          >
            <TextArea rows={4} />
          </Form.Item>
          
          <Form.Item
            name="contactInfo"
            label="Thông tin liên hệ"
            initialValue="Phụ huynh Nguyễn Văn X - 0987654321"
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setShowNotifyModal(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Gửi thông báo
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicalIncidentDetail; 