import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { getAllVaccinationRecords } from '../../../../api/adminApi';

export default function VaccinationRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await getAllVaccinationRecords();
      setRecords(res.data?.data || res.data || []);
    } catch (err) {
      message.error('Lỗi tải danh sách phiếu tiêm chủng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line
  }, []);

  const columns = [
    { title: 'Mã phiếu', dataIndex: 'recordId', key: 'recordId' },
    { title: 'Mã học sinh', dataIndex: 'studentId', key: 'studentId' },
    { title: 'Tên học sinh', dataIndex: 'studentName', key: 'studentName' },
    { title: 'Mã y tá', dataIndex: 'nurseId', key: 'nurseId' },
    { title: 'Tên y tá', dataIndex: 'nurseName', key: 'nurseName' },
    { title: 'Mã thông báo', dataIndex: 'vaccineNoticeId', key: 'vaccineNoticeId' },
    { title: 'Tên vắc xin', dataIndex: 'vaccineName', key: 'vaccineName' },
    { title: 'Kết quả', dataIndex: 'results', key: 'results' },
    { title: 'Ngày tiêm', dataIndex: 'date', key: 'date' },
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
        <Button icon={<ReloadOutlined />} onClick={fetchRecords}>
          Làm mới
        </Button>
        <div style={{ flex: 1 }} />
        <Button type="primary" icon={<PlusOutlined />}>Thêm phiếu tiêm</Button>
      </div>
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columns}
          dataSource={Array.isArray(records) ? records : []}
          rowKey={r => r.recordId}
          pagination={false}
        />
      </Spin>
    </div>
  );
} 