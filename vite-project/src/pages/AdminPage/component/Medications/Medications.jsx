import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, message, Spin, Modal, Form, InputNumber, Select, DatePicker, Card, Tag, Typography, Alert, Row, Col } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, MedicineBoxOutlined, WarningOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getAllMedications, searchMedications, createMedication, updateMedication, deleteMedication, getLowStockMedications } from '../../../../api/adminApi';
import dayjs from 'dayjs';

const { Text } = Typography;

const MedicationType = {
  TABLET: 'Viên',
  SYRUP: 'Siro',
  OINTMENT: 'Thuốc mỡ',
  SPRAY: 'Xịt',
  OTHER: 'Khác',
};

const medicationTypeOptions = [
  { value: 'TABLET', label: 'Viên' },
  { value: 'SYRUP', label: 'Siro' },
  { value: 'OINTMENT', label: 'Thuốc mỡ' },
  { value: 'SPRAY', label: 'Xịt' },
  { value: 'OTHER', label: 'Khác' },
];

const quantityTypeOptions = [
  { value: 'viên', label: 'Viên' },
  { value: 'hộp', label: 'Hộp' },
  { value: 'tuýp', label: 'Tuýp' },
  { value: 'lọ', label: 'Lọ' },
  { value: 'gói', label: 'Gói' },
  { value: 'chai', label: 'Chai' },
  { value: 'ống', label: 'Ống' },
  { value: 'khác', label: 'Khác' },
];

