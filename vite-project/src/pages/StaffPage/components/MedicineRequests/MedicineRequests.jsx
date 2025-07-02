import React from 'react';
import { Table, Badge, Button, Tooltip, Space, Tag } from 'antd';
import { CalendarOutlined, MedicineBoxOutlined, UserOutlined } from '@ant-design/icons';
import './MedicineRequests.css';

const MedicineRequests = ({ medicineRequests, handleViewDetail, loading }) => {
  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString || dateString === "null") return "Chưa xác định";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Lỗi khi định dạng ngày:', error);
      return dateString;
    }
  };

  // Cấu hình cột cho bảng yêu cầu thuốc
  const medicineRequestColumns = [
    {
      title: 'ID',
      dataIndex: 'medSentId',
      key: 'medSentId',
      width: 80,
    },
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (studentName, record) => (
        <Space direction="vertical" size={0}>
          <span><strong>{studentName || 'Không có tên'}</strong></span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            Lớp: {record.studentClass || 'Không xác định'}
          </span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            ID: {record.studentId ? record.studentId.substring(0, 8) + '...' : 'Không có'}
          </span>
        </Space>
      ),
    },
    {
      title: 'Phụ huynh',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId) => (
        <Tooltip title={`ID: ${parentId}`}>
          <Tag icon={<UserOutlined />} color="blue">
            {parentId ? parentId.substring(0, 8) + '...' : 'Không có'}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Thuốc',
      dataIndex: 'medicationName',
      key: 'medicationName',
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <span><strong>{name}</strong></span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            Liều lượng: {record.amount || '-'} lần/ngày
          </span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            Hướng dẫn: {record.instructions || 'Không có'}
          </span>
        </Space>
      ),
    },
    {
      title: 'Thời gian',
      key: 'timeInfo',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <CalendarOutlined />
            <span>Gửi: {formatDate(record.sentAt)}</span>
          </Space>
          {record.startDate && (
            <Space>
              <CalendarOutlined />
              <span>Bắt đầu: {formatDate(record.startDate)}</span>
            </Space>
          )}
          {record.endDate && (
            <Space>
              <CalendarOutlined />
              <span>Kết thúc: {formatDate(record.endDate)}</span>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: 'Thông tin bổ sung',
      key: 'additionalInfo',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>Tần suất: {record.frequencyPerDay || '-'} lần/ngày</span>
          <span>Ghi chú: {record.timingNotes || 'Không có'}</span>
        </Space>
      ),
      responsive: ['lg'],
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        let color = 'processing';
        let text = 'Đang xử lý';
        
        // Kiểm tra trạng thái dựa trên thông tin từ API
        if (record.status) {
          switch (record.status.toLowerCase()) {
            case 'approved':
              color = 'success';
              text = 'Đã duyệt';
              break;
            case 'rejected':
              color = 'error';
              text = 'Từ chối';
              break;
            case 'completed':
              color = 'green';
              text = 'Hoàn thành';
              break;
            case 'expired':
              color = 'default';
              text = 'Hết hạn';
              break;
            case 'pending':
              color = 'warning';
              text = 'Chờ duyệt';
              break;
            default:
              color = 'processing';
              text = 'Đang xử lý';
          }
        }
        
        return <Badge status={color} text={text} />;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<MedicineBoxOutlined />}
          size="small" 
          onClick={() => handleViewDetail(record.medSentId)}
        >
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
          rowKey={record => record.medSentId || record.key}
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Tổng số ${total} yêu cầu`
          }}
        />
      </div>
    </div>
  );
};

export default MedicineRequests; 