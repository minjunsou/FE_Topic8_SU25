import React from 'react';
import { Table, Badge, Button } from 'antd';
import './MedicineRequests.css';

const MedicineRequests = ({ medicineRequests, handleViewDetail, loading }) => {
  // Cấu hình cột cho bảng yêu cầu thuốc
  const medicineRequestColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Lớp',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Tên thuốc',
      dataIndex: 'medicineName',
      key: 'medicineName',
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestDate',
      key: 'requestDate',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let text = '';
        
        switch (status) {
          case 'pending':
            color = 'gold';
            text = 'Chờ duyệt';
            break;
          case 'approved':
            color = 'blue';
            text = 'Đã duyệt';
            break;
          case 'completed':
            color = 'green';
            text = 'Hoàn thành';
            break;
          case 'rejected':
            color = 'red';
            text = 'Từ chối';
            break;
          default:
            color = 'default';
            text = status;
        }
        
        return <Badge color={color} text={text} />;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => handleViewDetail(record.id)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="medicine-requests">
      <div className="staff-table-container">
        <Table 
          columns={medicineRequestColumns} 
          dataSource={medicineRequests} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
};

export default MedicineRequests; 