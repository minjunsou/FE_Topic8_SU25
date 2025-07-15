import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, message, Spin, Modal, Form, InputNumber, Select, DatePicker } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { getAllMedications, searchMedications, createMedication, updateMedication, deleteMedication, getLowStockMedications } from '../../../../api/adminApi';
import dayjs from 'dayjs';

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
      setMedications(res.data?.data || res.data || []);
    } catch (err) {
      message.error('Lỗi tải danh sách thuốc');
    } finally {
      setLoading(false);
    }
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
      title: 'Xác nhận xóa thuốc',
      content: `Bạn có chắc muốn xóa thuốc "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
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
    setLoading(true);
    setShowLowStock(true);
    try {
      const res = await getLowStockMedications();
      setMedications(res.data?.data || res.data || []);
    } catch (err) {
      message.error('Lỗi tải danh sách thuốc sắp hết');
    } finally {
      setLoading(false);
    }
  };

  const handleShowAll = () => {
    setShowLowStock(false);
    fetchMedications();
  };

  const columns = [
    { title: 'Tên thuốc', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Đơn vị', dataIndex: 'quantityType', key: 'quantityType' },
    { title: 'Loại thuốc', dataIndex: 'medicationType', key: 'medicationType', render: v => MedicationType[v] || v },
    { title: 'Hạn sử dụng', dataIndex: 'expiryDate', key: 'expiryDate' },
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
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input.Search
          placeholder="Tìm theo tên thuốc..."
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={v => setSearch(v)}
          style={{ width: 240 }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); fetchMedications(); }}>
          Làm mới
        </Button>
        <div style={{ flex: 1 }} />
        <Button onClick={showLowStock ? handleShowAll : handleShowLowStock}>
          {showLowStock ? 'Tất cả thuốc' : 'Thuốc sắp hết'}
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm thuốc</Button>
      </div>
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columns}
          dataSource={medications}
          rowKey={r => r.medicationId}
          pagination={false}
        />
      </Spin>
      <Modal
        title="Thêm thuốc mới"
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
          <Form.Item name="name" label="Tên thuốc" rules={[{ required: true, message: 'Bắt buộc' }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input /></Form.Item>
          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: 'Bắt buộc' }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="quantityType" label="Đơn vị" rules={[{ required: true, message: 'Bắt buộc' }]}><Select options={quantityTypeOptions} /></Form.Item>
          <Form.Item name="medicationType" label="Loại thuốc" rules={[{ required: true, message: 'Bắt buộc' }]}><Select options={medicationTypeOptions} /></Form.Item>
          <Form.Item name="expiryDate" label="Hạn sử dụng" rules={[{ required: true, message: 'Bắt buộc' }]}><DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" inputReadOnly /></Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Sửa thuốc"
        open={openEdit}
        onOk={handleEditOk}
        onCancel={() => setOpenEdit(false)}
        confirmLoading={editLoading}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item name="name" label="Tên thuốc" rules={[{ required: true, message: 'Bắt buộc' }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input /></Form.Item>
          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: 'Bắt buộc' }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="quantityType" label="Đơn vị" rules={[{ required: true, message: 'Bắt buộc' }]}><Select options={quantityTypeOptions} /></Form.Item>
          <Form.Item name="medicationType" label="Loại thuốc" rules={[{ required: true, message: 'Bắt buộc' }]}><Select options={medicationTypeOptions} /></Form.Item>
          <Form.Item name="expiryDate" label="Hạn sử dụng" rules={[{ required: true, message: 'Bắt buộc' }]}><DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" inputReadOnly /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 