import React, { useState, useEffect } from 'react';
import { Table, Button, Tabs, Modal, Form, Input, DatePicker, Select, message, Typography, Row, Col, Tag, Tooltip, Card, Empty, Spin, AutoComplete, Collapse, Descriptions, Badge, Statistic } from 'antd';
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
  const [studentRecordsLoading, setStudentRecordsLoading] = useState(false);

  // Add new state variables for record details
  const [recordDetailVisible, setRecordDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Add new state for health snapshots
  const [healthSnapshots, setHealthSnapshots] = useState([]);
  const [healthCheckRecords, setHealthCheckRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalSnapshots, setTotalSnapshots] = useState(0);

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
      
      // Sort notices by ID (largest to smallest)
      const sortedNotices = formattedNotices.sort((a, b) => b.id - a.id);
      
      setNotices(sortedNotices);
      console.log('Fetched and sorted health check notices by ID (desc):', sortedNotices);
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
      
      // Lấy danh sách studentId từ các xác nhận
      const studentIds = confirmationsData.map(confirmation => confirmation.studentId).filter(id => id);
      console.log('Student IDs from confirmations:', studentIds);
      
      // Lấy thông tin chi tiết của học sinh từ API mới
      const studentsData = await nurseApi.getStudentsByIds(studentIds);
      console.log('Students data:', studentsData);
      
      // Tạo map học sinh theo ID để dễ dàng truy cập
      const studentsMap = {};
      studentsData.forEach(student => {
        studentsMap[student.accountId] = student;
      });
      
      const formattedConfirmations = confirmationsData.map(confirmation => {
        // Lấy thông tin học sinh từ map nếu có
        const student = studentsMap[confirmation.studentId] || {};
        
        // Normalize status to uppercase and handle any inconsistent values
        let normalizedStatus = (confirmation.status || 'PENDING').toUpperCase();
        if (normalizedStatus === 'DECLINED' || normalizedStatus === 'CANCELED') {
          normalizedStatus = 'CANCELLED';
        } else if (normalizedStatus === 'CONFIRM') {
          normalizedStatus = 'CONFIRMED';
        } else if (normalizedStatus !== 'CONFIRMED' && normalizedStatus !== 'CANCELLED' && normalizedStatus !== 'PENDING') {
          normalizedStatus = 'PENDING';
        }
        
        return {
          ...confirmation,
          key: confirmation.confirmationId.toString(),
          id: confirmation.confirmationId,
          studentId: confirmation.studentId,
          studentName: student.fullName || confirmation.studentName || 'Không xác định',
          className: student.classId || confirmation.className || 'Không xác định',
          status: normalizedStatus,
          // Format confirmed_at from array if it exists
          confirmed_at: Array.isArray(confirmation.confirmedAt) ? 
            `${confirmation.confirmedAt[0]}-${confirmation.confirmedAt[1].toString().padStart(2, '0')}-${confirmation.confirmedAt[2].toString().padStart(2, '0')}` : 
            (confirmation.confirmedAt || 'N/A')
        };
      });
      
      // Sort confirmations: CONFIRMED first, then PENDING, then CANCELLED
      const sortedConfirmations = formattedConfirmations.sort((a, b) => {
        // Priority order: CONFIRMED (1), PENDING (2), CANCELLED (3)
        const priorityMap = {
          'CONFIRMED': 1,
          'PENDING': 2,
          'CANCELLED': 3
        };
        
        return priorityMap[a.status] - priorityMap[b.status];
      });
      
      setConfirmations(sortedConfirmations);
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
      ].sort((a, b) => {
        // Apply the same sorting logic to mock data
        const priorityMap = {
          'CONFIRMED': 1,
          'PENDING': 2,
          'CANCELLED': 3,
          'DECLINED': 3 // DECLINED has same priority as CANCELLED
        };
        
        return priorityMap[a.status] - priorityMap[b.status];
      }));
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
        date: dateString,
        priority: values.priority,
        grade: values.grade
      };

      console.log('Creating health check notice with data:', healthCheckData);

      // Use direct API call with axiosInstance for the new endpoint
      const response = await nurseApi.createHealthCheckNotice(healthCheckData);
      console.log('Health check notice created:', response);
      
      // Show success message
      message.success('Tạo thông báo kiểm tra sức khỏe thành công!');
      
      // Close modal and refresh notices list
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
      // Get current date in YYYY-MM-DD format (exact format the API expects)
      const today = new Date();
      // Manually format the date to ensure compatibility with API expectations
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
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
      // Exact order matters for the API to process correctly: healthCheckNoticeId, result, date
      const healthCheckResult = {};
      
      // Add properties in specific order for consistent serialization
      healthCheckResult.healthCheckNoticeId = selectedNotice.id;
      healthCheckResult.result = values.result;
      healthCheckResult.date = dateString;

      console.log('Submitting health check result:', healthCheckResult);
      console.log('Student ID:', studentId);
      console.log('Nurse ID:', nurseId);
      console.log('Selected Notice:', selectedNotice);

      try {
        // Submit health check result with 2 retries if needed
        let healthCheckResponse;
        let retries = 0;
        const maxRetries = 2;
        
        while (retries <= maxRetries) {
          try {
            healthCheckResponse = await nurseApi.submitHealthCheckResult(studentId, nurseId, healthCheckResult);
            console.log('Health check result submitted successfully:', healthCheckResponse);
            // Success, break out of retry loop
            break;
          } catch (err) {
            retries++;
            if (retries <= maxRetries) {
              console.log(`Retry attempt ${retries} of ${maxRetries}...`);
              // Wait briefly before retrying (500ms)
              await new Promise(resolve => setTimeout(resolve, 500));
            } else {
              // Exhausted retries, rethrow
              throw err;
            }
          }
        }
        
        // Step 2: Update basic health data with the new API
        try {
          // Prepare the request body according to the API requirements
          const basicHealthData = {
            studentId: studentId,
            heightCm: values.heightCm || 150,
            weightKg: values.weightKg || 50,
            visionLeft: values.visionStatusLeft || "10/10",
            visionRight: values.visionStatusRight || "10/10",
            hearingStatus: values.hearingStatus?.toLowerCase() || "normal",
            gender: values.gender || "male",
            bloodType: values.bloodType || "A"
          };
          
          console.log('Updating basic health data with:', basicHealthData);
          
          // Call the API to update basic health data
          await nurseApi.updateBasicHealthData(basicHealthData);
          console.log('Basic health data updated successfully');
          
          // Close the modal without showing a success message
          setResultModalVisible(false);
          resultForm.resetFields();
          
          // Refresh confirmations to show updated status
          fetchConfirmations(selectedNotice.id);
        } catch (basicHealthDataError) {
          console.error('Error updating basic health data:', basicHealthDataError);
          // Show warning for basic health data update failure
          console.error('Không thể cập nhật dữ liệu sức khỏe cơ bản:', basicHealthDataError.message || '');
          
          // Close the modal and refresh data anyway since health check was successful
          setResultModalVisible(false);
          resultForm.resetFields();
          fetchConfirmations(selectedNotice.id);
        }
      } catch (healthCheckError) {
        console.error('Error submitting health check result:', healthCheckError);
        
        // Enhanced error logging for better debugging
        if (healthCheckError.response) {
          console.error('Error response details:', {
            status: healthCheckError.response.status,
            data: healthCheckError.response.data,
            headers: healthCheckError.response.headers
          });
        } else {
          console.error('Error details:', healthCheckError.message || 'Unknown error');
        }
        
        // Try to update basic health data anyway
        try {
          const basicHealthData = {
            studentId: studentId,
            heightCm: values.heightCm || 150,
            weightKg: values.weightKg || 50,
            visionLeft: values.visionStatusLeft || "10/10",
            visionRight: values.visionStatusRight || "10/10",
            hearingStatus: values.hearingStatus?.toLowerCase() || "normal",
            gender: values.gender || "male",
            bloodType: values.bloodType || "A"
          };
          
          await nurseApi.updateBasicHealthData(basicHealthData);
          
          // Close the modal and refresh data since at least one operation succeeded
          setResultModalVisible(false);
          resultForm.resetFields();
          fetchConfirmations(selectedNotice.id);
        } catch (basicHealthDataError) {
          console.error('Error updating basic health data after health check error:', basicHealthDataError);
          // Both API calls failed, but we should still close the modal
          setResultModalVisible(false);
          resultForm.resetFields();
          
          // Try to refresh data anyway
          fetchConfirmations(selectedNotice.id);
        }
      }
    } catch (error) {
      console.error('Error in handleSubmitResult:', error);
      // Always close the modal and refresh data, even on general errors
      setResultModalVisible(false);
      resultForm.resetFields();
      fetchConfirmations(selectedNotice.id);
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

  // Fetch health check records and health snapshots for a specific student
  const fetchStudentHealthRecords = async (studentId) => {
    if (!studentId) return;
    
    setStudentRecordsLoading(true);
    
    // Fetch health snapshots
    try {
      // Fetch health snapshots using the API
      const response = await nurseApi.getStudentHealthSnapshots(studentId, currentPage, pageSize);
      
      // Get the content array from the response
      const snapshotsData = response.content || [];
      
      // Format snapshot data for the table
      const formattedSnapshots = snapshotsData.map(snapshot => {
        // Extract basic health data from the snapshot
        const basicHealthData = snapshot.medicalProfileData?.basicHealthData || {};
        
        // Format snapshot time
        let snapshotDate = 'N/A';
        if (Array.isArray(snapshot.snapshotTime) && snapshot.snapshotTime.length >= 3) {
          snapshotDate = `${snapshot.snapshotTime[0]}-${String(snapshot.snapshotTime[1]).padStart(2, '0')}-${String(snapshot.snapshotTime[2]).padStart(2, '0')}`;
        }
        
        // Format last measured date from basic health data
        let lastMeasuredDate = 'N/A';
        if (Array.isArray(basicHealthData.lastMeasured) && basicHealthData.lastMeasured.length >= 3) {
          lastMeasuredDate = `${basicHealthData.lastMeasured[0]}-${String(basicHealthData.lastMeasured[1]).padStart(2, '0')}-${String(basicHealthData.lastMeasured[2]).padStart(2, '0')}`;
        }
        
        return {
          key: snapshot.id.toString(),
          id: snapshot.id,
          medicalProfileId: snapshot.medicalProfileId,
          snapshotDate: snapshotDate,
          snapshotTime: snapshot.snapshotTime,
          heightCm: basicHealthData.heightCm || 'N/A',
          weightKg: basicHealthData.weightKg || 'N/A',
          bmi: basicHealthData.heightCm && basicHealthData.weightKg ? 
            (basicHealthData.weightKg / ((basicHealthData.heightCm / 100) * (basicHealthData.heightCm / 100))).toFixed(2) : 
            'N/A',
          visionLeft: basicHealthData.visionLeft || 'N/A',
          visionRight: basicHealthData.visionRight || 'N/A',
          hearingStatus: basicHealthData.hearingStatus || 'N/A',
          gender: basicHealthData.gender || 'N/A',
          bloodType: basicHealthData.bloodType || 'N/A',
          lastMeasuredDate: lastMeasuredDate,
          allergies: snapshot.medicalProfileData?.allergies || [],
          diseases: snapshot.medicalProfileData?.diseases || [],
          conditions: snapshot.medicalProfileData?.conditions || [],
          // Keep the entire snapshot for details view
          rawData: snapshot,
          basicHealthData: basicHealthData
        };
      });
      
      // Update state with formatted data
      setHealthSnapshots(formattedSnapshots);
      
      // Update pagination info
      setTotalSnapshots(response.totalElements || 0);
      
      console.log('Fetched student health snapshots:', formattedSnapshots);
      
      if (formattedSnapshots.length === 0) {
        message.info('Không có lịch sử sức khỏe cho học sinh này');
      }
    } catch (error) {
      console.error(`Error fetching health snapshots for student ID ${studentId}:`, error);
      message.error('Không thể lấy lịch sử sức khỏe của học sinh');
      setHealthSnapshots([]);
    } 
    
    // Fetch detailed health check records
    try {
      // Also fetch detailed health check records using the new API
      const healthCheckResponse = await nurseApi.getStudentHealthCheckHistory(studentId);
      console.log('Fetched student health check records:', healthCheckResponse);
      // Store the health check records data for access in the detail modal
      if (healthCheckResponse && healthCheckResponse.data) {
        setHealthCheckRecords(healthCheckResponse.data);
      } else {
        setHealthCheckRecords([]);
      }
    } catch (error) {
      console.error(`Error fetching health check records for student ID ${studentId}:`, error);
      setHealthCheckRecords([]);
    } finally {
      // Finish loading when both API calls are complete
      setStudentRecordsLoading(false);
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
    // Reset search options to all students
    const allOptions = students.map(student => ({
      value: student.accountId,
      label: `${student.fullName} - ${student.classId || 'N/A'}`
    }));
    setSearchOptions(allOptions);
  };

  // Columns for notices table
  const noticesColumns = [
    // {
    //   title: 'ID',
    //   dataIndex: 'id',
    //   key: 'id',
    //   sorter: (a, b) => b.id - a.id,
    //   sortDirections: ['descend', 'ascend'],
    //   defaultSortOrder: 'descend',
    //   width: 80,
    // },
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
      sorter: (a, b) => {
        // Priority order: CONFIRMED (1), PENDING (2), CANCELLED (3)
        const priorityMap = {
          'CONFIRMED': 1,
          'PENDING': 2,
          'CANCELLED': 3,
          'DECLINED': 3
        };
        
        return priorityMap[a.status] - priorityMap[b.status];
      },
      sortDirections: ['ascend', 'descend'],
      defaultSortOrder: 'ascend',
      filters: [
        { text: 'Đã xác nhận', value: 'CONFIRMED' },
        { text: 'Chưa xác nhận', value: 'PENDING' },
        { text: 'Đã từ chối', value: 'CANCELLED' },
      ],
      onFilter: (value, record) => record.status === value,
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
          case 'CANCELLED':
            color = 'red';
            text = 'Đã từ chối';
            icon = <CloseCircleOutlined />;
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

  // Show detailed record modal
  const showRecordDetailModal = (record) => {
    setSelectedRecord(record);
    
    // Find corresponding health check record by date
    if (healthCheckRecords && healthCheckRecords.length > 0) {
      const matchingRecord = healthCheckRecords.find(checkRecord => {
        // Format date from check record for comparison
        if (Array.isArray(checkRecord.date) && checkRecord.date.length >= 3) {
          const checkDate = `${checkRecord.date[0]}-${String(checkRecord.date[1]).padStart(2, '0')}-${String(checkRecord.date[2]).padStart(2, '0')}`;
          return checkDate === record.snapshotDate;
        }
        return false;
      });
      
      if (matchingRecord) {
        // If we found a matching health check record, update the selected record with its data
        setSelectedRecord(prev => ({
          ...prev,
          checkNoticeId: matchingRecord.checkNoticeId,
          recordId: matchingRecord.recordId,
          result: matchingRecord.results,
          recommendations: matchingRecord.recommendations,
          healthCheckDetails: matchingRecord
        }));
      }
    }
    
    setRecordDetailVisible(true);
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
            defaultSortField="id"
            defaultSortOrder="descend"
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
              {(studentRecordsLoading) ? (
                <div className="loading-container" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>Đang tải dữ liệu...</div>
                </div>
              ) : selectedStudent ? (
                <div>
                  {/* Health Check Records Section */}
                  <div className="health-check-records-section">
                    <Title level={4}>
                      <MedicineBoxOutlined /> Lịch sử kiểm tra sức khỏe
                    </Title>
                    
                    {healthSnapshots.length > 0 ? (
                      <Table 
                        columns={[
                          {
                            title: 'Ngày kiểm tra',
                            key: 'snapshotDate',
                            dataIndex: 'snapshotDate',
                          },
                          {
                            title: 'Kết quả',
                            key: 'result',
                            render: (_, record) => {
                              // Find the corresponding health check record to display its status
                              const matchingHealthCheckRecord = healthCheckRecords.find(
                                checkRecord => checkRecord.date && checkRecord.date.length >= 3 && 
                                `${checkRecord.date[0]}-${String(checkRecord.date[1]).padStart(2, '0')}-${String(checkRecord.date[2]).padStart(2, '0')}` === record.snapshotDate
                              );
                              return matchingHealthCheckRecord ? (
                                <Tag icon={<CheckCircleOutlined />} color="green">
                                  {matchingHealthCheckRecord.results === 'nomal' ? 'Khỏe mạnh' : 
                                   matchingHealthCheckRecord.results === 'NEEDS_ATTENTION' ? 'Cần theo dõi' : 
                                   matchingHealthCheckRecord.results === 'NEEDS_TREATMENT' ? 'Cần điều trị' : 
                                   matchingHealthCheckRecord.results || 'N/A'}
                                </Tag>
                              ) : (
                                <span>—</span>
                              );
                            }
                          },
                          {
                            title: 'Chiều cao (cm)',
                            key: 'height',
                            dataIndex: 'heightCm',
                          },
                          {
                            title: 'Cân nặng (kg)',
                            key: 'weight',
                            dataIndex: 'weightKg',
                          },
                          {
                            title: 'BMI',
                            key: 'bmi',
                            dataIndex: 'bmi',
                          },
                          {
                            title: 'Thị lực (T/P)',
                            key: 'vision',
                            render: (_, record) => {
                              const leftEye = record.visionLeft || 'N/A';
                              const rightEye = record.visionRight || 'N/A';
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
                        ]} 
                        dataSource={healthSnapshots} 
                        pagination={{ 
                          pageSize: pageSize, 
                          total: totalSnapshots, 
                          onChange: (page, pageSize) => {
                            setCurrentPage(page - 1);
                            setPageSize(pageSize || 20);
                            fetchStudentHealthRecords(selectedStudent.accountId);
                          }
                        }}
                      />
                    ) : (
                      <Empty 
                        description="Không có dữ liệu kiểm tra sức khỏe cho học sinh này" 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </div> */}
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
            date: null,
            priority: 'strong',
            grade: 1
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
          
          <Form.Item
            name="priority"
            label="Mức độ ưu tiên"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên!' }]}
          >
            <Select placeholder="Chọn mức độ ưu tiên">
              <Option value="strong">Cao</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="low">Thấp</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="grade"
            label="Khối lớp"
            rules={[{ required: true, message: 'Vui lòng chọn khối lớp!' }]}
          >
            <Select placeholder="Chọn khối lớp">
              <Option value={1}>Khối 1</Option>
              <Option value={2}>Khối 2</Option>
              <Option value={3}>Khối 3</Option>
              <Option value={4}>Khối 4</Option>
              <Option value={5}>Khối 5</Option>
              <Option value={6}>Khối 6</Option>
              <Option value={7}>Khối 7</Option>
              <Option value={8}>Khối 8</Option>
              <Option value={9}>Khối 9</Option>
              <Option value={10}>Khối 10</Option>
              <Option value={11}>Khối 11</Option>
              <Option value={12}>Khối 12</Option>
            </Select>
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

      {/* Modal displaying confirmations for a health check notice */}
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
            <div className="stat-icon">
              <CheckCircleOutlined />
            </div>
            <div className="stat-number">
              {confirmations.filter(c => c.status === 'CONFIRMED').length}
            </div>
            <div className="stat-label">Đã xác nhận</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">
              <QuestionCircleOutlined />
            </div>
            <div className="stat-number">
              {confirmations.filter(c => c.status === 'PENDING').length}
            </div>
            <div className="stat-label">Chưa xác nhận</div>
          </div>
          <div className="stat-card declined">
            <div className="stat-icon">
              <CloseCircleOutlined />
            </div>
            <div className="stat-number">
              {confirmations.filter(c => c.status === 'CANCELLED' || c.status === 'DECLINED').length}
            </div>
            <div className="stat-label">Đã từ chối</div>
          </div>
        </div>
        
        <Table
          columns={confirmationsColumns}
          dataSource={confirmations}
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowKey="key"
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
                  name="heightCm"
                  label={<><span className="required-field">*</span> Chiều cao (cm)</>}
                  rules={[{ required: true, message: 'Vui lòng nhập chiều cao!' }]}
                >
                  <Input type="number" placeholder="Nhập chiều cao (cm)" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="weightKg"
                  label={<><span className="required-field">*</span> Cân nặng (kg)</>}
                  rules={[{ required: true, message: 'Vui lòng nhập cân nặng!' }]}
                >
                  <Input type="number" placeholder="Nhập cân nặng (kg)" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="gender"
                  label={<><span className="required-field">*</span> Giới tính</>}
                  rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                  initialValue="male"
                >
                  <Select placeholder="Chọn giới tính">
                    <Option value="male">Nam</Option>
                    <Option value="female">Nữ</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="bloodType"
                  label={<><span className="required-field">*</span> Nhóm máu</>}
                  rules={[{ required: true, message: 'Vui lòng chọn nhóm máu!' }]}
                >
                  <Select placeholder="Chọn nhóm máu">
                    <Option value="A">A</Option>
                    <Option value="B">B</Option>
                    <Option value="AB">AB</Option>
                    <Option value="O">O</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

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
                    <Option value="normal">Bình thường</Option>
                    <Option value="mild">Giảm thính lực nhẹ</Option>
                    <Option value="severe">Giảm thính lực nặng</Option>
                    <Option value="treatment">Cần điều trị</Option>
                  </Select>
                </Form.Item>
              </Col>
              {/* <Col span={12}>
                <Form.Item
                  name="immunizationStatus"
                  label="Tình trạng tiêm chủng"
                >
                  <Select placeholder="Chọn tình trạng tiêm chủng">
                    <Option value="Đầy đủ">Đầy đủ</Option>
                    <Option value="Chưa đầy đủ">Chưa đầy đủ</Option>
                    <Option value="Cần cập nhật">Cần cập nhật</Option>
                  </Select>
                </Form.Item>
              </Col> */}
            </Row>

            {/* <Form.Item
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
            </Form.Item> */}
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
                  <p>
                    <strong>Ngày kiểm tra:</strong> {selectedRecord.snapshotDate}
                  </p>
                  {/* <p>
                    <strong>Ngày đo:</strong> {selectedRecord.lastMeasuredDate}
                  </p> */}
                  <p>
                    <strong>Kết quả tổng quát:</strong> {
                      selectedRecord.result === 'nomal' ? 'Khỏe mạnh' : 
                      selectedRecord.result === 'NEEDS_ATTENTION' ? 'Cần theo dõi' : 
                      selectedRecord.result === 'NEEDS_TREATMENT' ? 'Cần điều trị' : 
                      selectedRecord.result || 'N/A'
                    }
                  </p>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title="Chỉ số cơ thể" className="detail-card">
                  <p><strong>Chiều cao:</strong> {selectedRecord.heightCm} cm</p>
                  <p><strong>Cân nặng:</strong> {selectedRecord.weightKg} kg</p>
                  {/* <p><strong>BMI:</strong> {selectedRecord.bmi}</p> */}
                  <p><strong>Giới tính:</strong> {selectedRecord.gender === 'male' ? 'Nam' : selectedRecord.gender === 'female' ? 'Nữ' : selectedRecord.gender}</p>
                  <p><strong>Nhóm máu:</strong> {selectedRecord.bloodType}</p>
                  {/* <p><strong>Huyết áp:</strong> {selectedRecord.healthCheckDetails?.bloodPressure || 'N/A'}</p> */}
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title="Thị lực & Thính giác" className="detail-card">
                  <p><strong>Thị lực mắt trái:</strong> {selectedRecord.visionLeft}</p>
                  <p><strong>Thị lực mắt phải:</strong> {selectedRecord.visionRight}</p>
                  <p><strong>Thính giác:</strong> {
                    selectedRecord.hearingStatus === 'normal' ? 'Bình thường' : 
                    selectedRecord.hearingStatus === 'mild' ? 'Giảm thính lực nhẹ' : 
                    selectedRecord.hearingStatus === 'severe' ? 'Giảm thính lực nặng' :
                    selectedRecord.hearingStatus === 'treatment' ? 'Cần điều trị' :
                    selectedRecord.hearingStatus
                  }</p>
                  {/* <p><strong>Tình trạng răng miệng:</strong> {selectedRecord.healthCheckDetails?.dentalStatus || 'N/A'}</p>
                  <p><strong>Sức khỏe tổng quát:</strong> {selectedRecord.healthCheckDetails?.generalHealth || 'N/A'}</p> */}
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Tình trạng sức khỏe" className="detail-card">
                  {selectedRecord.conditions && selectedRecord.conditions.length > 0 ? (
                    <div>
                      <p><strong>Bệnh lý/Hội chứng:</strong></p>
                      <ul>
                        {selectedRecord.conditions.map((condition, index) => (
                          <li key={index}>
                            {condition.syndromeDisability?.name || 'N/A'}
                            {condition.note && <span> - Ghi chú: {condition.note}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>Không có bệnh lý/hội chứng</p>
                  )}
                  
                  {selectedRecord.diseases && selectedRecord.diseases.length > 0 ? (
                    <div style={{marginTop: 16}}>
                      <p><strong>Bệnh mãn tính:</strong></p>
                      <ul>
                        {selectedRecord.diseases.map((disease, index) => (
                          <li key={index}>{disease.disease?.name || 'N/A'}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p style={{marginTop: 16}}>Không có bệnh mãn tính</p>
                  )}
                  
                  {selectedRecord.allergies && selectedRecord.allergies.length > 0 ? (
                    <div style={{marginTop: 16}}>
                      <p><strong>Dị ứng:</strong></p>
                      <ul>
                        {selectedRecord.allergies.map((allergy, index) => (
                          <li key={index}>
                            {allergy.allergen?.name || 'N/A'} 
                            {allergy.reaction && <span> - Phản ứng: {allergy.reaction}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p style={{marginTop: 16}}>Không có dị ứng</p>
                  )}
                </Card>
              </Col>
              
              {/* <Col span={24}>
                <Card title="Khuyến nghị" className="detail-card">
                  <p>{selectedRecord.recommendations || 'Không có khuyến nghị'}</p>
                </Card>
              </Col> */}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HealthChecks; 