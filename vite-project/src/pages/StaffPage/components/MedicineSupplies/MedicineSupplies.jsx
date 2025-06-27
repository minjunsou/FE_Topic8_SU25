import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Tag, 
  Tabs, 
  Row, 
  Col, 
  Statistic, 
  Modal, 
  Form, 
  Select, 
  DatePicker,
  InputNumber,
  Typography,
  Tooltip,
  Badge,
  Popconfirm
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  FilterOutlined, 
  ExportOutlined,
  ImportOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined  
} from '@ant-design/icons';
import './MedicineSupplies.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;

// Dữ liệu mẫu cho thuốc
const mockMedicines = [
  {
    id: 1,
    name: 'Paracetamol 500mg',
    type: 'Thuốc',
    quantity: 150,
    unit: 'viên',
    expiry: '12/2024',
    status: 'active'
  },
  {
    id: 2,
    name: 'Vitamin C 1000mg',
    type: 'Thuốc',
    quantity: 80,
    unit: 'viên',
    expiry: '05/2025',
    status: 'active'
  },
  {
    id: 3,
    name: 'Băng cá nhân Urgo',
    type: 'Vật tư',
    quantity: 20,
    unit: 'gói',
    expiry: '08/2024',
    status: 'warning'
  },
  {
    id: 4,
    name: 'Băng gạc vô trùng',
    type: 'Vật tư',
    quantity: 30,
    unit: 'gói',
    expiry: '10/2024',
    status: 'active'
  },
  {
    id: 5,
    name: 'Cồn y tế 70%',
    type: 'Vật tư',
    quantity: 5,
    unit: 'chai',
    expiry: '11/2023',
    status: 'expired'
  }
];

