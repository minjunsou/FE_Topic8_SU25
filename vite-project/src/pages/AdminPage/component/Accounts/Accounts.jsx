import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Space, message, Spin, Modal, Form, DatePicker } from 'antd';
import { PlusOutlined, UploadOutlined, ReloadOutlined } from '@ant-design/icons';
import { getAccounts, createAccount, importAccounts } from '../../../../api/adminApi';
import dayjs from 'dayjs';

const { Option } = Select;

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
      setAccounts(res.data.accounts || []);
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
    { title: 'Tên đăng nhập', dataIndex: 'username', key: 'username' },
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', sorter: true },
    { title: 'Ngày sinh', dataIndex: 'dob', key: 'dob' },
    { title: 'Giới tính', dataIndex: 'gender', key: 'gender' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Vai trò', dataIndex: 'roleId', key: 'roleId', render: v => roleOptions.find(r => r.value === v)?.label || v },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link">Sửa</Button>
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

  // Thêm tài khoản
  const handleAdd = () => {
    form.resetFields();
    setOpenAdd(true);
  };

  const handleAddOk = async () => {
    try {
      const values = await form.validateFields();
      setAddLoading(true);
      // Tự động sinh username từ email
      const email = values.email;
      const username = email ? email.split('@')[0] : '';
      const payload = {
        ...values,
        username,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : undefined,
      };
      await createAccount(payload);
      message.success('Thêm tài khoản thành công');
      setOpenAdd(false);
      fetchAccounts();
    } catch (err) {
      if (err.errorFields) return; // Lỗi validate
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
    if (!fileList.length) {
      message.warning('Vui lòng chọn file Excel');
      return;
    }
    const formData = new FormData();
    formData.append('file', fileList[0]);
    setImportLoading(true);
    try {
      const res = await importAccounts(formData);
      setImportResult(res.data);
      message.success('Import tài khoản thành công');
      fetchAccounts();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Import thất bại');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input.Search
          placeholder="Tìm theo tên..."
          allowClear
          onSearch={v => setName(v)}
          style={{ width: 200 }}
        />
        <Select
          value={roleId}
          onChange={setRoleId}
          style={{ width: 160 }}
        >
          {roleOptions.map(r => (
            <Option key={r.value} value={r.value}>{r.label}</Option>
          ))}
        </Select>
        <Button icon={<ReloadOutlined />} onClick={fetchAccounts}>
          Làm mới
        </Button>
        <div style={{ flex: 1 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm tài khoản</Button>
        <Button icon={<UploadOutlined />} onClick={handleImport}>Import Excel</Button>
      </div>
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columns}
          dataSource={accounts}
          rowKey={r => r.accountId}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
        />
      </Spin>
      <Modal
        title="Thêm tài khoản mới"
        open={openAdd}
        onOk={handleAddOk}
        onCancel={() => setOpenAdd(false)}
        confirmLoading={addLoading}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Bắt buộc' }]}><Input /></Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Bắt buộc' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}><Input.Password /></Form.Item>
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Bắt buộc' }]}><Input /></Form.Item>
          <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true, message: 'Bắt buộc' }]}><DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" inputReadOnly /></Form.Item>
          <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Bắt buộc' }]}><Select options={genderOptions} /></Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Bắt buộc' }, { pattern: /^\d{9,11}$/, message: 'Số điện thoại không hợp lệ' }]}><Input /></Form.Item>
          <Form.Item name="roleId" label="Vai trò" rules={[{ required: true, message: 'Bắt buộc' }]}><Select options={roleOptions.filter(r => r.value)} /></Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Import tài khoản từ Excel"
        open={openImport}
        onOk={handleImportOk}
        onCancel={() => setOpenImport(false)}
        confirmLoading={importLoading}
        okText="Import"
        cancelText="Hủy"
        destroyOnClose
      >
        <Input
          type="file"
          accept=".xlsx,.xls"
          onChange={e => {
            const file = e.target.files[0];
            if (file && !['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(file.type)) {
              message.error('Chỉ chấp nhận file Excel (.xlsx, .xls)');
              setFileList([]);
            } else {
              setFileList(file ? [file] : []);
            }
          }}
        />
        {importResult && (
          <div style={{ marginTop: 16 }}>
            <div><b>Tổng xử lý:</b> {importResult.totalProcessed}</div>
            <div><b>Thành công:</b> {importResult.successCount}</div>
            <div><b>Thất bại:</b> {importResult.failureCount}</div>
            {importResult.results && importResult.results.filter(r => !r.success).length > 0 && (
              <div style={{ marginTop: 8 }}>
                <b>Danh sách lỗi:</b>
                <ul style={{ maxHeight: 120, overflow: 'auto', color: 'red' }}>
                  {importResult.results.filter(r => !r.success).map((r, idx) => (
                    <li key={idx}>{r.email || r.phone || r.accountId}: {r.errorMessage}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
} 