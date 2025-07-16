import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Button, Tag, Modal, Form, Select, Radio, Divider, message, Tabs, Row, Col, Alert, Input, Dropdown, Space } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, MedicineBoxOutlined, DownOutlined, UserOutlined } from '@ant-design/icons';
import './HealthCheckPage.css';
import parentApi from '../../../api/parentApi';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const HealthCheckPage = () => {
  const [form] = Form.useForm();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedHealthCheck, setSelectedHealthCheck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingHealthChecks, setUpcomingHealthChecks] = useState([]);
  const [healthCheckHistory, setHealthCheckHistory] = useState([]);
  const [userChildren, setUserChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [confirmationsLoading, setConfirmationsLoading] = useState(false);

  // Lấy thông tin user từ localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const parentId = userInfo?.accountId;

  // Fetch data khi component được mount hoặc khi selectedChild thay đổi
  useEffect(() => {
    if (parentId && selectedChild) {
      fetchHealthCheckNotices();
      fetchHealthCheckHistory();
    }
  }, [parentId, selectedChild]);

  // Fetch data khi component được mount
  useEffect(() => {
    if (parentId) {
      // Kiểm tra xem có thông báo đã chọn từ HeaderAfter không
      const selectedNoticeStr = localStorage.getItem('selectedHealthCheckNotice');
      let selectedStudentId = null;
      
      if (selectedNoticeStr) {
        try {
          const selectedNotice = JSON.parse(selectedNoticeStr);
          console.log('Selected health check notice:', selectedNotice);
          
          // Lưu lại ID học sinh từ thông báo (nếu có)
          if (selectedNotice.studentId) {
            selectedStudentId = selectedNotice.studentId;
          }
          
          // Hiển thị thông báo đã chọn
          if (selectedNotice.checkNoticeId) {
            // Tìm thông báo trong danh sách và hiển thị chi tiết
            setTimeout(() => {
              const notice = {
                key: `notice-${selectedNotice.checkNoticeId}`,
                id: selectedNotice.checkNoticeId,
                checkNoticeId: selectedNotice.checkNoticeId,
                name: selectedNotice.title,
                date: Array.isArray(selectedNotice.date) && selectedNotice.date.length >= 3 
                  ? `${selectedNotice.date[2]}/${selectedNotice.date[1]}/${selectedNotice.date[0]}`
                  : 'Chưa xác định',
                location: 'Phòng y tế trường',
                status: selectedNotice.status || 'pending',
                description: selectedNotice.description,
                deadline: 'Sớm nhất có thể',
                studentId: selectedNotice.studentId,
                studentName: selectedNotice.studentName,
                className: selectedNotice.className
              };
              
              setSelectedHealthCheck(notice);
              setDetailModalVisible(true);
            }, 500);
            
            // Xóa thông tin đã chọn để tránh hiển thị lại khi refresh
            localStorage.removeItem('selectedHealthCheckNotice');
          }
        } catch (error) {
          console.error('Error parsing selected notice:', error);
        }
      }
      
      // Lấy danh sách con và chọn con phù hợp (dựa trên thông báo hoặc chọn đầu tiên)
      fetchUserChildren(selectedStudentId);
    }
  }, [parentId]);

  // Lấy danh sách con của phụ huynh
  const fetchUserChildren = async (preSelectedStudentId = null) => {
    if (!parentId) return;
    
    setChildrenLoading(true);
    try {
      console.log('Fetching children for parent ID:', parentId);
      const children = await parentApi.getParentChildren(parentId);
      console.log('Children data received:', children);
      
      if (Array.isArray(children) && children.length > 0) {
        const formattedChildren = children.map(child => ({
          id: child.childId || child.accountId || child.studentId,
          name: child.fullName,
          class: child.classId || 'N/A'
        }));
        
        setUserChildren(formattedChildren);
        
        // Chọn con phù hợp dựa trên thông báo hoặc chọn con đầu tiên nếu chưa chọn con nào
        if (preSelectedStudentId) {
          // Tìm con phù hợp với ID từ thông báo
          const preSelectedChild = formattedChildren.find(child => child.id === preSelectedStudentId);
          if (preSelectedChild) {
            console.log('Pre-selecting child based on notification:', preSelectedChild);
            setSelectedChild(preSelectedChild);
          } else {
            // Nếu không tìm thấy, chọn con đầu tiên
            setSelectedChild(formattedChildren[0]);
          }
        } else if (formattedChildren.length > 0 && !selectedChild) {
          // Nếu không có ID con được chỉ định, chọn con đầu tiên
          setSelectedChild(formattedChildren[0]);
        }
      } else {
        message.warning('Không tìm thấy thông tin học sinh');
        setUserChildren([]);
      }
    } catch (error) {
      console.error('Error fetching user children:', error);
      message.error('Không thể lấy danh sách học sinh');
      // Sử dụng dữ liệu mẫu trong trường hợp lỗi
      setUserChildren([
        { id: 1, name: 'Nguyễn Văn An', class: '10A1' },
        { id: 2, name: 'Nguyễn Thị Bình', class: '7B2' },
      ]);
      
      // Set the first child as selected by default
      if (!selectedChild) {
        setSelectedChild({ id: 1, name: 'Nguyễn Văn An', class: '10A1' });
      }
    } finally {
      setChildrenLoading(false);
    }
  };

  // Lấy danh sách thông báo kiểm tra sức khỏe
  const fetchHealthCheckNotices = async () => {
    if (!selectedChild) return;
    
    setLoading(true);
    setConfirmationsLoading(true);
    try {
      // Lấy danh sách xác nhận kiểm tra sức khỏe của học sinh đã chọn
      const studentConfirmations = await parentApi.getHealthCheckConfirmationsByStudent(selectedChild.id);
      console.log('Student health check confirmations:', studentConfirmations);
      
      // Nếu không có xác nhận nào, hiển thị thông báo
      if (!studentConfirmations || studentConfirmations.length === 0) {
        message.info(`Không tìm thấy thông báo kiểm tra sức khỏe nào cho học sinh ${selectedChild.name}`);
        setUpcomingHealthChecks([]);
        setLoading(false);
        setConfirmationsLoading(false);
        return;
      }
      
      // Lấy thông tin chi tiết cho mỗi thông báo kiểm tra sức khỏe
      const upcomingChecks = await Promise.all(
        studentConfirmations.map(async (confirmation) => {
          try {
            // Lấy thông tin chi tiết của thông báo kiểm tra sức khỏe
            const noticeDetail = await parentApi.getHealthCheckNoticeById(confirmation.checkNoticeId);
            console.log(`Notice detail for ID ${confirmation.checkNoticeId}:`, noticeDetail);
            
            // Format ngày từ mảng [năm, tháng, ngày] thành chuỗi ngày/tháng/năm
            const formatDate = (dateArray) => {
              if (Array.isArray(dateArray) && dateArray.length >= 3) {
                return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`;
              }
              return 'Chưa xác định';
            };
            
            // Chuẩn hóa trạng thái để đảm bảo xử lý nhất quán
            let normalizedStatus = (confirmation.status || 'pending').toLowerCase();
            
            // Kết hợp thông tin xác nhận và thông báo
            return {
              key: confirmation.confirmationId.toString(),
              id: confirmation.confirmationId,
              confirmationId: confirmation.confirmationId,
              checkNoticeId: confirmation.checkNoticeId,
              healthCheckNoticeId: confirmation.checkNoticeId, // Thêm field này để khớp với API
              name: noticeDetail?.title || 'Thông báo kiểm tra sức khỏe',
              date: noticeDetail?.date ? formatDate(noticeDetail.date) : 'Chưa xác định',
              location: 'Phòng y tế trường',
              status: normalizedStatus,
              description: noticeDetail?.description || 'Không có mô tả',
              deadline: noticeDetail?.createdAt ? formatDate(noticeDetail.createdAt) : 'Chưa xác định',
              // Thông tin học sinh
              studentId: selectedChild.id,
              studentName: selectedChild.name,
              className: selectedChild.class,
              // Thêm thông tin chi tiết của thông báo
              noticeDetail: noticeDetail || {}
            };
          } catch (error) {
            console.error(`Error fetching notice detail for ID ${confirmation.checkNoticeId}:`, error);
            // Trả về thông tin cơ bản nếu không lấy được chi tiết
            // Chuẩn hóa trạng thái
            let normalizedStatus = (confirmation.status || 'pending').toLowerCase();
            
            return {
              key: confirmation.confirmationId.toString(),
              id: confirmation.confirmationId,
              confirmationId: confirmation.confirmationId,
              checkNoticeId: confirmation.checkNoticeId,
              name: 'Thông báo kiểm tra sức khỏe',
              date: Array.isArray(confirmation.confirmedAt) && confirmation.confirmedAt.length >= 3 
                ? `${confirmation.confirmedAt[2]}/${confirmation.confirmedAt[1]}/${confirmation.confirmedAt[0]}`
                : 'Chưa xác định',
              location: 'Phòng y tế trường',
              status: normalizedStatus,
              description: 'Không thể lấy thông tin chi tiết',
              deadline: 'Chưa xác định',
              studentId: selectedChild.id,
              studentName: selectedChild.name,
              className: selectedChild.class
            };
          }
        })
      );
      
      // Lọc bỏ các thông báo có trạng thái CANCELLED/cancelled
      const filteredChecks = upcomingChecks.filter(
        check => check.status.toLowerCase() !== 'cancelled' && 
                 check.status.toLowerCase() !== 'declined' &&
                 check.status.toLowerCase() !== 'đã từ chối'
      );
      
      setUpcomingHealthChecks(filteredChecks);
      
      // Lấy lịch sử kiểm tra sức khỏe cho học sinh đã chọn
      // fetchHealthCheckHistory(); // This is now handled by the useEffect hook
    } catch (error) {
      console.error('Error fetching health check notices:', error);
      message.error('Không thể lấy danh sách thông báo kiểm tra sức khỏe');
      // Sử dụng dữ liệu mẫu trong trường hợp lỗi
      setUpcomingHealthChecks([
        {
          key: '1',
          id: 1,
          checkNoticeId: 1,
          name: 'Kiểm tra sức khỏe định kỳ học kỳ 1',
          date: '10/09/2025',
          location: 'Phòng y tế trường',
          status: 'pending',
          description: 'Kiểm tra sức khỏe tổng quát, đo chiều cao, cân nặng, thị lực, và khám răng miệng',
          deadline: '05/09/2025',
          studentId: selectedChild?.id || 1,
          studentName: selectedChild?.name || 'Học sinh mẫu',
          className: selectedChild?.class || '10A1'
        },
        {
          key: '2',
          id: 2,
          checkNoticeId: 2,
          name: 'Kiểm tra thị lực',
          date: '15/10/2025',
          location: 'Phòng y tế trường',
          status: 'pending',
          description: 'Kiểm tra thị lực và sức khỏe mắt cho học sinh các lớp 6-12',
          deadline: '10/10/2025',
          studentId: selectedChild?.id || 2,
          studentName: selectedChild?.name || 'Học sinh mẫu 2',
          className: selectedChild?.class || '7B2'
        },
      ]);
    } finally {
      setLoading(false);
      setConfirmationsLoading(false);
    }
  };

  // Lấy lịch sử kiểm tra sức khỏe cho học sinh đã chọn
  const fetchHealthCheckHistory = async () => {
    if (!selectedChild) return;
    
    setLoading(true);
    try {
      // Lấy lịch sử kiểm tra sức khỏe từ API
      const healthCheckRecords = await parentApi.getHealthCheckRecordsByStudent(selectedChild.id);
      console.log('Health check records:', healthCheckRecords);
      
      if (!healthCheckRecords || healthCheckRecords.length === 0) {
        message.info(`Không có dữ liệu kiểm tra sức khỏe cho học sinh ${selectedChild.name}`);
        setHealthCheckHistory([]);
        setLoading(false);
        return;
      }
      
      // Lấy danh sách y tá để hiển thị thông tin y tá
      const nurses = await parentApi.getAllNurses();
      console.log('Nurses:', nurses);
      
      // Tạo map các y tá theo ID để dễ dàng tra cứu
      const nursesMap = {};
      nurses.forEach(nurse => {
        nursesMap[nurse.id] = nurse;
      });
      
      // Format ngày từ mảng [năm, tháng, ngày] thành chuỗi ngày/tháng/năm
      const formatDate = (dateArray) => {
        if (Array.isArray(dateArray) && dateArray.length >= 3) {
          return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`;
        }
        return 'Chưa xác định';
      };
      
      // Format dữ liệu lịch sử cho bảng
      const formattedHistory = await Promise.all(healthCheckRecords.map(async record => {
        // Tìm thông tin y tá
        const nurse = nursesMap[record.nurseId] || {};
        
        // Lấy thông tin chi tiết thông báo kiểm tra sức khỏe
        let noticeDetail = null;
        try {
          if (record.checkNoticeId) {
            noticeDetail = await parentApi.getHealthCheckNoticeById(record.checkNoticeId);
            console.log(`Chi tiết thông báo kiểm tra sức khỏe ID ${record.checkNoticeId}:`, noticeDetail);
          }
        } catch (error) {
          console.error(`Lỗi khi lấy thông tin chi tiết thông báo kiểm tra sức khỏe ID ${record.checkNoticeId}:`, error);
        }
        
        return {
          key: record.recordId.toString(),
          id: record.recordId,
          recordId: record.recordId,
          checkNoticeId: record.checkNoticeId,
          name: noticeDetail ? noticeDetail.title : `Kiểm tra sức khỏe #${record.checkNoticeId || record.recordId}`,
          description: noticeDetail ? noticeDetail.description : 'Không có mô tả',
          date: Array.isArray(record.date) ? formatDate(record.date) : 'Chưa xác định',
          location: 'Phòng y tế trường',
          status: 'completed',
          student: selectedChild.name,
          nurseId: record.nurseId,
          nurseName: nurse.fullName || 'Chưa xác định',
          result: {
            results: record.results || 'Chưa có kết quả',
            // Thêm các trường khác nếu có trong record
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
          // Lưu dữ liệu gốc và thông tin chi tiết thông báo cho chi tiết
          rawData: record,
          noticeDetail: noticeDetail
        };
      }));
      
      setHealthCheckHistory(formattedHistory);
      
      if (formattedHistory.length === 0) {
        message.info(`Không có dữ liệu kiểm tra sức khỏe cho học sinh ${selectedChild.name}`);
      }
    } catch (error) {
      console.error('Error fetching health check history:', error);
      message.error('Không thể lấy lịch sử kiểm tra sức khỏe');
      // Sử dụng dữ liệu mẫu trong trường hợp lỗi
      setHealthCheckHistory([
        {
          key: '1',
          id: 'HC001',
          name: 'Kiểm tra sức khỏe định kỳ',
          date: '15/02/2025',
          location: 'Phòng y tế trường',
          status: 'completed',
          student: selectedChild?.name || 'Nguyễn Văn An',
          nurseName: 'Bác sĩ Nguyễn Thị Minh',
          result: {
            height: 165,
            weight: 55,
            bmi: 20.2,
            bmiStatus: 'Bình thường',
            leftEye: '10/10',
            rightEye: '10/10',
            bloodPressure: '110/70',
            dentalStatus: 'Tốt',
            generalHealth: 'Tốt',
            recommendations: 'Không có khuyến nghị đặc biệt'
          }
        },
        {
          key: '2',
          id: 'HC002',
          name: 'Kiểm tra sức khỏe răng miệng',
          date: '20/03/2025',
          location: 'Phòng y tế trường',
          status: 'completed',
          student: selectedChild?.name || 'Nguyễn Văn An',
          nurseName: 'Bác sĩ Trần Văn Hùng',
          result: {
            dentalStatus: 'Cần điều trị sâu răng nhẹ',
            recommendations: 'Nên đến nha sĩ để điều trị sâu răng ở răng hàm dưới bên phải'
          }
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi chọn học sinh
  const handleChildSelect = (child) => {
    setSelectedChild(child);
    // fetchHealthCheckNotices() is now triggered by useEffect
  };

  // Cột cho bảng các đợt kiểm tra sức khỏe sắp tới
  const upcomingColumns = [
    {
      title: 'Tên đợt kiểm tra',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (text, record) => {
        if (!text || text === 'Chưa xác định') {
          return <span>Chưa chọn học sinh</span>;
        }
        return `${text} ${record.className ? `(${record.className})` : ''}`;
      },
    },
    {
      title: 'Ngày kiểm tra',
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
        // Chuẩn hóa trạng thái sang lowercase
        const normalizedStatus = status ? status.toLowerCase() : 'pending';
        
        let color = 'default';
        let text = 'Chưa xác nhận';
        let icon = <ClockCircleOutlined />;
        
        // Kiểm tra các trạng thái đã xác nhận
        if (normalizedStatus === 'confirmed' || normalizedStatus === 'confirm' || normalizedStatus === 'đã xác nhận') {
          color = 'green';
          text = 'Đã xác nhận';
          icon = <CheckCircleOutlined />;
        } 
        // Kiểm tra các trạng thái đã từ chối
        else if (normalizedStatus === 'declined' || normalizedStatus === 'cancelled' || normalizedStatus === 'đã từ chối') {
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
        <div className="action-buttons">
          <Button 
            type="primary" 
            onClick={() => showDetailModal(record)}
            style={{ marginRight: 8 }}
          >
            Chi tiết
          </Button>
          {/* Hiển thị nút xác nhận nếu trạng thái là pending, chưa xác nhận, hoặc null/undefined */}
          {(record.status === 'pending' || 
            record.status === 'PENDING' || 
            record.status === 'Chưa xác nhận' || 
            record.status === null || 
            record.status === undefined) && (
            <Button 
              onClick={() => showConfirmModal(record)}
            >
              Xác nhận
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Cột cho bảng lịch sử kiểm tra sức khỏe
  const historyColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
    },
    {
      title: 'Tên đợt kiểm tra',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ngày kiểm tra',
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
        let text = status === 'completed' ? 'Đã hoàn thành' : status;
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Kết quả',
      key: 'result',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => showDetailModal(record)}
        >
          Xem kết quả
        </Button>
      ),
    },
  ];

  // Hiển thị modal xác nhận tham gia kiểm tra sức khỏe
  const showConfirmModal = (healthCheck) => {
    if (!selectedChild) {
      message.error('Vui lòng chọn học sinh trước khi xác nhận');
      return;
    }
    
    setSelectedHealthCheck(healthCheck);
    form.setFieldsValue({
      confirmStatus: 'CONFIRMED'
    });
    setConfirmModalVisible(true);
  };

  // Hiển thị modal chi tiết thông báo kiểm tra sức khỏe
  const showDetailModal = (record) => {
    setSelectedHealthCheck(record);
    setDetailModalVisible(true);
  };

  // Xử lý xác nhận tham gia kiểm tra sức khỏe
  const handleConfirm = () => {
    if (!selectedChild) {
      message.error('Vui lòng chọn học sinh trước khi xác nhận');
      return;
    }
    
    setLoading(true);
    
    const formValues = form.getFieldsValue();
    const status = formValues.confirmStatus; // CONFIRMED hoặc CANCELLED
    
    // Tạo dữ liệu gửi đến API theo đúng thứ tự của API
    const confirmationData = {
      "healthCheckNoticeId": selectedHealthCheck.checkNoticeId,
      "studentId": selectedChild.id,
      "parentId": parentId,
      "status": status // CONFIRMED hoặc CANCELLED
    };
    
    // Gọi API cập nhật xác nhận
    parentApi.updateHealthCheckConfirmation(
      selectedHealthCheck.confirmationId,
      confirmationData
    )
      .then(() => {
        const statusText = status === 'CONFIRMED' ? 'xác nhận' : 'từ chối';
        message.success(`Đã ${statusText} tham gia kiểm tra sức khỏe cho học sinh ${selectedChild.name}`);
        setConfirmModalVisible(false);
        
        // Nếu từ chối tham gia, loại bỏ thông báo này khỏi danh sách hiển thị
        if (status === 'CANCELLED') {
          const filteredHealthChecks = upcomingHealthChecks.filter(item => 
            item.confirmationId !== selectedHealthCheck.confirmationId
          );
          setUpcomingHealthChecks(filteredHealthChecks);
        } else {
          // Cập nhật trạng thái trong danh sách
          const updatedHealthChecks = upcomingHealthChecks.map(item => {
            if (item.confirmationId === selectedHealthCheck.confirmationId) {
              return {
                ...item,
                status: status.toLowerCase()
              };
            }
            return item;
          });
          
          setUpcomingHealthChecks(updatedHealthChecks);
        }
      })
      .catch(error => {
        console.error('Lỗi khi xác nhận kiểm tra sức khỏe:', error);
        message.error('Không thể xác nhận tham gia kiểm tra sức khỏe');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="health-check-page">
      <Card className="health-check-card">
        <div className="health-check-header">
          <Title level={2} className="health-check-title">
            <MedicineBoxOutlined /> Kiểm Tra Sức Khỏe
          </Title>
          <Text className="health-check-subtitle">
            Quản lý lịch kiểm tra sức khỏe và xem kết quả kiểm tra
          </Text>
        </div>
        
        {/* Child selection dropdown */}
        <div className="child-selection-container" style={{ marginBottom: 20 }}>
          <Text strong style={{ marginRight: 10 }}>Chọn học sinh:</Text>
          <Select
            loading={childrenLoading}
            value={selectedChild?.id}
            style={{ width: 250 }}
            onChange={(value) => {
              const child = userChildren.find(c => c.id === value);
              if (child) handleChildSelect(child);
            }}
            placeholder="Chọn học sinh"
          >
            {userChildren.map(child => (
              <Option key={child.id} value={child.id}>
                {child.name} - {child.class}
              </Option>
            ))}
          </Select>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Lịch kiểm tra sắp tới" key="upcoming">
            <Alert
              message="Thông báo"
              description="Vui lòng xác nhận tham gia các đợt kiểm tra sức khỏe trước thời hạn để nhà trường có thể sắp xếp lịch phù hợp."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table 
              columns={upcomingColumns} 
              dataSource={upcomingHealthChecks} 
              loading={loading || confirmationsLoading}
              pagination={{ pageSize: 5 }}
              rowKey="key"
              locale={{
                emptyText: selectedChild ? 
                  `Không tìm thấy thông báo kiểm tra sức khỏe nào cho học sinh ${selectedChild.name}` : 
                  'Vui lòng chọn học sinh để xem thông báo kiểm tra sức khỏe'
              }}
            />
          </TabPane>
          <TabPane tab="Lịch sử kiểm tra" key="history">
            <Table 
              columns={historyColumns} 
              dataSource={healthCheckHistory} 
              loading={loading || confirmationsLoading}
              pagination={{ pageSize: 5 }}
              rowKey="key"
              locale={{
                emptyText: selectedChild ? 
                  `Không tìm thấy lịch sử kiểm tra sức khỏe nào cho học sinh ${selectedChild.name}` : 
                  'Vui lòng chọn học sinh để xem lịch sử kiểm tra sức khỏe'
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal xác nhận tham gia kiểm tra sức khỏe */}
      <Modal
        title="Xác nhận tham gia kiểm tra sức khỏe"
        visible={confirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleConfirm}
        >
          <Paragraph>
            <strong>Tên đợt kiểm tra:</strong> {selectedHealthCheck?.name}
          </Paragraph>
          <Paragraph>
            <strong>Ngày kiểm tra:</strong> {selectedHealthCheck?.date}
          </Paragraph>
          <Paragraph>
            <strong>Địa điểm:</strong> {selectedHealthCheck?.location}
          </Paragraph>
          <Paragraph>
            <strong>Học sinh:</strong> {selectedChild?.name} ({selectedChild?.class})
          </Paragraph>
          
          {selectedHealthCheck?.description && (
            <Paragraph>
              <strong>Mô tả:</strong> {selectedHealthCheck.description}
            </Paragraph>
          )}
          
          {selectedHealthCheck?.noticeDetail && selectedHealthCheck.noticeDetail.additionalInfo && (
            <Paragraph>
              <strong>Thông tin bổ sung:</strong> {selectedHealthCheck.noticeDetail.additionalInfo}
            </Paragraph>
          )}
          
          <Divider />

          <Form.Item
            name="confirmStatus"
            label="Xác nhận tham gia"
            rules={[{ required: true, message: 'Vui lòng chọn xác nhận hoặc từ chối!' }]}
          >
            <Radio.Group>
              <Radio value="CONFIRMED">Xác nhận tham gia</Radio>
              <Radio value="CANCELLED">Từ chối tham gia</Radio>
            </Radio.Group>
          </Form.Item>

          <div className="form-actions">
            <Button onClick={() => setConfirmModalVisible(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Xác nhận
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal hiển thị chi tiết thông báo kiểm tra sức khỏe */}
      <Modal
        title="Chi tiết kiểm tra sức khỏe"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          (selectedHealthCheck?.status === 'pending' || 
           selectedHealthCheck?.status === 'PENDING' || 
           selectedHealthCheck?.status === 'Chưa xác nhận' || 
           selectedHealthCheck?.status === null || 
           selectedHealthCheck?.status === undefined) && (
            <Button 
              key="confirm" 
              type="primary" 
              onClick={() => {
                setDetailModalVisible(false);
                showConfirmModal(selectedHealthCheck);
              }}
            >
              Xác nhận tham gia
            </Button>
          )
        ]}
        destroyOnClose
      >
        {selectedHealthCheck && (
          <div className="health-check-detail">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Thông tin chung" bordered={false}>
                  <p><strong>Tên đợt kiểm tra:</strong> {selectedHealthCheck.name}</p>
                  <p><strong>Mã thông báo:</strong> {selectedHealthCheck.checkNoticeId}</p>
                  <p><strong>Học sinh:</strong> {selectedChild ? `${selectedChild.name} (${selectedChild.class})` : 'Chưa chọn học sinh'}</p>
                  <p><strong>Ngày kiểm tra:</strong> {selectedHealthCheck.date}</p>
                  <p><strong>Địa điểm:</strong> {selectedHealthCheck.location}</p>
                  <p><strong>Trạng thái:</strong> {
                    (() => {
                      // Chuẩn hóa trạng thái
                      const status = selectedHealthCheck.status ? selectedHealthCheck.status.toLowerCase() : 'pending';
                      
                      if (status === 'confirmed' || status === 'confirm' || status === 'đã xác nhận') {
                        return 'Đã xác nhận';
                      } else if (status === 'declined' || status === 'cancelled' || status === 'đã từ chối') {
                        return 'Đã từ chối';
                      } else {
                        return 'Chưa xác nhận';
                      }
                    })()
                  }</p>
                  {selectedHealthCheck.confirmationId && (
                    <p><strong>Mã xác nhận:</strong> {selectedHealthCheck.confirmationId}</p>
                  )}
                </Card>
              </Col>
              <Col span={24}>
                <Card title="Mô tả" bordered={false}>
                  <p>{selectedHealthCheck.description}</p>
                </Card>
              </Col>
              {selectedHealthCheck.noticeDetail && (
                <Col span={24}>
                  <Card title="Thông tin bổ sung" bordered={false}>
                    {selectedHealthCheck.noticeDetail.createdAt && Array.isArray(selectedHealthCheck.noticeDetail.createdAt) && (
                      <p><strong>Ngày tạo thông báo:</strong> {
                        `${selectedHealthCheck.noticeDetail.createdAt[2]}/${selectedHealthCheck.noticeDetail.createdAt[1]}/${selectedHealthCheck.noticeDetail.createdAt[0]}`
                      }</p>
                    )}
                    {selectedHealthCheck.noticeDetail.additionalInfo && (
                      <p><strong>Thông tin thêm:</strong> {selectedHealthCheck.noticeDetail.additionalInfo}</p>
                    )}
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HealthCheckPage; 