const MedicineSupplies = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [medicines, setMedicines] = useState(mockMedicines);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Thống kê
  const stats = {
    totalMedicines: medicines.filter(item => item.type === 'Thuốc').length,
    totalSupplies: medicines.filter(item => item.type === 'Vật tư').length,
    expiredItems: medicines.filter(item => item.status === 'expired').length,
    warningItems: medicines.filter(item => item.status === 'warning').length
  };

  // Lọc dữ liệu dựa trên tab đang chọn và text tìm kiếm
  const filteredData = medicines.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
    
    if (activeTab === 'all') return matchSearch;
    if (activeTab === 'medicines') return matchSearch && item.type === 'Thuốc';
    if (activeTab === 'supplies') return matchSearch && item.type === 'Vật tư';
    if (activeTab === 'expired') return matchSearch && item.status === 'expired';
    if (activeTab === 'warning') return matchSearch && item.status === 'warning';
    
    return matchSearch;
  });

  // Render trạng thái
  const renderStatus = (status) => {
    const statusMap = {
      'active': { color: 'green', text: 'Còn hạn' },
      'warning': { color: 'orange', text: 'Sắp hết hạn' },
      'expired': { color: 'red', text: 'Đã hết hạn' }
    };

    return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
  };

  // Xử lý khi thêm thuốc/vật tư mới
  const handleAddItem = (values) => {
    const newItem = {
      id: Math.max(...medicines.map(item => item.id)) + 1,
      ...values,
      expiry: values.expiry.format('MM/YYYY'),
      status: 'active'
    };
    
    setMedicines([...medicines, newItem]);
    setAddModalVisible(false);
    form.resetFields();
  };

  // Xử lý khi xóa thuốc/vật tư
  const handleDeleteItem = (id) => {
    setMedicines(medicines.filter(item => item.id !== id));
  };

  // Xử lý khi sửa thuốc/vật tư
  const handleEditItem = (item) => {
    setCurrentItem(item);
    editForm.setFieldsValue({
      name: item.name,
      type: item.type,
      quantity: item.quantity,
      unit: item.unit,
      expiry: null // DatePicker cần định dạng đặc biệt
    });
    setEditModalVisible(true);
  };

  // Xử lý khi lưu thông tin cập nhật
  const handleUpdateItem = (values) => {
    const updatedItems = medicines.map(item => {
      if (item.id === currentItem.id) {
        return {
          ...item,
          ...values,
          expiry: values.expiry.format('MM/YYYY'),
        };
      }
      return item;
    });
    
    setMedicines(updatedItems);
    setEditModalVisible(false);
    setCurrentItem(null);
  };

  // Cấu hình bảng
  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <span>{text}</span>
          {record.status === 'expired' && (
            <Tooltip title="Đã hết hạn">
              <ExclamationCircleOutlined style={{ color: 'red', marginLeft: 8 }} />
            </Tooltip>
          )}
          {record.status === 'warning' && (
            <Tooltip title="Sắp hết hạn">
              <WarningOutlined style={{ color: 'orange', marginLeft: 8 }} />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (text, record) => (
        <span>{text} {record.unit}</span>
      )
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiry',
      key: 'expiry',
      width: 120
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => renderStatus(status)
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditItem(record)}
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa mục này?"
            onConfirm={() => handleDeleteItem(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="medicine-supplies-container">
      <Card className="statistics-card">
        <Row gutter={[24, 24]}>
          <Col xs={12} sm={12} md={6}>
            <Statistic 
              title="Tổng số thuốc" 
              value={stats.totalMedicines} 
              suffix="loại"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Statistic 
              title="Vật tư y tế" 
              value={stats.totalSupplies} 
              suffix="loại"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Statistic 
              title="Đã hết hạn" 
              value={stats.expiredItems} 
              suffix="loại"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Statistic 
              title="Cận hết hạn" 
              value={stats.warningItems} 
              suffix="loại"
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            className="supplies-tabs"
          >
            <TabPane 
              tab="Tất cả" 
              key="all"
            />
            <TabPane 
              tab="Thuốc" 
              key="medicines" 
            />
            <TabPane 
              tab="Vật tư y tế" 
              key="supplies" 
            />
            <TabPane 
              tab={
                <Badge count={stats.warningItems} offset={[10, 0]}>
                  <span>Cận hạn</span>
                </Badge>
              } 
              key="warning" 
            />
            <TabPane 
              tab={
                <Badge count={stats.expiredItems} offset={[10, 0]}>
                  <span>Hết hạn</span>
                </Badge>
              } 
              key="expired" 
            />
          </Tabs>
        }
        extra={
          <Space>
            <Search
              placeholder="Tìm kiếm thuốc, vật tư..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setAddModalVisible(true)}
            >
              Thêm mới
            </Button>
            <Button icon={<ExportOutlined />}>
              Xuất báo cáo
            </Button>
          </Space>
        }
      >
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
          }}
        />
      </Card>

      {/* Modal thêm thuốc/vật tư mới */}
      <Modal
        title="Thêm thuốc/vật tư mới"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddItem}
        >
          <Form.Item
            name="name"
            label="Tên thuốc/vật tư"
            rules={[{ required: true, message: 'Vui lòng nhập tên thuốc/vật tư' }]}
          >
            <Input placeholder="Nhập tên thuốc/vật tư" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
          >
            <Select placeholder="Chọn loại">
              <Option value="Thuốc">Thuốc</Option>
              <Option value="Vật tư">Vật tư y tế</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập số lượng" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="Đơn vị"
                rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
              >
                <Input placeholder="vd: viên, chai, gói" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="expiry"
            label="Hạn sử dụng"
            rules={[{ required: true, message: 'Vui lòng chọn hạn sử dụng' }]}
          >
            <DatePicker 
              picker="month" 
              style={{ width: '100%' }} 
              format="MM/YYYY" 
              placeholder="Chọn tháng/năm"
            />
          </Form.Item>

          <Form.Item className="form-footer">
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setAddModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Thêm mới
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal sửa thuốc/vật tư */}
      <Modal
        title="Sửa thông tin thuốc/vật tư"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateItem}
        >
          <Form.Item
            name="name"
            label="Tên thuốc/vật tư"
            rules={[{ required: true, message: 'Vui lòng nhập tên thuốc/vật tư' }]}
          >
            <Input placeholder="Nhập tên thuốc/vật tư" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
          >
            <Select placeholder="Chọn loại">
              <Option value="Thuốc">Thuốc</Option>
              <Option value="Vật tư">Vật tư y tế</Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập số lượng" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="Đơn vị"
                rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
              >
                <Input placeholder="vd: viên, chai, gói" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="expiry"
            label="Hạn sử dụng"
            rules={[{ required: true, message: 'Vui lòng chọn hạn sử dụng' }]}
          >
            <DatePicker 
              picker="month" 
              style={{ width: '100%' }} 
              format="MM/YYYY" 
              placeholder="Chọn tháng/năm"
            />
          </Form.Item>

          <Form.Item className="form-footer">
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setEditModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicineSupplies; 