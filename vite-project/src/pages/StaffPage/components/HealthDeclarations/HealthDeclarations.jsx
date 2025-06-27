import React from 'react';
import { Table, Badge, Button } from 'antd';
import './HealthDeclarations.css';

const HealthDeclarations = ({ healthDeclarations, handleViewHealthDetail, loading }) => {
  // Cấu hình cột cho bảng khai báo sức khỏe
  const healthDeclarationColumns = [
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
      title: 'Ngày khai báo',
      dataIndex: 'declarationDate',
      key: 'declarationDate',
    },
    {
      title: 'Triệu chứng',
      dataIndex: 'symptoms',
      key: 'symptoms',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let text = '';
        
        switch (status) {
          case 'new':
            color = 'blue';
            text = 'Mới';
            break;
          case 'reviewed':
            color = 'green';
            text = 'Đã xem';
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
        <Button type="primary" size="small" onClick={() => handleViewHealthDetail(record.id)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="health-declarations">
      <div className="staff-table-container">
        <Table 
          columns={healthDeclarationColumns} 
          dataSource={healthDeclarations} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
};

export default HealthDeclarations; 