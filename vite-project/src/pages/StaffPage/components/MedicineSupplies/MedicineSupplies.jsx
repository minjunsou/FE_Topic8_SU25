import React, { useState, useEffect } from 'react';
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
  Popconfirm,
  message,
  notification,
  Alert,
  Dropdown,
  List,
  Avatar
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
  WarningOutlined,
  SyncOutlined,
  AlertOutlined,
  BellOutlined,
  BellFilled
} from '@ant-design/icons';
import moment from 'moment';
import { nurseApi } from '../../../../api';
import './MedicineSupplies.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;

const MedicineSupplies = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [lowStockMedications, setLowStockMedications] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const THRESHOLD = 5; // Ngưỡng cố định cho số lượng thuốc thấp
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Lấy dữ liệu thuốc từ API khi component được mount
  useEffect(() => {
    fetchMedications();
    fetchLowStockMedications();
  }, []);

  // Hàm gọi API để lấy danh sách thuốc
  const fetchMedications = async () => {
    try {
      setLoading(true);
      const data = await nurseApi.getAllMedications();
      
      // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
      const formattedData = data.map(item => ({
        id: item.medicationId,
        name: item.name,
        type: 'Thuốc', // Mặc định là thuốc
        quantity: item.quantity,
        unit: 'viên', // Mặc định là viên
        expiry: formatExpiryDate(item.expiryDate),
        status: getStatus(item.expiryDate),
        description: item.description,
        rawExpiryDate: item.expiryDate // Lưu trữ ngày gốc để xử lý sau này
      }));
      
      setMedicines(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thuốc:', error);
      message.error('Không thể tải danh sách thuốc. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Hàm gọi API để lấy danh sách thuốc sắp hết hàng
  const fetchLowStockMedications = async () => {
    try {
      const data = await nurseApi.getLowStockMedications(THRESHOLD);
      setLowStockMedications(data);
      
      // Hiển thị thông báo nếu có thuốc sắp hết hàng
      if (data && data.length > 0) {
        showLowStockNotification(data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thuốc sắp hết hàng:', error);
    }
  };

  // Hiển thị thông báo cho thuốc sắp hết hàng
  const showLowStockNotification = (medications) => {
    notification.warning({
      message: 'Cảnh báo: Thuốc sắp hết hàng',
      description: (
        <div>
          <p>Các thuốc sau đây có số lượng dưới ngưỡng {THRESHOLD}:</p>
          <ul>
            {medications.map(med => (
              <li key={med.medicationId}>
                <strong>{med.name}</strong>: {med.quantity} {med.unit || 'viên'}
              </li>
            ))}
          </ul>
          <p>Vui lòng bổ sung thuốc kịp thời.</p>
        </div>
      ),
      icon: <AlertOutlined style={{ color: '#ff4d4f' }} />,
      duration: 0,
      placement: 'topRight',
    });
  };

  // Nội dung của dropdown thông báo
  const notificationContent = (
    <Card className="notification-dropdown" style={{ width: 300, maxHeight: 400, overflow: 'auto' }}>
      <List
        itemLayout="horizontal"
        dataSource={lowStockMedications}
        header={<div className="notification-header">Thuốc sắp hết hàng</div>}
        footer={
          <div style={{ textAlign: 'center' }}>
            <Button 
              type="link" 
              onClick={() => {
                setNotificationsVisible(false);
                setActiveTab('low-stock');
              }}
            >
              Xem tất cả
            </Button>
          </div>
        }
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<AlertOutlined />} style={{ backgroundColor: '#ff4d4f' }} />}
              title={item.name}
              description={`Số lượng: ${item.quantity} ${item.unit || 'viên'}`}
            />
          </List.Item>
        )}
        locale={{ emptyText: 'Không có thuốc sắp hết hàng' }}
      />
    </Card>
  );

  // Chuyển đổi định dạng ngày hết hạn từ API sang định dạng hiển thị
  const formatExpiryDate = (dateString) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('MM/YYYY');
  };

  // Xác định trạng thái của thuốc dựa vào ngày hết hạn
  const getStatus = (expiryDate) => {
    if (!expiryDate) return 'unknown';
    
    const today = moment();
    const expiry = moment(expiryDate);
    
    if (expiry.isBefore(today)) {
      return 'expired';
    } else if (expiry.diff(today, 'months') <= 3) {
      return 'warning';
    } else {
      return 'active';
    }
  };

  // Thống kê
  const stats = {
    totalMedicines: medicines.filter(item => item.type === 'Thuốc').length,
    totalSupplies: medicines.filter(item => item.type === 'Vật tư').length,
    expiredItems: medicines.filter(item => item.status === 'expired').length,
    warningItems: medicines.filter(item => item.status === 'warning').length,
    lowStockItems: lowStockMedications.length
  };

  // Lọc dữ liệu dựa trên tab đang chọn và text tìm kiếm
  const filteredData = medicines.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
    
    if (activeTab === 'all') return matchSearch;
    if (activeTab === 'medicines') return matchSearch && item.type === 'Thuốc';
    if (activeTab === 'supplies') return matchSearch && item.type === 'Vật tư';
    if (activeTab === 'expired') return matchSearch && item.status === 'expired';
    if (activeTab === 'warning') return matchSearch && item.status === 'warning';
    if (activeTab === 'low-stock') return matchSearch && lowStockMedications.some(med => med.medicationId === item.id);
    
    return matchSearch;
  });

  // Render trạng thái
  const renderStatus = (status) => {
    const statusMap = {
      'active': { color: 'green', text: 'Còn hạn' },
      'warning': { color: 'orange', text: 'Sắp hết hạn' },
      'expired': { color: 'red', text: 'Đã hết hạn' },
      'unknown': { color: 'gray', text: 'Không xác định' }
    };

    return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
  };

  // Xử lý khi thêm thuốc/vật tư mới
  const handleAddItem = async (values) => {
    try {
      setLoading(true);
      
      // Chuyển đổi dữ liệu để gửi đến API
      const medicationData = {
        name: values.name,
        description: values.description || '',
        quantity: parseInt(values.quantity, 10),
        expiryDate: values.expiry.format('MM/YYYY')
      };
      
      console.log('Dữ liệu thuốc mới gửi đến API:', medicationData);
      
      // Gọi API để thêm thuốc mới
      await nurseApi.addMedication(medicationData);
      
      message.success('Thêm thuốc mới thành công!');
      setAddModalVisible(false);
      form.resetFields();
      
      // Tải lại danh sách thuốc
      fetchMedications();
      fetchLowStockMedications();
    } catch (error) {
      console.error('Lỗi khi thêm thuốc mới:', error);
      message.error('Không thể thêm thuốc mới. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Xử lý khi xóa thuốc/vật tư
  const handleDeleteItem = async (id) => {
    try {
      setLoading(true);
      
      if (!id) {
        throw new Error('Không tìm thấy ID của thuốc cần xóa');
      }
      
      console.log(`Đang xóa thuốc với ID: ${id}`);
      
      // Gọi API để xóa thuốc
      await nurseApi.deleteMedication(id);
      
      message.success('Xóa thuốc thành công!');
      
      // Tải lại danh sách thuốc
      fetchMedications();
      fetchLowStockMedications();
    } catch (error) {
      console.error(`Lỗi khi xóa thuốc ID ${id}:`, error);
      message.error('Không thể xóa thuốc. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  // Xử lý khi sửa thuốc/vật tư
  const handleEditItem = (item) => {
    setCurrentItem(item);
    editForm.setFieldsValue({
      name: item.name,
      type: item.type,
      quantity: item.quantity,
      unit: item.unit,
      description: item.description || '',
      expiry: item.rawExpiryDate ? moment(item.rawExpiryDate) : null
    });
    setEditModalVisible(true);
  };

  // Xử lý khi lưu thông tin cập nhật
  const handleUpdateItem = async (values) => {
    try {
      setLoading(true);
      
      if (!currentItem || !currentItem.id) {
        throw new Error('Không tìm thấy ID của thuốc cần cập nhật');
      }

      // Lấy medicationId từ currentItem
      const medicationId = currentItem.id;
      
      // Chuyển đổi dữ liệu để gửi đến API
      const medicationData = {
        name: values.name,
        description: values.description || '',
        quantity: parseInt(values.quantity, 10),
        expiryDate: values.expiry.format('MM/YYYY')
      };
      
      console.log(`Dữ liệu cập nhật thuốc ID ${medicationId}:`, medicationData);
      
      // Gọi API để cập nhật thuốc
      await nurseApi.updateMedication(medicationId, medicationData);
      
      message.success('Cập nhật thông tin thuốc thành công!');
      setEditModalVisible(false);
      setCurrentItem(null);
      
      // Tải lại danh sách thuốc
      fetchMedications();
      fetchLowStockMedications();
    } catch (error) {
      console.error(`Lỗi khi cập nhật thuốc:`, error);
      message.error('Không thể cập nhật thông tin thuốc. Vui lòng thử lại sau.');
      setLoading(false);
    }
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
          {lowStockMedications.some(med => med.medicationId === record.id) && (
            <Tooltip title="Số lượng thấp">
              <AlertOutlined style={{ color: '#ff4d4f', marginLeft: 8 }} />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (text, record) => (
        <span>
          {text} {record.unit}
          {lowStockMedications.some(med => med.medicationId === record.id) && (
            <Tag color="red" style={{ marginLeft: 8 }}>Sắp hết</Tag>
          )}
        </span>
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
      {lowStockMedications.length > 0 && (
        <Alert
          message="Cảnh báo: Thuốc sắp hết hàng"
          description={
            <div>
              <p>Có {lowStockMedications.length} loại thuốc có số lượng dưới ngưỡng {THRESHOLD}.</p>
              <ul className="low-stock-list">
                {lowStockMedications.slice(0, 3).map(med => (
                  <li key={med.medicationId}>
                    <strong>{med.name}</strong>: còn {med.quantity} {med.unit || 'viên'}
                  </li>
                ))}
                {lowStockMedications.length > 3 && (
                  <li>... và {lowStockMedications.length - 3} loại thuốc khác</li>
                )}
              </ul>
            </div>
          }
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

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
              title="Sắp hết hàng" 
              value={stats.lowStockItems} 
              suffix="loại"
              valueStyle={{ color: '#ff4d4f' }}
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
            <TabPane 
              tab={
                <Badge count={stats.lowStockItems} offset={[10, 0]}>
                  <span>Sắp hết hàng</span>
                </Badge>
              } 
              key="low-stock" 
            />
          </Tabs>
        }
        extra={
          <Space>
            <Dropdown 
              overlay={notificationContent} 
              trigger={['click']}
              visible={notificationsVisible}
              onVisibleChange={setNotificationsVisible}
            >
              <Badge count={lowStockMedications.length} overflowCount={99}>
                <Button 
                  icon={notificationsVisible ? <BellFilled /> : <BellOutlined />} 
                  shape="circle"
                  style={{ marginRight: 8 }}
                />
              </Badge>
            </Dropdown>
            <Button 
              icon={<SyncOutlined />} 
              onClick={() => {
                fetchMedications();
                fetchLowStockMedications();
              }}
              loading={loading}
            >
              Làm mới
            </Button>
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
          loading={loading}
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
            name="description"
            label="Mô tả"
          >
            <Input.TextArea placeholder="Nhập mô tả thuốc/vật tư" rows={3} />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại"
            initialValue="Thuốc"
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
                initialValue="viên"
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
              placeholder="Chọn tháng/năm hết hạn"
            />
          </Form.Item>

          <Form.Item className="form-footer">
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setAddModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
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
            name="description"
            label="Mô tả"
          >
            <Input.TextArea placeholder="Nhập mô tả thuốc/vật tư" rows={3} />
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
              placeholder="Chọn tháng/năm hết hạn"
            />
          </Form.Item>

          <Form.Item className="form-footer">
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setEditModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
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