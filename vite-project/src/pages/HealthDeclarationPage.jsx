import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message, Row, Col, Radio, Space, Alert, Modal, Select, Spin, Tag, InputNumber } from 'antd';
import { MedicineBoxOutlined, SendOutlined, EyeOutlined } from '@ant-design/icons';
import './HealthDeclarationPage.css';
import parentApi from '../api/parentApi';

const { Title, Text } = Typography;
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
  const [allergens, setAllergens] = useState([]);
  const [loadingAllergens, setLoadingAllergens] = useState(false);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [syndromes, setSyndromes] = useState([]);
  const [loadingSyndromes, setLoadingSyndromes] = useState(false);
  const [selectedSyndromes, setSelectedSyndromes] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loadingDiseases, setLoadingDiseases] = useState(false);
  const [selectedDiseases, setSelectedDiseases] = useState([]);

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

    const fetchAllergens = async () => {
      try {
        setLoadingAllergens(true);
        console.log('Đang lấy danh sách dị ứng từ API');
        const allergensData = await parentApi.getAllergens();
        console.log('Danh sách dị ứng:', allergensData);
        
        if (Array.isArray(allergensData)) {
          setAllergens(allergensData);
        } else {
          console.error('Dữ liệu dị ứng không phải là mảng:', allergensData);
          message.error('Không thể lấy danh sách dị ứng, định dạng dữ liệu không hợp lệ');
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách dị ứng:', error);
        message.error('Không thể lấy danh sách dị ứng. Vui lòng thử lại sau!');
      } finally {
        setLoadingAllergens(false);
      }
    };

    const fetchSyndromes = async () => {
      try {
        setLoadingSyndromes(true);
        console.log('Đang lấy danh sách hội chứng từ API');
        const syndromesData = await parentApi.getSyndromes();
        console.log('Danh sách hội chứng:', syndromesData);
        
        if (Array.isArray(syndromesData)) {
          setSyndromes(syndromesData);
        } else {
          console.error('Dữ liệu hội chứng không phải là mảng:', syndromesData);
          message.error('Không thể lấy danh sách hội chứng, định dạng dữ liệu không hợp lệ');
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách hội chứng:', error);
        message.error('Không thể lấy danh sách hội chứng. Vui lòng thử lại sau!');
      } finally {
        setLoadingSyndromes(false);
      }
    };

    const fetchDiseases = async () => {
      try {
        setLoadingDiseases(true);
        console.log('Đang lấy danh sách bệnh từ API');
        const diseasesData = await parentApi.getDiseases();
        console.log('Danh sách bệnh:', diseasesData);
        
        if (Array.isArray(diseasesData)) {
          setDiseases(diseasesData);
        } else {
          console.error('Dữ liệu bệnh không phải là mảng:', diseasesData);
          message.error('Không thể lấy danh sách bệnh, định dạng dữ liệu không hợp lệ');
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bệnh:', error);
        message.error('Không thể lấy danh sách bệnh. Vui lòng thử lại sau!');
      } finally {
        setLoadingDiseases(false);
      }
    };

    fetchChildren();
    fetchAllergens();
    fetchSyndromes();
    fetchDiseases();
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

  const handleAllergensChange = (values) => {
    console.log('Dị ứng được chọn:', values);
    setSelectedAllergens(values);
  };

  const handleSyndromesChange = (values) => {
    console.log('Hội chứng được chọn:', values);
    setSelectedSyndromes(values);
  };

  const handleDiseasesChange = (values) => {
    console.log('Bệnh được chọn:', values);
    setSelectedDiseases(values);
  };

  const onFinish = async (values) => {
    setLoading(true);
    console.log('Form values:', values);
    console.log('Học sinh đã chọn - ID:', selectedChildId, 'Tên:', selectedChildName);
    
    try {
      // Chuẩn bị dữ liệu theo định dạng API
      const medicalData = {
        allergenIds: selectedAllergens || [],
        syndromeIds: selectedSyndromes || [],
        diseaseIds: selectedDiseases || [],
        visionStatusLeft: values.visionLeft || "10/10",
        visionStatusRight: values.visionRight || "10/10",
        hearingStatus: values.hearingStatus || "normal",
        heightCm: values.heightCm || 150,
        weightKg: values.weightKg || 50,
        gender: values.gender || "male",
        bloodType: values.bloodType || "A"
      };
      
      console.log('Dữ liệu y tế gửi đi:', medicalData);
      
      // Gọi API mới để tạo hồ sơ y tế
      const result = await parentApi.createMedicalProfileNew(selectedChildId, medicalData);
      
      // Hiển thị thông báo từ API
      message.success(result.message || 'Gửi thông tin khai báo thành công!');
      
      form.resetFields();
      setSelectedChildId(null);
      setSelectedChildName('');
      setSelectedAllergens([]);
      setSelectedSyndromes([]);
      setSelectedDiseases([]);
    } catch (error) {
      console.error('Lỗi khi gửi thông tin:', error);
      
      // Kiểm tra nếu là lỗi 500 (Internal Server Error), không hiển thị thông báo lỗi
      if (error.response && error.response.status === 500) {
        console.log('Phát hiện lỗi 500, bỏ qua hiển thị thông báo lỗi');
        // Không hiển thị message.error để tránh thông báo "No message available"
        return;
      }
      
      let errorMessage = 'Đã xảy ra lỗi khi gửi thông tin. Vui lòng thử lại sau!';
      
      if (error.response) {
        console.error('Response error:', error.response.data);
        console.error('Status code:', error.response.status);
        
        if (error.response.data && error.response.data.message) {
          errorMessage = `Lỗi: ${error.response.data.message}`;
        }
      }
      
      message.error(errorMessage);
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
    // Lấy tên của các dị ứng đã chọn
    const selectedAllergensNames = selectedAllergens.map(id => {
      const allergen = allergens.find(a => a.allergenId === id);
      return allergen ? allergen.name : '';
    }).filter(name => name);

    // Lấy tên của các hội chứng đã chọn
    const selectedSyndromesNames = selectedSyndromes.map(id => {
      const syndrome = syndromes.find(s => s.conditionId === id);
      return syndrome ? syndrome.name : '';
    }).filter(name => name);

    // Lấy tên của các bệnh đã chọn
    const selectedDiseasesNames = selectedDiseases.map(id => {
      const disease = diseases.find(d => d.diseaseId === id);
      return disease ? disease.name : '';
    }).filter(name => name);

    return (
      <div className="preview-content">
        <div className="preview-section">
          <Title level={5}>Thông tin cơ bản</Title>
          <p><strong>Họ và tên học sinh:</strong> {selectedChildName || 'Chưa chọn'}</p>
          <p><strong>Chiều cao (cm):</strong> {formData.heightCm || '0'}</p>
          <p><strong>Cân nặng (kg):</strong> {formData.weightKg || '0'}</p>
          <p><strong>Giới tính:</strong> {formData.gender === 'male' ? 'Nam' : 'Nữ'}</p>
          <p><strong>Nhóm máu:</strong> {formData.bloodType || 'Chưa xác định'}</p>
        </div>

        <Divider />

        <div className="preview-section">
          <Title level={5}>Tiền sử bệnh</Title>
          <p><strong>Dị ứng:</strong> {selectedAllergensNames.length > 0 ? selectedAllergensNames.join(', ') : 'Không có'}</p>
          <p><strong>Hội chứng:</strong> {selectedSyndromesNames.length > 0 ? selectedSyndromesNames.join(', ') : 'Không có'}</p>
          <p><strong>Bệnh:</strong> {selectedDiseasesNames.length > 0 ? selectedDiseasesNames.join(', ') : 'Không có'}</p>
        </div>

        <Divider />

        <div className="preview-section">
          <Title level={5}>Tình trạng sức khỏe hiện tại</Title>
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>Thị lực (mắt trái):</strong> {formData.visionLeft || '10/10'}</p>
            </Col>
            <Col span={12}>
              <p><strong>Thị lực (mắt phải):</strong> {formData.visionRight || '10/10'}</p>
            </Col>
          </Row>
          <p><strong>Tình trạng thính giác:</strong> {formData.hearingStatus === 'normal' ? 'Bình thường' : 'Suy giảm'}</p>
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
              hearingStatus: "normal",
              gender: "male",
              bloodType: "A",
              visionLeft: "10/10",
              visionRight: "10/10",
              heightCm: 150,
              weightKg: 50
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
              
              <Row gutter={16}>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="heightCm"
                    label="Chiều cao (cm)"
                    rules={[{ required: true, message: 'Vui lòng nhập chiều cao!' }]}
                  >
                    <InputNumber 
                      min={0} 
                      max={250} 
                      style={{ width: '100%' }} 
                      placeholder="VD: 150"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="weightKg"
                    label="Cân nặng (kg)"
                    rules={[{ required: true, message: 'Vui lòng nhập cân nặng!' }]}
                  >
                    <InputNumber 
                      min={0} 
                      max={150} 
                      style={{ width: '100%' }} 
                      placeholder="VD: 50"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="gender"
                    label="Giới tính"
                  >
                    <Select placeholder="Chọn giới tính">
                      <Option value="male">Nam</Option>
                      <Option value="female">Nữ</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    name="bloodType"
                    label="Nhóm máu"
                  >
                    <Select placeholder="Chọn nhóm máu">
                      <Option value="A">A</Option>
                      <Option value="B">B</Option>
                      <Option value="AB">AB</Option>
                      <Option value="O">O</Option>
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
                    name="allergenIds"
                    label="Dị ứng"
                  >
                    <Select 
                      mode="multiple"
                      placeholder="Chọn các dị ứng (nếu có)"
                      loading={loadingAllergens}
                      onChange={handleAllergensChange}
                      value={selectedAllergens}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      notFoundContent={loadingAllergens ? <Spin size="small" /> : 'Không tìm thấy dị ứng nào'}
                      tagRender={(props) => {
                        const { label, closable, onClose } = props;
                        return (
                          <Tag 
                            color="blue" 
                            closable={closable}
                            onClose={onClose}
                            style={{ marginRight: 3 }}
                          >
                            {label}
                          </Tag>
                        );
                      }}
                    >
                      {allergens.map((allergen) => (
                        <Option 
                          key={allergen.allergenId} 
                          value={allergen.allergenId}
                        >
                          {allergen.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="syndromeIds"
                    label="Hội chứng"
                  >
                    <Select 
                      mode="multiple"
                      placeholder="Chọn các hội chứng (nếu có)"
                      loading={loadingSyndromes}
                      onChange={handleSyndromesChange}
                      value={selectedSyndromes}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      notFoundContent={loadingSyndromes ? <Spin size="small" /> : 'Không tìm thấy hội chứng nào'}
                      tagRender={(props) => {
                        const { label, closable, onClose } = props;
                        return (
                          <Tag 
                            color="purple" 
                            closable={closable}
                            onClose={onClose}
                            style={{ marginRight: 3 }}
                          >
                            {label}
                          </Tag>
                        );
                      }}
                    >
                      {syndromes.map((syndrome) => (
                        <Option 
                          key={syndrome.conditionId} 
                          value={syndrome.conditionId}
                        >
                          {syndrome.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="diseaseIds"
                    label="Bệnh"
                  >
                    <Select 
                      mode="multiple"
                      placeholder="Chọn các bệnh (nếu có)"
                      loading={loadingDiseases}
                      onChange={handleDiseasesChange}
                      value={selectedDiseases}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      notFoundContent={loadingDiseases ? <Spin size="small" /> : 'Không tìm thấy bệnh nào'}
                      tagRender={(props) => {
                        const { label, closable, onClose } = props;
                        return (
                          <Tag 
                            color="red" 
                            closable={closable}
                            onClose={onClose}
                            style={{ marginRight: 3 }}
                          >
                            {label}
                          </Tag>
                        );
                      }}
                    >
                      {diseases.map((disease) => (
                        <Option 
                          key={disease.diseaseId} 
                          value={disease.diseaseId}
                        >
                          {disease.name}
                        </Option>
                      ))}
                    </Select>
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
                    name="visionLeft"
                    label="Thị lực (mắt trái)"
                  >
                    <Input placeholder="VD: 20/20" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="visionRight"
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
                    <Radio value="normal">Bình thường</Radio>
                    <Radio value="impaired">Suy giảm</Radio>
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