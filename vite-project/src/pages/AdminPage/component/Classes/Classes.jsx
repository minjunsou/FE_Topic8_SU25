import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Space, message, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { getClassesByGrade } from '../../../../api/adminApi';

const gradeOptions = [
  { value: '', label: 'Tất cả khối' },
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
  const [grade, setGrade] = useState('');

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
        <Button type="primary" icon={<PlusOutlined />}>Thêm lớp học</Button>
      </div>
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columns}
          dataSource={classes}
          rowKey={r => r.classId}
          pagination={false}
        />
      </Spin>
    </div>
  );
} 