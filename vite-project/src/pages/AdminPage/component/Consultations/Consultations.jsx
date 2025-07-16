import React, { useEffect, useState } from 'react';
import { Table, Button, Input, DatePicker, Space, message, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { searchConsultationsByDate } from '../../../../api/adminApi';
import dayjs from 'dayjs';

export default function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');

  const fetchConsultations = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await searchConsultationsByDate(date, 'asc');
      setConsultations(res.data?.data || res.data || []);
    } catch (err) {
      message.error('Lỗi tải danh sách lịch tư vấn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date) fetchConsultations();
    // eslint-disable-next-line
  }, [date]);

  const columns = [
    { title: 'Mã lịch', dataIndex: 'consultationId', key: 'consultationId' },
    { title: 'Mã học sinh', dataIndex: 'studentId', key: 'studentId' },
    { title: 'Mã phụ huynh', dataIndex: 'parentId', key: 'parentId' },
    { title: 'Mã nhân viên', dataIndex: 'staffId', key: 'staffId' },
    { title: 'Mã phiếu khám', dataIndex: 'healthCheckRecordId', key: 'healthCheckRecordId' },
    { title: 'Ngày tư vấn', dataIndex: 'scheduledDate', key: 'scheduledDate' },
    { title: 'Khung giờ', dataIndex: 'slot', key: 'slot' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    { title: 'Lý do', dataIndex: 'reason', key: 'reason' },
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
        <DatePicker
          placeholder="Chọn ngày tư vấn"
          onChange={d => setDate(d ? d.format('YYYY-MM-DD') : '')}
          style={{ width: 180 }}
          allowClear
        />
        <Button icon={<ReloadOutlined />} onClick={fetchConsultations} disabled={!date}>
          Làm mới
        </Button>
        <div style={{ flex: 1 }} />
        <Button type="primary" icon={<PlusOutlined />}>Thêm lịch tư vấn</Button>
      </div>
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columns}
          dataSource={consultations}
          rowKey={r => r.consultationId}
          pagination={false}
        />
      </Spin>
      {!date && <div style={{ color: '#888', marginTop: 24 }}>Vui lòng chọn ngày để xem lịch tư vấn.</div>}
    </div>
  );
} 