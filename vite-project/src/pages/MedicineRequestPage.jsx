import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Typography, Card, Row, Col, message, Select } from 'antd';
import './MedicineRequestPage.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const MedicineRequestPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Danh sách học sinh mẫu
  const studentList = [
    { id: 1, name: 'Nguyễn Văn A', class: '10A1' },
    { id: 2, name: 'Trần Thị B', class: '10A2' },
    { id: 3, name: 'Lê Văn C', class: '11B1' },
    { id: 4, name: 'Phạm Thị D', class: '11B2' },
    { id: 5, name: 'Hoàng Văn E', class: '12C1' },
    { id: 6, name: 'Đỗ Thị F', class: '12C2' },
  ];

  const onFinish = (values) => {
    setLoading(true);
    console.log('Form values:', values);
    
    // Giả lập gửi form
    setTimeout(() => {
      message.success('Yêu cầu thuốc đã được gửi thành công!');
      form.resetFields();
      setLoading(false);
    }, 1500);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Form validation failed:', errorInfo);
    message.error('Vui lòng kiểm tra lại thông tin!');
  };

  return (
    <div className="medicine-request-page">
      <div className="medicine-request-container">
        <Card className="medicine-request-card">
          <Title level={2} className="medicine-request-title">Medicine Request Form</Title>
          <Text className="medicine-request-subtitle">
            Submit medication details for your child to the school nurse
          </Text>
          
          <Form
            form={form}
            name="medicineRequestForm"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            className="medicine-request-form"
          >
            {/* Thông tin học sinh */}
            <Title level={5} className="form-section-title">Thông tin học sinh</Title>
            <Form.Item
              name="studentId"
              rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
              label="Chọn học sinh"
            >
              <Select 
                placeholder="Chọn học sinh" 
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {studentList.map(student => (
                  <Option key={student.id} value={student.id}>
                    {student.name} - Lớp {student.class}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            {/* Chỉ tiết thuốc */}
            <Title level={5} className="form-section-title">Chỉ tiết thuốc</Title>
            <Form.Item
              name="medicineName"
              rules={[{ required: true, message: 'Vui lòng nhập tên thuốc!' }]}
            >
              <Input placeholder="Tên thuốc" />
            </Form.Item>
            
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="dosage"
                  rules={[{ required: true, message: 'Vui lòng nhập liều lượng!' }]}
                >
                  <Input placeholder="Liều lượng" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="frequency"
                  rules={[{ required: true, message: 'Vui lòng nhập tần suất!' }]}
                >
                  <Input placeholder="Tần suất (vd: ngày 2 lần)" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="startDate"
              rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
            >
              <DatePicker 
                placeholder="MM/DD/YYYY" 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Form.Item>
            
            {/* Hướng dẫn đặc biệt */}
            <Title level={5} className="form-section-title">Hướng dẫn đặc biệt</Title>
            <Form.Item
              name="specialInstructions"
            >
              <TextArea 
                placeholder="Nhập chỉ dẫn đặc biệt nếu cần thiết (vd: uống sau khi ăn)" 
                rows={4}
              />
            </Form.Item>
            
            {/* Thông tin phụ huynh/người giám hộ */}
            <Title level={5} className="form-section-title">Thông tin phụ huynh/người giám hộ</Title>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="parentName"
                  rules={[{ required: true, message: 'Vui lòng nhập tên phụ huynh!' }]}
                >
                  <Input placeholder="Tên phụ huynh" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="contactNumber"
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                  <Input placeholder="Số điện thoại" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item className="form-buttons">
              <Button 
                type="default" 
                htmlType="button" 
                onClick={() => form.resetFields()}
                className="cancel-button"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="submit-button"
              >
                Submit Request
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default MedicineRequestPage; 