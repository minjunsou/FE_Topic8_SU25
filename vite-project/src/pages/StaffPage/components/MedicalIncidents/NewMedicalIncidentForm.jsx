import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  Row, 
  Col,
  Divider,
  Space 
} from 'antd';

const { Option } = Select;
const { TextArea } = Input;

// Mock data cho danh sách học sinh
const studentOptions = [
  { value: '1', label: 'Nguyễn Văn A - Lớp 10A1' },
  { value: '2', label: 'Trần Thị B - Lớp 11B2' },
  { value: '3', label: 'Lê Văn C - Lớp 12C3' },
  { value: '4', label: 'Phạm Thị D - Lớp 10A2' },
  { value: '5', label: 'Hoàng Văn E - Lớp 11B1' },
];

// Các loại sự kiện y tế phổ biến
const incidentTypeOptions = [
  { value: 'fever', label: 'Sốt' },
  { value: 'injury', label: 'Chấn thương' },
  { value: 'allergy', label: 'Dị ứng' },
  { value: 'stomachache', label: 'Đau bụng' },
  { value: 'headache', label: 'Đau đầu' },
  { value: 'cold', label: 'Cảm lạnh' },
  { value: 'other', label: 'Khác' },
];

const NewMedicalIncidentForm = ({ onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [isOtherType, setIsOtherType] = useState(false);
  
  const handleFinish = (values) => {
    // Format date values
    const formattedValues = {
      ...values,
      incidentDate: values.incidentDate ? values.incidentDate.format('YYYY-MM-DD') : '',
      incidentTime: values.incidentDate ? values.incidentDate.format('HH:mm') : '',
    };
    onSubmit(formattedValues);
  };

  const handleIncidentTypeChange = (value) => {
    setIsOtherType(value === 'other');
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        severity: 'medium',
      }}
    >
      <Divider orientation="left">Thông tin học sinh</Divider>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="studentId"
            label="Học sinh"
            rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
          >
            <Select
              showSearch
              placeholder="Chọn học sinh"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              options={studentOptions}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Thông tin sự kiện</Divider>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="incidentDate"
            label="Thời gian xảy ra"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
          >
            <DatePicker 
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="severity"
            label="Mức độ nghiêm trọng"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ' }]}
          >
            <Select placeholder="Chọn mức độ">
              <Option value="low">Thấp</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="incidentType"
            label="Loại sự kiện"
            rules={[{ required: true, message: 'Vui lòng chọn loại sự kiện' }]}
          >
            <Select 
              placeholder="Chọn loại sự kiện"
              onChange={handleIncidentTypeChange}
              options={incidentTypeOptions}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          {isOtherType && (
            <Form.Item
              name="customIncidentType"
              label="Loại sự kiện khác"
              rules={[{ required: isOtherType, message: 'Vui lòng nhập loại sự kiện' }]}
            >
              <Input placeholder="Nhập loại sự kiện" />
            </Form.Item>
          )}
        </Col>
      </Row>

      <Form.Item
        name="description"
        label="Mô tả chi tiết"
        rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết' }]}
      >
        <TextArea rows={4} placeholder="Mô tả chi tiết về sự kiện y tế" />
      </Form.Item>

      <Divider orientation="left">Hành động ban đầu</Divider>
      <Form.Item
        name="initialActions"
        label="Các hành động đã thực hiện"
      >
        <TextArea rows={3} placeholder="Nhập các hành động sơ cứu/xử lý ban đầu đã thực hiện (nếu có)" />
      </Form.Item>

      <Form.Item
        name="medicinesUsed"
        label="Thuốc đã sử dụng"
      >
        <TextArea rows={2} placeholder="Nhập các loại thuốc đã sử dụng (nếu có)" />
      </Form.Item>

      <Form.Item className="form-footer">
        <Space style={{ float: 'right' }}>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Tạo sự kiện
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default NewMedicalIncidentForm; 