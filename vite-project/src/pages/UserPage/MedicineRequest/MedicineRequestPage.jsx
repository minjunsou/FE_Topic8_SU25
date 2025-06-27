import React, { useState } from 'react';
import { Card, Typography, Table, Button, Tag, Modal, Form, Select, Input, DatePicker, Tabs, message } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import './MedicineRequestPage.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const MedicineRequestPage = () => {
  const [form] = Form.useForm();
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  // Danh sách học sinh của phụ huynh
  const studentList = [
    { id: 1, name: 'Nguyễn Văn An', class: '10A1' },
    { id: 2, name: 'Nguyễn Thị Bình', class: '7B2' },
  ];

  // Danh sách thuốc có sẵn
  const medicineList = [
    { id: 1, name: 'Paracetamol', type: 'Hạ sốt', unit: 'Viên' },
    { id: 2, name: 'Ibuprofen', type: 'Giảm đau', unit: 'Viên' },
    { id: 3, name: 'Cetirizine', type: 'Kháng histamine', unit: 'Viên' },
    { id: 4, name: 'Amoxicillin', type: 'Kháng sinh', unit: 'Viên' },
    { id: 5, name: 'Vitamin C', type: 'Vitamin', unit: 'Viên' },
  ];

  // Dữ liệu mẫu cho các yêu cầu thuốc đang xử lý
  const activeRequestsData = [
    {
      key: '1',
      id: 'MR001',
      student: 'Nguyễn Văn An',
      class: '10A1',
      medicine: 'Paracetamol',
      quantity: 10,
      reason: 'Đau đầu, sốt nhẹ',
      requestDate: '05/07/2025',
      status: 'pending',
      note: 'Cần uống sau khi ăn',
    },
    {
      key: '2',
      id: 'MR002',
      student: 'Nguyễn Thị Bình',
      class: '7B2',
      medicine: 'Cetirizine',
      quantity: 5,
      reason: 'Dị ứng theo mùa',
      requestDate: '10/07/2025',
      status: 'approved',
      approvedDate: '11/07/2025',
      note: 'Uống 1 viên/ngày vào buổi sáng',
    },
  ];

  // Dữ liệu mẫu cho lịch sử yêu cầu thuốc
  const historyRequestsData = [
    {
      key: '1',
      id: 'MR003',
      student: 'Nguyễn Văn An',
      class: '10A1',
      medicine: 'Ibuprofen',
      quantity: 6,
      reason: 'Đau cơ sau hoạt động thể thao',
      requestDate: '15/05/2025',
      status: 'completed',
      approvedDate: '16/05/2025',
      completedDate: '20/05/2025',
      note: 'Đã cấp đủ số lượng',
    },
    {
      key: '2',
      id: 'MR004',
      student: 'Nguyễn Thị Bình',
      class: '7B2',
      medicine: 'Vitamin C',
      quantity: 30,
      reason: 'Tăng cường sức đề kháng',
      requestDate: '20/04/2025',
      status: 'rejected',
      rejectedDate: '21/04/2025',
      rejectedReason: 'Không có chỉ định y tế cụ thể',
      note: 'Đề nghị tham khảo ý kiến bác sĩ trước khi sử dụng',
    },
    {
      key: '3',
      id: 'MR005',
      student: 'Nguyễn Văn An',
      class: '10A1',
      medicine: 'Paracetamol',
      quantity: 10,
      reason: 'Sốt nhẹ',
      requestDate: '10/03/2025',
      status: 'completed',
      approvedDate: '11/03/2025',
      completedDate: '15/03/2025',
      note: 'Đã cấp đủ số lượng',
    },
  ];

  // Cột cho bảng các yêu cầu thuốc đang xử lý
  const activeColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
    },
    {
      title: 'Lớp',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Thuốc',
      dataIndex: 'medicine',
      key: 'medicine',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
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
        let color = 'default';
        let text = 'Đang chờ duyệt';
        let icon = <ClockCircleOutlined />;
        
        if (status === 'approved') {
          color = 'processing';
          text = 'Đã duyệt, đang chuẩn bị';
          icon = <CheckCircleOutlined />;
        } else if (status === 'rejected') {
          color = 'error';
          text = 'Đã từ chối';
          icon = <ExclamationCircleOutlined />;
        }
        
        return <Tag icon={icon} color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Chi tiết',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => showDetailModal(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Cột cho bảng lịch sử yêu cầu thuốc
  const historyColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
    },
    {
      title: 'Lớp',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Thuốc',
      dataIndex: 'medicine',
      key: 'medicine',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
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
        let color = 'success';
        let text = 'Đã hoàn thành';
        let icon = <CheckCircleOutlined />;
        
        if (status === 'rejected') {
          color = 'error';
          text = 'Đã từ chối';
          icon = <ExclamationCircleOutlined />;
        }
        
        return <Tag icon={icon} color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Chi tiết',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => showDetailModal(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Hiển thị modal tạo yêu cầu thuốc
  const showRequestModal = () => {
    setRequestModalVisible(true);
    form.resetFields();
  };

  // Hiển thị modal chi tiết yêu cầu thuốc
  const showDetailModal = (record) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };

  // Xử lý khi tạo yêu cầu thuốc
  const handleCreateRequest = () => {
    form.validateFields()
      .then(values => {
        setLoading(true);
        
        // Giả lập gửi dữ liệu
        setTimeout(() => {
          console.log('Form values:', values);
          
          message.success('Đã gửi yêu cầu thuốc thành công!');
          setRequestModalVisible(false);
          setLoading(false);
          
          // Trong thực tế, bạn sẽ cần cập nhật state hoặc gọi API để cập nhật dữ liệu
        }, 1000);
      })
      .catch(info => {
        console.log('Validate failed:', info);
      });
  };

  return (
    <div className="medicine-request-page">
      <div className="medicine-request-container">
        <Card className="medicine-request-card">
          <Title level={2} className="medicine-request-title">
            <MedicineBoxOutlined /> Yêu cầu thuốc
          </Title>
          <Paragraph className="medicine-request-description">
            Gửi yêu cầu cấp thuốc cho học sinh và theo dõi trạng thái xử lý yêu cầu.
          </Paragraph>

          <div className="medicine-request-actions">
            <Button 
              type="primary" 
              icon={<MedicineBoxOutlined />} 
              onClick={showRequestModal}
              className="create-request-btn"
            >
              Tạo yêu cầu thuốc mới
            </Button>
          </div>

          <Tabs activeKey={activeTab} onChange={setActiveTab} className="medicine-request-tabs">
            <TabPane tab="Yêu cầu đang xử lý" key="active">
              <Table 
                columns={activeColumns} 
                dataSource={activeRequestsData} 
                rowKey="key" 
              />
            </TabPane>
            <TabPane tab="Lịch sử yêu cầu" key="history">
              <Table 
                columns={historyColumns} 
                dataSource={historyRequestsData} 
                rowKey="key" 
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>

      {/* Modal tạo yêu cầu thuốc */}
      <Modal
        title={
          <span>
            <MedicineBoxOutlined /> Tạo yêu cầu thuốc mới
          </span>
        }
        open={requestModalVisible}
        onCancel={() => setRequestModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setRequestModalVisible(false)}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading} 
            onClick={handleCreateRequest}
          >
            Gửi yêu cầu
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="studentId"
            label="Chọn học sinh"
            rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
          >
            <Select placeholder="Chọn học sinh">
              {studentList.map(student => (
                <Option key={student.id} value={student.id}>
                  {student.name} - Lớp {student.class}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="medicineId"
            label="Chọn thuốc"
            rules={[{ required: true, message: 'Vui lòng chọn thuốc!' }]}
          >
            <Select placeholder="Chọn thuốc">
              {medicineList.map(medicine => (
                <Option key={medicine.id} value={medicine.id}>
                  {medicine.name} - {medicine.type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng!' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' },
            ]}
          >
            <Input type="number" placeholder="Nhập số lượng" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do yêu cầu"
            rules={[{ required: true, message: 'Vui lòng nhập lý do yêu cầu!' }]}
          >
            <TextArea rows={4} placeholder="Nhập lý do yêu cầu thuốc" />
          </Form.Item>

          <Form.Item
            name="note"
            label="Ghi chú (nếu có)"
          >
            <TextArea rows={2} placeholder="Nhập ghi chú về cách sử dụng, liều lượng, v.v." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chi tiết yêu cầu thuốc */}
      <Modal
        title={
          <span>
            <MedicineBoxOutlined /> Chi tiết yêu cầu thuốc
          </span>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="back" type="primary" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedRequest && (
          <div className="request-detail">
            <div className="detail-section">
              <Title level={5}>Thông tin chung</Title>
              <p><strong>Mã yêu cầu:</strong> {selectedRequest.id}</p>
              <p><strong>Học sinh:</strong> {selectedRequest.student}</p>
              <p><strong>Lớp:</strong> {selectedRequest.class}</p>
              <p><strong>Ngày yêu cầu:</strong> {selectedRequest.requestDate}</p>
              <p><strong>Trạng thái:</strong> 
                {selectedRequest.status === 'pending' && <Tag icon={<ClockCircleOutlined />} color="default">Đang chờ duyệt</Tag>}
                {selectedRequest.status === 'approved' && <Tag icon={<CheckCircleOutlined />} color="processing">Đã duyệt, đang chuẩn bị</Tag>}
                {selectedRequest.status === 'completed' && <Tag icon={<CheckCircleOutlined />} color="success">Đã hoàn thành</Tag>}
                {selectedRequest.status === 'rejected' && <Tag icon={<ExclamationCircleOutlined />} color="error">Đã từ chối</Tag>}
              </p>
            </div>

            <div className="detail-section">
              <Title level={5}>Thông tin thuốc</Title>
              <p><strong>Tên thuốc:</strong> {selectedRequest.medicine}</p>
              <p><strong>Số lượng:</strong> {selectedRequest.quantity}</p>
              <p><strong>Lý do yêu cầu:</strong> {selectedRequest.reason}</p>
              <p><strong>Ghi chú:</strong> {selectedRequest.note || 'Không có'}</p>
            </div>

            {selectedRequest.status === 'approved' && (
              <div className="detail-section">
                <Title level={5}>Thông tin phê duyệt</Title>
                <p><strong>Ngày phê duyệt:</strong> {selectedRequest.approvedDate}</p>
                <p><strong>Dự kiến cấp phát:</strong> Trong vòng 24 giờ làm việc</p>
              </div>
            )}

            {selectedRequest.status === 'completed' && (
              <div className="detail-section">
                <Title level={5}>Thông tin phê duyệt và cấp phát</Title>
                <p><strong>Ngày phê duyệt:</strong> {selectedRequest.approvedDate}</p>
                <p><strong>Ngày cấp phát:</strong> {selectedRequest.completedDate}</p>
              </div>
            )}

            {selectedRequest.status === 'rejected' && (
              <div className="detail-section">
                <Title level={5}>Thông tin từ chối</Title>
                <p><strong>Ngày từ chối:</strong> {selectedRequest.rejectedDate}</p>
                <p><strong>Lý do từ chối:</strong> {selectedRequest.rejectedReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicineRequestPage; 