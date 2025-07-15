import React, { useState, useEffect } from 'react';
import { Table, Button, Tabs, Modal, Form, Input, DatePicker, Select, message, Typography, Row, Col, Tag, Tooltip, Card, Empty, Spin, AutoComplete, Collapse, Descriptions, Badge } from 'antd';
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined, SearchOutlined, UserOutlined, LoadingOutlined, FileTextOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import './HealthChecks.css';
import nurseApi from '../../../../api/nurseApi';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const HealthChecks = () => {
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState([]);
  const [confirmations, setConfirmations] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [confirmationsModalVisible, setConfirmationsModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form] = Form.useForm();
  const [resultForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  
  // New states for student health check records tab
  const [searchValue, setSearchValue] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const [studentHealthRecords, setStudentHealthRecords] = useState([]);
  const [studentRecordsLoading, setStudentRecordsLoading] = useState(false);

  // Add new state variables for medical profiles
  const [medicalProfiles, setMedicalProfiles] = useState([]);
  const [medicalProfilesLoading, setMedicalProfilesLoading] = useState(false);
  const [recordDetailVisible, setRecordDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchNotices();
    fetchStudents();
  }, []);

  // Update search options when students data changes
  useEffect(() => {
    const options = students.map(student => ({
      value: student.accountId,
      label: `${student.fullName} - ${student.classId || 'N/A'}`
    }));
    setSearchOptions(options);
  }, [students]);

  // Fetch health check notices
  const fetchNotices = async () => {
    setLoading(true);
    try {
      // Use nurseApi instead of direct API call
      const response = await nurseApi.getAllHealthCheckNotices();
      
      // The response format is { time_stamp, data: [...notices] }
      const noticesData = response.data || [];
      
      const formattedNotices = noticesData.map(notice => ({
        ...notice,
        key: notice.checkNoticeId.toString(),
        id: notice.checkNoticeId,
        title: notice.title,
        description: notice.description,
        // Format the date from array [year, month, day] to string for display
        date: Array.isArray(notice.date) ? 
          `${notice.date[0]}-${notice.date[1].toString().padStart(2, '0')}-${notice.date[2].toString().padStart(2, '0')}` : 
          'N/A',
        // Format the created_at from array [year, month, day] to string for display
        created_at: Array.isArray(notice.createdAt) ? 
          `${notice.createdAt[0]}-${notice.createdAt[1].toString().padStart(2, '0')}-${notice.createdAt[2].toString().padStart(2, '0')}` : 
          'N/A'
      }));
      
      setNotices(formattedNotices);
      console.log('Fetched health check notices:', formattedNotices);
    } catch (error) {
      console.error('Error fetching health check notices:', error);
      message.error('Không thể lấy danh sách thông báo kiểm tra sức khỏe');
      // Use mock data in case of error
      setNotices([
        {
          id: 1,
          key: '1',
          title: 'Kiểm tra sức khỏe định kỳ học kỳ 1',
          description: 'Kiểm tra sức khỏe tổng quát, đo chiều cao, cân nặng, thị lực, và khám răng miệng',
          date: '2025-09-10',
          created_at: '2025-08-15'
        },
        {
          id: 2,
          key: '2',
          title: 'Kiểm tra sức khỏe chuyên khoa mắt',
          description: 'Kiểm tra thị lực và sức khỏe mắt cho học sinh các lớp 6-12',
          date: '2025-10-15',
          created_at: '2025-09-01'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      // Use nurseApi.getAllStudents instead of direct API call
      const studentsData = await nurseApi.getAllStudents();
      
      setStudents(studentsData.map(student => ({
        ...student,
        key: student.accountId
      })));
      
      console.log('Fetched students:', studentsData.length);
    } catch (error) {
      console.error('Error fetching students:', error);
      message.error('Không thể lấy danh sách học sinh');
      // Use mock data in case of error
      setStudents([
        {
          accountId: '1',
          key: '1',
          fullName: 'Nguyễn Văn An',
          classId: '10A1'
        },
        {
          accountId: '2',
          key: '2',
          fullName: 'Trần Thị Bình',
          classId: '11B2'
        },
        {
          accountId: '3',
          key: '3',
          fullName: 'Lê Văn Cường',
          classId: '12C3'
        }
      ]);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch confirmations for a specific notice
  const fetchConfirmations = async (noticeId) => {
    setLoading(true);
    try {
      // Use nurseApi instead of direct API call
      const response = await nurseApi.getHealthCheckConfirmations(noticeId);
      
      // The response format is { time_stamp, data: [...confirmations] }
      const confirmationsData = response.data || [];
      
      const formattedConfirmations = confirmationsData.map(confirmation => {
        // Find the student information from the students array
        const student = students.find(s => s.accountId === confirmation.studentId) || {};
        
        return {
          ...confirmation,
          key: confirmation.confirmationId.toString(),
          id: confirmation.confirmationId,
          studentId: confirmation.studentId,
          studentName: student.fullName || 'Không xác định',
          className: student.classId || 'Không xác định',
          status: confirmation.status,
          // Format confirmed_at from array if it exists
          confirmed_at: Array.isArray(confirmation.confirmedAt) ? 
            `${confirmation.confirmedAt[0]}-${confirmation.confirmedAt[1].toString().padStart(2, '0')}-${confirmation.confirmedAt[2].toString().padStart(2, '0')}` : 
            (confirmation.confirmedAt || 'N/A')
        };
      });
      
      setConfirmations(formattedConfirmations);
    } catch (error) {
      console.error(`Error fetching confirmations for notice ${noticeId}:`, error);
      message.error('Không thể lấy danh sách xác nhận kiểm tra sức khỏe');
      // Use mock data in case of error
      setConfirmations([
        {
          id: 1,
          key: '1',
          studentId: '1',
          studentName: 'Nguyễn Văn An',
          className: '10A1',
          status: 'CONFIRMED',
          confirmed_at: '2025-08-20'
        },
        {
          id: 2,
          key: '2',
          studentId: '2',
          studentName: 'Trần Thị Bình',
          className: '11B2',
          status: 'PENDING',
          confirmed_at: null
        },
        {
          id: 3,
          key: '3',
          studentId: '3',
          studentName: 'Lê Văn Cường',
          className: '12C3',
          status: 'DECLINED',
          confirmed_at: '2025-08-22'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle creating a new health check notice
  const handleCreateNotice = async (values) => {
    setLoading(true);
    try {
      // Format the date as a string in YYYY-MM-DD format as expected by the API
      const dateString = values.date.format('YYYY-MM-DD');
      
      // Prepare the request body according to the API requirements
      const healthCheckData = {
        title: values.title,
        description: values.description,
        date: dateString
      };

      console.log('Creating health check notice with data:', healthCheckData);

      // Use nurseApi instead of direct API call
      await nurseApi.createHealthCheckNotice(healthCheckData);
      
      message.success('Tạo thông báo kiểm tra sức khỏe thành công');
      setCreateModalVisible(false);
      form.resetFields();
      fetchNotices();
    } catch (error) {
      console.error('Error creating health check notice:', error);
      message.error('Không thể tạo thông báo kiểm tra sức khỏe');
    } finally {
      setLoading(false);
    }
  };

  // Handle view confirmations
  const handleViewConfirmations = (notice) => {
    setSelectedNotice(notice);
    fetchConfirmations(notice.id);
    setConfirmationsModalVisible(true);
    console.log('Viewing confirmations for notice:', notice);
  };

  // Handle submitting health check result
  const handleSubmitResult = async (values) => {
    setLoading(true);
    try {
      // Get current date in YYYY-MM-DD format
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      
      // Get studentId from the selected student
      const studentId = selectedStudent.studentId || selectedStudent.accountId;
      
      // Debug localStorage contents
      console.log('All localStorage keys:', Object.keys(localStorage));
      console.log('localStorage contents:', Object.keys(localStorage).reduce((acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      }, {}));
      
      // Get nurseId (accountId) from userInfo in localStorage
      const userInfoStr = localStorage.getItem('userInfo');
      console.log('Raw userInfo from localStorage:', userInfoStr);
      
      let nurseId = '';
      let userInfo = null;
      
      if (userInfoStr) {
        try {
          userInfo = JSON.parse(userInfoStr);
          console.log('Parsed userInfo:', userInfo);
          
          // Try to get accountId from different possible locations
          nurseId = userInfo.accountId;
          
          if (!nurseId && userInfo.user) {
            nurseId = userInfo.user.accountId;
          }
          
          console.log('Retrieved nurseId from userInfo:', nurseId);
        } catch (e) {
          console.error('Error parsing userInfo from localStorage:', e);
        }
      }
      
      // Fallback: try to get from other localStorage keys if not found in userInfo
      if (!nurseId) {
        const possibleKeys = ['accountId', 'userId', 'user_id', 'id'];
        for (const key of possibleKeys) {
          const value = localStorage.getItem(key);
          if (value) {
            nurseId = value;
            console.log(`Found nurseId in localStorage key "${key}":`, nurseId);
            break;
          }
        }
      }
      
      // Final fallback: check if there's a user object
      if (!nurseId) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            nurseId = user.accountId || user.id || user.userId;
            console.log('Retrieved nurseId from user object:', nurseId);
          } catch (e) {
            console.error('Error parsing user object from localStorage:', e);
          }
        }
      }
      
      console.log('Final nurseId to be used:', nurseId);
      
      if (!studentId) {
        throw new Error('Không tìm thấy ID học sinh');
      }
      
      if (!nurseId) {
        throw new Error('Không tìm thấy accountId trong userInfo. Vui lòng đăng nhập lại.');
      }
      
      // Validate selectedNotice
      if (!selectedNotice || !selectedNotice.id) {
        throw new Error('Không tìm thấy thông tin thông báo kiểm tra sức khỏe');
      }
      
      // Step 1: Prepare and submit health check result to first API
      // http://localhost:8080/api/v1/health-check-records/create?studentId={studentId}&nurseId={accountId}
      const healthCheckResult = {
        healthCheckNoticeId: selectedNotice.id,
        result: values.result,
        date: dateString
      };

      console.log('Submitting health check result:', healthCheckResult);
      console.log('Student ID:', studentId);
      console.log('Nurse ID:', nurseId);
      console.log('Selected Notice:', selectedNotice);

      try {
        // Submit health check result
        const healthCheckResponse = await nurseApi.submitHealthCheckResult(studentId, nurseId, healthCheckResult);
        console.log('Health check result submitted successfully:', healthCheckResponse);
        
        // Step 2: Create medical profile with second API
        try {
          // http://localhost:8080/api/medicalProfiles/create/{studentId}/{recordId}
          // Map form values to medical profile data structure
          const medicalProfileData = {
            allergies: values.allergies || "Không có",
            chronicDiseases: values.chronicDiseases || "Không có",
            hearingStatus: values.hearingStatus || "Bình thường",
            immunizationStatus: values.immunizationStatus || "Đầy đủ",
            pastTreatments: values.recommendations || "Không có",
            visionStatusLeft: values.visionStatusLeft || values.leftEye || "Bình thường",
            visionStatusRight: values.visionStatusRight || values.rightEye || "Bình thường"
          };
          
          console.log('Creating medical profile with data:', medicalProfileData);
          console.log('Student ID for medical profile:', studentId);
          
          // Create medical profile - don't pass recordId parameter
          await nurseApi.createMedicalProfile(studentId, medicalProfileData);
          console.log('Medical profile created successfully');
          
          message.success('Cập nhật kết quả kiểm tra sức khỏe thành công');
          setResultModalVisible(false);
          resultForm.resetFields();
          
          // Refresh confirmations to show updated status
          fetchConfirmations(selectedNotice.id);
        } catch (medicalProfileError) {
          console.error('Error creating medical profile:', medicalProfileError);
          message.warning('Kết quả kiểm tra sức khỏe đã được lưu, nhưng không thể tạo hồ sơ y tế: ' + (medicalProfileError.message || ''));
        }
      } catch (healthCheckError) {
        console.error('Error submitting health check result:', healthCheckError);
        message.error('Không thể lưu kết quả kiểm tra sức khỏe: ' + (healthCheckError.message || ''));
        
        // Try to create medical profile anyway
        try {
          const medicalProfileData = {
            allergies: values.allergies || "Không có",
            chronicDiseases: values.chronicDiseases || "Không có",
            hearingStatus: values.hearingStatus || "Bình thường",
            immunizationStatus: values.immunizationStatus || "Đầy đủ",
            pastTreatments: values.recommendations || "Không có",
            visionStatusLeft: values.visionStatusLeft || "Bình thường",
            visionStatusRight: values.visionStatusRight || "Bình thường"
          };
          
          await nurseApi.createMedicalProfile(studentId, medicalProfileData);
          message.warning('Không thể lưu kết quả kiểm tra sức khỏe, nhưng hồ sơ y tế đã được tạo thành công');
        } catch (medicalProfileError) {
          console.error('Error creating medical profile after health check error:', medicalProfileError);
        }
      }
    } catch (error) {
      console.error('Error in handleSubmitResult:', error);
      message.error('Không thể xử lý yêu cầu: ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  // Handle recording a result for a student
  const handleRecordResult = (confirmation) => {
    // Find the student information from the students array
    const student = students.find(s => s.accountId === confirmation.studentId);
    if (student) {
      setSelectedStudent({
        ...student,
        studentId: confirmation.studentId // Ensure studentId is set correctly
      });
      setResultModalVisible(true);
    } else {
      message.error('Không tìm thấy thông tin học sinh');
    }
  };

  // Fetch health check records for a specific student
  const fetchStudentHealthRecords = async (studentId) => {
    if (!studentId) return;
    
    setStudentRecordsLoading(true);
    setMedicalProfilesLoading(true);
    
    try {
      // Fetch health check records
      const response = await nurseApi.getStudentHealthCheckHistory(studentId);
      
      // The response format might be { time_stamp, data: [...records] }
      const recordsData = response.data || [];
      
      // Format the records data
      const formattedRecords = Array.isArray(recordsData) ? recordsData.map(record => ({
        key: record.recordId.toString(),
        recordId: record.recordId,
        studentId: record.studentId,
        nurseId: record.nurseId,
        healthCheckNoticeId: record.healthCheckNoticeId,
        result: record.result,
        // Format the date from array [year, month, day] to string for display
        date: Array.isArray(record.date) ? 
          `${record.date[0]}-${record.date[1].toString().padStart(2, '0')}-${record.date[2].toString().padStart(2, '0')}` : 
          (record.date || 'N/A'),
        // Include any additional details if available
        details: record.details || {}
      })) : [];
      
      setStudentHealthRecords(formattedRecords);
      console.log('Fetched student health records:', formattedRecords);
      
      if (formattedRecords.length === 0) {
        message.info('Không có dữ liệu kiểm tra sức khỏe cho học sinh này');
      }
    } catch (error) {
      console.error(`Error fetching health records for student ID ${studentId}:`, error);
      message.error('Không thể lấy lịch sử kiểm tra sức khỏe của học sinh');
      setStudentHealthRecords([]);
    } finally {
      setStudentRecordsLoading(false);
    }
    
    // Fetch medical profiles separately
    try {
      const profiles = await nurseApi.getStudentMedicalProfiles(studentId);
      setMedicalProfiles(profiles);
      console.log('Fetched student medical profiles:', profiles);
    } catch (error) {
      console.error(`Error fetching medical profiles for student ID ${studentId}:`, error);
      message.error('Không thể lấy hồ sơ sức khỏe của học sinh');
      setMedicalProfiles([]);
    } finally {
      setMedicalProfilesLoading(false);
    }
  };
  
  // Handle student search and selection
  const handleStudentSearch = (value) => {
    setSearchValue(value);
    
    // Filter options based on search value
    if (value) {
      const filteredOptions = students
        .filter(student => 
          student.fullName.toLowerCase().includes(value.toLowerCase()) || 
          (student.classId && student.classId.toLowerCase().includes(value.toLowerCase()))
        )
        .map(student => ({
          value: student.accountId,
          label: `${student.fullName} - ${student.classId || 'N/A'}`
        }));
      setSearchOptions(filteredOptions);
    } else {
      // Reset to all options if search value is empty
      const allOptions = students.map(student => ({
        value: student.accountId,
        label: `${student.fullName} - ${student.classId || 'N/A'}`
      }));
      setSearchOptions(allOptions);
    }
  };

  const handleStudentSelect = (value) => {
    // Find the selected student
    const student = students.find(s => s.accountId === value);
    if (student) {
      setSelectedStudent(student);
      fetchStudentHealthRecords(value);
    }
  };

  // Handle clearing selected student and search
  const handleClearSearch = () => {
    setSearchValue('');
    setSelectedStudent(null);
    setStudentHealthRecords([]);
    setMedicalProfiles([]);
    // Reset search options to all students
    const allOptions = students.map(student => ({
      value: student.accountId,
      label: `${student.fullName} - ${student.classId || 'N/A'}`
    }));
    setSearchOptions(allOptions);
  };

  // Columns for notices table
  const noticesColumns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Ngày kiểm tra',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => handleViewConfirmations(record)}
        >
          Xem xác nhận
        </Button>
      ),
    },
  ];

  // Columns for confirmations table
  const confirmationsColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let text = '';
        let icon = null;
        
        switch (status) {
          case 'CONFIRMED':
            color = 'green';
            text = 'Đã xác nhận';
            icon = <CheckCircleOutlined />;
            break;
          case 'DECLINED':
            color = 'red';
            text = 'Đã từ chối';
            icon = <CloseCircleOutlined />;
            break;
          case 'PENDING':
          default:
            color = 'gold';
            text = 'Chưa xác nhận';
            icon = <QuestionCircleOutlined />;
            break;
        }
        
        return <Tag icon={icon} color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Ngày xác nhận',
      dataIndex: 'confirmed_at',
      key: 'confirmed_at',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => handleRecordResult(record)}
          disabled={record.status !== 'CONFIRMED'}
        >
          Nhập kết quả
        </Button>
      ),
    },
  ];

  // Columns for student health records table
  const studentHealthRecordsColumns = [
    {
      title: 'Ngày kiểm tra',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Kết quả',
      dataIndex: 'result',
      key: 'result',
      render: (result) => {
        let color = '';
        let text = result;
        
        switch (result) {
          case 'nomal':
            color = 'green';
            text = 'Khỏe mạnh';
            break;
          case 'NEEDS_ATTENTION':
            color = 'gold';
            text = 'Cần theo dõi';
            break;
          case 'NEEDS_TREATMENT':
            color = 'red';
            text = 'Cần điều trị';
            break;
          default:
            color = 'default';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Chiều cao (cm)',
      key: 'height',
      render: (_, record) => record.details?.height || 'N/A',
    },
    {
      title: 'Cân nặng (kg)',
      key: 'weight',
      render: (_, record) => record.details?.weight || 'N/A',
    },
    {
      title: 'BMI',
      key: 'bmi',
      render: (_, record) => {
        if (record.details?.height && record.details?.weight) {
          const height = record.details.height / 100; // convert cm to m
          const weight = record.details.weight;
          const bmi = (weight / (height * height)).toFixed(1);
          return bmi;
        }
        return 'N/A';
      },
    },
    {
      title: 'Thị lực (T/P)',
      key: 'vision',
      render: (_, record) => {
        const leftEye = record.details?.leftEye || 'N/A';
        const rightEye = record.details?.rightEye || 'N/A';
        return `${leftEye} / ${rightEye}`;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => showRecordDetailModal(record)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Show detailed record modal
  const showRecordDetailModal = (record) => {
    setSelectedRecord(record);
    setRecordDetailVisible(true);
  };

  // Render medical profile card
  const renderMedicalProfileCard = (profile) => {
    return (
      <Card 
        key={profile.medicalProfileId} 
        title={
          <div className="medical-profile-header">
            <MedicineBoxOutlined style={{ marginRight: 8 }} />
            {`Hồ sơ sức khỏe #${profile.medicalProfileId}`}
            <Badge 
              className="profile-date-badge"
              count={profile.lastUpdated} 
              style={{ backgroundColor: '#52c41a' }} 
            />
          </div>
        }
        className="medical-profile-card"
      >
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="Dị ứng">
            {profile.allergies === 'nomal' ? 'Không có' : profile.allergies}
          </Descriptions.Item>
          <Descriptions.Item label="Bệnh mãn tính">
            {profile.chronicDiseases === 'nomal' ? 'Không có' : profile.chronicDiseases}
          </Descriptions.Item>
          <Descriptions.Item label="Thính lực">
            {profile.hearingStatus === 'nomal' ? 'Bình thường' : profile.hearingStatus}
          </Descriptions.Item>
          <Descriptions.Item label="Tình trạng tiêm chủng">
            <Tag color={profile.immunizationStatus === 'Complete' ? 'green' : 'orange'}>
              {profile.immunizationStatus === 'Complete' ? 'Đầy đủ' : 
               profile.immunizationStatus === 'nomal' ? 'Bình thường' : profile.immunizationStatus}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Điều trị trước đây">
            {profile.pastTreatments === 'nomal' ? 'Không có' : profile.pastTreatments}
          </Descriptions.Item>
          <Descriptions.Item label="Thị lực (Trái/Phải)">
            {profile.visionStatusLeft === 'nomal' ? 'Bình thường' : profile.visionStatusLeft} / 
            {profile.visionStatusRight === 'nomal' ? 'Bình thường' : profile.visionStatusRight}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };

  return (
    <div className="health-checks">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Quản lý kiểm tra sức khỏe" key="1">
          <div className="staff-table-header">
            <Title level={4}>Danh sách thông báo kiểm tra sức khỏe</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setCreateModalVisible(true)}
            >
              Tạo thông báo mới
            </Button>
          </div>

          <Table 
            columns={noticesColumns} 
            dataSource={notices} 
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </TabPane>
        
        <TabPane tab="Lịch sử kiểm tra sức khỏe học sinh" key="2">
          <div className="student-health-records">
            <div className="search-container">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={12} lg={10} xl={8}>
                  <AutoComplete
                    style={{ width: '100%' }}
                    options={searchOptions}
                    onSelect={handleStudentSelect}
                    onSearch={handleStudentSearch}
                    placeholder=""
                    value={searchValue}
                    notFoundContent={studentsLoading ? <Spin size="small" /> : "Không tìm thấy học sinh"}
                    allowClear
                    onClear={handleClearSearch}
                  >
                    <Input.Search 
                      size="large" 
                      enterButton={<SearchOutlined />} 
                      placeholder=""
                      onSearch={(value) => {
                        if (value && searchOptions.length > 0) {
                          handleStudentSelect(searchOptions[0].value);
                        }
                      }}
                      loading={studentsLoading}
                    />
                  </AutoComplete>
                </Col>
                
                {selectedStudent && (
                  <Col xs={24} sm={24} md={12} lg={14} xl={16}>
                    <div className="selected-student-info">
                      <Text strong style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
                        <UserOutlined style={{ marginRight: 8 }} /> 
                        {selectedStudent.fullName} - Lớp {selectedStudent.classId || 'N/A'}
                      </Text>
                      <Button 
                        type="text" 
                        icon={<CloseCircleOutlined />} 
                        onClick={handleClearSearch}
                        size="small"
                      >
                        Xóa
                      </Button>
                    </div>
                  </Col>
                )}
              </Row>
            </div>
            
            <div className="records-container">
              {(studentRecordsLoading || medicalProfilesLoading) ? (
                <div className="loading-container" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>Đang tải dữ liệu...</div>
                </div>
              ) : selectedStudent ? (
                <div>
                  {/* Medical Profiles Section */}
                  <div className="medical-profiles-section">
                    <Title level={4}>
                      <FileTextOutlined /> Hồ sơ sức khỏe
                    </Title>
                    
                    {medicalProfiles.length > 0 ? (
                      <div className="medical-profiles-list">
                        {medicalProfiles.map(profile => renderMedicalProfileCard(profile))}
                      </div>
                    ) : (
                      <Empty 
                        description="Không có hồ sơ sức khỏe cho học sinh này" 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                  
                  {/* Health Check Records Section */}
                  <div className="health-check-records-section" style={{ marginTop: 24 }}>
                    <Title level={4}>
                      <MedicineBoxOutlined /> Lịch sử kiểm tra sức khỏe
                    </Title>
                    
                    {studentHealthRecords.length > 0 ? (
                      <Table 
                        columns={studentHealthRecordsColumns} 
                        dataSource={studentHealthRecords} 
                        pagination={{ pageSize: 10 }}
                      />
                    ) : (
                      <Empty 
                        description="Không có dữ liệu kiểm tra sức khỏe cho học sinh này" 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <Empty 
                  description="Vui lòng chọn một học sinh để xem lịch sử kiểm tra sức khỏe" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </div>
        </TabPane>
      </Tabs>

      {/* Modal tạo thông báo kiểm tra sức khỏe mới */}
      <Modal
        title="Tạo thông báo kiểm tra sức khỏe mới"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateNotice}
          initialValues={{
            title: '',
            description: '',
            date: null
          }}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tiêu đề thông báo" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea rows={4} placeholder="Nhập mô tả chi tiết về đợt kiểm tra sức khỏe" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày kiểm tra"
            rules={[{ required: true, message: 'Vui lòng chọn ngày kiểm tra!' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              placeholder="Chọn ngày kiểm tra" 
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item>
            <Row justify="end" gutter={8}>
              <Col>
                <Button onClick={() => setCreateModalVisible(false)}>
                  Hủy
                </Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Tạo thông báo
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem xác nhận kiểm tra sức khỏe */}
      <Modal
        title={`Danh sách xác nhận - ${selectedNotice?.title || ''}`}
        open={confirmationsModalVisible}
        onCancel={() => setConfirmationsModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setConfirmationsModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        <div className="confirmation-stats">
          <div className="stat-card confirmed">
            <div className="stat-number">
              {confirmations.filter(c => c.status === 'CONFIRMED').length}
            </div>
            <div className="stat-label">Đã xác nhận</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">
              {confirmations.filter(c => c.status === 'PENDING').length}
            </div>
            <div className="stat-label">Chưa xác nhận</div>
          </div>
          <div className="stat-card declined">
            <div className="stat-number">
              {confirmations.filter(c => c.status === 'DECLINED').length}
            </div>
            <div className="stat-label">Đã từ chối</div>
          </div>
        </div>
        
        <Table 
          columns={confirmationsColumns} 
          dataSource={confirmations} 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Modal>

      {/* Modal nhập kết quả kiểm tra sức khỏe */}
      <Modal
        title={`Nhập kết quả kiểm tra sức khỏe - ${selectedStudent?.fullName || ''}`}
        open={resultModalVisible}
        onCancel={() => setResultModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={resultForm}
          layout="vertical"
          onFinish={handleSubmitResult}
        >
          {/* Thông tin kết quả kiểm tra sức khỏe cơ bản - API 1 */}
          <Card title="Kết quả kiểm tra sức khỏe" className="form-card">
            <Form.Item
              name="result"
              label={<><span className="required-field">*</span> Kết quả tổng quát</>}
              rules={[{ required: true, message: 'Vui lòng chọn kết quả tổng quát!' }]}
            >
              <Select placeholder="Chọn kết quả tổng quát">
                <Option value="nomal">Khỏe mạnh</Option>
                <Option value="NEEDS_ATTENTION">Cần theo dõi</Option>
                <Option value="NEEDS_TREATMENT">Cần điều trị</Option>
              </Select>
            </Form.Item>
          </Card>

          {/* Thông tin hồ sơ y tế - API 2 */}
          <Card title="Hồ sơ y tế" className="form-card" style={{ marginTop: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="visionStatusLeft"
                  label={<><span className="required-field">*</span> Thị lực mắt trái</>}
                  rules={[{ required: true, message: 'Vui lòng nhập thị lực mắt trái!' }]}
                >
                  <Input placeholder="Nhập thị lực mắt trái (vd: 10/10)" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="visionStatusRight"
                  label={<><span className="required-field">*</span> Thị lực mắt phải</>}
                  rules={[{ required: true, message: 'Vui lòng nhập thị lực mắt phải!' }]}
                >
                  <Input placeholder="Nhập thị lực mắt phải (vd: 10/10)" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="hearingStatus"
                  label={<><span className="required-field">*</span> Tình trạng thính giác</>}
                  rules={[{ required: true, message: 'Vui lòng chọn tình trạng thính giác!' }]}
                >
                  <Select placeholder="Chọn tình trạng thính giác">
                    <Option value="Bình thường">Bình thường</Option>
                    <Option value="Giảm thính lực nhẹ">Giảm thính lực nhẹ</Option>
                    <Option value="Giảm thính lực nặng">Giảm thính lực nặng</Option>
                    <Option value="Cần điều trị">Cần điều trị</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="immunizationStatus"
                  label={<><span className="required-field">*</span> Tình trạng tiêm chủng</>}
                  rules={[{ required: true, message: 'Vui lòng chọn tình trạng tiêm chủng!' }]}
                >
                  <Select placeholder="Chọn tình trạng tiêm chủng">
                    <Option value="Đầy đủ">Đầy đủ</Option>
                    <Option value="Chưa đầy đủ">Chưa đầy đủ</Option>
                    <Option value="Cần cập nhật">Cần cập nhật</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="allergies"
              label="Dị ứng"
            >
              <TextArea rows={2} placeholder="Nhập thông tin về dị ứng (nếu có)" />
            </Form.Item>

            <Form.Item
              name="chronicDiseases"
              label="Bệnh mãn tính"
            >
              <TextArea rows={2} placeholder="Nhập thông tin về bệnh mãn tính (nếu có)" />
            </Form.Item>
            
            <Form.Item
              name="recommendations"
              label="Điều trị trước đây"
            >
              <TextArea rows={3} placeholder="Nhập thông tin về điều trị trước đây (nếu có)" />
            </Form.Item>
          </Card>

          {/* Thông tin bổ sung - sẽ được lưu trong pastTreatments */}
          {/* <Card title="Thông tin chi tiết" className="form-card" style={{ marginTop: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="height"
                  label={<><span className="required-field">*</span> Chiều cao (cm)</>}
                  rules={[{ required: true, message: 'Vui lòng nhập chiều cao!' }]}
                >
                  <Input type="number" placeholder="Nhập chiều cao (cm)" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="weight"
                  label={<><span className="required-field">*</span> Cân nặng (kg)</>}
                  rules={[{ required: true, message: 'Vui lòng nhập cân nặng!' }]}
                >
                  <Input type="number" placeholder="Nhập cân nặng (kg)" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="bloodPressure"
              label={<><span className="required-field">*</span> Huyết áp</>}
              rules={[{ required: true, message: 'Vui lòng nhập huyết áp!' }]}
            >
              <Input placeholder="Nhập huyết áp (vd: 120/80)" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="dentalStatus"
                  label={<><span className="required-field">*</span> Tình trạng răng miệng</>}
                  rules={[{ required: true, message: 'Vui lòng chọn tình trạng răng miệng!' }]}
                >
                  <Select placeholder="Chọn tình trạng răng miệng">
                    <Option value="Tốt">Tốt</Option>
                    <Option value="Sâu răng nhẹ">Sâu răng nhẹ</Option>
                    <Option value="Sâu răng nặng">Sâu răng nặng</Option>
                    <Option value="Cần điều trị">Cần điều trị</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="generalHealth"
                  label={<><span className="required-field">*</span> Tình trạng sức khỏe tổng quát</>}
                  rules={[{ required: true, message: 'Vui lòng chọn tình trạng sức khỏe tổng quát!' }]}
                >
                  <Select placeholder="Chọn tình trạng sức khỏe tổng quát">
                    <Option value="Tốt">Tốt</Option>
                    <Option value="Trung bình">Trung bình</Option>
                    <Option value="Cần theo dõi">Cần theo dõi</Option>
                    <Option value="Cần điều trị">Cần điều trị</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="recommendations"
              label="Khuyến nghị"
            >
              <TextArea rows={4} placeholder="Nhập khuyến nghị cho học sinh" />
            </Form.Item>
          </Card> */}

          <Form.Item style={{ marginTop: '16px' }}>
            <Row justify="end" gutter={8}>
              <Col>
                <Button onClick={() => setResultModalVisible(false)}>
                  Hủy
                </Button>
              </Col>
              <Col>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Lưu kết quả
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem chi tiết kết quả kiểm tra sức khỏe */}
      <Modal
        title={`Chi tiết kết quả kiểm tra sức khỏe`}
        open={recordDetailVisible}
        onCancel={() => setRecordDetailVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setRecordDetailVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedRecord && (
          <div className="health-record-details">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Thông tin chung" className="detail-card">
                  <p><strong>Ngày kiểm tra:</strong> {selectedRecord.date}</p>
                  <p><strong>Kết quả tổng quát:</strong> {
                    selectedRecord.result === 'nomal' ? 'Khỏe mạnh' : 
                    selectedRecord.result === 'NEEDS_ATTENTION' ? 'Cần theo dõi' : 
                    selectedRecord.result === 'NEEDS_TREATMENT' ? 'Cần điều trị' : 
                    selectedRecord.result
                  }</p>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title="Chỉ số cơ thể" className="detail-card">
                  <p><strong>Chiều cao:</strong> {selectedRecord.details?.height || 'N/A'} cm</p>
                  <p><strong>Cân nặng:</strong> {selectedRecord.details?.weight || 'N/A'} kg</p>
                  <p><strong>BMI:</strong> {
                    selectedRecord.details?.height && selectedRecord.details?.weight ? 
                    (selectedRecord.details.weight / ((selectedRecord.details.height / 100) ** 2)).toFixed(1) : 
                    'N/A'
                  }</p>
                  <p><strong>Huyết áp:</strong> {selectedRecord.details?.bloodPressure || 'N/A'}</p>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title="Thị lực & Răng miệng" className="detail-card">
                  <p><strong>Thị lực mắt trái:</strong> {selectedRecord.details?.leftEye || 'N/A'}</p>
                  <p><strong>Thị lực mắt phải:</strong> {selectedRecord.details?.rightEye || 'N/A'}</p>
                  <p><strong>Tình trạng răng miệng:</strong> {selectedRecord.details?.dentalStatus || 'N/A'}</p>
                  <p><strong>Sức khỏe tổng quát:</strong> {selectedRecord.details?.generalHealth || 'N/A'}</p>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="Khuyến nghị" className="detail-card">
                  <p>{selectedRecord.details?.recommendations || 'Không có khuyến nghị'}</p>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HealthChecks; 