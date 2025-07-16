import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { getAllHealthCheckNotices } from '../../../../api/adminApi';

export default function HealthCheckNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await getAllHealthCheckNotices();
      setNotices(res.data?.data || res.data || []);
    } catch (err) {
      message.error('Lỗi tải danh sách thông báo khám sức khỏe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
    // eslint-disable-next-line
  }, []);

  const columns = [
    { title: 'Mã thông báo', dataIndex: 'checkNoticeId', key: 'checkNoticeId' },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Ngày khám', dataIndex: 'date', key: 'date' },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt' },
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
        <Button icon={<ReloadOutlined />} onClick={fetchNotices}>
          Làm mới
        </Button>
        <div style={{ flex: 1 }} />
        <Button type="primary" icon={<PlusOutlined />}>Thêm thông báo</Button>
      </div>
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columns}
          dataSource={notices}
          rowKey={r => r.checkNoticeId}
          pagination={false}
        />
      </Spin>
    </div>
  );
} 