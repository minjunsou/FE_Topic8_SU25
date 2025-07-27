import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Input, 
  Badge, 
  Tag, 
  Select,
  Modal, 
  Form,
  message,
  Spin,
  DatePicker,
  List,
  Typography,
  Row,
  Col,
  Timeline,
  Alert,
  Descriptions,
  Avatar
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import nurseApi from '../../../../api/nurseApi';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const HealthEventFollowUp = ({ healthEventId, onFollowUpUpdate }) => {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    if (healthEventId) {
      fetchFollowUps();
    }
  }, [healthEventId]);

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const data = await nurseApi.getFollowUpsByHealthEvent(healthEventId);
      console.log('Follow-ups for health event:', data);
      setFollowUps(data);
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
      message.error('Không thể tải danh sách follow-ups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFollowUp = async (values) => {
    try {
      const data = {
        eventId: healthEventId,
        parentId: values.parentId, // This should be selected from dropdown
        instruction: values.instruction,
        requiresDoctor: values.requiresDoctor,
        status: values.status || 'PENDING'
      };

      await nurseApi.createHealthEventFollowUp(data);
      message.success('Tạo follow-up thành công');
      setModalVisible(false);
      form.resetFields();
      fetchFollowUps();
      if (onFollowUpUpdate) {
        onFollowUpUpdate();
      }
    } catch (error) {
      console.error('Error creating follow-up:', error);
      message.error('Không thể tạo follow-up');
    }
  };

  const handleUpdateFollowUp = async (values) => {
    try {
      await nurseApi.updateFollowUpStatus(selectedFollowUp.followId, values.status);
      message.success('Cập nhật follow-up thành công');
      setEditModalVisible(false);
      editForm.resetFields();
      fetchFollowUps();
      if (onFollowUpUpdate) {
        onFollowUpUpdate();
      }
    } catch (error) {
      console.error('Error updating follow-up:', error);
      message.error('Không thể cập nhật follow-up');
    }
  };

  const handleAcknowledgeFollowUp = async (followUpId) => {
    try {
      await nurseApi.acknowledgeFollowUp(followUpId);
      message.success('Xác nhận follow-up thành công');
      fetchFollowUps();
      if (onFollowUpUpdate) {
        onFollowUpUpdate();
      }
    } catch (error) {
      console.error('Error acknowledging follow-up:', error);
      message.error('Không thể xác nhận follow-up');
    }
  };

  const renderStatus = (status) => {
    const statusConfig = {
      PENDING: {
        color: 'orange',
        text: 'Chờ xử lý',
        icon: <ClockCircleOutlined />
      },
      IN_PROGRESS: {
        color: 'blue',
        text: 'Đang thực hiện',
        icon: <ClockCircleOutlined />
      },
      COMPLETED: {
        color: 'green',
        text: 'Hoàn thành',
        icon: <CheckCircleOutlined />
      },
      CANCELLED: {
        color: 'red',
        text: 'Đã hủy',
        icon: <ExclamationCircleOutlined />
      },
      ACKNOWLEDGED: {
        color: 'green',
        text: 'Đã xác nhận',
        icon: <CheckCircleOutlined />
      }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge color={config.color} text={config.text} />;
  };

  const renderTimeline = () => {
    return (
      <Timeline>
        {followUps.map((followUp, index) => (
          <Timeline.Item 
            key={followUp.followId || index}
            color={followUp.status === 'COMPLETED' || followUp.status === 'ACKNOWLEDGED' ? 'green' : 
                   followUp.status === 'IN_PROGRESS' ? 'blue' : 
                   followUp.status === 'CANCELLED' ? 'red' : 'orange'}
          >
            <Card size="small" style={{ marginBottom: 8 }}>
              <Row gutter={16} align="middle">
                <Col span={16}>
                  <Title level={5}>
                    <Space>
                      <MedicineBoxOutlined />
                      Follow-up #{followUp.followId}
                    </Space>
                  </Title>
                  <Text type="secondary">
                    <CalendarOutlined /> Tạo lúc: {followUp.createdAt ? dayjs(followUp.createdAt).format('DD/MM/YYYY HH:mm') : 'N/A'}
                  </Text>
                  <Paragraph style={{ marginTop: 8 }}>
                    <Text strong>Hướng dẫn:</Text> {followUp.instruction}
                  </Paragraph>
                  {followUp.requiresDoctor && (
                    <Alert 
                      message="Cần tư vấn bác sĩ" 
                      type="warning" 
                      showIcon 
                      style={{ marginTop: 8 }}
                    />
                  )}
                </Col>
                <Col span={8} style={{ textAlign: 'right' }}>
                  {renderStatus(followUp.status)}
                  <Space style={{ marginTop: 8 }}>
                    <Button 
                      size="small" 
                      icon={<EditOutlined />}
                      onClick={() => {
                        setSelectedFollowUp(followUp);
                        editForm.setFieldsValue({
                          instruction: followUp.instruction,
                          requiresDoctor: followUp.requiresDoctor,
                          status: followUp.status
                        });
                        setEditModalVisible(true);
                      }}
                    >
                      Sửa
                    </Button>
                    {followUp.status === 'PENDING' && (
                      <Button 
                        size="small" 
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleAcknowledgeFollowUp(followUp.followId)}
                      >
                        Xác nhận
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  return (
    <div className="health-event-follow-up">
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>Theo dõi sau sự cố</span>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setModalVisible(true)}
          >
            Thêm follow-up
          </Button>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        ) : followUps.length > 0 ? (
          renderTimeline()
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Text type="secondary">Chưa có follow-up nào</Text>
          </div>
        )}
      </Card>

      {/* Create Follow-up Modal */}
      <Modal
        title="Thêm follow-up mới"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateFollowUp}
        >
          <Form.Item
            name="parentId"
            label="Phụ huynh"
            rules={[{ required: true, message: 'Vui lòng chọn phụ huynh' }]}
          >
            <Select placeholder="Chọn phụ huynh">
              {/* This should be populated with actual parent data */}
              <Option value="parent-uuid-1">Phụ huynh 1</Option>
              <Option value="parent-uuid-2">Phụ huynh 2</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="instruction"
            label="Hướng dẫn"
            rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn' }]}
          >
            <TextArea rows={4} placeholder="Nhập hướng dẫn chi tiết..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="requiresDoctor"
                label="Cần tư vấn bác sĩ"
                valuePropName="checked"
              >
                <Select placeholder="Chọn">
                  <Option value={true}>Có</Option>
                  <Option value={false}>Không</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="PENDING">Chờ xử lý</Option>
                  <Option value="IN_PROGRESS">Đang thực hiện</Option>
                  <Option value="COMPLETED">Hoàn thành</Option>
                  <Option value="CANCELLED">Đã hủy</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Tạo follow-up
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Follow-up Modal */}
      <Modal
        title="Sửa follow-up"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateFollowUp}
        >
          <Form.Item
            name="instruction"
            label="Hướng dẫn"
            rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn' }]}
          >
            <TextArea rows={4} placeholder="Nhập hướng dẫn chi tiết..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="requiresDoctor"
                label="Cần tư vấn bác sĩ"
                valuePropName="checked"
              >
                <Select placeholder="Chọn">
                  <Option value={true}>Có</Option>
                  <Option value={false}>Không</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="PENDING">Chờ xử lý</Option>
                  <Option value="IN_PROGRESS">Đang thực hiện</Option>
                  <Option value="COMPLETED">Hoàn thành</Option>
                  <Option value="CANCELLED">Đã hủy</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthEventFollowUp; 