import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Tag, 
  Row, 
  Col, 
  Typography, 
  Tooltip, 
  message,
  Spin,
  Statistic,
  Tabs,
  Modal,
  List,
  Avatar,
  Divider,
  Empty,
  Select,
  Form
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  PhoneOutlined, 
  MailOutlined,
  InfoCircleOutlined,
  ProfileOutlined,
  TeamOutlined,
  UserOutlined,
  ReadOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { nurseApi } from '../../../../api';
import './ProfileManagement.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const ProfileManagement = () => {
  const [activeTab, setActiveTab] = useState('parents');
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState({
    parents: true,
    students: true
  });
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    parents: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    students: {
      current: 1,
      pageSize: 10,
      total: 0
    }
  });
  
  // State cho modal xem danh sách con
  const [childrenModalVisible, setChildrenModalVisible] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [parentChildren, setParentChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  
  // State cho form thêm con
  const [form] = Form.useForm();
  const [addingChild, setAddingChild] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [searchStudentText, setSearchStudentText] = useState('');

  // Lấy dữ liệu khi component được mount
  useEffect(() => {
    fetchParents();
    fetchStudents();
  }, []);

  // Hàm gọi API để lấy danh sách phụ huynh
  const fetchParents = async () => {
    try {
      setLoading(prev => ({ ...prev, parents: true }));
      const data = await nurseApi.getAllParents();
      
      // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
      const formattedData = data.map(item => ({
        id: item.accountId,
        fullName: item.fullName,
        email: item.email,
        phone: item.phone,
        status: item.status || 'ACTIVE', // Mặc định là ACTIVE nếu không có status
        username: item.username,
        dob: item.dob,
        gender: item.gender,
        roleId: item.roleId,
        children: [] // Hiện tại API không trả về thông tin con
      }));
      
      console.log('Dữ liệu phụ huynh đã được định dạng:', formattedData);
      
      setParents(formattedData);
      setPagination(prev => ({
        ...prev,
        parents: {
          ...prev.parents,
          total: data.length
        }
      }));
      setLoading(prev => ({ ...prev, parents: false }));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phụ huynh:', error);
      message.error('Không thể tải danh sách phụ huynh. Vui lòng thử lại sau.');
      setLoading(prev => ({ ...prev, parents: false }));
    }
  };

  // Hàm gọi API để lấy danh sách học sinh
  const fetchStudents = async () => {
    try {
      setLoading(prev => ({ ...prev, students: true }));
      const data = await nurseApi.getAllStudents();
      
      // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
      const formattedData = data.map(item => ({
        id: item.accountId,
        fullName: item.fullName,
        email: item.email,
        phone: item.phone,
        status: item.status || 'ACTIVE', // Mặc định là ACTIVE nếu không có status
        username: item.username,
        dob: item.dob,
        gender: item.gender,
        roleId: item.roleId,
        className: item.className || 'Chưa phân lớp'
      }));
      
      console.log('Dữ liệu học sinh đã được định dạng:', formattedData);
      
      setStudents(formattedData);
      setPagination(prev => ({
        ...prev,
        students: {
          ...prev.students,
          total: data.length
        }
      }));
      setLoading(prev => ({ ...prev, students: false }));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách học sinh:', error);
      message.error('Không thể tải danh sách học sinh. Vui lòng thử lại sau.');
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  // Hàm gọi API để lấy danh sách con của phụ huynh
  const fetchParentChildren = async (parentId, parentName) => {
    try {
      setLoadingChildren(true);
      setSelectedParent({ id: parentId, name: parentName });
      setChildrenModalVisible(true);
      
      const data = await nurseApi.getParentChildren(parentId);
      console.log(`Danh sách con của phụ huynh ${parentName}:`, data);
      
      setParentChildren(data);
      
      // Cập nhật danh sách học sinh có thể thêm (loại bỏ các học sinh đã là con của phụ huynh này)
      const childrenIds = data.map(child => child.childId);
      const filteredStudents = students.filter(student => !childrenIds.includes(student.id));
      setAvailableStudents(filteredStudents);
      
      setLoadingChildren(false);
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách con của phụ huynh ID ${parentId}:`, error);
      message.error('Không thể tải danh sách con của phụ huynh. Vui lòng thử lại sau.');
      setLoadingChildren(false);
    }
  };

  // Hàm thêm học sinh vào phụ huynh
  const handleAddStudentToParent = async (values) => {
    if (!selectedParent || !values.studentId) {
      message.error('Vui lòng chọn học sinh để thêm');
      return;
    }

    try {
      setAddingChild(true);
      
      await nurseApi.addStudentToParent(values.studentId, selectedParent.id);
      
      message.success(`Đã thêm học sinh vào phụ huynh ${selectedParent.name} thành công`);
      
      // Cập nhật lại danh sách con
      await fetchParentChildren(selectedParent.id, selectedParent.name);
      
      // Reset form
      form.resetFields();
      
      setAddingChild(false);
    } catch (error) {
      console.error('Lỗi khi thêm học sinh vào phụ huynh:', error);
      message.error('Không thể thêm học sinh vào phụ huynh. Vui lòng thử lại sau.');
      setAddingChild(false);
    }
  };

  // Lọc dữ liệu dựa trên text tìm kiếm
  const getFilteredData = (dataSource) => {
    const searchLower = searchText.toLowerCase();
    return dataSource.filter(item => (
      item.fullName?.toLowerCase().includes(searchLower) ||
      item.email?.toLowerCase().includes(searchLower) ||
      item.phone?.toLowerCase().includes(searchLower) ||
      item.username?.toLowerCase().includes(searchLower) ||
      (item.className && item.className.toLowerCase().includes(searchLower))
    ));
  };

  // Lọc danh sách học sinh có thể thêm dựa trên text tìm kiếm
  const getFilteredAvailableStudents = () => {
    if (!searchStudentText) return availableStudents;
    
    const searchLower = searchStudentText.toLowerCase();
    return availableStudents.filter(student => (
      student.fullName?.toLowerCase().includes(searchLower) ||
      student.username?.toLowerCase().includes(searchLower) ||
      (student.className && student.className.toLowerCase().includes(searchLower))
    ));
  };

  // Render giới tính
  const renderGender = (gender) => {
    if (gender === 'M') return 'Nam';
    if (gender === 'F') return 'Nữ';
    return 'Không xác định';
  };

  // Cấu hình bảng phụ huynh
  const parentColumns = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => renderGender(gender)
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dob',
      key: 'dob',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary" 
              icon={<InfoCircleOutlined />} 
              size="small"
              onClick={() => message.info(`Xem chi tiết phụ huynh: ${record.fullName}`)}
            />
          </Tooltip>
          <Tooltip title="Xem danh sách con">
            <Button 
              type="default" 
              icon={<TeamOutlined />} 
              size="small"
              onClick={() => fetchParentChildren(record.id, record.fullName)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Cấu hình bảng học sinh
  const studentColumns = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
      render: (className) => (
        className ? <Tag color="blue">{className}</Tag> : <Text type="secondary">Chưa phân lớp</Text>
      )
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => renderGender(gender)
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dob',
      key: 'dob',
    },
    // {
    //   title: 'Hành động',
    //   key: 'action',
    //   width: 120,
    //   render: (_, record) => (
    //     <Space size="small">
    //       <Tooltip title="Xem chi tiết">
    //         <Button 
    //           type="primary" 
    //           icon={<InfoCircleOutlined />} 
    //           size="small"
    //           onClick={() => message.info(`Xem chi tiết học sinh: ${record.fullName}`)}
    //         />
    //       </Tooltip>
    //     </Space>
    //   ),
    // },
  ];

  // Xử lý thay đổi trang
  const handleTableChange = (pagination, tabKey) => {
    setPagination(prev => ({
      ...prev,
      [tabKey]: pagination
    }));
  };

  // Xử lý thay đổi tab
  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchText('');
  };

  // Xử lý làm mới dữ liệu
  const handleRefresh = () => {
    if (activeTab === 'parents') {
      fetchParents();
    } else {
      fetchStudents();
    }
  };

  // Xử lý đóng modal
  const handleCloseModal = () => {
    setChildrenModalVisible(false);
    setSelectedParent(null);
    setParentChildren([]);
    form.resetFields();
  };

  return (
    <div className="profile-management-container">
      <Card
        title={
          <Title level={4}>
            <ProfileOutlined /> Quản lý hồ sơ
          </Title>
        }
        extra={
          <Space>
            <Search
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={activeTab === 'parents' ? loading.parents : loading.students}
            >
              Làm mới
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane 
            tab={
              <span>
                <UserOutlined /> Phụ huynh ({parents.length})
              </span>
            } 
            key="parents"
          >
            {loading.parents ? (
              <div className="loading-container">
                <Spin size="large" />
                <Text type="secondary" style={{ marginTop: 16 }}>Đang tải dữ liệu phụ huynh...</Text>
              </div>
            ) : (
              <Table 
                columns={parentColumns} 
                dataSource={getFilteredData(parents)} 
                rowKey="id"
                pagination={{
                  ...pagination.parents,
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} phụ huynh`
                }}
                onChange={(pag) => handleTableChange(pag, 'parents')}
                scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
                expandable={false}
                size="middle"
              />
            )}
          </TabPane>
          <TabPane 
            tab={
              <span>
                <TeamOutlined /> Học sinh ({students.length})
              </span>
            } 
            key="students"
          >
            {loading.students ? (
              <div className="loading-container">
                <Spin size="large" />
                <Text type="secondary" style={{ marginTop: 16 }}>Đang tải dữ liệu học sinh...</Text>
              </div>
            ) : (
              <Table 
                columns={studentColumns} 
                dataSource={getFilteredData(students)} 
                rowKey="id"
                pagination={{
                  ...pagination.students,
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} học sinh`
                }}
                onChange={(pag) => handleTableChange(pag, 'students')}
                scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
                expandable={false}
                size="middle"
              />
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal hiển thị danh sách con của phụ huynh */}
      <Modal
        title={
          <Space>
            <TeamOutlined />
            <span>Danh sách con của phụ huynh: {selectedParent?.name}</span>
          </Space>
        }
        open={childrenModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>
        ]}
        width={700}
        bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
        centered
      >
        {loadingChildren ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin />
            <div style={{ marginTop: 8 }}>Đang tải danh sách con...</div>
          </div>
        ) : (
          <>
            <div className="children-list-section">
              <Title level={5}>Danh sách con hiện tại</Title>
              {parentChildren.length > 0 ? (
                <List
                  className="children-scroll-list"
                  itemLayout="horizontal"
                  dataSource={parentChildren}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={<Text strong>{item.fullName}</Text>}
                        description={
                          <Space direction="vertical" size={0}>
                            <Text>ID: {item.childId}</Text>
                            {item.classId && (
                              <Tag color="blue">Lớp ID: {item.classId}</Tag>
                            )}
                          </Space>
                        }
                      />
                      <Button 
                        type="link" 
                        icon={<InfoCircleOutlined />}
                        onClick={() => {
                          // Tìm học sinh trong danh sách học sinh
                          const student = students.find(s => s.id === item.childId);
                          if (student) {
                            message.info(`Xem chi tiết học sinh: ${item.fullName}`);
                          } else {
                            message.warning(`Không tìm thấy thông tin chi tiết của học sinh: ${item.fullName}`);
                          }
                        }}
                      >
                        Chi tiết
                      </Button>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  description="Phụ huynh này chưa có thông tin con" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
            
            <Divider />
            
            <div className="add-child-section">
              <Title level={5}>Thêm con cho phụ huynh</Title>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleAddStudentToParent}
              >
                <Form.Item
                  name="studentId"
                  label="Chọn học sinh"
                  rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
                >
                  <Select
                    showSearch
                    placeholder="Tìm kiếm và chọn học sinh"
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                    onSearch={setSearchStudentText}
                    filterOption={false}
                    notFoundContent={searchStudentText ? <Spin size="small" /> : <Empty description="Không tìm thấy học sinh" />}
                    loading={loading.students}
                  >
                    {getFilteredAvailableStudents().map(student => (
                      <Option key={student.id} value={student.id}>
                        <Space>
                          <UserOutlined />
                          <span>{student.fullName}</span>
                          {student.className && <Tag color="blue">{student.className}</Tag>}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<PlusOutlined />}
                    loading={addingChild}
                  >
                    Thêm con
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ProfileManagement; 