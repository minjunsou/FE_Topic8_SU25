import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Spin, Modal, Input, DatePicker, Form, InputNumber } from 'antd';
import { PlusOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { getAllVaccines, getVaccineBatches, createVaccine } from '../../../../api/adminApi';

export default function Vaccine() {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openBatches, setOpenBatches] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);

  // Modal Thêm vaccine
  const [openAdd, setOpenAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchVaccines = async () => {
    setLoading(true);
    try {
      const res = await getAllVaccines();
      setVaccines(res.data || []);
    } catch (err) {
      message.error('Lỗi tải danh sách vaccine');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async (vaccineId) => {
    setBatchesLoading(true);
    try {
      const res = await getVaccineBatches(vaccineId);
      setBatches(res.data || []);
    } catch (err) {
      message.error('Lỗi tải danh sách lô vaccine');
    } finally {
      setBatchesLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccines();
  }, []);

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
        releaseDate: values.releaseDate ? values.releaseDate.format('YYYY-MM-DD') : undefined,
      };
      await createVaccine(payload);
      message.success('Thêm vaccine thành công');
      setOpenAdd(false);
      fetchVaccines();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err?.response?.data?.message || 'Thêm vaccine thất bại');
    } finally {
      setAddLoading(false);
    }
  };

  const vaccineColumns = [
    { title: 'Tên vaccine', dataIndex: 'name', key: 'name' },
    { title: 'Loại', dataIndex: 'type', key: 'type' },
    { title: 'Phiên bản', dataIndex: 'version', key: 'version' },
    { title: 'Ngày phát hành', dataIndex: 'releaseDate', key: 'releaseDate' },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => {
            setSelectedVaccine(record);
            setOpenBatches(true);
            fetchBatches(record.vaccineId);
          }}>Xem lô</Button>
          <Button type="link">Sửa</Button>
        </Space>
      ),
    },
  ];

  const batchColumns = [
    { title: 'Mã lô', dataIndex: 'vaccineBatchId', key: 'vaccineBatchId' },
    { title: 'Ngày nhập kho', dataIndex: 'stockInDate', key: 'stockInDate' },
    { title: 'Hạn sử dụng', dataIndex: 'expiryDate', key: 'expiryDate' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link">Giảm số lượng</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button icon={<ReloadOutlined />} onClick={fetchVaccines}>Làm mới</Button>
        <div style={{ flex: 1 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm vaccine</Button>
      </div>
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={vaccineColumns}
          dataSource={vaccines}
          rowKey={r => r.vaccineId}
          pagination={false}
        />
      </Spin>
      <Modal
        title={`Danh sách lô của vaccine: ${selectedVaccine?.name || ''}`}
        open={openBatches}
        onCancel={() => setOpenBatches(false)}
        footer={null}
        width={700}
      >
        <Spin spinning={batchesLoading} tip="Đang tải...">
          <Table
            columns={batchColumns}
            dataSource={batches}
            rowKey={r => r.vaccineBatchId}
            pagination={false}
          />
        </Spin>
      </Modal>
      <Modal
        title="Thêm vaccine mới"
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
          <Form.Item name="name" label="Tên vaccine" rules={[{ required: true, message: 'Bắt buộc' }]}><Input /></Form.Item>
          <Form.Item name="type" label="Loại" rules={[{ required: true, message: 'Bắt buộc' }]}><Input /></Form.Item>
          <Form.Item name="version" label="Phiên bản" rules={[{ required: true, message: 'Bắt buộc' }]}><Input /></Form.Item>
          <Form.Item name="releaseDate" label="Ngày phát hành" rules={[{ required: true, message: 'Bắt buộc' }]}><DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" inputReadOnly /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 