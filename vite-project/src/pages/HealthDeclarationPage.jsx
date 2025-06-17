import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message, Row, Col, Radio, Space, Alert, Modal, Select } from 'antd';
import { MedicineBoxOutlined, SendOutlined, EyeOutlined } from '@ant-design/icons';
import './HealthDeclarationPage.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const HealthDeclarationPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [formData, setFormData] = useState({});

  // Danh sách học sinh mẫu
  const studentList = [
    { id: 1, name: 'Nguyễn Văn An' },
    { id: 2, name: 'Trần Thị Bình' },
    { id: 3, name: 'Lê Hoàng Cường' },
    { id: 4, name: 'Phạm Minh Đức' },
    { id: 5, name: 'Hoàng Thị Em' },
    { id: 6, name: 'Vũ Quang Huy' },
    { id: 7, name: 'Đặng Thị Lan' },
  ];

  const onFinish = async (values) => {
    setLoading(true);
    console.log('Form values:', values);
    
    try {
      // Giả lập gửi dữ liệu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Gửi thông tin khai báo thành công!');
      form.resetFields();
    } catch (error) {
      console.error('Lỗi khi gửi thông tin:', error);
      message.error('Đã xảy ra lỗi khi gửi thông tin. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    form.validateFields()
      .then(values => {
        setFormData(values);
        setPreviewVisible(true);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const renderPreviewContent = () => {
    // Tìm tên học sinh từ ID được chọn
    const selectedStudent = studentList.find(student => student.id === formData.studentId);
    const studentName = selectedStudent ? selectedStudent.name : 'Chưa chọn';

    return (
      <div className="preview-content">
        <div className="preview-section">
          <Title level={5}>Thông tin cơ bản</Title>
          <p><strong>Họ và tên học sinh:</strong> {studentName}</p>
        </div>

        <Divider />

        <div className="preview-section">
          <Title level={5}>Tiền sử bệnh</Title>
          <p><strong>Tiền sử đã mắc:</strong> {formData.medicalHistory || 'Không có'}</p>
          <p><strong>Bệnh mãn tính:</strong> {formData.chronicDiseases || 'Không có'}</p>
        </div>

        <Divider />

        <div className="preview-section">
          <Title level={5}>Tình trạng sức khỏe hiện tại</Title>
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>Chiều cao (cm):</strong> {formData.weight || 'Chưa cung cấp'}</p>
            </Col>
            <Col span={12}>
              <p><strong>Cân nặng (kg):</strong> {formData.height || 'Chưa cung cấp'}</p>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>Thị lực (mắt trái):</strong> {formData.leftEye || 'Chưa cung cấp'}</p>
            </Col>
            <Col span={12}>
              <p><strong>Thị lực (mắt phải):</strong> {formData.rightEye || 'Chưa cung cấp'}</p>
            </Col>
          </Row>
          <p>
            <strong>Trạng thái sức khỏe:</strong> {
              formData.healthStatus === 'good' ? 'Khỏe mạnh bình thường' : 
              formData.healthStatus === 'sick' ? 'Đang mắc bệnh' : 
              'Chưa cung cấp'
            }
          </p>
        </div>

        <Divider />

        <div className="preview-section">
          <Title level={5}>Lịch sử tiêm chủng</Title>
          <p><strong>Các mũi tiêm đã thực hiện:</strong> {formData.vaccineHistory || 'Không có'}</p>
        </div>

        <Divider />

        {/* <div className="preview-section">
          <Title level={5}>Thông tin bổ sung</Title>
          <p><strong>Ghi chú thêm:</strong> {formData.additionalInfo || 'Không có'}</p>
        </div> */}
      </div>
    );
  };

  return (
    <div className="health-declaration-page">
      <div className="health-declaration-container">
        <Card className="health-declaration-card">
          <div className="health-declaration-header">
            <Title level={2} className="health-declaration-title">
              <MedicineBoxOutlined /> Phiếu Khai Báo Sức Khỏe Học Sinh
            </Title>
            <Text className="health-declaration-subtitle">Vui lòng điền đầy đủ thông tin để đảm bảo sức khỏe</Text>
          </div>

          <Divider />

          <Form
            form={form}
            name="health_declaration_form"
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
          >
            <div className="form-section">
              <Title level={4}>Thông tin cơ bản</Title>
              <Row gutter={16}>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    name="studentId"
                    label="Họ và tên học sinh"
                    rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
                  >
                    <Select 
                      placeholder="Chọn học sinh" 
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {studentList.map(student => (
                        <Option key={student.id} value={student.id}>{student.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="form-section">
              <Title level={4}>Tiền sử bệnh</Title>
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="medicalHistory"
                    label="Tiền sử đã mắc"
                  >
                    <Input placeholder="Liệt kê các bệnh mà đã từng mắc (nếu có)" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="chronicDiseases"
                    label="Bệnh mãn tính"
                  >
                    <TextArea rows={4} placeholder="Liệt kê các bệnh mãn tính trên người (nếu có)" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="form-section">
              <Title level={4}>Tình trạng sức khỏe hiện tại</Title>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="weight"
                    label="Chiều cao (cm)"
                  >
                    <Input type="number" placeholder="VD: 165" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="height"
                    label="Cân nặng (kg)"
                  >
                    <Input type="number" placeholder="VD: 55" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="leftEye"
                    label="Thị lực (mắt trái)"
                  >
                    <Input placeholder="VD: 10/10" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="rightEye"
                    label="Thị lực (mắt phải)"
                  >
                    <Input placeholder="VD: 10/10" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="healthStatus"
                label="Trạng sức"
              >
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="good">Khỏe mạnh bình thường</Radio>
                    <Radio value="sick">Đang mắc bệnh</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              {form.getFieldValue('healthStatus') === 'sick' && (
                <Alert
                  message="Chú ý"
                  description="Nếu học sinh đang mắc bệnh, vui lòng liên hệ với nhà trường để được hướng dẫn thêm."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}
            </div>

            <Divider />

            <div className="form-section">
              <Title level={4}>Lịch sử tiêm chủng</Title>
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="vaccineHistory"
                    label="Các mũi tiêm đã thực hiện"
                  >
                    <TextArea rows={4} placeholder="Liệt kê các mũi tiêm đã thực hiện (tên vaccine, ngày tiêm)" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* <div className="form-section">
              <Title level={4}>Thông tin bổ sung</Title>
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="additionalInfo"
                    label="Ghi chú thêm"
                  >
                    <TextArea rows={4} placeholder="Thông tin bổ sung khác cần chú ý (nếu có)" />
                  </Form.Item>
                </Col>
              </Row>
            </div> */}

            <Form.Item className="form-submit-button">
              <Space size="middle" style={{ display: 'flex', justifyContent: 'center' }}>
                <Button 
                  type="primary" 
                  ghost
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                  size="large"
                >
                  Xem trước
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  icon={<SendOutlined />}
                  loading={loading}
                >
                  Gửi thông tin
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>

      <Modal
        title="Xem trước thông tin khai báo"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="back" onClick={() => setPreviewVisible(false)}>
            Quay lại chỉnh sửa
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => {
              setPreviewVisible(false);
              form.submit();
            }}
          >
            Xác nhận và gửi
          </Button>,
        ]}
        width={700}
      >
        {renderPreviewContent()}
      </Modal>
    </div>
  );
};

export default HealthDeclarationPage; 