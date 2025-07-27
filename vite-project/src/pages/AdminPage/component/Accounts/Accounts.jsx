import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Space, message, Spin, Modal, Form, DatePicker, Switch, Card, Tag, Typography, Row, Col } from 'antd';
import { PlusOutlined, UploadOutlined, ReloadOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import { getAccounts, createAccount, importAccounts, updateAccount, getAccountStatistics } from '../../../../api/adminApi';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

const roleOptions = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 1, label: 'Học sinh' },
  { value: 2, label: 'Phụ huynh' },
  { value: 3, label: 'Y tá' },
  { value: 5, label: 'Admin' },
];

const genderOptions = [
  { value: 'Nam', label: 'Nam' },
  { value: 'Nữ', label: 'Nữ' },
  { value: 'Khác', label: 'Khác' },
];

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [sortBy, setSortBy] = useState('fullName');
  const [direction, setDirection] = useState('asc');

  // Modal Thêm tài khoản
  const [openAdd, setOpenAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form] = Form.useForm();

  // Modal Import Excel
  const [openImport, setOpenImport] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [fileList, setFileList] = useState([]);

  // Modal Sửa tài khoản
  const [openEdit, setOpenEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [editingAccount, setEditingAccount] = useState(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const params = {
        page: page - 1,
        size: pageSize,
        name: name || undefined,
        roleId: roleId || undefined,
        sortBy,
        direction,
      };
      const res = await getAccounts(params);
      const accountsData = res.data.accounts || [];
      setAccounts(accountsData);
      setTotal(res.data.totalItems || 0);
    } catch (err) {
      message.error('Lỗi tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line
  }, [page, pageSize, name, roleId, sortBy, direction]);

  const columns = [
    { 
      title: 'Tên đăng nhập', 
      dataIndex: 'username', 
      key: 'username',
      render: (text) => <Text code>{text}</Text>
    },
    { 
      title: 'Họ tên', 
      dataIndex: 'fullName', 
      key: 'fullName', 
      sorter: true,
      render: (text) => <Text strong>{text}</Text>
    },
    { 
      title: 'Ngày sinh', 
      dataIndex: 'dob', 
      key: 'dob',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'
    },
    { 
      title: 'Giới tính', 
      dataIndex: 'gender', 
      key: 'gender',
      render: (gender) => (
        <Tag color={gender === 'Nam' ? 'blue' : gender === 'Nữ' ? 'pink' : 'default'}>
          {gender}
        </Tag>
      )
    },
    { 
      title: 'Số điện thoại', 
      dataIndex: 'phone', 
      key: 'phone' 
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email' 
    },
    { 
      title: 'Vai trò', 
      dataIndex: 'roleId', 
      key: 'roleId', 
      render: v => {
        const role = roleOptions.find(r => r.value === v);
        const color = v === 1 ? 'green' : v === 2 ? 'blue' : v === 3 ? 'orange' : 'red';
        return <Tag color={color}>{role?.label || v}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          {/* <Button type="link" danger>Xóa</Button> */}
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    if (sorter && sorter.field) {
      setSortBy(sorter.field);
      setDirection(sorter.order === 'descend' ? 'desc' : 'asc');
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setOpenAdd(true);
  };

  const handleAddOk = async () => {
    try {
      const values = await form.validateFields();
      setAddLoading(true);
      await createAccount(values);
      message.success('Thêm tài khoản thành công');
      setOpenAdd(false);
      fetchAccounts();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err?.response?.data?.message || 'Thêm tài khoản thất bại');
    } finally {
      setAddLoading(false);
    }
  };

  const handleImport = () => {
    setFileList([]);
    setImportResult(null);
    setOpenImport(true);
  };

  const handleImportOk = async () => {
    if (fileList.length === 0) {
      message.error('Vui lòng chọn file Excel');
      return;
    }
    try {
      setImportLoading(true);
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj);
      const res = await importAccounts(formData);
      setImportResult(res.data);
      message.success('Import thành công');
      setOpenImport(false);
      fetchAccounts();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Import thất bại');
    } finally {
      setImportLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingAccount(record);
    editForm.setFieldsValue({
      ...record,
      dob: record.dob ? dayjs(record.dob) : null,
    });
    setOpenEdit(true);
  };

  const handleEditOk = async () => {
    try {
      const values = await editForm.validateFields();
      setEditLoading(true);
      const payload = {
        ...values,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : undefined,
      };
      await updateAccount(editingAccount.accountId, payload);
      message.success('Cập nhật tài khoản thành công');
      setOpenEdit(false);
      fetchAccounts();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err?.response?.data?.message || 'Cập nhật tài khoản thất bại');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="accounts-management">
      <div style={{ marginBottom: 24 }}>
        <h2>Quản lý tài khoản</h2>
      </div>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Input
              placeholder="Tìm kiếm theo tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
          allowClear
        />
          </Col>
          <Col span={4}>
        <Select
              placeholder="Vai trò"
          value={roleId}
          onChange={setRoleId}
              allowClear
              style={{ width: '100%' }}
            >
              {roleOptions.slice(1).map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
          ))}
        </Select>
          </Col>
          <Col span={14}>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAdd}
              >
                Thêm tài khoản
              </Button>
              <Button 
                icon={<UploadOutlined />} 
                onClick={handleImport}
              >
                Import Excel
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => {
                  fetchAccounts();
                }}
              >
          Làm mới
        </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Accounts Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={accounts}
          rowKey="accountId"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tài khoản`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Add Account Modal */}
      <Modal
        title="Thêm tài khoản"
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
                name="username"
                label="Tên đăng nhập"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="roleId"
                label="Vai trò"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
              >
                <Select>
                  {roleOptions.slice(1).map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dob"
                label="Ngày sinh"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
              >
                <Select>
                  {genderOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Import Modal */}
      <Modal
        title="Import tài khoản từ Excel"
        open={openImport}
        onOk={handleImportOk}
        onCancel={() => setOpenImport(false)}
        confirmLoading={importLoading}
      >
        <div>
          <p>Vui lòng chọn file Excel chứa danh sách tài khoản</p>
          <input
          type="file"
          accept=".xlsx,.xls"
            onChange={(e) => {
            const file = e.target.files[0];
              if (file) {
                setFileList([{ originFileObj: file, name: file.name }]);
            }
          }}
        />
        {importResult && (
          <div style={{ marginTop: 16 }}>
              <p>Kết quả import:</p>
              <p>Thành công: {importResult.successCount}</p>
              <p>Thất bại: {importResult.failureCount}</p>
              </div>
            )}
          </div>
      </Modal>

      {/* Edit Account Modal */}
      <Modal
        title="Sửa tài khoản"
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
                name="fullName"
                label="Họ tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dob"
                label="Ngày sinh"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
              >
                <Select>
                  {genderOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 