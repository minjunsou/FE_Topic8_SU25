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
  Divider,
  Alert,
  Modal
} from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import parentApi from '../../../api/parentApi';
import './AppointmentPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AppointmentPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fromHealthCheck, setFromHealthCheck] = useState(false);
  const [nurses, setNurses] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  
  // On mount, check localStorage for pending appointment
  useEffect(() => {
    const pending = localStorage.getItem('pendingAppointment');
    if (pending) {
      try {
        const data = JSON.parse(pending);
        setFromHealthCheck(true);
        // Prefill form
        form.setFieldsValue({
          studentId: data.studentId,
          staffId: data.staffId,
          // date, slot, reason left for user to pick
        });
        form.healthCheckRecordId = data.healthCheckRecordId;
        form.parentId = data.parentId;
        // Optionally show a message
        if (data.studentName && data.nurseName) {
          message.info(`Đặt lịch khám cho học sinh ${data.studentName} với y tá ${data.nurseName}`);
        }
      } catch (e) {
        console.error('Error parsing pending appointment data:', e);
      }
      // Clear after use
      localStorage.removeItem('pendingAppointment');
    }
    fetchChildren();
    fetchNurses();
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
      }));
      
      console.log('Dữ liệu con đã định dạng:', formattedChildren);
      setChildren(formattedChildren);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu con:', error);
      message.error('Không thể tải thông tin học sinh');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch nurses
  const fetchNurses = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/accounts?page=0&size=10&roleId=3&sortBy=fullName&direction=asc');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Nurses API response:', data);
      
      const nursesList = data.accounts || [];
      setNurses(nursesList);
    } catch (error) {
      console.error('Error fetching nurses:', error);
      message.error('Không thể lấy danh sách y tá');
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    
    let birthDate;
    if (Array.isArray(dob)) {
      // Nếu dob là mảng [năm, tháng, ngày]
      birthDate = new Date(dob[0], dob[1] - 1, dob[2]);
    } else if (typeof dob === 'string') {
      // Nếu dob là chuỗi ISO
      birthDate = new Date(dob);
    } else {
      return 'N/A';
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      let date;
      if (Array.isArray(dateString)) {
        // Nếu dateString là mảng [năm, tháng, ngày]
        date = new Date(dateString[0], dateString[1] - 1, dateString[2]);
      } else if (typeof dateString === 'string') {
        // Nếu dateString là chuỗi ISO
        date = new Date(dateString);
      } else {
        return '';
      }
      
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (error) {
      console.error('Lỗi khi định dạng ngày:', error);
      return '';
    }
  };

  // const useDefaultAppointments = () => {
  //   const demoAppointments = [
  //     {
  //       id: '1',
  //       childName: 'Nguyễn Văn A',
  //       appointmentDate: '2025-07-10',
  //       timeSlot: 'MORNING',
  //       reason: 'Khám sức khỏe định kỳ',
  //       status: 'PENDING'
  //     },
  //     {
  //       id: '2',
  //       childName: 'Nguyễn Thị B',
  //       appointmentDate: '2025-07-15',
  //       timeSlot: 'AFTERNOON',
  //       reason: 'Tiêm vắc-xin',
  //       status: 'APPROVED'
  //     }
  //   ];
    
  //   setAppointments(demoAppointments);
  // };

  // Handle form submission
  const handleSubmit = async (values) => {
    setSubmitting(true);
    
    try {
      // Format date to yyyy-MM-dd
      const formattedDate = values.date.format('YYYY-MM-DD');
      
      // Get parent ID from localStorage or from URL params
      const parentId = form.parentId || (() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          return parsedUserInfo.accountId;
        }
        return null;
      })();
      
      if (!parentId) {
        message.error('Không tìm thấy ID phụ huynh');
        setSubmitting(false);
        return;
      }
      
      // Prepare request body
      const requestBody = {
        studentId: values.studentId,
        parentId: parentId,
        nurseId: values.staffId, // Đổi staffId thành nurseId
        healthCheckRecordId: form.healthCheckRecordId || 1, // giữ nguyên nếu backend cần
        scheduledDate: formattedDate,
        slot: values.slot, // Gửi cả hai trường
        timeSlot: values.slot,
        reason: values.reason
      };
      
      console.log('Booking request body:', requestBody);
      
      // Call the API
      const response = await axios.post('http://localhost:8080/api/v1/consultations/schedule', requestBody);
      console.log('Booking response:', response);
      
      // Show success message
      message.success('Đặt lịch khám thành công!');
      // Show success modal
      setSuccessModalVisible(true);
      // Reset form
      form.resetFields();
      
      // Refresh appointments list
      // Reset fromHealthCheck
      if (fromHealthCheck) {
        setFromHealthCheck(false);
        // Clear URL params
        navigate('/appointment', { replace: true });
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      message.error('Đặt lịch khám thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Watch for nurse and date selection to fetch available slots
  useEffect(() => {
    const staffId = form.getFieldValue('staffId');
    const date = form.getFieldValue('date');
    if (staffId && date) {
      fetchAvailableSlots(staffId, date.format('YYYY-MM-DD'));
    } else {
      setAvailableSlots([]);
    }
  }, [form.getFieldValue('staffId'), form.getFieldValue('date')]);

  // Fetch available slots for a nurse and date
  const fetchAvailableSlots = async (staffId, date) => {
    setLoadingSlots(true);
    setAvailableSlots([]);
    try {
      // Đổi endpoint và tên biến cho đúng API mới
      const nurseId = staffId;
      const response = await axios.get(`http://localhost:8080/api/v1/consultations/nurse-availability?nurseId=${nurseId}&date=${date}`);
      setAvailableSlots(response.data || []);
    } catch (error) {
      setAvailableSlots([]);
      message.error('Không thể lấy khung giờ khả dụng.');
    } finally {
      setLoadingSlots(false);
    }
  };

  return (
    <div className="appointment-page" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f4f8fb' }}>
      <Card className="appointment-card" style={{ maxWidth: 480, width: '100%', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32 }}>
        <Title level={3} className="appointment-title" style={{ textAlign: 'center', marginBottom: 32, color: '#0078FF', letterSpacing: 1 }}>
          <CalendarOutlined style={{ color: '#0078FF', marginRight: 8 }} /> Đặt lịch khám
        </Title>
        {fromHealthCheck && (
          <Alert
            message="Thông tin từ kiểm tra sức khỏe"
            description="Thông tin lịch hẹn đã được điền từ bản ghi kiểm tra sức khỏe. Bạn có thể điều chỉnh thông tin nếu cần."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="appointment-form"
          style={{ marginTop: 8 }}
        >
          <Form.Item
            name="studentId"
            label={<span style={{ fontWeight: 500 }}>Học sinh <span style={{ color: 'red' }}>*</span></span>}
            rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
            style={{ marginBottom: 20 }}
          >
            <Select placeholder="Chọn học sinh" loading={loading} disabled={fromHealthCheck} size="large">
              {children.map(child => (
                <Option key={child.id} value={child.id}>
                  {child.name} {child.class ? `- ${child.class}` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="staffId"
            label={<span style={{ fontWeight: 500 }}>Y tá phụ trách <span style={{ color: 'red' }}>*</span></span>}
            rules={[{ required: true, message: 'Vui lòng chọn y tá phụ trách!' }]}
            style={{ marginBottom: 20 }}
          >
            <Select
              placeholder="Chọn y tá phụ trách"
              loading={loading}
              disabled={fromHealthCheck}
              size="large"
              onChange={() => {
                form.setFieldsValue({ slot: undefined });
                setAvailableSlots([]);
              }}
            >
              {nurses.map(nurse => (
                <Option key={nurse.accountId} value={nurse.accountId}>
                  {nurse.fullName} ({nurse.username})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="date"
            label={<span style={{ fontWeight: 500 }}>Ngày hẹn khám <span style={{ color: 'red' }}>*</span></span>}
            rules={[{ required: true, message: 'Vui lòng chọn ngày hẹn khám!' }]}
            style={{ marginBottom: 20 }}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              placeholder="Chọn ngày hẹn khám"
              size="large"
              onChange={() => {
                form.setFieldsValue({ slot: undefined });
                setAvailableSlots([]);
              }}
            />
          </Form.Item>
          <Form.Item
            name="slot"
            label={<span style={{ fontWeight: 500 }}>Khung giờ <span style={{ color: 'red' }}>*</span></span>}
            rules={[{ required: true, message: 'Vui lòng chọn khung giờ!' }]}
            style={{ marginBottom: 20 }}
          >
            <Select
              placeholder="Chọn khung giờ"
              loading={loadingSlots}
              disabled={!(form.getFieldValue('staffId') && form.getFieldValue('date')) || loadingSlots}
              size="large"
            >
              {availableSlots.length === 0 && !loadingSlots && (
                <Option value="" disabled>
                  {form.getFieldValue('staffId') && form.getFieldValue('date') ? 'Không có khung giờ khả dụng' : 'Chọn y tá và ngày trước'}
                </Option>
              )}
              {availableSlots.includes('MORNING_SLOT_1') && (
                <Option value="MORNING_SLOT_1">Sáng ca 1 (7:30-9:00)</Option>
              )}
              {availableSlots.includes('MORNING_SLOT_2') && (
                <Option value="MORNING_SLOT_2">Sáng ca 2 (9:00-10:30)</Option>
              )}
              {availableSlots.includes('AFTERNOON_SLOT_1') && (
                <Option value="AFTERNOON_SLOT_1">Chiều ca 1 (13:30-15:00)</Option>
              )}
              {availableSlots.includes('AFTERNOON_SLOT_2') && (
                <Option value="AFTERNOON_SLOT_2">Chiều ca 2 (15:00-16:30)</Option>
              )}
            </Select>
          </Form.Item>
          <Form.Item
            name="reason"
            label={<span style={{ fontWeight: 500 }}>Lý do khám <span style={{ color: 'red' }}>*</span></span>}
            rules={[{ required: true, message: 'Vui lòng nhập lý do khám!' }]}
            style={{ marginBottom: 28 }}
          >
            <TextArea rows={4} placeholder="Nhập lý do khám" size="large" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting} 
              block
              size="large"
              style={{ borderRadius: 8, fontWeight: 600, letterSpacing: 1 }}
            >
              Đặt lịch
            </Button>
          </Form.Item>
        </Form>
        <Modal
          open={successModalVisible}
          onCancel={() => setSuccessModalVisible(false)}
          footer={null}
          centered
        >
          <div style={{ textAlign: 'center', padding: 16 }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4} style={{ color: '#52c41a', marginBottom: 8 }}>Đặt lịch thành công!</Title>
            <p>Bạn đã đặt lịch khám thành công. Bạn có thể xem lại lịch sử đặt lịch của mình.</p>
            <Button type="primary" size="large" style={{ marginTop: 16 }} onClick={() => navigate('/profile?tab=appointment')}>
              Đi đến lịch sử đặt lịch
            </Button>
          </div>
        </Modal>
      </Card>
    </div>
  );
};

export default AppointmentPage; 