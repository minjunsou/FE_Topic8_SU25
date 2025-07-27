import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Select, Spin, Empty, message, Tag, Button, Modal, Descriptions, Avatar, Space, Divider, List, Badge, Alert, Tabs, Form, DatePicker, Input, Radio, Popconfirm } from 'antd';
import { MedicineBoxOutlined, FileTextOutlined, CheckCircleOutlined, UserOutlined, InfoCircleOutlined, PhoneOutlined, MailOutlined, AlertOutlined, ExperimentOutlined, HeartOutlined, CalendarOutlined } from '@ant-design/icons';
import { parentApi } from '../../api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useRef } from 'react';
import './UserProfile.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const HealthCheckHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const appointmentTabRef = useRef(null);
  // Lấy tab từ query param
  const getDefaultTab = () => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') === 'appointment' ? 'appointment' : 'health';
  };
  const [activeTab, setActiveTab] = useState(getDefaultTab());
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [healthCheckHistory, setHealthCheckHistory] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [nurseModalVisible, setNurseModalVisible] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [medicalProfile, setMedicalProfile] = useState(null);
  const [loadingMedicalProfile, setLoadingMedicalProfile] = useState(false);
  const [nurses, setNurses] = useState([]);
  const [parentId, setParentId] = useState(null);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [loadingAppointment, setLoadingAppointment] = useState(false);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState({ visible: false, record: null });
  // State cho modal xác nhận hủy lịch
  const [cancellingId, setCancellingId] = useState(null);
  const [cancellingLoading, setCancellingLoading] = useState(false);

  // Fetch children data on component mount
  useEffect(() => {
    fetchChildrenData();
    fetchNurses();
  }, []);
  
  // Fetch health check history when a child is selected
  useEffect(() => {
    if (selectedChild) {
      fetchHealthCheckHistory();
    }
  }, [selectedChild]);
  
  // Scroll đến tab lịch sử đặt lịch khám nếu có query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'appointment' && appointmentTabRef.current) {
      setTimeout(() => {
        appointmentTabRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [location.search]);
  
  // Fetch children data
  const fetchChildrenData = async () => {
    setLoading(true);
    try {
      // Get parent ID from localStorage using userInfo instead of auth
      const storedUserInfo = localStorage.getItem('userInfo');
      if (!storedUserInfo) {
        message.error('Không tìm thấy thông tin người dùng');
        setLoading(false);
        return;
      }
      
      const parsedUserInfo = JSON.parse(storedUserInfo);
      const userParentId = parsedUserInfo.accountId;
      setParentId(userParentId);
      
      if (!userParentId) {
        message.error('Không tìm thấy ID người dùng');
        setLoading(false);
        return;
      }
      
      console.log(`Đang gọi API để lấy danh sách con của phụ huynh ID: ${userParentId}`);
      
      // Get children list using the parentApi function
      const childrenData = await parentApi.getParentChildren(userParentId);
      console.log('API response children:', childrenData);
      
      if (childrenData && childrenData.length > 0) {
        // Format children data - handle different possible formats from API
        const formattedChildren = childrenData.map(child => ({
          id: child.childId || child.accountId || child.studentId,
          name: child.fullName || child.name || 'Học sinh',
          className: child.className || child.classId || 'N/A',
          gender: child.gender || 'male',
          dob: child.dob || []
        }));
        
        console.log('Formatted children data:', formattedChildren);
        setChildren(formattedChildren);
        
        // Select the first child by default
        if (formattedChildren.length > 0) {
          setSelectedChild(formattedChildren[0]);
        }
      } else {
        message.info('Không tìm thấy thông tin học sinh');
      }
    } catch (error) {
      console.error('Error fetching children data:', error);
      message.error('Không thể lấy danh sách học sinh. Vui lòng thử lại sau.');
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
      
      return nursesList;
    } catch (error) {
      console.error('Error fetching nurses:', error);
      message.error('Không thể lấy danh sách y tá');
      return [];
    }
  };
  
  // Fetch health check history
  const fetchHealthCheckHistory = async () => {
    if (!selectedChild) return;
    
    setLoading(true);
    try {
      // Get health check records
      console.log(`Đang gọi API để lấy lịch sử kiểm tra sức khỏe của học sinh ID: ${selectedChild.id}`);
      const healthCheckRecords = await parentApi.getHealthCheckRecordsByStudent(selectedChild.id);
      console.log('Health check records:', healthCheckRecords);
      
      if (!healthCheckRecords || healthCheckRecords.length === 0) {
        message.info(`Không có dữ liệu kiểm tra sức khỏe cho học sinh ${selectedChild.name}`);
        setHealthCheckHistory([]);
        setLoading(false);
        return;
      }
      
      // Get nurses list for displaying nurse information using the exact API endpoint
      try {
        const nursesList = await fetchNurses();
        
        // Create nurses map for easy lookup
        const nursesMap = {};
        nursesList.forEach(nurse => {
          nursesMap[nurse.accountId] = nurse;
        });
        
        // Format date from array [year, month, day] to string day/month/year
        const formatDate = (dateArray) => {
          if (Array.isArray(dateArray) && dateArray.length >= 3) {
            return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`;
          }
          return 'Chưa xác định';
        };
        
        // Format history data for table
        const formattedHistory = await Promise.all(healthCheckRecords.map(async record => {
          // Find nurse information
          const nurse = nursesMap[record.nurseId] || {};
          
          // Get notice detail
          let noticeDetail = null;
          try {
            if (record.checkNoticeId) {
              noticeDetail = await parentApi.getHealthCheckNoticeById(record.checkNoticeId);
            }
          } catch (error) {
            console.error(`Error getting notice detail for ID ${record.checkNoticeId}:`, error);
          }
          
          // Format and return record
          return {
            key: record.recordId.toString(),
            id: record.recordId,
            recordId: record.recordId,
            checkNoticeId: record.checkNoticeId,
            name: noticeDetail ? noticeDetail.title : `Kiểm tra sức khỏe #${record.checkNoticeId || record.recordId}`,
            description: noticeDetail ? noticeDetail.description : 'Không có mô tả',
            date: Array.isArray(record.date) ? formatDate(record.date) : 'Chưa xác định',
            location: 'Phòng y tế trường',
            status: record.results === 'NORMAL' ? 'Bình thường' : 
                   record.results === 'NEEDS_ATTENTION' ? 'Cần chú ý' : 
                   record.results === 'NEEDS_TREATMENT' ? 'Cần điều trị' : 'Không xác định',
            student: selectedChild.name,
            studentId: selectedChild.id, // Store student ID for fetching medical profile
            nurseId: record.nurseId,
            nurseName: nurse.fullName || 'Chưa xác định',
            nurse: nurse, // Store the full nurse object for the modal
            result: {
              results: record.results || 'Chưa có kết quả',
              height: record.height || 0,
              weight: record.weight || 0,
              bmi: record.bmi || 0,
              bmiStatus: record.bmiStatus || 'Chưa xác định',
              leftEye: record.leftEye || 'Chưa xác định',
              rightEye: record.rightEye || 'Chưa xác định',
              bloodPressure: record.bloodPressure || 'Chưa xác định',
              dentalStatus: record.dentalStatus || 'Chưa xác định',
              generalHealth: record.generalHealth || 'Chưa xác định',
              recommendations: record.recommendations || record.results || 'Chưa có khuyến nghị'
            },
            rawData: record,
            noticeDetail: noticeDetail
          };
        }));
        
        // Sort history by ID (newest first)
        const sortedHistory = formattedHistory.sort((a, b) => b.id - a.id);
        
        setHealthCheckHistory(sortedHistory);
      } catch (error) {
        console.error('Error fetching nurses:', error);
        message.error('Không thể lấy danh sách y tá');
      }
    } catch (error) {
      console.error('Error fetching health check history:', error);
      message.error('Không thể lấy lịch sử kiểm tra sức khỏe');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch medical profile data
  const fetchMedicalProfile = async (studentId) => {
    if (!studentId) return null;
    
    setLoadingMedicalProfile(true);
    try {
      console.log(`Đang gọi API để lấy hồ sơ y tế của học sinh ID: ${studentId}`);
      
      // Use parentApi if it has getMedicalProfile method, otherwise use direct axios call
      let medicalProfileData;
      try {
        medicalProfileData = await parentApi.getMedicalProfile(studentId);
      } catch (error) {
        // Fallback to direct API call if parentApi method fails or doesn't exist
        const response = await axios.get(`http://localhost:8080/api/medicalProfiles/${studentId}/get-medical-profile`);
        medicalProfileData = response.data;
      }
      
      console.log('Medical profile data:', medicalProfileData);
      return medicalProfileData;
    } catch (error) {
      console.error('Error fetching medical profile:', error);
      message.error('Không thể lấy hồ sơ y tế');
      return null;
    } finally {
      setLoadingMedicalProfile(false);
    }
  };
  
  // Handle child selection
  const handleChildChange = (childId) => {
    const child = children.find(c => c.id === childId);
    setSelectedChild(child);
  };
  
  // Show detail modal
  const showDetailModal = async (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
    
    // Fetch medical profile data
    const medicalProfileData = await fetchMedicalProfile(record.studentId);
    setMedicalProfile(medicalProfileData);
  };

  // Show nurse modal
  const showNurseModal = (nurse) => {
    setSelectedNurse(nurse);
    setNurseModalVisible(true);
  };
  
  // Handle go to appointment page with data
  const handleGoToAppointment = (record) => {
    const studentName = record.student;
    const nurseName = nurses.find(nurse => nurse.accountId === record.nurseId)?.fullName || '';
    // Prepare the data to store
    const bookingData = {
      studentId: record.studentId,
      studentName,
      parentId,
      staffId: record.nurseId,
      nurseName,
      healthCheckRecordId: record.recordId,
      fromHealthCheck: true
    };
    // Save to localStorage
    localStorage.setItem('pendingAppointment', JSON.stringify(bookingData));
    // Navigate to appointment page
    navigate('/appointment');
  };
  
  // Get status tag color
  const getStatusTagColor = (status) => {
    if (status === 'Bình thường') return 'success';
    if (status === 'Cần chú ý') return 'warning';
    if (status === 'Cần điều trị') return 'error';
    return 'default';
  };
  
  // Get severity color for allergies
  const getSeverityColor = (severity) => {
    if (severity <= 3) return 'green';
    if (severity <= 7) return 'orange';
    return 'red';
  };
  
  // Format date from ISO string
  const formatIsoDate = (isoString) => {
    if (!isoString) return 'Không xác định';
    try {
      const date = new Date(isoString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (error) {
      return isoString;
    }
  };
  
  // Table columns
  const columns = [
    {
      title: 'Ngày kiểm tra',
      dataIndex: 'date',
      key: 'date',
      width: '15%',
    },
    {
      title: 'Tên kiểm tra',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
    },
    {
      title: 'Y tá thực hiện',
      dataIndex: 'nurseName',
      key: 'nurseName',
      width: '20%',
    },
    {
      title: 'Kết quả',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status) => (
        <Tag color={getStatusTagColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '30%',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<FileTextOutlined />} 
            onClick={() => showDetailModal(record)}
          >
            Chi tiết
          </Button>
          <Button 
            type="default" 
            icon={<UserOutlined />} 
            onClick={() => showNurseModal(record.nurse)}
            disabled={!record.nurse || !record.nurse.accountId}
          >
            Y tá
          </Button>
          <Button 
            type="primary" 
            icon={<CalendarOutlined />} 
            onClick={() => handleGoToAppointment(record)}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Đặt lịch khám
          </Button>
        </Space>
      ),
    },
  ];

  // Fetch appointment history for parent
  const fetchAppointmentHistory = async () => {
    setLoadingAppointment(true);
    try {
      let parentId = null;
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        parentId = parsedUserInfo.accountId;
      }
      if (parentId) {
        // Gọi API mới lấy lịch sử đặt lịch khám
        const data = await parentApi.getConsultationAppointmentsByParent(parentId);
        // Map lại dữ liệu cho bảng
        const mappedData = data.map(item => {
          // Format ngày
          let formattedDate = '';
          if (Array.isArray(item.scheduledDate) && item.scheduledDate.length >= 3) {
            formattedDate = `${item.scheduledDate[2]}/${item.scheduledDate[1]}/${item.scheduledDate[0]}`;
          } else {
            formattedDate = item.scheduledDate || '';
          }
          // Map tên học sinh nếu có
          let studentName = item.studentId;
          if (children && children.length > 0) {
            const found = children.find(c => c.id === item.studentId);
            if (found) studentName = found.name;
          }
          // Map tên y tá nếu có
          let nurseName = item.nurseId;
          if (nurses && nurses.length > 0) {
            const foundNurse = nurses.find(n => n.accountId === item.nurseId);
            if (foundNurse) nurseName = foundNurse.fullName;
          }
          // Format slot
          let slotLabel = '';
          switch(item.slot) {
            case 'MORNING_SLOT_1': slotLabel = 'Sáng ca 1 (7:30-9:00)'; break;
            case 'MORNING_SLOT_2': slotLabel = 'Sáng ca 2 (9:00-10:30)'; break;
            case 'AFTERNOON_SLOT_1': slotLabel = 'Chiều ca 1 (13:30-15:00)'; break;
            case 'AFTERNOON_SLOT_2': slotLabel = 'Chiều ca 2 (15:00-16:30)'; break;
            default: slotLabel = item.slot || '';
          }
          return {
            id: item.id || item.consultationId,
            appointmentDate: formattedDate,
            childName: studentName,
            nurseName: nurseName,
            slot: slotLabel,
            reason: item.reason,
            status: item.status,
          };
        });
        setAppointmentHistory(mappedData);
      }
    } catch (error) {
      message.error('Không thể lấy lịch sử đặt lịch khám');
    } finally {
      setLoadingAppointment(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'appointment') {
      fetchAppointmentHistory();
    }
  }, [activeTab]);

  // Hàm xử lý hủy lịch
  const handleCancelAppointment = async (record) => {
    setCancelLoadingId(record.id);
    try {
      await parentApi.cancelConsultationAppointment(record.id, parentId);
      message.success('Hủy lịch hẹn thành công!');
      fetchAppointmentHistory();
    } catch (error) {
      message.error('Hủy lịch hẹn thất bại!');
    } finally {
      setCancelLoadingId(null);
      setConfirmCancel({ visible: false, record: null });
    }
  };

  // Cột cho bảng lịch sử đặt lịch khám
  const appointmentColumns = [
    {
      title: 'Ngày hẹn',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      width: '15%',
    },
    {
      title: 'Học sinh',
      dataIndex: 'childName',
      key: 'childName',
      width: '18%',
    },
    {
      title: 'Y tá phụ trách',
      dataIndex: 'nurseName',
      key: 'nurseName',
      width: '18%',
    },
    {
      title: 'Khung giờ',
      dataIndex: 'slot',
      key: 'slot',
      width: '16%',
    },
    {
      title: 'Lý do khám',
      dataIndex: 'reason',
      key: 'reason',
      width: '18%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => (
        <Tag color={status === 'SCHEDULED' ? 'blue' : status === 'COMPLETED' ? 'green' : status === 'CANCELLED' ? 'default' : 'default'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: '13%',
      render: (_, record) => (
        record.status === 'SCHEDULED' ? (
          <Popconfirm
            title="Bạn chắc chắn muốn hủy lịch hẹn này?"
            okText="Hủy lịch"
            cancelText="Không"
            onConfirm={async () => {
              setCancellingId(record.id);
              setCancellingLoading(true);
              try {
                await parentApi.cancelConsultationAppointment(record.id, parentId);
                message.success('Đã hủy lịch hẹn thành công!');
                fetchAppointmentHistory();
              } catch (error) {
                message.error('Hủy lịch hẹn thất bại!');
              } finally {
                setCancellingId(null);
                setCancellingLoading(false);
              }
            }}
            okButtonProps={{ loading: cancellingLoading && cancellingId === record.id }}
          >
            <Button danger size="small" loading={cancellingLoading && cancellingId === record.id}>
              Hủy lịch
            </Button>
          </Popconfirm>
        ) : null
      ),
    },
  ];

  // Render allergies list
  const renderAllergies = () => {
    if (!medicalProfile || !medicalProfile.allergies || medicalProfile.allergies.length === 0) {
      return <Empty description="Không có thông tin dị ứng" />;
    }
    
    return (
      <List
        dataSource={medicalProfile.allergies}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={
                <Space>
                  {item.allergenName}
                  {item.lifeThreatening && <Badge count="Nguy hiểm" style={{ backgroundColor: '#f5222d' }} />}
                </Space>
              }
              description={
                <>
                  <div><strong>Phản ứng:</strong> {item.reaction || 'Không có thông tin'}</div>
                  <div>
                    <strong>Mức độ:</strong> 
                    <Tag color={getSeverityColor(item.severity)} style={{ marginLeft: 8 }}>
                      {item.severity}/10
                    </Tag>
                  </div>
                </>
              }
            />
          </List.Item>
        )}
      />
    );
  };
  
  // Render diseases list
  const renderDiseases = () => {
    if (!medicalProfile || !medicalProfile.diseases || medicalProfile.diseases.length === 0) {
      return <Empty description="Không có thông tin bệnh lý" />;
    }
    
    return (
      <List
        dataSource={medicalProfile.diseases}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={item.diseaseName}
              description={
                <>
                  <div><strong>Từ ngày:</strong> {item.sinceDate || 'Không xác định'}</div>
                  <div>
                    <strong>Mức độ:</strong> 
                    <Tag color={getSeverityColor(item.severity)} style={{ marginLeft: 8 }}>
                      {item.severity}/10
                    </Tag>
                  </div>
                </>
              }
            />
          </List.Item>
        )}
      />
    );
  };
  
  // Render conditions list
  const renderConditions = () => {
    if (!medicalProfile || !medicalProfile.conditions || medicalProfile.conditions.length === 0) {
      return <Empty description="Không có thông tin tình trạng" />;
    }
    
    return (
      <List
        dataSource={medicalProfile.conditions}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={item.conditionName}
              description={
                <>
                  <div><strong>Ghi chú:</strong> {item.note || 'Không có ghi chú'}</div>
                </>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  return (
    <Card className="user-profile-section">
      <Title level={4}>
        <MedicineBoxOutlined /> Lịch sử kiểm tra sức khỏe
      </Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }}>
        <Tabs.TabPane tab="Lịch sử kiểm tra sức khỏe" key="health">
          {/* Tab lịch sử kiểm tra sức khỏe */}
          {children.length > 0 && (
            <div className="child-select-container">
              <Text strong>Chọn học sinh:</Text>
              <Select
                value={selectedChild?.id}
                onChange={handleChildChange}
                className="child-select"
                style={{ width: 200, marginLeft: 8 }}
              >
                {children.map(child => (
                  <Option key={child.id} value={child.id}>
                    {child.name} - {child.className}
                  </Option>
                ))}
              </Select>
            </div>
          )}
          <div className="health-check-history">
            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
                <Text>Đang tải dữ liệu...</Text>
              </div>
            ) : healthCheckHistory.length > 0 ? (
              <Table
                columns={columns}
                dataSource={healthCheckHistory}
                pagination={{ pageSize: 5 }}
                rowClassName="health-check-row"
              />
            ) : (
              <Empty
                description={
                  <span>
                    {selectedChild 
                      ? `Không có dữ liệu kiểm tra sức khỏe cho học sinh ${selectedChild.name}`
                      : 'Vui lòng chọn học sinh để xem lịch sử kiểm tra sức khỏe'
                    }
                  </span>
                }
              />
            )}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Lịch sử đặt lịch khám" key="appointment">
          <div ref={appointmentTabRef} />
          {/* Tab lịch sử đặt lịch khám */}
          <div className="appointment-history">
            {loadingAppointment ? (
              <div className="loading-container">
                <Spin size="large" />
                <Text>Đang tải dữ liệu...</Text>
              </div>
            ) : appointmentHistory.length > 0 ? (
              <Table
                columns={appointmentColumns}
                dataSource={appointmentHistory}
                pagination={{ pageSize: 5 }}
                rowKey="id"
              />
            ) : (
              <Empty description="Không có lịch sử đặt lịch khám" />
            )}
          </div>
        </Tabs.TabPane>
      </Tabs>
      
      {/* Modal Chi tiết kiểm tra sức khỏe */}
      <Modal
        title={
          <span>
            <CheckCircleOutlined /> Chi tiết kiểm tra sức khỏe
          </span>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setMedicalProfile(null);
        }}
        footer={[
          <Button key="close" type="primary" onClick={() => {
            setDetailModalVisible(false);
            setMedicalProfile(null);
          }}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <div className="health-check-detail">
            <Descriptions title={selectedRecord.name} bordered column={1}>
              <Descriptions.Item label="Ngày kiểm tra">{selectedRecord.date}</Descriptions.Item>
              <Descriptions.Item label="Học sinh">{selectedRecord.student}</Descriptions.Item>
              <Descriptions.Item label="Y tá thực hiện">{selectedRecord.nurseName}</Descriptions.Item>
              <Descriptions.Item label="Kết quả chung">
                <Tag color={getStatusTagColor(selectedRecord.status)}>
                  {selectedRecord.status}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Chiều cao">
                {selectedRecord.rawData.height || 
                  (medicalProfile?.basicHealthData?.heightCm ? `${medicalProfile.basicHealthData.heightCm} cm` : 'Không có dữ liệu')}
              </Descriptions.Item>
              <Descriptions.Item label="Cân nặng">
                {selectedRecord.rawData.weight || 
                  (medicalProfile?.basicHealthData?.weightKg ? `${medicalProfile.basicHealthData.weightKg} kg` : 'Không có dữ liệu')}
              </Descriptions.Item>
              {/* <Descriptions.Item label="BMI">
                {selectedRecord.rawData.bmi || 'Không có dữ liệu'}
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng BMI">
                {selectedRecord.rawData.bmiStatus || 'Không có dữ liệu'}
              </Descriptions.Item> */}
              <Descriptions.Item label="Thị lực (trái)">
                {selectedRecord.rawData.leftEye || medicalProfile?.basicHealthData?.visionLeft || 'Không có dữ liệu'}
              </Descriptions.Item>
              <Descriptions.Item label="Thị lực (phải)">
                {selectedRecord.rawData.rightEye || medicalProfile?.basicHealthData?.visionRight || 'Không có dữ liệu'}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Huyết áp">
                {selectedRecord.rawData.bloodPressure || 'Không có dữ liệu'}
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng răng">
                {selectedRecord.rawData.dentalStatus || 'Không có dữ liệu'}
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng chung">
                {selectedRecord.rawData.generalHealth || 'Không có dữ liệu'}
              </Descriptions.Item>
              <Descriptions.Item label="Khuyến nghị">
                {selectedRecord.rawData.recommendations || 'Không có khuyến nghị'}
              </Descriptions.Item> */}  
            </Descriptions>
            
            {loadingMedicalProfile ? (
              <div className="loading-container" style={{ marginTop: 24 }}>
                <Spin size="default" />
                <Text>Đang tải hồ sơ y tế...</Text>
              </div>
            ) : medicalProfile ? (
              <div className="medical-profile-section">
                <Divider orientation="left">
                  <Title level={5}>
                    <ExperimentOutlined /> Thông tin hồ sơ y tế
                  </Title>
                </Divider>
                
                <Alert 
                  message="Hồ sơ y tế chi tiết"
                  description={`Cập nhật lần cuối: ${formatIsoDate(medicalProfile.basicHealthData?.lastMeasured)}`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                <Tabs defaultActiveKey="allergies">
                  <Tabs.TabPane 
                    tab={
                      <span>
                        <AlertOutlined /> Dị ứng {medicalProfile.allergies?.length > 0 && `(${medicalProfile.allergies.length})`}
                      </span>
                    } 
                    key="allergies"
                  >
                    {renderAllergies()}
                  </Tabs.TabPane>
                  <Tabs.TabPane 
                    tab={
                      <span>
                        <MedicineBoxOutlined /> Bệnh lý {medicalProfile.diseases?.length > 0 && `(${medicalProfile.diseases.length})`}
                      </span>
                    } 
                    key="diseases"
                  >
                    {renderDiseases()}
                  </Tabs.TabPane>
                  <Tabs.TabPane 
                    tab={
                      <span>
                        <HeartOutlined /> Tình trạng {medicalProfile.conditions?.length > 0 && `(${medicalProfile.conditions.length})`}
                      </span>
                    } 
                    key="conditions"
                  >
                    {renderConditions()}
                  </Tabs.TabPane>
                </Tabs>
                
                <Descriptions title="Thông tin cơ bản" bordered column={1} style={{ marginTop: 16 }}>
                  <Descriptions.Item label="Nhóm máu">
                    {medicalProfile.basicHealthData?.bloodType || 'Không có dữ liệu'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tình trạng thính giác">
                    {medicalProfile.basicHealthData?.hearingStatus === 'normal' ? 'Bình thường' : 
                     medicalProfile.basicHealthData?.hearingStatus === 'impaired' ? 'Suy giảm' :
                     medicalProfile.basicHealthData?.hearingStatus || 'Không có dữ liệu'}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ) : (
              <Empty 
                description="Không có dữ liệu hồ sơ y tế" 
                style={{ marginTop: 24 }}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Modal Thông tin y tá */}
      <Modal
        title={
          <span>
            <UserOutlined /> Thông tin y tá phụ trách
          </span>
        }
        open={nurseModalVisible}
        onCancel={() => setNurseModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setNurseModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={500}
      >
        {selectedNurse ? (
          <div className="nurse-detail">
            <div className="nurse-header">
              <Avatar
                size={64}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              />
              <div className="nurse-title">
                <Title level={4}>{selectedNurse.fullName}</Title>
                <Tag color="blue">Y tá trường</Tag>
              </div>
            </div>
            
            <Divider />
            
            <Descriptions bordered column={1}>
              <Descriptions.Item label={<><UserOutlined /> Tên tài khoản</>}>
                {selectedNurse.username}
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {selectedNurse.email}
              </Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>
                {selectedNurse.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {selectedNurse.gender === 'F' ? 'Nữ' : 'Nam'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {selectedNurse.dob}
              </Descriptions.Item>
            </Descriptions>
          </div>
        ) : (
          <Empty description="Không tìm thấy thông tin y tá" />
        )}
      </Modal>

      {/* Modal xác nhận hủy lịch */}
      <Modal
        open={confirmCancel.visible}
        onCancel={() => setConfirmCancel({ visible: false, record: null })}
        onOk={() => handleCancelAppointment(confirmCancel.record)}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        confirmLoading={!!cancelLoadingId}
        centered
      >
        <p>Bạn chắc chắn muốn hủy lịch hẹn này?</p>
        {confirmCancel.record && (
          <ul style={{ marginLeft: 16 }}>
            <li><b>Ngày hẹn:</b> {confirmCancel.record.appointmentDate}</li>
            <li><b>Học sinh:</b> {confirmCancel.record.childName}</li>
            <li><b>Y tá phụ trách:</b> {confirmCancel.record.nurseName}</li>
            <li><b>Khung giờ:</b> {confirmCancel.record.slot}</li>
          </ul>
        )}
      </Modal>
    </Card>
  );
};

export default HealthCheckHistory; 