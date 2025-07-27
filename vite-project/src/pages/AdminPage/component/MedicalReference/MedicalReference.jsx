import React, { useState, useEffect } from 'react';
import { Tabs, Table, Button, Modal, Form, Input, message, InputNumber, Checkbox, Select } from 'antd';
import {
  createAllergen, searchAllergens,
  createDisease, searchDiseases,
  createSyndrome, searchSyndromes
} from '../../../../api/adminApi';

const syndromeTypes = [
  { value: 'MENTAL', label: 'Tâm thần' },
  { value: 'PHYSICAL', label: 'Thể chất' },
  { value: 'COGNITIVE', label: 'Nhận thức' },
  { value: 'SENSORY', label: 'Giác quan' },
  { value: 'DEVELOPMENTAL', label: 'Phát triển' },
  { value: 'OTHER', label: 'Khác' },
];

const tabList = [
  {
    key: 'allergen',
    label: 'Dị ứng',
    search: searchAllergens,
    create: createAllergen,
    columns: [
      { title: 'ID', dataIndex: 'allergenId', key: 'allergenId', width: 80 },
      { title: 'Tên dị ứng', dataIndex: 'name', key: 'name' },
    ],
    formFields: [
      { name: 'name', label: 'Tên dị ứng', rules: [{ required: true, message: 'Vui lòng nhập tên dị ứng!' }], input: <Input autoFocus /> },
    ],
    initialValues: {},
  },
  {
    key: 'disease',
    label: 'Bệnh',
    search: searchDiseases,
    create: createDisease,
    columns: [
      { title: 'ID', dataIndex: 'diseaseId', key: 'diseaseId', width: 80 },
      { title: 'Tên bệnh', dataIndex: 'name', key: 'name' },
      { title: 'Mô tả', dataIndex: 'description', key: 'description' },
      { title: 'Mức độ', dataIndex: 'severityLevel', key: 'severityLevel', width: 90 },
      { title: 'Mãn tính', dataIndex: 'chronic', key: 'chronic', width: 90, render: v => v ? 'Có' : 'Không' },
      { title: 'Lây nhiễm', dataIndex: 'contagious', key: 'contagious', width: 90, render: v => v ? 'Có' : 'Không' },
    ],
    formFields: [
      { name: 'name', label: 'Tên bệnh', rules: [{ required: true, message: 'Vui lòng nhập tên bệnh!' }], input: <Input autoFocus /> },
      { name: 'description', label: 'Mô tả', rules: [], input: <Input.TextArea rows={2} /> },
      { name: 'severityLevel', label: 'Mức độ nghiêm trọng (1-10)', rules: [{ required: true, type: 'number', min: 1, max: 10, message: 'Nhập từ 1 đến 10' }], input: <InputNumber min={1} max={10} style={{ width: 120 }} /> },
      { name: 'chronic', label: 'Mãn tính', valuePropName: 'checked', input: <Checkbox /> },
      { name: 'contagious', label: 'Lây nhiễm', valuePropName: 'checked', input: <Checkbox /> },
    ],
    initialValues: { chronic: false, contagious: false },
  },
  {
    key: 'syndrome',
    label: 'Hội chứng/Khuyết tật',
    search: searchSyndromes,
    create: createSyndrome,
    columns: [
      { title: 'ID', dataIndex: 'conditionId', key: 'conditionId', width: 80 },
      { title: 'Tên', dataIndex: 'name', key: 'name' },
      { title: 'Mô tả', dataIndex: 'description', key: 'description' },
      { title: 'Loại', dataIndex: 'type', key: 'type', render: v => syndromeTypes.find(t => t.value === v)?.label || v },
      { title: 'Ưu tiên', dataIndex: 'priority', key: 'priority', width: 90 },
    ],
    formFields: [
      { name: 'name', label: 'Tên hội chứng/khuyết tật', rules: [{ required: true, message: 'Vui lòng nhập tên!' }], input: <Input autoFocus /> },
      { name: 'description', label: 'Mô tả', rules: [], input: <Input.TextArea rows={2} /> },
      { name: 'type', label: 'Loại', rules: [{ required: true, message: 'Chọn loại!' }], input: <Select options={syndromeTypes} style={{ width: 180 }} /> },
      { name: 'priority', label: 'Mức độ ưu tiên (1-10)', rules: [{ required: true, type: 'number', min: 1, max: 10, message: 'Nhập từ 1 đến 10' }], input: <InputNumber min={1} max={10} style={{ width: 120 }} /> },
    ],
    initialValues: { priority: 1 },
  },
];

export default function MedicalReference() {
  const [activeKey, setActiveKey] = useState('allergen');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const currentTab = tabList.find(t => t.key === activeKey);

  const fetchData = async (name = '') => {
    setLoading(true);
    try {
      const res = await currentTab.search(name);
      setData(res.data?.data || res.data || []);
    } catch (e) {
      message.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchValue('');
    fetchData();
    // eslint-disable-next-line
  }, [activeKey]);

  const handleSearch = () => {
    fetchData(searchValue);
  };

  const handleAdd = () => {
    form.validateFields().then(async (values) => {
      try {
        await currentTab.create(values);
        message.success('Thêm mới thành công!');
        setModalOpen(false);
        form.resetFields();
        fetchData();
      } catch {
        message.error('Thêm mới thất bại!');
      }
    });
  };

  return (
    <div>
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        items={tabList.map(tab => ({ key: tab.key, label: tab.label }))}
      />
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input.Search
          placeholder={`Tìm kiếm ${currentTab.label.toLowerCase()}...`}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 240 }}
          allowClear
        />
        <Button type="primary" onClick={() => setModalOpen(true)}>Thêm mới</Button>
      </div>
      <Table
        rowKey={currentTab.key === 'allergen' ? 'allergenId' : currentTab.key === 'disease' ? 'diseaseId' : 'conditionId'}
        columns={currentTab.columns}
        dataSource={data}
        loading={loading}
                                             pagination={{ pageSize: 10 }}
        scroll={{ x: true }}
      />
      <Modal
        title={`Thêm ${currentTab.label}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleAdd}
        okText="Thêm"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={currentTab.initialValues}>
          {currentTab.formFields.map(field => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              rules={field.rules}
              valuePropName={field.valuePropName}
            >
              {field.input}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
} 