import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Space, message, Spin, Modal, Form, InputNumber } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { getClassesByGrade, createClass } from '../../../../api/adminApi';

const gradeOptions = [
  { value: '1', label: 'Khối 1' },
  { value: '2', label: 'Khối 2' },
  { value: '3', label: 'Khối 3' },
  { value: '4', label: 'Khối 4' },
  { value: '5', label: 'Khối 5' },
  { value: '6', label: 'Khối 6' },
  { value: '7', label: 'Khối 7' },
  { value: '8', label: 'Khối 8' },
  { value: '9', label: 'Khối 9' },
  { value: '10', label: 'Khối 10' },
  { value: '11', label: 'Khối 11' },
  { value: '12', label: 'Khối 12' },
];

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState('1');

  // Modal Thêm lớp học
  const [openAdd, setOpenAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await getClassesByGrade(grade);
      setClasses(res.data || []);
    } catch (err) {
      message.error('Lỗi tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line
  }, [grade]);

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({ schoolYear: new Date().getFullYear() });
    setOpenAdd(true);
  };

  const handleAddOk = async () => {
    try {
      const values = await form.validateFields();
      setAddLoading(true);
      await createClass(values);
      message.success('Thêm lớp học thành công');
      setOpenAdd(false);
      fetchClasses();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err?.response?.data?.message || 'Thêm lớp học thất bại');
    } finally {
      setAddLoading(false);
    }
  };

  const columns = [
    { title: 'Tên lớp', dataIndex: 'className', key: 'className' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Năm học', dataIndex: 'schoolYear', key: 'schoolYear' },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link">Sửa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Select
          value={grade}
          onChange={setGrade}
          style={{ width: 160 }}
        >
          {gradeOptions.map(g => (
            <Select.Option key={g.value} value={g.value}>{g.label}</Select.Option>
          ))}
        </Select>
        <Button icon={<ReloadOutlined />} onClick={fetchClasses}>
          Làm mới
        </Button>
        <div style={{ flex: 1 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm lớp học</Button>
      </div>
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columns}
          dataSource={classes}
          rowKey={r => r.classId}
          pagination={false}
        />
      </Spin>
      <Modal
        title="Thêm lớp học mới"
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
          <Form.Item name="grade" label="Khối" rules={[{ required: true, message: 'Bắt buộc' }]}> 
            <Select placeholder="Chọn khối">
              {gradeOptions.map(g => (
                <Select.Option key={g.value} value={parseInt(g.value, 10)}>{g.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="className" label="Tên lớp" rules={[{ required: true, message: 'Bắt buộc' }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input /></Form.Item>
          <Form.Item name="schoolYear" label="Năm học" rules={[{ required: true, message: 'Bắt buộc' }]}><InputNumber min={2000} max={2100} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 