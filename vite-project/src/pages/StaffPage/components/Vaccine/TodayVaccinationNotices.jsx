import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Tag } from 'antd';
import nurseApi from '@/api/nurseApi';

const TodayVaccinationNotices = () => {
  const [notices, setNotices] = useState([]);
  const [confirmedStudents, setConfirmedStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await nurseApi.getTodayVaccinationNotices();
      setNotices(data);
    } catch {
      setNotices([]);
    }
    setLoading(false);
  };

  const handleViewConfirmed = async (noticeId) => {
    try {
      const students = await nurseApi.getConfirmedStudentsByNotice(noticeId);
      Modal.info({
        title: 'Danh sách học sinh đã xác nhận',
        width: 600,
        content: (
          <Table
            columns={[
              { title: 'Họ tên', dataIndex: 'fullName' },
              { title: 'Lớp', dataIndex: 'className' },
              { title: 'Trạng thái', dataIndex: 'status', render: () => <Tag color="green">Đã xác nhận</Tag> },
            ]}
            dataSource={students}
            rowKey="accountId"
            pagination={false}
          />
        ),
      });
    } catch {
      // ...
    }
  };

  return (
    <Card title="Thông báo tiêm chủng hôm nay">
      <Table
        columns={[
          { title: 'Tiêu đề', dataIndex: 'title' },
          { title: 'Ngày tiêm', dataIndex: 'vaccinationDate' },
          { title: 'Khối lớp', dataIndex: 'grade' },
          {
            title: 'Hành động',
            render: (_, record) => (
              <Button onClick={() => handleViewConfirmed(record.vaccineNoticeId)}>
                Xem học sinh đã xác nhận
              </Button>
            ),
          },
        ]}
        dataSource={notices}
        rowKey="vaccineNoticeId"
        loading={loading}
      />
    </Card>
  );
};

export default TodayVaccinationNotices;