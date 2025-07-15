import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, message, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { getAllMedications, searchMedications } from '../../../../api/adminApi';

const medicationTypeMap = {
  TABLET: 'Viên',
  SYRUP: 'Siro',
  OINTMENT: 'Thuốc mỡ',
  SPRAY: 'Xịt',
  OTHER: 'Khác',
};

export default function Medications() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

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

  const columns = [
    { title: 'Tên thuốc', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Đơn vị', dataIndex: 'quantityType', key: 'quantityType' },
    { title: 'Loại thuốc', dataIndex: 'medicationType', key: 'medicationType', render: v => medicationTypeMap[v] || v },
    { title: 'Hạn sử dụng', dataIndex: 'expiryDate', key: 'expiryDate' },
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
        <Button type="primary" icon={<PlusOutlined />}>Thêm thuốc</Button>
      </div>
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columns}
          dataSource={medications}
          rowKey={r => r.medicationId}
          pagination={false}
        />
      </Spin>
    </div>
  );
} 