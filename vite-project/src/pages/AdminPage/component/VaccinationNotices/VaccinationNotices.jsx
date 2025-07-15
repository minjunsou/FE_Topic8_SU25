import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, message, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { getAllVaccinationNotices, searchVaccinationNotices } from '../../../../api/adminApi';

export default function VaccinationNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchNotices = async () => {
    setLoading(true);
    try {
      let res;
      if (search) {
        res = await searchVaccinationNotices(search);
      } else {
        res = await getAllVaccinationNotices();
      }
      setNotices(res.data?.data || res.data || []);
    } catch (err) {
      message.error('Lỗi tải danh sách thông báo tiêm chủng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
    // eslint-disable-next-line
  }, [search]);

  const columns = [
    { title: 'Mã thông báo', dataIndex: 'vaccineNoticeId', key: 'vaccineNoticeId' },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Tên vắc xin', dataIndex: 'vaccineName', key: 'vaccineName' },
    { title: 'Ngày tiêm', dataIndex: 'date', key: 'date' },
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
        <Input.Search
          placeholder="Tìm theo tên vắc xin..."
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={v => setSearch(v)}
          style={{ width: 240 }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => { setSearch(''); fetchNotices(); }}>
          Làm mới
        </Button>
        <div style={{ flex: 1 }} />
        <Button type="primary" icon={<PlusOutlined />}>Thêm thông báo</Button>
      </div>
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columns}
          dataSource={notices}
          rowKey={r => r.vaccineNoticeId}
          pagination={false}
        />
      </Spin>
    </div>
  );
} 