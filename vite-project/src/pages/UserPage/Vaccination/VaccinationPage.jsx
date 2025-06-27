import React, { useState } from 'react';
import { Card, Typography, Table, Button, Tag, Modal, Form, Select, Radio, Divider, message, Tabs, Row, Col } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import './VaccinationPage.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { confirm } = Modal;

const VaccinationPage = () => {
  const [form] = Form.useForm();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Danh sách học sinh của phụ huynh
  const studentList = [
    { id: 1, name: 'Nguyễn Văn An', class: '10A1' },
    { id: 2, name: 'Nguyễn Thị Bình', class: '7B2' },
  ];

  // Dữ liệu mẫu cho các đợt tiêm chủng sắp tới
  const upcomingVaccinationsData = [
    {
      key: '1',
      id: 'VAC001',
      name: 'Tiêm phòng cúm mùa',
      date: '15/08/2025',
      location: 'Phòng y tế trường',
      status: 'pending',
      description: 'Tiêm vaccine phòng cúm mùa cho học sinh các lớp 10-12',
      deadline: '10/08/2025',
    },
    {
      key: '2',
      id: 'VAC002',
      name: 'Tiêm phòng viêm não Nhật Bản',
      date: '20/09/2025',
      location: 'Phòng y tế trường',
      status: 'pending',
      description: 'Tiêm vaccine phòng viêm não Nhật Bản cho học sinh các lớp 6-9',
      deadline: '15/09/2025',
    },
  ];

  // Dữ liệu mẫu cho lịch sử tiêm chủng
  const vaccinationHistoryData = [
    {
      key: '1',
      id: 'VAC001',
      name: 'Tiêm phòng COVID-19 (mũi 1)',
      date: '10/01/2025',
      location: 'Phòng y tế trường',
      status: 'completed',
      student: 'Nguyễn Văn An',
      result: 'Hoàn thành, không có phản ứng phụ',
    },
    {
      key: '2',
      id: 'VAC002',
      name: 'Tiêm phòng COVID-19 (mũi 2)',
      date: '10/02/2025',
      location: 'Phòng y tế trường',
      status: 'completed',
      student: 'Nguyễn Văn An',
      result: 'Hoàn thành, sốt nhẹ sau tiêm',
    },
    {
      key: '3',
      id: 'VAC003',
      name: 'Tiêm phòng viêm gan B',
      date: '15/03/2025',
      location: 'Phòng y tế trường',
      status: 'completed',
      student: 'Nguyễn Thị Bình',
      result: 'Hoàn thành, không có phản ứng phụ',
    },
  ];

  // Cột cho bảng các đợt tiêm chủng sắp tới
  const upcomingColumns = [
    {
      title: 'Tên đợt tiêm chủng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ngày tiêm',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Hạn xác nhận',
      dataIndex: 'deadline',
      key: 'deadline',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let text = 'Chưa xác nhận';
        let icon = <ClockCircleOutlined />;
        
        if (status === 'confirmed') {
          color = 'green';
          text = 'Đã xác nhận';
          icon = <CheckCircleOutlined />;
        } else if (status === 'declined') {
          color = 'red';
          text = 'Đã từ chối';
          icon = <ExclamationCircleOutlined />;
        }
        
        return <Tag icon={icon} color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => showConfirmModal(record)}
          disabled={record.status === 'confirmed' || record.status === 'declined'}
        >
          Xác nhận tham gia
        </Button>
      ),
    },
  ];

  // Cột cho bảng lịch sử tiêm chủng
  const historyColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
    },
    {
      title: 'Tên đợt tiêm chủng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ngày tiêm',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let text = 'Đã hoàn thành';
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Kết quả',
      dataIndex: 'result',
      key: 'result',
    },
  ];

  // Hiển thị modal xác nhận tham gia tiêm chủng
  const showConfirmModal = (vaccination) => {
    setSelectedVaccination(vaccination);
    setConfirmModalVisible(true);
    form.resetFields();
  };

  // Xử lý khi xác nhận tham gia tiêm chủng
  const handleConfirm = () => {
    form.validateFields()
      .then(values => {
        setLoading(true);
        
        // Giả lập gửi dữ liệu
        setTimeout(() => {
          console.log('Form values:', values);
          console.log('Selected vaccination:', selectedVaccination);
          
          message.success('Đã xác nhận tham gia tiêm chủng thành công!');
          setConfirmModalVisible(false);
          setLoading(false);
          
          // Cập nhật trạng thái của đợt tiêm chủng
          const updatedData = upcomingVaccinationsData.map(item => {
            if (item.key === selectedVaccination.key) {
              return { ...item, status: values.confirmStatus === 'yes' ? 'confirmed' : 'declined' };
            }
            return item;
          });
          
          // Trong thực tế, bạn sẽ cần cập nhật state hoặc gọi API để cập nhật dữ liệu
          // setUpcomingVaccinationsData(updatedData);
        }, 1000);
      })
      .catch(info => {
        console.log('Validate failed:', info);
      });
  };

  return (
    <div className="vaccination-page">
      <div className="vaccination-container">
        <Card className="vaccination-card">
          <Title level={2} className="vaccination-title">Quản lý tiêm chủng</Title>
          <Paragraph className="vaccination-description">
            Quản lý thông tin tiêm chủng của học sinh, xác nhận tham gia các đợt tiêm chủng sắp tới và xem lịch sử tiêm chủng.
          </Paragraph>

          <Tabs activeKey={activeTab} onChange={setActiveTab} className="vaccination-tabs">
            <TabPane tab="Đợt tiêm chủng sắp tới" key="upcoming">
              <Table 
                columns={upcomingColumns} 
                dataSource={upcomingVaccinationsData} 
                rowKey="key"
                expandable={{
                  expandedRowRender: (record) => (
                    <p style={{ margin: 0 }}>
                      <strong>Mô tả:</strong> {record.description}
                    </p>
                  ),
                }}
              />
            </TabPane>
            <TabPane tab="Lịch sử tiêm chủng" key="history">
              <Table 
                columns={historyColumns} 
                dataSource={vaccinationHistoryData} 
                rowKey="key" 
              />
            </TabPane>
          </Tabs>
        </Card>
      </div>

      <Modal
        title="Xác nhận tham gia tiêm chủng"
        open={confirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setConfirmModalVisible(false)}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={loading} 
            onClick={handleConfirm}
          >
            Xác nhận
          </Button>,
        ]}
      >
        {selectedVaccination && (
          <>
            <div className="vaccination-info">
              <Title level={5}>Thông tin đợt tiêm chủng</Title>
              <p><strong>Tên:</strong> {selectedVaccination.name}</p>
              <p><strong>Ngày tiêm:</strong> {selectedVaccination.date}</p>
              <p><strong>Địa điểm:</strong> {selectedVaccination.location}</p>
              <p><strong>Mô tả:</strong> {selectedVaccination.description}</p>
            </div>

            <Divider />

            <Form form={form} layout="vertical">
              <Form.Item
                name="studentId"
                label="Chọn học sinh tham gia"
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
                name="confirmStatus"
                label="Xác nhận tham gia"
                rules={[{ required: true, message: 'Vui lòng chọn xác nhận!' }]}
              >
                <Radio.Group>
                  <Radio value="yes">Đồng ý cho con tham gia tiêm chủng</Radio>
                  <Radio value="no">Không đồng ý cho con tham gia tiêm chủng</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="note"
                label="Ghi chú (nếu có)"
              >
                <Select placeholder="Chọn lý do (nếu không đồng ý)">
                  <Option value="allergy">Con tôi bị dị ứng với thành phần của vaccine</Option>
                  <Option value="sick">Con tôi đang bị bệnh</Option>
                  <Option value="vaccinated">Con tôi đã được tiêm vaccine này rồi</Option>
                  <Option value="other">Lý do khác</Option>
                </Select>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default VaccinationPage; 