import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message, Row, Col, Radio, Space, Alert, Modal, Select, Spin } from 'antd';
import { MedicineBoxOutlined, SendOutlined, EyeOutlined } from '@ant-design/icons';
import './HealthDeclarationPage.css';
import parentApi from '../api/parentApi';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const HealthDeclarationPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [children, setChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [selectedChildName, setSelectedChildName] = useState('');

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoadingChildren(true);
        // Lấy thông tin user từ localStorage
        const userInfoString = localStorage.getItem('userInfo');
        if (!userInfoString) {
          message.error('Không tìm thấy thông tin người dùng, vui lòng đăng nhập lại');
          return;
        }
        
        const userInfo = JSON.parse(userInfoString);
        const parentId = userInfo.accountId;
        
        if (!parentId) {
          message.error('Không tìm thấy ID phụ huynh, vui lòng đăng nhập lại');
          return;
        }
        
        console.log('Đang lấy danh sách con của phụ huynh ID:', parentId);
        const childrenData = await parentApi.getParentChildren(parentId);
        console.log('Danh sách con của phụ huynh:', childrenData);
        
        if (Array.isArray(childrenData)) {
          // Đảm bảo mỗi child có childId duy nhất và không null
          const validChildren = childrenData.filter(child => child && child.childId);
          setChildren(validChildren);
        } else {
          console.error('Dữ liệu con không phải là mảng:', childrenData);
          message.error('Không thể lấy danh sách con, định dạng dữ liệu không hợp lệ');
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách con:', error);
        message.error('Không thể lấy danh sách con. Vui lòng thử lại sau!');
      } finally {
        setLoadingChildren(false);
      }
    };

    fetchChildren();
  }, []);

  const handleChildSelect = (value, option) => {
    if (!value) return;
    
    console.log('Học sinh được chọn:', value, option);
    setSelectedChildId(value);
    setSelectedChildName(option.children);
    
    // Cập nhật form field
    form.setFieldsValue({
      studentId: value
    });
  };

  const onFinish = async (values) => {
    setLoading(true);
    console.log('Form values:', values);
    console.log('Học sinh đã chọn - ID:', selectedChildId, 'Tên:', selectedChildName);
    
    try {
      // Chuẩn bị dữ liệu theo định dạng API
      const medicalData = {
        allergies: values.allergies || "",
        chronicDiseases: values.chronicDiseases || "",
        hearingStatus: values.hearingStatus || "Normal",
        immunizationStatus: values.immunizationStatus || "Complete",
        pastTreatments: values.pastTreatments || "",
        visionStatusLeft: values.leftEye || "20/20",
        visionStatusRight: values.rightEye || "20/20"
      };
      
      // Tạo recordId ngẫu nhiên từ 1 đến 1000
      const randomRecordId = Math.floor(Math.random() * 1000) + 1;
      console.log('Sử dụng recordId ngẫu nhiên:', randomRecordId);
      
      // Gọi API để tạo hồ sơ y tế thông qua parentApi với recordId ngẫu nhiên
      await parentApi.createMedicalProfile(selectedChildId, medicalData, randomRecordId);
      
      message.success('Gửi thông tin khai báo thành công!');
      form.resetFields();
      setSelectedChildId(null);
      setSelectedChildName('');
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
    return (
      <div className="preview-content">
        <div className="preview-section">
          <Title level={5}>Thông tin cơ bản</Title>
          <p><strong>Họ và tên học sinh:</strong> {selectedChildName || 'Chưa chọn'}</p>
        </div>

        <Divider />

        <div className="preview-section">
          <Title level={5}>Tiền sử bệnh</Title>
          <p><strong>Dị ứng:</strong> {formData.allergies || 'Không có'}</p>
          <p><strong>Bệnh mãn tính:</strong> {formData.chronicDiseases || 'Không có'}</p>
          <p><strong>Điều trị trước đây:</strong> {formData.pastTreatments || 'Không có'}</p>
        </div>

        <Divider />

        <div className="preview-section">
          <Title level={5}>Tình trạng sức khỏe hiện tại</Title>
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>Thị lực (mắt trái):</strong> {formData.leftEye || '20/20'}</p>
            </Col>
            <Col span={12}>
              <p><strong>Thị lực (mắt phải):</strong> {formData.rightEye || '20/20'}</p>
            </Col>
          </Row>
          <p><strong>Tình trạng thính giác:</strong> {formData.hearingStatus || 'Normal'}</p>
          <p><strong>Tình trạng tiêm chủng:</strong> {formData.immunizationStatus || 'Complete'}</p>
        </div>
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
            initialValues={{
              hearingStatus: "Normal",
              immunizationStatus: "Complete"
            }}
          >
            <div className="form-section">
              <Title level={4}>Thông tin cơ bản</Title>
              <Row gutter={16}>
                <Col xs={24} sm={24} md={12}>
                  <Form.Item
                    name="studentId"
                    label="Họ và tên học sinh"
                    rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
                    validateStatus={selectedChildId ? 'success' : undefined}
                    help={selectedChildId ? null : 'Vui lòng chọn học sinh!'}
                  >
                    <Select 
                      placeholder="Chọn học sinh" 
                      showSearch
                      optionFilterProp="children"
                      loading={loadingChildren}
                      disabled={loadingChildren}
                      onChange={handleChildSelect}
                      value={selectedChildId}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      notFoundContent={loadingChildren ? <Spin size="small" /> : 'Không tìm thấy học sinh nào'}
                    >
                      {children.map((child, index) => (
                        <Option 
                          key={child.childId || `child-${index}`} 
                          value={child.childId}
                        >
                          {child.fullName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  {selectedChildId && (
                    <Alert
                      message={`Đã chọn học sinh: ${selectedChildName}`}
                      type="success"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                  )}
                </Col>
              </Row>
            </div>

            <Divider />

            <div className="form-section">
              <Title level={4}>Tiền sử bệnh</Title>
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="allergies"
                    label="Dị ứng"
                  >
                    <Input placeholder="Liệt kê các dị ứng (nếu có)" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="chronicDiseases"
                    label="Bệnh mãn tính"
                  >
                    <TextArea rows={4} placeholder="Liệt kê các bệnh mãn tính (nếu có)" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="pastTreatments"
                    label="Điều trị trước đây"
                  >
                    <TextArea rows={4} placeholder="Liệt kê các điều trị đã thực hiện trước đây (nếu có)" />
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
                    name="leftEye"
                    label="Thị lực (mắt trái)"
                  >
                    <Input placeholder="VD: 20/20" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="rightEye"
                    label="Thị lực (mắt phải)"
                  >
                    <Input placeholder="VD: 20/20" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="hearingStatus"
                label="Tình trạng thính giác"
              >
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="Normal">Bình thường</Radio>
                    <Radio value="Impaired">Suy giảm</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="immunizationStatus"
                label="Tình trạng tiêm chủng"
              >
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="Complete">Đầy đủ</Radio>
                    <Radio value="Incomplete">Chưa đầy đủ</Radio>
                    <Radio value="None">Chưa tiêm chủng</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </div>

            <Divider />

            <Form.Item className="form-submit-button">
              <Space size="middle" style={{ display: 'flex', justifyContent: 'center' }}>
                <Button 
                  type="primary" 
                  ghost
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                  size="large"
                  disabled={!selectedChildId}
                >
                  Xem trước
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  icon={<SendOutlined />}
                  loading={loading}
                  disabled={!selectedChildId}
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