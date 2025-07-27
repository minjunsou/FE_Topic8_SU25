import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Row,
  Col,
  Alert,
  Divider,
  Typography,
  Card,
  Tag,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  AlertOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  EditOutlined,
  PlusOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const HealthEventForm = ({
  visible,
  onCancel,
  onSubmit,
  selectedEvent,
  students,
  studentsLoading,
  form
}) => {
  const isEdit = !!selectedEvent;

  // Form validation rules
  const formValidationRules = {
    eventDate: [
      { required: true, message: 'Vui lòng chọn ngày xảy ra' }
    ],
    eventType: [
      { required: true, message: 'Vui lòng nhập loại sự cố' }
    ],
    description: [
      { required: true, message: 'Vui lòng nhập mô tả' },
      { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' }
    ],
    solution: [
      { required: true, message: 'Vui lòng nhập giải pháp' },
      { min: 5, message: 'Giải pháp phải có ít nhất 5 ký tự' }
    ],
    priority: [
      { required: true, message: 'Vui lòng chọn mức độ' }
    ],
    status: [
      { required: true, message: 'Vui lòng chọn trạng thái' }
    ],
    studentId: [
      { required: true, message: 'Vui lòng chọn học sinh' }
    ]
  };

  // Priority options with descriptions
  const priorityOptions = [
    {
      value: 'LOW',
      label: 'Thấp',
      description: 'Có thể xử lý tại trường, không cần thông báo phụ huynh',
      icon: <CheckCircleOutlined />,
      color: 'blue'
    },
    {
      value: 'MEDIUM',
      label: 'Trung bình',
      description: 'Cần thông báo phụ huynh qua email, cần phê duyệt',
      icon: <InfoCircleOutlined />,
      color: 'gold'
    },
    {
      value: 'HIGH',
      label: 'Cao',
      description: 'Cần thông báo ngay phụ huynh, phê duyệt khẩn cấp',
      icon: <AlertOutlined />,
      color: 'orange'
    },
    {
      value: 'CRITICAL',
      label: 'Khẩn cấp',
      description: 'Thông báo khẩn cấp, cần hành động ngay lập tức',
      icon: <ExclamationCircleOutlined />,
      color: 'red'
    }
  ];

  // Status options
  const statusOptions = [
    { value: 'PENDING', label: 'Chờ xử lý', color: 'orange' },
    { value: 'IN_PROGRESS', label: 'Đang xử lý', color: 'blue' },
    { value: 'COMPLETED', label: 'Hoàn thành', color: 'green' },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'red' }
  ];

  // Event type suggestions
  const eventTypeSuggestions = [
    'Chấn thương',
    'Bệnh tật',
    'Dị ứng',
    'Tai nạn',
    'Sốt',
    'Đau đầu',
    'Buồn nôn',
    'Chảy máu',
    'Gãy xương',
    'Bỏng',
    'Ngộ độc',
    'Khác'
  ];

  // Handle form submit
  const handleSubmit = async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible && !isEdit) {
      form.resetFields();
    }
  }, [visible, isEdit, form]);

  return (
    <Modal
      title={
        <Space>
          {isEdit ? <EditOutlined /> : <PlusOutlined />}
          {isEdit ? 'Chỉnh sửa sự cố y tế' : 'Thêm sự cố y tế mới'}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      className="health-event-form-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          priority: 'MEDIUM',
          status: 'PENDING',
          requiresHomeCare: false
        }}
      >
        {/* Basic Information */}
        <Card title="Thông tin cơ bản" size="small" className="form-section">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="eventDate"
                label={
                  <Space>
                    <CalendarOutlined />
                    Ngày xảy ra
                  </Space>
                }
                rules={formValidationRules.eventDate}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Chọn ngày"
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current > moment().endOf('day')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="eventType"
                label={
                  <Space>
                    <FileTextOutlined />
                    Loại sự cố
                  </Space>
                }
                rules={formValidationRules.eventType}
              >
                <Select
                  placeholder="Chọn hoặc nhập loại sự cố"
                  showSearch
                  allowClear
                  mode="tags"
                  options={eventTypeSuggestions.map(type => ({ label: type, value: type }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {!isEdit && (
            <Form.Item
              name="studentId"
              label={
                <Space>
                  <UserOutlined />
                  Học sinh
                </Space>
              }
              rules={formValidationRules.studentId}
            >
              <Select
                placeholder="Chọn học sinh"
                loading={studentsLoading}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {students.map(student => (
                  <Option key={student.accountId} value={student.accountId}>
                    {student.fullName} - {student.studentCode}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Card>

        {/* Event Details */}
        <Card title="Chi tiết sự cố" size="small" className="form-section">
          <Form.Item
            name="description"
            label={
              <Space>
                <InfoCircleOutlined />
                Mô tả chi tiết
              </Space>
            }
            rules={formValidationRules.description}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả chi tiết về sự cố y tế đã xảy ra..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="solution"
                label={
                  <Space>
                    <CheckCircleOutlined />
                    Giải pháp đã áp dụng
                  </Space>
                }
                rules={formValidationRules.solution}
              >
                <TextArea
                  rows={3}
                  placeholder="Giải pháp đã được áp dụng..."
                  showCount
                  maxLength={300}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="note"
                label={
                  <Space>
                    <InfoCircleOutlined />
                    Ghi chú bổ sung
                  </Space>
                }
              >
                <TextArea
                  rows={3}
                  placeholder="Ghi chú bổ sung (nếu có)..."
                  showCount
                  maxLength={200}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Priority and Status */}
        <Card title="Phân loại và trạng thái" size="small" className="form-section">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="priority"
                label={
                  <Space>
                    <AlertOutlined />
                    Mức độ
                  </Space>
                }
                rules={formValidationRules.priority}
              >
                <Select placeholder="Chọn mức độ">
                  {priorityOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      <Space>
                        {option.icon}
                        {option.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              {/* Priority description */}
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  const priority = getFieldValue('priority');
                  const priorityInfo = priorityOptions.find(p => p.value === priority);
                  return priorityInfo ? (
                    <Alert
                      message={priorityInfo.label}
                      description={priorityInfo.description}
                      type="info"
                      showIcon
                      style={{ marginTop: 8 }}
                    />
                  ) : null;
                }}
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="status"
                label={
                  <Space>
                    <InfoCircleOutlined />
                    Trạng thái
                  </Space>
                }
                rules={formValidationRules.status}
              >
                <Select placeholder="Chọn trạng thái">
                  {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      <Tag color={option.color}>{option.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="requiresHomeCare"
                label={
                  <Space>
                    <HomeOutlined />
                    Cần chăm sóc tại nhà
                  </Space>
                }
                valuePropName="checked"
              >
                <Select placeholder="Chọn">
                  <Option value={true}>
                    <Space>
                      <HomeOutlined />
                      Có
                    </Space>
                  </Option>
                  <Option value={false}>
                    <Space>
                      <CheckCircleOutlined />
                      Không
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Form Actions */}
        <Divider />
        <div className="form-actions">
          <Space>
            <Button type="primary" htmlType="submit" size="large">
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </Button>
            <Button onClick={onCancel} size="large">
              Hủy
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default HealthEventForm; 