export default function Medications() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [alerts, setAlerts] = useState([]);

  // Modal Thêm thuốc
  const [openAdd, setOpenAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form] = Form.useForm();

  // Modal Sửa thuốc
  const [openEdit, setOpenEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [editingMedication, setEditingMedication] = useState(null);

  const [showLowStock, setShowLowStock] = useState(false);

  const fetchMedications = async () => {
    setLoading(true);
    try {
      let res;
      if (search) {
        res = await searchMedications(search);
      } else {
        res = await getAllMedications();
      }
      
      const medicationsData = Array.isArray(res) ? res : 
                            Array.isArray(res.data) ? res.data : 
                            Array.isArray(res.data?.data) ? res.data.data : [];
      
      setMedications(medicationsData);
      
      // Tạo alerts từ dữ liệu thực tế
      createAlerts(medicationsData);
    } catch (err) {
      message.error('Lỗi tải danh sách thuốc');
    } finally {
      setLoading(false);
    }
  };

  const createAlerts = (medicationsData) => {
    const lowStockCount = medicationsData.filter(med => med.quantity < 10).length;
    const expiredCount = medicationsData.filter(med => {
      if (!med.expiryDate) return false;
      return dayjs(med.expiryDate).isBefore(dayjs(), 'day');
    }).length;

    const newAlerts = [];
    if (lowStockCount > 0) {
      newAlerts.push({
        type: 'warning',
        message: `${lowStockCount} loại thuốc sắp hết hàng`,
        icon: <WarningOutlined />
      });
    }
    if (expiredCount > 0) {
      newAlerts.push({
        type: 'error',
        message: `${expiredCount} loại thuốc đã hết hạn`,
        icon: <ExclamationCircleOutlined />
      });
    }
    setAlerts(newAlerts);
  };

  useEffect(() => {
    fetchMedications();
    // eslint-disable-next-line
  }, [search]);

  const handleAdd = () => {
    form.resetFields();
    setOpenAdd(true);
  };

  const handleAddOk = async () => {
    try {
      const values = await form.validateFields();
      setAddLoading(true);
      const payload = {
        ...values,
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : undefined,
      };
      await createMedication(payload);
      message.success('Thêm thuốc thành công');
      setOpenAdd(false);
      fetchMedications();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err?.response?.data?.message || 'Thêm thuốc thất bại');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingMedication(record);
    editForm.setFieldsValue({
      ...record,
      expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
    });
    setOpenEdit(true);
  };

  const handleEditOk = async () => {
    try {
      const values = await editForm.validateFields();
      setEditLoading(true);
      const payload = {
        ...values,
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : undefined,
      };
      await updateMedication(editingMedication.medicationId, payload);
      message.success('Cập nhật thuốc thành công');
      setOpenEdit(false);
      fetchMedications();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err?.response?.data?.message || 'Cập nhật thuốc thất bại');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa thuốc "${record.name}"?`,
      onOk: async () => {
        try {
          await deleteMedication(record.medicationId);
          message.success('Xóa thuốc thành công');
          fetchMedications();
        } catch (err) {
          message.error(err?.response?.data?.message || 'Xóa thuốc thất bại');
        }
      },
    });
  };

  const handleShowLowStock = async () => {
    setShowLowStock(true);
    try {
      const res = await getLowStockMedications(10);
      const lowStockData = Array.isArray(res) ? res : 
                          Array.isArray(res.data) ? res.data : 
                          Array.isArray(res.data?.data) ? res.data.data : [];
      setMedications(lowStockData);
    } catch (err) {
      message.error('Lỗi tải danh sách thuốc sắp hết');
    }
  };

  const handleShowAll = () => {
    setShowLowStock(false);
    fetchMedications();
  };

  const columns = [
    { 
      title: 'Tên thuốc', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    { 
      title: 'Mô tả', 
      dataIndex: 'description', 
      key: 'description',
      ellipsis: true
    },
    { 
      title: 'Số lượng', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (quantity, record) => (
        <Text type={quantity < 10 ? 'danger' : 'secondary'}>
          {quantity} {record.quantityType}
        </Text>
      )
    },
    { 
      title: 'Loại', 
      dataIndex: 'medicationType', 
      key: 'medicationType',
      render: (type) => (
        <Tag color="blue">
          {MedicationType[type] || type}
        </Tag>
      )
    },
    { 
      title: 'Hạn sử dụng', 
      dataIndex: 'expiryDate', 
      key: 'expiryDate',
      render: (date) => {
        if (!date) return 'N/A';
        const isExpired = dayjs(date).isBefore(dayjs(), 'day');
        return (
          <Text type={isExpired ? 'danger' : 'secondary'}>
            {dayjs(date).format('DD/MM/YYYY')}
            {isExpired && <Tag color="red" style={{ marginLeft: 8 }}>Hết hạn</Tag>}
          </Text>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="medications-management">
      <div style={{ marginBottom: 24 }}>
        <h2>Quản lý thuốc</h2>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {alerts.map((alert, index) => (
            <Alert
              key={index}
              message={alert.message}
              type={alert.type}
              icon={alert.icon}
              showIcon
              style={{ marginBottom: 8 }}
            />
          ))}
        </div>
      )}

      {/* Filters and Actions */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Input.Search
              placeholder="Tìm kiếm thuốc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={setSearch}
              allowClear
            />
          </Col>
          <Col span={16}>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAdd}
              >
                Thêm thuốc mới
              </Button>
              <Button 
                icon={<WarningOutlined />} 
                onClick={handleShowLowStock}
                type={showLowStock ? 'primary' : 'default'}
              >
                Thuốc sắp hết
              </Button>
              <Button 
                icon={<MedicineBoxOutlined />} 
                onClick={handleShowAll}
                type={!showLowStock ? 'primary' : 'default'}
              >
                Tất cả thuốc
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => {
                  fetchMedications();
                }}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Medications Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={medications}
          rowKey="medicationId"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thuốc`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Add Medication Modal */}
      <Modal
        title="Thêm thuốc mới"
        open={openAdd}
        onOk={handleAddOk}
        onCancel={() => setOpenAdd(false)}
        confirmLoading={addLoading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên thuốc"
                rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="medicationType"
                label="Loại thuốc"
                rules={[{ required: true, message: 'Vui lòng chọn loại thuốc' }]}
              >
                <Select>
                  {medicationTypeOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantityType"
                label="Đơn vị"
                rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
              >
                <Select>
                  {quantityTypeOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="expiryDate"
            label="Hạn sử dụng"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Medication Modal */}
      <Modal
        title="Sửa thuốc"
        open={openEdit}
        onOk={handleEditOk}
        onCancel={() => setOpenEdit(false)}
        confirmLoading={editLoading}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên thuốc"
                rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="medicationType"
                label="Loại thuốc"
                rules={[{ required: true, message: 'Vui lòng chọn loại thuốc' }]}
              >
                <Select>
                  {medicationTypeOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantityType"
                label="Đơn vị"
                rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
              >
                <Select>
                  {quantityTypeOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="expiryDate"
            label="Hạn sử dụng"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 