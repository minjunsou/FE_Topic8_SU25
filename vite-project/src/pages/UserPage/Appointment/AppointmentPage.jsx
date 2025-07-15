import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Form, 
  Select, 
  DatePicker, 
  Input, 
  Button, 
  message, 
  Spin, 
  Table, 
  Tag,
  Row,
  Col,
  Divider
} from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import parentApi from '../../../api/parentApi';
import './AppointmentPage.css';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AppointmentPage = () => {
  const [form] = Form.useForm();
  const [children, setChildren] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // Lấy danh sách con và lịch sử đặt hẹn khi component mount
  useEffect(() => {
    fetchChildren();
    fetchAppointments();
  }, []);

  // Lấy danh sách con từ API
  const fetchChildren = async () => {
    setLoading(true);
    try {
      // Lấy accountId từ localStorage giống như trong ChildrenInfo.jsx
      const storedUserInfo = localStorage.getItem('userInfo');
      if (!storedUserInfo) {
        message.error('Không tìm thấy thông tin người dùng');
        setLoading(false);
        return;
      }
      
      const parsedUserInfo = JSON.parse(storedUserInfo);
      const userAccountId = parsedUserInfo.accountId;
      
      if (!userAccountId) {
        message.error('Không tìm thấy ID người dùng');
        setLoading(false);
        return;
      }
      
      console.log('Đang lấy danh sách con cho phụ huynh ID:', userAccountId);
      
      // Gọi API để lấy danh sách con
      const childrenData = await parentApi.getParentChildren(userAccountId);
      console.log('Danh sách con từ API:', childrenData);
      
      if (!childrenData || childrenData.length === 0) {
        console.log('Không có dữ liệu con');
        // Thêm dữ liệu demo cho trường hợp API chưa sẵn sàng
        const demoChildren = [
          { 
            id: 'demo1', 
            childId: 'demo1',
            name: 'Nguyễn Văn A',
            fullName: 'Nguyễn Văn A',
            dob: '2018-01-01'
          },
          { 
            id: 'demo2', 
            childId: 'demo2',
            name: 'Nguyễn Thị B',
            fullName: 'Nguyễn Thị B',
            dob: '2020-05-15'
          }
        ];
        setChildren(demoChildren);
        message.warning('Đang sử dụng dữ liệu demo cho học sinh. Khi hệ thống hoàn chỉnh, sẽ hiển thị dữ liệu thực.');
        setLoading(false);
        return;
      }
      
      // Định dạng lại dữ liệu con giống như trong ChildrenInfo.jsx
      const formattedChildren = childrenData.map(child => ({
        id: child.childId || child.accountId || child.id,
        name: child.fullName || child.name,
        age: calculateAge(child.dob),
        grade: child.classId || 'N/A',
        class: child.className || child.classId || 'N/A',
        school: child.schoolName || 'Trường học',
        birthdate: formatDate(child.dob) || 'Chưa cập nhật',
        dob: child.dob || ''
      }));
      
      console.log('Dữ liệu con đã định dạng:', formattedChildren);
      setChildren(formattedChildren);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu con:', error);
      message.error('Không thể tải thông tin học sinh');
      
      // Thêm dữ liệu demo cho trường hợp lỗi
      const demoChildren = [
        { 
          id: 'demo1', 
          name: 'Nguyễn Văn A',
          age: 7,
          grade: '1',
          class: '1A',
          school: 'Trường Tiểu học XYZ'
        },
        { 
          id: 'demo2', 
          name: 'Nguyễn Thị B',
          age: 5,
          grade: 'Mẫu giáo',
          class: 'Lớp Hoa',
          school: 'Trường Mầm non ABC'
        }
      ];
      setChildren(demoChildren);
    } finally {
      setLoading(false);
    }
  };

  // Hàm tính tuổi từ ngày sinh (copy từ ChildrenInfo.jsx)
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error('Lỗi khi tính tuổi:', error);
      return 'N/A';
    }
  };

  // Hàm định dạng ngày tháng (copy từ ChildrenInfo.jsx)
  const formatDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Lỗi khi định dạng ngày tháng:', error);
      return null;
    }
  };

  // Giả lập: Lấy lịch sử đặt lịch hẹn (sẽ cập nhật khi có API thật)
  const fetchAppointments = async () => {
    setTableLoading(true);
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (!storedUserInfo) {
        console.log('Không tìm thấy thông tin người dùng để lấy lịch sử đặt hẹn');
        useDefaultAppointments();
        return;
      }
      
      const parsedUserInfo = JSON.parse(storedUserInfo);
      const userAccountId = parsedUserInfo.accountId;
      
      if (!userAccountId) {
        console.log('Không tìm thấy ID người dùng để lấy lịch sử đặt hẹn');
        useDefaultAppointments();
        return;
      }
      
      console.log(`Đang gọi API để lấy lịch sử đặt hẹn của phụ huynh ID: ${userAccountId}`);
      
      // Gọi API thực tế để lấy lịch sử đặt hẹn
      const appointmentsData = await parentApi.getAppointments(userAccountId);
      
      if (appointmentsData && appointmentsData.length > 0) {
        // Xử lý dữ liệu từ API nếu cần
        const formattedAppointments = appointmentsData.map(appointment => ({
          id: appointment.id || appointment.appointmentId,
          childName: appointment.childName || appointment.studentName || 'Không có tên',
          appointmentDate: appointment.appointmentDate,
          timeSlot: appointment.timeSlot,
          reason: appointment.reason,
          status: appointment.status || 'PENDING'
        }));
        
        setAppointments(formattedAppointments);
      } else {
        // Nếu API trả về dữ liệu rỗng hoặc lỗi, sử dụng dữ liệu demo
        console.log('Không có dữ liệu lịch hẹn từ API, sử dụng dữ liệu demo');
        useDefaultAppointments();
      }
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử đặt lịch:', error);
      message.error('Không thể lấy lịch sử đặt lịch. Vui lòng thử lại sau.');
      useDefaultAppointments();
    } finally {
      setTableLoading(false);
    }
  };

  // Hàm trợ giúp để sử dụng dữ liệu mẫu cho lịch hẹn
  const useDefaultAppointments = () => {
    const demoAppointments = [
      {
        id: '1',
        childName: 'Nguyễn Văn A',
        appointmentDate: '2025-07-10',
        timeSlot: 'MORNING',
        reason: 'Khám sức khỏe định kỳ',
        status: 'PENDING'
      },
      {
        id: '2',
        childName: 'Nguyễn Thị B',
        appointmentDate: '2025-07-15',
        timeSlot: 'AFTERNOON',
        reason: 'Tiêm vắc-xin',
        status: 'APPROVED'
      }
    ];
    
    setAppointments(demoAppointments);
  };

  // Xử lý đặt lịch hẹn
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (!storedUserInfo) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      
      const parsedUserInfo = JSON.parse(storedUserInfo);
      const userAccountId = parsedUserInfo.accountId;
      
      if (!userAccountId) {
        throw new Error('Không tìm thấy ID người dùng');
      }

      const appointmentData = {
        appointmentDate: values.appointmentDate.format('YYYY-MM-DD'),
        timeSlot: values.timeSlot,
        reason: values.reason
      };

      console.log(`Đang đặt lịch hẹn cho học sinh ID: ${values.childId}, phụ huynh ID: ${userAccountId}`);
      console.log('Thông tin lịch hẹn:', appointmentData);
      
      await parentApi.scheduleAppointment(values.childId, userAccountId, appointmentData);
      
      message.success('Đặt lịch hẹn thành công!');
      form.resetFields();
      
      // Cập nhật lại danh sách đặt lịch
      fetchAppointments();
    } catch (error) {
      console.error('Lỗi khi đặt lịch hẹn:', error);
      message.error('Đặt lịch hẹn thất bại. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  // Cấu hình cột cho bảng lịch sử đặt lịch
  const columns = [
    {
      title: 'Học sinh',
      dataIndex: 'childName',
      key: 'childName',
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date) => {
        const formattedDate = new Date(date).toLocaleDateString('vi-VN');
        return formattedDate;
      }
    },
    {
      title: 'Thời gian',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      render: (slot) => {
        return slot === 'MORNING' ? 'Buổi sáng (8:00 - 11:30)' : 'Buổi chiều (13:30 - 16:30)';
      }
    },
    {
      title: 'Lý do khám',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        let text = 'Đang xử lý';
        
        if (status === 'APPROVED') {
          color = 'green';
          text = 'Đã xác nhận';
        } else if (status === 'REJECTED') {
          color = 'red';
          text = 'Đã từ chối';
        } else if (status === 'COMPLETED') {
          color = 'purple';
          text = 'Đã hoàn thành';
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
  ];

  return (
    <div className="appointment-page-container">
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Title level={2}>
            <CalendarOutlined /> Đặt lịch hẹn với bác sĩ
          </Title>
          <Paragraph>
            Đặt lịch hẹn để khám sức khỏe định kỳ hoặc khám chữa bệnh cho con bạn với bác sĩ trường học.
          </Paragraph>
        </Col>

        {/* Form đặt lịch hẹn */}
        <Col xs={24} lg={12}>
          <Card 
            title={<Title level={4}>Đặt lịch hẹn mới</Title>}
            className="appointment-form-card"
          >
            <Spin spinning={loading}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
              >
                <Form.Item
                  name="childId"
                  label="Chọn học sinh"
                  rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
                >
                  <Select 
                    placeholder="Chọn học sinh cần đặt lịch"
                    style={{ width: '100%' }}
                    suffixIcon={<UserOutlined />}
                  >
                    {children.map(child => (
                      <Option key={child.id} value={child.id}>
                        {child.name} {child.age && `(${child.age} tuổi)`} {child.grade && child.grade !== 'N/A' ? `- Lớp ${child.grade}` : ''}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="appointmentDate"
                  label="Ngày hẹn"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn!' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    placeholder="Chọn ngày hẹn"
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      // Không cho phép chọn ngày trong quá khứ và ngày hiện tại
                      return current && current.valueOf() < Date.now();
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="timeSlot"
                  label="Khung giờ"
                  rules={[{ required: true, message: 'Vui lòng chọn khung giờ!' }]}
                >
                  <Select 
                    placeholder="Chọn khung giờ"
                    suffixIcon={<ClockCircleOutlined />}
                  >
                    <Option value="MORNING">Buổi sáng (8:00 - 11:30)</Option>
                    <Option value="AFTERNOON">Buổi chiều (13:30 - 16:30)</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="reason"
                  label="Lý do khám"
                  rules={[{ required: true, message: 'Vui lòng nhập lý do khám!' }]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Nhập lý do khám" 
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={submitting}
                    block
                    icon={<CalendarOutlined />}
                  >
                    Đặt lịch hẹn
                  </Button>
                </Form.Item>
              </Form>
            </Spin>
          </Card>
        </Col>

        {/* Lưu ý và hướng dẫn */}
        <Col xs={24} lg={12}>
          <Card title={<Title level={4}>Lưu ý khi đặt lịch</Title>} className="appointment-info-card">
            <div className="appointment-info-content">
              <ul>
                <li>
                  <Text strong>Thời gian đặt lịch:</Text> Vui lòng đặt lịch trước ít nhất 2 ngày làm việc.
                </li>
                <li>
                  <Text strong>Thời gian khám:</Text> Buổi sáng từ 8:00 - 11:30, buổi chiều từ 13:30 - 16:30.
                </li>
                <li>
                  <Text strong>Xác nhận lịch hẹn:</Text> Y tá trường sẽ xác nhận lịch hẹn của bạn trong vòng 24 giờ.
                </li>
                <li>
                  <Text strong>Hủy hoặc đổi lịch:</Text> Vui lòng thông báo trước ít nhất 1 ngày làm việc.
                </li>
                <li>
                  <Text strong>Giấy tờ cần mang theo:</Text> Thẻ bảo hiểm y tế, sổ tiêm chủng (nếu có).
                </li>
              </ul>
              
              <Divider />
              
              <Paragraph strong>
                Thông tin liên hệ:
              </Paragraph>
              <Paragraph>
                <Text>Phòng y tế trường: 028.1234.5678</Text>
                <br />
                <Text>Email: healthcare@school.edu.vn</Text>
              </Paragraph>
            </div>
          </Card>
        </Col>

        {/* Lịch sử đặt lịch hẹn */}
        <Col xs={24}>
          <Card title={<Title level={4}>Lịch sử đặt lịch hẹn</Title>} className="appointment-history-card">
            <Table
              columns={columns}
              dataSource={appointments}
              rowKey="id"
              loading={tableLoading}
              pagination={{ pageSize: 5 }}
              locale={{ emptyText: 'Chưa có lịch hẹn nào' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AppointmentPage; 