import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Modal, Form, Select, Radio, message, Tabs, Typography, Row, Col, Statistic, Alert, Space, Divider, DatePicker, Input } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, HistoryOutlined, FileTextOutlined } from '@ant-design/icons';
import parentApi from '../../../api/parentApi';
import './VaccinationPage.css';

const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const VaccinationPage = () => {
  const [confirmations, setConfirmations] = useState([]);
  const [vaccinationHistory, setVaccinationHistory] = useState([]);
  const [externalVaccines, setExternalVaccines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedConfirmation, setSelectedConfirmation] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [form] = Form.useForm();
  const [externalVaccineForm] = Form.useForm();
  const [externalVaccineModal, setExternalVaccineModal] = useState(false);
  const [children, setChildren] = useState([]);
  const [vaccines, setVaccines] = useState([]);

  // Lấy thông tin user
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const parentId = userInfo?.accountId;

  // Fetch data khi component mount
  useEffect(() => {
    if (parentId) {
    fetchConfirmations();
      fetchVaccinationHistory();
      fetchExternalVaccines();
      fetchChildren();
      fetchVaccines();
    }
  }, [parentId]);
  
  const fetchConfirmations = async () => {
    setLoading(true);
    try {
      const data = await parentApi.getVaccinationConfirmationsByStatusAndParent('PENDING', parentId);
      setConfirmations(data);
    } catch (error) {
      console.error('Lỗi khi lấy xác nhận tiêm chủng:', error);
      setConfirmations([]);
    }
    setLoading(false);
  };

  const fetchVaccinationHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await parentApi.getVaccinationConfirmationsByParent(parentId);
      setVaccinationHistory(data.filter(item => item.status !== 'PENDING'));
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử tiêm chủng:', error);
      setVaccinationHistory([]);
    }
    setHistoryLoading(false);
  };

  const fetchExternalVaccines = async () => {
    try {
      // Lấy danh sách con của parent và vaccines
      const [children, vaccinesList] = await Promise.all([
        parentApi.getChildrenByParent(parentId),
        parentApi.getAllVaccines()
      ]);
      
      const allExternalVaccines = [];
      for (const child of children) {
        const vaccines = await parentApi.getExternalVaccinesByStudent(child.childId);
        // Map thêm thông tin tên học sinh và vaccine
        const mappedVaccines = vaccines.map(vaccine => {
          const vaccineInfo = vaccinesList.find(v => v.vaccineId === vaccine.vaccineId);
          return {
            ...vaccine,
            studentName: child.fullName,
            vaccineName: vaccineInfo?.name || 'Unknown'
          };
        });
        allExternalVaccines.push(...mappedVaccines);
      }
      setExternalVaccines(allExternalVaccines);
    } catch (error) {
      console.error('Lỗi khi lấy tiêm chủng bên ngoài:', error);
      setExternalVaccines([]);
    }
  };

  const fetchChildren = async () => {
    try {
      const childrenData = await parentApi.getChildrenByParent(parentId);
      setChildren(childrenData);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách con:', error);
      setChildren([]);
    }
  };

  const fetchVaccines = async () => {
    try {
      const vaccinesData = await parentApi.getAllVaccines();
      setVaccines(vaccinesData);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách vaccine:', error);
      setVaccines([]);
    }
  };

  // Xác nhận cho 1 học sinh
  const handleConfirm = async (values) => {
    setLoading(true);
    try {
      await parentApi.updateVaccinationConfirmation({
        vaccinationConfirmationId: selectedConfirmation.confirmationId,
        vaccineNoticeId: selectedConfirmation.vaccineNoticeId,
        studentId: selectedConfirmation.studentId,
        parentId,
        status: values.confirmStatus === 'yes' ? 'CONFIRMED' : 'DECLINED',
      });
      message.success('Đã xác nhận!');
      setModalVisible(false);
      await fetchConfirmations();
      await fetchVaccinationHistory();
    } catch (error) {
      message.error('Xác nhận thất bại!');
    }
    setLoading(false);
  };

  // Xác nhận tất cả
  const handleConfirmAll = async () => {
    setLoading(true);
    try {
      await parentApi.confirmAllVaccinationConfirmationsByParent(parentId);
      message.success('Đã xác nhận tất cả!');
      await fetchConfirmations();
      await fetchVaccinationHistory();
    } catch (error) {
      message.error('Xác nhận tất cả thất bại!');
    }
    setLoading(false);
  };

  // Khai báo tiêm chủng bên ngoài
  const handleSubmitExternalVaccine = async (values) => {
    try {
      await parentApi.createExternalVaccine({
        studentId: values.studentId,
        submittedBy: parentId,
        vaccineId: values.vaccineId,
        injectionDate: values.injectionDate.format('YYYY-MM-DD'),
        location: values.location,
        note: values.note
      });
      message.success('Đã khai báo tiêm chủng bên ngoài!');
      setExternalVaccineModal(false);
      externalVaccineForm.resetFields();
      await fetchExternalVaccines();
    } catch (error) {
      message.error('Khai báo thất bại!');
    }
  };

  // Thống kê
  const pendingCount = confirmations.length;
  const confirmedCount = vaccinationHistory.filter(item => item.status === 'CONFIRMED').length;
  const declinedCount = vaccinationHistory.filter(item => item.status === 'DECLINED').length;

  const pendingColumns = [
    { title: 'Học sinh', dataIndex: 'studentName', key: 'studentName' },
    { title: 'Tên đợt tiêm', dataIndex: 'vaccineName', key: 'vaccineName' },
    { title: 'Ngày tiêm', dataIndex: 'vaccinationDate', key: 'vaccinationDate', 
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '' },
    { title: 'Khối lớp', dataIndex: 'grade', key: 'grade' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
            render: status => (
              <Tag color={status === 'CONFIRMED' ? 'green' : status === 'DECLINED' ? 'red' : 'orange'}>
                {status === 'CONFIRMED' ? 'Đã xác nhận' : status === 'DECLINED' ? 'Đã từ chối' : 'Chưa xác nhận'}
              </Tag>
            ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
                disabled={record.status !== 'PENDING'}
                onClick={() => {
                  setSelectedConfirmation(record);
                  setModalVisible(true);
                  form.resetFields();
                }}
        >
                Xác nhận
        </Button>
      ),
    },
  ];

  const historyColumns = [
    { title: 'Học sinh', dataIndex: 'studentName', key: 'studentName' },
    { title: 'Tên đợt tiêm', dataIndex: 'vaccineName', key: 'vaccineName' },
    { title: 'Ngày tiêm', dataIndex: 'vaccinationDate', key: 'vaccinationDate',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '' },
    { title: 'Ngày xác nhận', dataIndex: 'confirmedAt', key: 'confirmedAt',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'CONFIRMED' ? 'green' : 'red'}>
          {status === 'CONFIRMED' ? 'Đã xác nhận' : 'Đã từ chối'}
        </Tag>
      ),
    },
  ];

  const externalVaccineColumns = [
    { title: 'Học sinh', dataIndex: 'studentName', key: 'studentName' },
    { title: 'Tên vaccine', dataIndex: 'vaccineName', key: 'vaccineName' },
    { title: 'Ngày tiêm', dataIndex: 'injectionDate', key: 'injectionDate',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '' },
    { title: 'Địa điểm', dataIndex: 'location', key: 'location' },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
    {
      title: 'Trạng thái',
      dataIndex: 'verified',
      key: 'verified',
      render: verified => (
        <Tag color={verified ? 'green' : 'orange'}>
          {verified ? 'Đã xác minh' : 'Chờ xác minh'}
        </Tag>
      ),
    },
  ];

  return (
    <div className="vaccination-page">
      <div className="vaccination-container">
        <Card className="vaccination-card">
          <div className="vaccination-header">
            <Title level={2} className="vaccination-title">
              <FileTextOutlined /> Quản lý tiêm chủng
            </Title>
            <Text className="vaccination-description">
              Xem và xác nhận thông báo tiêm chủng cho con của bạn
            </Text>
          </div>

          {/* Thống kê */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Chờ xác nhận"
                  value={pendingCount}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Đã xác nhận"
                  value={confirmedCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Đã từ chối"
                  value={declinedCount}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tiêm bên ngoài"
                  value={externalVaccines.length}
                  prefix={<HistoryOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>

          <Tabs activeKey={activeTab} onChange={setActiveTab} className="vaccination-tabs">
            <TabPane tab="Chờ xác nhận" key="pending">
              <Card
                title="Thông báo tiêm chủng chờ xác nhận"
                extra={
                  <Button 
                    type="primary" 
                    onClick={handleConfirmAll} 
                    disabled={confirmations.filter(c => c.status === 'PENDING').length === 0}
                  >
                    Xác nhận tất cả
                  </Button>
                }
              >
                {confirmations.length === 0 ? (
                  <Alert
                    message="Không có thông báo tiêm chủng nào chờ xác nhận"
                    type="info"
                    showIcon
                  />
                ) : (
                  <Table
                    columns={pendingColumns}
        dataSource={confirmations}
        rowKey="confirmationId"
        loading={loading}
                    pagination={{ pageSize: 10 }}
      />
                )}
              </Card>
            </TabPane>

            <TabPane tab="Lịch sử tiêm chủng" key="history">
              <Card title="Lịch sử tiêm chủng">
                <Table
                  columns={historyColumns}
                  dataSource={vaccinationHistory}
                  rowKey="confirmationId"
                  loading={historyLoading}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </TabPane>

            <TabPane tab="Tiêm chủng bên ngoài" key="external">
              <Card 
                title="Tiêm chủng bên ngoài"
                extra={
                  <Button type="primary" onClick={() => setExternalVaccineModal(true)}>
                    Khai báo tiêm chủng bên ngoài
                  </Button>
                }
              >
                <Table
                  columns={externalVaccineColumns}
                  dataSource={externalVaccines}
                  rowKey="externalVaccineId"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </TabPane>
          </Tabs>

          {/* Modal xác nhận tiêm chủng */}
      <Modal
        title="Xác nhận tham gia tiêm chủng"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
            width={600}
          >
            {selectedConfirmation && (
              <div style={{ marginBottom: 16 }}>
                <Alert
                  message={`Thông báo tiêm chủng: ${selectedConfirmation.vaccineName}`}
                  description={`Học sinh: ${selectedConfirmation.studentName} - Ngày tiêm: ${new Date(selectedConfirmation.vaccinationDate).toLocaleDateString('vi-VN')}`}
                  type="info"
                  showIcon
                />
              </div>
            )}
        <Form form={form} layout="vertical" onFinish={handleConfirm}>
              <Form.Item
                name="confirmStatus"
                label="Xác nhận tham gia"
                rules={[{ required: true, message: 'Vui lòng chọn xác nhận!' }]}
              >
                <Radio.Group>
                  <Radio value="yes">Đồng ý cho con tham gia tiêm chủng</Radio>
                  <Radio value="no">Không đồng ý cho con tham gia tiêm chủng</Radio>
                </Radio.Group>
              </Form.Item>
          <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Xác nhận
                  </Button>
                  <Button onClick={() => setModalVisible(false)}>
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          {/* Modal khai báo tiêm chủng bên ngoài */}
          <Modal
            title="Khai báo tiêm chủng bên ngoài"
            open={externalVaccineModal}
            onCancel={() => setExternalVaccineModal(false)}
            footer={null}
            width={600}
          >
            <Form form={externalVaccineForm} layout="vertical" onFinish={handleSubmitExternalVaccine}>
                                        <Form.Item
                            name="studentId"
                            label="Chọn con"
                            rules={[{ required: true, message: 'Vui lòng chọn con!' }]}
                          >
                            <Select placeholder="Chọn con">
                              {children.map(child => (
                                <Option key={child.childId} value={child.childId}>
                                  {child.fullName} - {child.className}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                          <Form.Item
                            name="vaccineId"
                            label="Tên vaccine"
                            rules={[{ required: true, message: 'Vui lòng nhập tên vaccine!' }]}
                          >
                            <Select placeholder="Chọn vaccine">
                              {vaccines.map(vaccine => (
                                <Option key={vaccine.vaccineId} value={vaccine.vaccineId}>
                                  {vaccine.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
              <Form.Item
                name="injectionDate"
                label="Ngày tiêm"
                rules={[{ required: true, message: 'Vui lòng chọn ngày tiêm!' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
              <Form.Item
                name="location"
                label="Địa điểm tiêm"
                rules={[{ required: true, message: 'Vui lòng nhập địa điểm!' }]}
              >
                <Input placeholder="Ví dụ: Bệnh viện Nhi Đồng, Phòng khám tư..." />
              </Form.Item>
              <Form.Item
                name="note"
                label="Ghi chú"
              >
                <Input.TextArea placeholder="Ghi chú về tiêm chủng (nếu có)" />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Khai báo
                  </Button>
                  <Button onClick={() => setExternalVaccineModal(false)}>
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
      </Modal>
    </Card>
      </div>
    </div>
  );
};

export default VaccinationPage; 