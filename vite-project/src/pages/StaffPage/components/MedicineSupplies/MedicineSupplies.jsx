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

// Custom ExpiryDateInput component to avoid DatePicker issues
const ExpiryDateInput = ({ value, onChange }) => {
  // Generate month options
  const monthOptions = [];
  for (let i = 1; i <= 12; i++) {
    const monthNum = i.toString().padStart(2, '0');
    monthOptions.push(
      <Option key={monthNum} value={monthNum}>{monthNum}</Option>
    );
  }

  // Generate year options (current year to current year + 20)
  const yearOptions = [];
  const currentYear = moment().year();
  for (let i = currentYear; i <= currentYear + 20; i++) {
    yearOptions.push(
      <Option key={i} value={i.toString()}>{i}</Option>
    );
  }

  // Parse value if it exists
  let month = '01';
  let year = moment().add(1, 'year').format('YYYY');
  
  if (value) {
    if (typeof value === 'string') {
      // Try to parse from MM/YYYY format
      const parts = value.split('/');
      if (parts.length === 2) {
        month = parts[0];
        year = parts[1];
      }
    } else if (moment.isMoment(value)) {
      month = value.format('MM');
      year = value.format('YYYY');
    }
  }
  
  const handleMonthChange = (newMonth) => {
    if (onChange) {
      onChange(`${newMonth}/${year}`);
    }
  };

  const handleYearChange = (newYear) => {
    if (onChange) {
      onChange(`${month}/${newYear}`);
    }
  };

  return (
    <Space style={{ width: '100%' }}>
      <Select 
        placeholder="Tháng"
        value={month}
        onChange={handleMonthChange}
        style={{ width: 100 }}
      >
        {monthOptions}
      </Select>
      <Select 
        placeholder="Năm"
        value={year}
        onChange={handleYearChange}
        style={{ width: 100 }}
      >
        {yearOptions}
      </Select>
    </Space>
  );
};

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
  const [expiryMonth, setExpiryMonth] = useState('01');
  const [expiryYear, setExpiryYear] = useState(moment().add(1, 'year').format('YYYY'));
  const [addExpiryMonth, setAddExpiryMonth] = useState('01');
  const [addExpiryYear, setAddExpiryYear] = useState(moment().add(1, 'year').format('YYYY'));
  const [currentDeletingId, setCurrentDeletingId] = useState(null); // Track the ID of the item being deleted

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
      console.log('Fetched medications data:', data);
      
      // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
      const formattedData = data.map(item => {
        // Xác định loại thuốc/vật tư dựa trên medicationType
        let type = 'Thuốc'; // Mặc định là "Thuốc" nếu không có giá trị
        if (item.medicationType === 'MEDICAL_SUPPLY') {
          type = 'Vật tư';
        } else if (item.medicationType === 'MEDICATION') {
          type = 'Thuốc';
        }
        
        return {
          id: item.medicationId,
          name: item.name || 'Không có tên',
          type: type,
          quantity: item.quantity || 0,
          unit: item.quantityType || 'viên',
          expiry: formatExpiryDate(item.expiryDate),
          status: getStatus(item.expiryDate),
          description: item.description || '',
          rawExpiryDate: item.expiryDate, // Lưu trữ ngày gốc để xử lý sau này
          medicationType: item.medicationType, // Lưu trữ giá trị medicationType gốc
          quantityType: item.quantityType // Lưu trữ giá trị quantityType gốc
        };
      });
      
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
      console.log('Low stock medications data:', data);
      
      // Đảm bảo data có định dạng đúng
      if (Array.isArray(data)) {
        setLowStockMedications(data);
        
        // Hiển thị thông báo nếu có thuốc sắp hết hàng
        if (data.length > 0) {
          showLowStockNotification(data);
        }
      } else {
        console.error('Invalid low stock medications data format:', data);
        setLowStockMedications([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thuốc sắp hết hàng:', error);
      setLowStockMedications([]);
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
      duration: 3, // Hiện thông báo trong 3 giây
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
    
    try {
      // Xử lý nhiều định dạng ngày khác nhau
      
      // Kiểm tra nếu là định dạng "07/2025"
      if (dateString.match(/^\d{2}\/\d{4}$/)) {
        return dateString; // Đã đúng định dạng
      }
      
      // Kiểm tra nếu là định dạng "2025-12-31"
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return moment(dateString).format('MM/YYYY');
      }
      
      // Trường hợp khác
      return moment(dateString).isValid() ? moment(dateString).format('MM/YYYY') : 'N/A';
    } catch (error) {
      console.error('Lỗi khi định dạng ngày:', error);
      return 'N/A';
    }
  };

  // Xác định trạng thái của thuốc dựa vào ngày hết hạn
  const getStatus = (expiryDate) => {
    if (!expiryDate) return 'unknown';
    
    try {
      const today = moment();
      let expiry;
      
      // Xử lý nhiều định dạng ngày khác nhau
      if (expiryDate.match(/^\d{2}\/\d{4}$/)) {
        // Format "07/2025"
        const [month, year] = expiryDate.split('/');
        // Đặt ngày là ngày cuối cùng của tháng đó
        expiry = moment(`${year}-${month}-01`).endOf('month');
      } else {
        // Các định dạng khác
        expiry = moment(expiryDate);
      }
      
      if (!expiry.isValid()) {
        return 'unknown';
      }
      
      if (expiry.isBefore(today)) {
        return 'expired';
      } else if (expiry.diff(today, 'months') <= 3) {
        return 'warning';
      } else {
        return 'active';
      }
    } catch (error) {
      console.error('Lỗi khi xác định trạng thái thuốc:', error);
      return 'unknown';
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
      
      // Chuyển đổi medicationType từ giá trị hiển thị sang giá trị API
      const medicationType = values.type === 'Thuốc' ? 'MEDICATION' : 'MEDICAL_SUPPLY';
      
      // Chuyển đổi dữ liệu để gửi đến API
      const medicationData = {
        name: values.name,
        description: values.description || '',
        quantity: parseInt(values.quantity, 10),
        quantityType: values.unit || 'viên',
        medicationType: medicationType,
        expiryDate: `${addExpiryMonth}/${addExpiryYear}`
      };
      
      console.log('Dữ liệu thuốc mới gửi đến API:', medicationData);
      
      // Gọi API để thêm thuốc mới
      await nurseApi.addMedication(medicationData);
      
      message.success('Thêm thuốc mới thành công!');
      setAddModalVisible(false);
      form.resetFields();
      
      // Reset các giá trị
      setAddExpiryMonth('01');
      setAddExpiryYear(moment().add(1, 'year').format('YYYY'));
      
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
    setCurrentDeletingId(id); // Set the ID of the item being deleted
    try {
      setLoading(true);
      
      if (!id) {
        throw new Error('Không tìm thấy ID của thuốc cần xóa');
      }
      
      console.log(`Đang xóa thuốc với ID: ${id}`);
      
      // Gọi API để xóa thuốc - sử dụng endpoint http://localhost:8080/api/v1/medications/{medicationId}
      const response = await nurseApi.deleteMedication(id);
      
      if (response) {
        message.success('Xóa thuốc thành công!');
        
        // Tải lại danh sách thuốc
        fetchMedications();
        fetchLowStockMedications();
      } else {
        throw new Error('Không nhận được phản hồi từ API');
      }
    } catch (error) {
      console.error(`Lỗi khi xóa thuốc ID ${id}:`, error);
      
      // Hiển thị thông báo lỗi chi tiết hơn cho người dùng
      let errorMessage = 'Không thể xóa thuốc.';
      
      if (error.response) {
        // Lỗi từ API
        if (error.response.status === 404) {
          errorMessage = 'Không tìm thấy thuốc cần xóa.';
        } else if (error.response.status === 403) {
          errorMessage = 'Bạn không có quyền xóa thuốc này.';
        } else if (error.response.status === 500) {
          errorMessage = 'Lỗi máy chủ khi xóa thuốc. Vui lòng thử lại sau.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = `Lỗi: ${error.response.data.message}`;
        }
      } else if (error.message) {
        errorMessage = `Lỗi: ${error.message}`;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
      setCurrentDeletingId(null); // Reset the deleting ID after deletion attempt
    }
  };

  // Xử lý khi sửa thuốc/vật tư
  const handleEditItem = (item) => {
    setCurrentItem(item);
    console.log('Editing item:', item);
    
    // Parse expiry date if available
    let month = '01';
    let year = moment().add(1, 'year').format('YYYY');
    
    if (item.rawExpiryDate) {
      console.log('Raw expiry date:', item.rawExpiryDate);
      
      if (typeof item.rawExpiryDate === 'string') {
        // Handle format like "MM/YYYY"
        if (item.rawExpiryDate.match(/^\d{2}\/\d{4}$/)) {
          const parts = item.rawExpiryDate.split('/');
          month = parts[0];
          year = parts[1];
        } 
        // Handle format like "2025-12-31"
        else if (item.rawExpiryDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const date = moment(item.rawExpiryDate);
          if (date.isValid()) {
            month = date.format('MM');
            year = date.format('YYYY');
          }
        }
      } else if (Array.isArray(item.rawExpiryDate) && item.rawExpiryDate.length >= 2) {
        // Handle format like [YYYY, MM, DD]
        year = item.rawExpiryDate[0].toString();
        month = item.rawExpiryDate[1].toString().padStart(2, '0');
      }
    }
    
    console.log(`Parsed expiry: month=${month}, year=${year}`);
    setExpiryMonth(month);
    setExpiryYear(year);
    
    editForm.setFieldsValue({
      name: item.name,
      type: item.type,
      quantity: item.quantity,
      unit: item.quantityType || item.unit,
      description: item.description || '',
      expiryMonth: month,
      expiryYear: year
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
      
      // Chuyển đổi medicationType từ giá trị hiển thị sang giá trị API
      const medicationType = values.type === 'Thuốc' ? 'MEDICATION' : 'MEDICAL_SUPPLY';
      
      // Chuyển đổi dữ liệu để gửi đến API
      const medicationData = {
        name: values.name,
        description: values.description || '',
        quantity: parseInt(values.quantity, 10),
        quantityType: values.unit || 'viên',
        medicationType: medicationType,
        expiryDate: `${expiryMonth}/${expiryYear}`
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
          {record.quantity <= THRESHOLD && (
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
      render: (_, record) => {
        // Track delete loading state for each medication
        const isDeleting = loading && currentDeletingId === record.id;
        
        return (
          <Space size="small">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEditItem(record)}
              disabled={isDeleting}
            />
            <Popconfirm
              title="Xóa thuốc"
              description={
                <div>
                  <p>Bạn có chắc muốn xóa thuốc <strong>{record.name}</strong>?</p>
                  <p>Hành động này không thể hoàn tác.</p>
                </div>
              }
              onConfirm={() => handleDeleteItem(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true, loading: isDeleting }}
              icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            >
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
                loading={isDeleting}
              />
            </Popconfirm>
          </Space>
        );
      },
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
            {/* <Button icon={<ExportOutlined />}>
              Xuất báo cáo
            </Button> */}
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
                rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
              >
                <Select placeholder="Chọn đơn vị">
                  <Option value="viên">Viên</Option>
                  <Option value="hộp">Hộp</Option>
                  <Option value="lọ">Lọ</Option>
                  <Option value="ống">Ống</Option>
                  <Option value="tuýp">Tuýp</Option>
                  <Option value="gói">Gói</Option>
                  <Option value="chai">Chai</Option>
                  <Option value="vỉ">Vỉ</Option>
                  <Option value="miếng">Miếng</Option>
                  <Option value="cái">Cái</Option>
                  <Option value="bộ">Bộ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="expiry"
            label="Hạn sử dụng"
            rules={[{ required: true, message: 'Vui lòng chọn hạn sử dụng' }]}
          >
            <ExpiryDateInput 
              value={`${addExpiryMonth}/${addExpiryYear}`}
              onChange={(value) => {
                const [month, year] = value.split('/');
                setAddExpiryMonth(month);
                setAddExpiryYear(year);
              }}
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
                rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
              >
                <Select placeholder="Chọn đơn vị">
                  <Option value="viên">Viên</Option>
                  <Option value="hộp">Hộp</Option>
                  <Option value="lọ">Lọ</Option>
                  <Option value="ống">Ống</Option>
                  <Option value="tuýp">Tuýp</Option>
                  <Option value="gói">Gói</Option>
                  <Option value="chai">Chai</Option>
                  <Option value="vỉ">Vỉ</Option>
                  <Option value="miếng">Miếng</Option>
                  <Option value="cái">Cái</Option>
                  <Option value="bộ">Bộ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="expiry"
            label="Hạn sử dụng"
            rules={[{ required: true, message: 'Vui lòng chọn hạn sử dụng' }]}
          >
            <ExpiryDateInput 
              value={`${expiryMonth}/${expiryYear}`}
              onChange={(value) => {
                const [month, year] = value.split('/');
                setExpiryMonth(month);
                setExpiryYear(year);
              }}
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