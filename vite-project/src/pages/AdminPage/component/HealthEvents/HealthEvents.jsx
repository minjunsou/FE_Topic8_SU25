import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { getAllHealthEvents } from '../../../../api/adminApi';

export default function HealthEvents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await getAllHealthEvents();
      setIncidents(res.data?.data || res.data || []);
    } catch (err) {
      message.error('Lỗi tải danh sách sự cố sức khỏe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    // eslint-disable-next-line
  }, []);

  const columns = [
    { title: 'Ngày sự cố', dataIndex: 'eventDate', key: 'eventDate' },
    { title: 'Loại sự cố', dataIndex: 'eventType', key: 'eventType' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Giải pháp', dataIndex: 'solution', key: 'solution' },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
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
        <Button icon={<ReloadOutlined />} onClick={fetchIncidents}>
          Làm mới
        </Button>
        <div style={{ flex: 1 }} />
        <Button type="primary" icon={<PlusOutlined />}>Thêm sự cố</Button>
      </div>
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columns}
          dataSource={incidents}
          rowKey={r => r.eventId}
          pagination={false}
        />
      </Spin>
    </div>
  );
} 