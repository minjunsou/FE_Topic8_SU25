import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Alert,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Divider,
  Descriptions,
  Tag,
  Badge,
  Row,
  Col
} from 'antd';
import {
  ExperimentOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import nurseApi from '../../../../api/nurseApi';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const HealthEventTest = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [students, setStudents] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Get user info
    try {
      const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      setUserInfo(storedUserInfo);
    } catch (error) {
      console.error('Error parsing user info:', error);
    }

    // Get students
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const studentsData = await nurseApi.getStudents();
      if (studentsData && Array.isArray(studentsData)) {
        setStudents(studentsData);
      } else {
        // Mock data fallback
        setStudents([
          {
            accountId: '550e8400-e29b-41d4-a716-446655440001',
            fullName: 'Nguyễn Văn A',
            studentCode: 'ST001'
          },
          {
            accountId: '550e8400-e29b-41d4-a716-446655440002',
            fullName: 'Trần Thị B',
            studentCode: 'ST002'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // Mock data fallback
      setStudents([
        {
          accountId: '550e8400-e29b-41d4-a716-446655440001',
          fullName: 'Nguyễn Văn A',
          studentCode: 'ST001'
        },
        {
          accountId: '550e8400-e29b-41d4-a716-446655440002',
          fullName: 'Trần Thị B',
          studentCode: 'ST002'
        }
      ]);
    }
  };

  const validateTestData = (values) => {
    const errors = [];

    // Check required fields
    if (!values.studentId) {
      errors.push('Vui lòng chọn học sinh');
    }

    if (!values.eventDate) {
      errors.push('Vui lòng chọn ngày xảy ra sự cố');
    }

    if (!values.eventType || values.eventType.trim().length === 0) {
      errors.push('Vui lòng nhập loại sự cố');
    }

    if (!values.description || values.description.trim().length === 0) {
      errors.push('Vui lòng nhập mô tả sự cố');
    }

    if (!values.priority) {
      errors.push('Vui lòng chọn mức độ ưu tiên');
    }

    if (!values.status) {
      errors.push('Vui lòng chọn trạng thái');
    }

    // Check user validation
    if (!userInfo) {
      errors.push('Không có thông tin người dùng');
    } else if (!userInfo.accountId) {
      errors.push('Thiếu accountId của người dùng');
    } else if (userInfo.roleId !== 3) {
      errors.push(`Người dùng có roleId = ${userInfo.roleId}, cần roleId = 3 (NURSE)`);
    }

    return errors;
  };

  const handleTestSubmit = async (values) => {
    setLoading(true);
    setTestResult(null);

    try {
      // Validate test data
      const validationErrors = validateTestData(values);
      if (validationErrors.length > 0) {
        setTestResult({
          success: false,
          message: 'Validation Failed',
          errors: validationErrors,
          type: 'validation'
        });
        return;
      }

      // Prepare test data
      const testData = {
        eventDate: values.eventDate ? values.eventDate.format('YYYY-MM-DD') : null,
        eventType: values.eventType?.trim(),
        description: values.description?.trim(),
        solution: values.solution?.trim(),
        note: values.note?.trim(),
        status: values.status,
        priority: values.priority,
        requiresHomeCare: values.requiresHomeCare,
        medications: values.medications || []
      };

      console.log('Test data to send:', {
        studentId: values.studentId,
        nurseId: userInfo.accountId,
        data: testData
      });

      // Attempt to create health event
      const result = await nurseApi.createHealthEvent(values.studentId, testData);

      setTestResult({
        success: true,
        message: 'Health Event Created Successfully',
        data: result,
        type: 'success'
      });

      message.success('Test thành công! Health event đã được tạo.');
      form.resetFields();

    } catch (error) {
      console.error('Test failed:', error);

      let errorMessage = 'Có lỗi xảy ra';
      let errorDetails = [];

      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            errorMessage = 'Dữ liệu không hợp lệ';
            errorDetails.push(data?.message || 'Bad Request');
            break;
          case 401:
            errorMessage = 'Phiên đăng nhập đã hết hạn';
            errorDetails.push('Unauthorized');
            break;
          case 403:
            errorMessage = 'Không có quyền thực hiện';
            errorDetails.push('Forbidden');
            break;
          case 404:
            errorMessage = 'Không tìm thấy tài nguyên';
            errorDetails.push('Not Found');
            break;
          case 500:
            errorMessage = 'Lỗi server';
            if (data?.message) {
              if (data.message.includes('Student not exists or not a student')) {
                errorMessage = 'Học sinh không tồn tại hoặc không phải là học sinh';
              } else if (data.message.includes('Nurse not exists or not a nurse')) {
                errorMessage = 'Y tá không tồn tại hoặc không phải là y tá';
              } else {
                errorDetails.push(data.message);
              }
            }
            break;
          default:
            errorDetails.push(data?.message || 'Unknown error');
        }
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Không thể kết nối đến server';
        errorDetails.push('Network Error');
      } else {
        errorDetails.push(error.message || 'Unknown error');
      }

      setTestResult({
        success: false,
        message: errorMessage,
        errors: errorDetails,
        type: 'error'
      });

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (roleId) => {
    const roleMap = {
      1: { name: 'STUDENT', color: 'blue' },
      2: { name: 'PARENT', color: 'green' },
      3: { name: 'NURSE', color: 'orange' },
      4: { name: 'ADMIN', color: 'red' }
    };
    return roleMap[roleId] || { name: 'UNKNOWN', color: 'default' };
  };

  return (
    <div className="health-event-test">
      <Card
        title={
          <Space>
            <ExperimentOutlined />
            <span>Test Health Event Creation</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {/* User Info Display */}
        <Descriptions title="Current User Info" bordered column={1} style={{ marginBottom: 16 }}>
          <Descriptions.Item label="Account ID">
            <Text code>{userInfo?.accountId || 'N/A'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Full Name">
            <Text>{userInfo?.fullName || 'N/A'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Role">
            <Space>
              <Text>{userInfo?.roleId || 'N/A'}</Text>
              {userInfo?.roleId && (
                <Tag color={getRoleInfo(userInfo.roleId).color}>
                  {getRoleInfo(userInfo.roleId).name}
                </Tag>
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Can Create Health Event">
            <Badge 
              status={userInfo?.roleId === 3 ? 'success' : 'error'} 
              text={userInfo?.roleId === 3 ? 'Yes' : 'No'} 
            />
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Test Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleTestSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="studentId"
                label="Học sinh"
                rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
              >
                <Select placeholder="Chọn học sinh">
                  {students.map(student => (
                    <Option key={student.accountId} value={student.accountId}>
                      {student.fullName} - {student.studentCode}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="eventDate"
                label="Ngày xảy ra"
                rules={[{ required: true, message: 'Vui lòng chọn ngày xảy ra sự cố' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Chọn ngày"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="eventType"
                label="Loại sự cố"
                rules={[
                  { required: true, message: 'Vui lòng nhập loại sự cố' },
                  { min: 3, message: 'Loại sự cố phải có ít nhất 3 ký tự' }
                ]}
              >
                <Input placeholder="Nhập loại sự cố" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Mức độ"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
              >
                <Select placeholder="Chọn mức độ">
                  <Option value="LOW">Thấp</Option>
                  <Option value="MEDIUM">Trung bình</Option>
                  <Option value="HIGH">Cao</Option>
                  <Option value="CRITICAL">Khẩn cấp</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả' },
              { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' }
            ]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả chi tiết về sự cố" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="PENDING">Chờ xử lý</Option>
                  <Option value="IN_PROGRESS">Đang xử lý</Option>
                  <Option value="COMPLETED">Hoàn thành</Option>
                  <Option value="CANCELLED">Đã hủy</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="requiresHomeCare"
                label="Cần chăm sóc tại nhà"
              >
                <Select placeholder="Chọn">
                  <Option value={true}>Có</Option>
                  <Option value={false}>Không</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="solution"
                label="Giải pháp"
              >
                <TextArea rows={3} placeholder="Giải pháp đã áp dụng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="note"
                label="Ghi chú"
              >
                <TextArea rows={3} placeholder="Ghi chú bổ sung" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Test Tạo Health Event
              </Button>
              <Button onClick={() => form.resetFields()}>
                Reset Form
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* Test Result */}
        {testResult && (
          <>
            <Divider />
            <Alert
              message={testResult.message}
              description={
                <div>
                  <Text strong>Type:</Text> {testResult.type}
                  <br />
                  {testResult.errors && testResult.errors.length > 0 && (
                    <>
                      <Text strong>Errors:</Text>
                      <ul>
                        {testResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {testResult.data && (
                    <>
                      <Text strong>Response Data:</Text>
                      <pre style={{ fontSize: '12px', marginTop: 8 }}>
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    </>
                  )}
                </div>
              }
              type={testResult.success ? 'success' : 'error'}
              showIcon
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default HealthEventTest; 