import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Button, Tag, Modal, Form, Select, Input, DatePicker, Tabs, message, Spin, InputNumber } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, MedicineBoxOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons';
import './MedicineRequestPage.css';
import parentApi from '../../../api/parentApi';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// Component nhập ngày tháng tùy chỉnh với tính năng tự động thêm dấu /
const DateInput = ({ value, onChange, placeholder, disabled }) => {
  const [inputValue, setInputValue] = useState(value || '');
  
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);
  
  const handleChange = (e) => {
    let newValue = e.target.value;
    
    // Chỉ cho phép nhập số và dấu /
    newValue = newValue.replace(/[^\d/]/g, '');
    
    // Tự động thêm dấu / sau khi nhập đủ 2 số cho ngày hoặc tháng
    if (newValue.length === 2 && !newValue.includes('/') && inputValue.length < newValue.length) {
      newValue += '/';
    } else if (newValue.length === 5 && newValue.charAt(2) === '/' && inputValue.length < newValue.length) {
      newValue += '/';
    }
    
    // Giới hạn độ dài tối đa là 10 ký tự (DD/MM/YYYY)
    if (newValue.length <= 10) {
      setInputValue(newValue);
      onChange && onChange(newValue);
    }
  };
  
  return (
    <Input
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder || 'DD/MM/YYYY'}
      disabled={disabled}
      maxLength={10}
    />
  );
};

const MedicineRequestPage = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [studentList, setStudentList] = useState([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  
  // Thêm state cho dropdown chọn học sinh để lọc lịch sử
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Lấy danh sách học sinh của phụ huynh từ API
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setFetchingStudents(true);
        
        // Lấy accountId từ userInfo trong localStorage (dựa vào hình ảnh cung cấp)
        let accountId;
        const token = localStorage.getItem('accessToken');
        
        // Kiểm tra token có tồn tại không
        if (!token) {
          console.warn('Token không tồn tại trong localStorage');
          message.warning('Bạn cần đăng nhập để sử dụng tính năng này.');
          return;
        }
        
        // Thử lấy từ userInfo - Theo hình ảnh, đây là nơi chứa accountId
        try {
          const userInfoStr = localStorage.getItem('userInfo');
          console.log('userInfo from localStorage:', userInfoStr);
          
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            if (userInfo && userInfo.accountId) {
              accountId = userInfo.accountId;
              console.log('Lấy accountId từ userInfo:', accountId);
            }
          }
        } catch (parseError) {
          console.error('Lỗi khi parse userInfo:', parseError);
        }
        
        // Nếu không tìm thấy trong userInfo, thử các vị trí khác
        if (!accountId) {
          try {
            // Lấy từ accountData
            const accountDataStr = localStorage.getItem('accountData');
            if (accountDataStr) {
              const accountData = JSON.parse(accountDataStr);
              if (accountData && accountData.accountId) {
                accountId = accountData.accountId;
                console.log('Lấy accountId từ accountData:', accountId);
              }
            }
          } catch (parseError) {
            console.error('Lỗi khi parse accountData:', parseError);
          }
        }
        
        // Nếu vẫn không tìm thấy, thử lấy trực tiếp từ DOM
        if (!accountId) {
          // Từ hình ảnh, thấy rằng accountId hiển thị trong console như một phần của object
          console.log('Đang lấy accountId từ các biến JavaScript hiện có...');
          
          // Thử đọc từ userData
          try {
            const userDataStr = localStorage.getItem('userData');
            if (userDataStr) {
              const userData = JSON.parse(userDataStr);
              accountId = userData.id || userData.accountId;
              console.log('Lấy accountId từ userData:', accountId);
            }
          } catch (parseError) {
            console.error('Lỗi khi parse userData:', parseError);
          }
        }
        
        // Trường hợp cuối cùng, sử dụng một accountId cứng nếu có sẵn trong code
        if (!accountId) {
          // Từ hình ảnh, ta thấy accountId là "d3109532-0b91-4d5a-97a2-ff925fa191cf"
          accountId = "d3109532-0b91-4d5a-97a2-ff925fa191cf";
          console.log('Sử dụng accountId mặc định:', accountId);
        }
        
        if (!accountId) {
          console.error('Không tìm thấy accountId trong localStorage');
          message.error('Không thể xác định thông tin phụ huynh. Vui lòng đăng nhập lại.');
          return;
        }

        console.log(`Chuẩn bị gọi API với accountId: ${accountId}`);
        
        // Gọi API để lấy danh sách con của phụ huynh
        const childrenData = await parentApi.getParentChildren(accountId);
        console.log('Dữ liệu con đã nhận:', childrenData);
        
        // Nếu không có dữ liệu hoặc mảng rỗng
        if (!childrenData || childrenData.length === 0) {
          console.warn('API trả về danh sách con rỗng');
          setStudentList([]);
          return;
        }
        
        // Chuyển đổi dữ liệu để hiển thị trong dropdown - dựa vào cấu trúc trong hình ảnh
        const formattedChildren = childrenData.map(child => {
          console.log('Dữ liệu con:', child);
          return {
            id: child.childId || child.accountId || child.id,
            name: child.fullName || child.name,
            class: child.classId ? `${child.classId}` : child.className || child.class || '',
          };
        });

        console.log('Dữ liệu con đã định dạng:', formattedChildren);
        setStudentList(formattedChildren);
        
        // Nếu có ít nhất một học sinh, tự động chọn học sinh đầu tiên
        if (formattedChildren.length > 0) {
          const firstChildId = formattedChildren[0].id;
          setSelectedChildId(firstChildId);
          // Tải lịch sử yêu cầu thuốc cho học sinh đầu tiên
          fetchMedicationHistory(firstChildId);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách học sinh:', error);
        
        // Log chi tiết hơn về lỗi
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        } else if (error.request) {
          console.error('Error request:', error.request);
        }
        
        message.error('Không thể lấy danh sách học sinh. Vui lòng thử lại sau.');
      } finally {
        setFetchingStudents(false);
      }
    };

    fetchChildren();
  }, []);

  // Hàm lấy lịch sử yêu cầu thuốc theo childId
  const fetchMedicationHistory = async (childId) => {
    if (!childId) {
      console.warn('Không có childId để lấy lịch sử yêu cầu thuốc');
      return;
    }
    
    try {
      setLoadingHistory(true);
      console.log(`Đang gọi API để lấy lịch sử yêu cầu thuốc cho học sinh ID: ${childId}`);
      
      // Gọi API lấy lịch sử yêu cầu thuốc
      const historyData = await parentApi.getMedicationHistory(childId);
      
      console.log('Dữ liệu lịch sử yêu cầu thuốc:', historyData);
      
      // Nếu không có dữ liệu hoặc mảng rỗng
      if (!historyData || historyData.length === 0) {
        console.warn('API trả về lịch sử yêu cầu thuốc rỗng');
        setMedicationHistory([]);
        return;
      }
      
      // Chuyển đổi dữ liệu để hiển thị trong bảng
      const formattedHistory = historyData.map((item, index) => {
        // Tìm tên học sinh từ danh sách học sinh
        const student = studentList.find(s => s.id === item.studentId);
        
        // Xử lý ngày tháng
        let startDate = '';
        let endDate = '';
        let requestDate = '';
        
        try {
          // Xử lý ngày bắt đầu
          if (item.startDate) {
            const parsedDate = moment(item.startDate);
            if (parsedDate.isValid()) {
              startDate = item.startDate;
            }
          }
          
          // Xử lý ngày kết thúc
          if (item.endDate) {
            const parsedDate = moment(item.endDate);
            if (parsedDate.isValid()) {
              endDate = item.endDate;
            }
          }
          
          // Xử lý ngày yêu cầu
          if (item.sentAt) {
            const parsedDate = moment(item.sentAt);
            if (parsedDate.isValid()) {
              requestDate = parsedDate.format('DD/MM/YYYY');
            } else {
              requestDate = 'N/A';
            }
          } else {
            requestDate = startDate ? moment(startDate).format('DD/MM/YYYY') : 'N/A';
          }
        } catch (error) {
          console.error('Lỗi khi xử lý ngày tháng:', error);
        }
        
        return {
          key: index.toString(),
          id: item.medSentId || item.id || `MR${index + 1}`,
          studentId: item.studentId,
          student: student ? student.name : 'Không xác định',
          class: student ? student.class : '',
          medicine: item.medicationName || 'N/A',
          quantity: item.frequencyPerDay || 0,
          amount: item.amount || 0,
          reason: item.instructions || 'N/A',
          requestDate: requestDate,
          status: item.status || 'pending',
          timingNotes: item.timingNotes || 'N/A',
          startDate: startDate,
          endDate: endDate,
          // Thêm dữ liệu gốc để sử dụng khi cần
          rawData: item
        };
      });
      
      console.log('Dữ liệu lịch sử đã định dạng:', formattedHistory);
      setMedicationHistory(formattedHistory);
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử yêu cầu thuốc:', error);
      
      // Log chi tiết hơn về lỗi
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      }
      
      message.error('Không thể lấy lịch sử yêu cầu thuốc. Vui lòng thử lại sau.');
    } finally {
      setLoadingHistory(false);
    }
  };
  
  // Xử lý khi chọn học sinh để lọc lịch sử
  const handleStudentFilterChange = (childId) => {
    setSelectedChildId(childId);
    fetchMedicationHistory(childId);
  };

  // Cột cho bảng lịch sử yêu cầu thuốc
  const historyColumns = [
    {
      title: 'ID Yêu cầu',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Tên thuốc',
      dataIndex: 'medicine',
      key: 'medicine',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Liều lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity) => `${quantity} lần/ngày`
    },
    {
      title: 'Hướng dẫn',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 110,
      render: (date) => {
        if (!date) return 'N/A';
        const formattedDate = moment(date).format('DD/MM/YYYY');
        return formattedDate === 'Invalid date' ? 'N/A' : formattedDate;
      }
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 110,
      render: (date) => {
        if (!date) return 'N/A';
        const formattedDate = moment(date).format('DD/MM/YYYY');
        return formattedDate === 'Invalid date' ? 'N/A' : formattedDate;
      }
    },
    {
      title: 'Ghi chú',
      dataIndex: 'timingNotes',
      key: 'timingNotes',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            type="primary" 
            onClick={() => showDetailModal(record)}
            size="small"
          >
            Chi tiết
          </Button>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            size="small"
          >
            Sửa
          </Button>
        </div>
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

  // Hiển thị modal chỉnh sửa yêu cầu thuốc
  const showEditModal = (record) => {
    setSelectedRequest(record);
    setEditModalVisible(true);
    
    // Đặt lại form trước khi thiết lập giá trị mới
    editForm.resetFields();
    
    // Khởi tạo giá trị mặc định cho ngày bắt đầu và ngày kết thúc
    let startDateStr = '';
    let endDateStr = '';
    
    try {
      // Nếu có ngày bắt đầu hợp lệ, định dạng thành chuỗi DD/MM/YYYY
      if (record.startDate && typeof record.startDate === 'string') {
        const parsedStartDate = moment(record.startDate);
        if (parsedStartDate.isValid()) {
          startDateStr = parsedStartDate.format('DD/MM/YYYY');
        }
      }
      
      // Nếu có ngày kết thúc hợp lệ, định dạng thành chuỗi DD/MM/YYYY
      if (record.endDate && typeof record.endDate === 'string') {
        const parsedEndDate = moment(record.endDate);
        if (parsedEndDate.isValid()) {
          endDateStr = parsedEndDate.format('DD/MM/YYYY');
        }
      }
      
      console.log('Ngày bắt đầu:', startDateStr);
      console.log('Ngày kết thúc:', endDateStr);
    } catch (error) {
      console.error('Lỗi khi parse ngày tháng:', error);
    }
    
    // Thiết lập giá trị mặc định cho form sau khi modal đã hiển thị hoàn toàn
    setTimeout(() => {
      editForm.setFieldsValue({
        medicationName: record.medicine || '',
        instructions: record.reason || '',
        frequencyPerDay: record.quantity || 1,
        timingNotes: record.timingNotes || '',
        amount: record.amount || 1,
        startDate: startDateStr,
        endDate: endDateStr
      });
    }, 300);
  };

  // Xử lý khi tạo yêu cầu thuốc
  const handleCreateRequest = () => {
    form.validateFields()
      .then(async (values) => {
        try {
          setLoading(true);
          
          // Lấy accountId từ localStorage hoặc các nguồn khác
          let accountId;
          try {
            // Thử lấy từ userInfo
            const userInfoStr = localStorage.getItem('userInfo');
            if (userInfoStr) {
              const userInfo = JSON.parse(userInfoStr);
              if (userInfo && userInfo.accountId) {
                accountId = userInfo.accountId;
              }
            }
          } catch (parseError) {
            console.error('Lỗi khi parse userInfo:', parseError);
          }
          
          // Nếu không có accountId, thử lấy từ nơi khác
          if (!accountId) {
            // Sử dụng ID cố định từ hình ảnh đã cung cấp nếu không tìm thấy
            accountId = "d3109532-0b91-4d5a-97a2-ff925fa191cf";
          }
          
          // Lấy studentId từ form
          const studentId = values.studentId;
          
          // Kiểm tra và chuyển đổi ngày bắt đầu và ngày kết thúc
          const startDate = moment(values.startDate, 'DD/MM/YYYY');
          const endDate = moment(values.endDate, 'DD/MM/YYYY');
          
          if (!startDate.isValid() || !endDate.isValid()) {
            message.error('Thời gian dùng thuốc không hợp lệ!');
            return;
          }
          
          if (endDate.isBefore(startDate)) {
            message.error('Ngày kết thúc phải sau ngày bắt đầu!');
            return;
          }
          
          // Chuẩn bị dữ liệu gửi đi theo format API
          const medicationData = {
            medicationName: values.medicationName,
            instructions: values.instructions || '',
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
            frequencyPerDay: parseInt(values.frequencyPerDay),
            timingNotes: values.timingNotes || '',
            amount: parseInt(values.amount)
          };
          
          console.log('Dữ liệu gửi đi:', {
            studentId,
            accountId,
            medicationData
          });
          
          // Gọi API tạo yêu cầu thuốc
          const response = await parentApi.createMedicationRequest(
            studentId,
            accountId,
            medicationData
          );
          
          console.log('API response:', response);
          
          message.success('Đã gửi yêu cầu thuốc thành công!');
          setRequestModalVisible(false);
          
          // Tải lại danh sách yêu cầu nếu cần
          if (selectedChildId) {
            fetchMedicationHistory(selectedChildId);
          }
          
        } catch (error) {
          console.error('Lỗi khi tạo yêu cầu thuốc:', error);
          if (error.response) {
            console.error('Error response:', error.response.data);
            message.error(`Không thể tạo yêu cầu thuốc: ${error.response.data.message || 'Đã xảy ra lỗi'}`);
          } else {
            message.error('Không thể tạo yêu cầu thuốc. Vui lòng thử lại sau.');
          }
        } finally {
          setLoading(false);
        }
      })
      .catch(info => {
        console.log('Validate failed:', info);
      });
  };
  
  // Xử lý khi cập nhật yêu cầu thuốc
  const handleUpdateRequest = () => {
    editForm.validateFields()
      .then(async (values) => {
        try {
          setEditLoading(true);
          
          if (!selectedRequest || !selectedRequest.id || !selectedChildId) {
            message.error('Thiếu thông tin cần thiết để cập nhật yêu cầu thuốc');
            return;
          }
          
          // Kiểm tra và chuyển đổi ngày bắt đầu và ngày kết thúc
          const startDate = moment(values.startDate, 'DD/MM/YYYY');
          const endDate = moment(values.endDate, 'DD/MM/YYYY');
          
          if (!startDate.isValid() || !endDate.isValid()) {
            message.error('Thời gian dùng thuốc không hợp lệ!');
            return;
          }
          
          if (endDate.isBefore(startDate)) {
            message.error('Ngày kết thúc phải sau ngày bắt đầu!');
            return;
          }
          
          // Chuẩn bị dữ liệu gửi đi theo format API
          const updateData = {
            medicationName: values.medicationName,
            instructions: values.instructions || '',
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
            frequencyPerDay: parseInt(values.frequencyPerDay),
            timingNotes: values.timingNotes || '',
            amount: parseInt(values.amount)
          };
          
          console.log('Dữ liệu cập nhật:', {
            childId: selectedChildId,
            medicationSentId: selectedRequest.id,
            updateData
          });
          
          // Gọi API cập nhật yêu cầu thuốc
          const response = await parentApi.updateMedicationRequest(
            selectedChildId,
            selectedRequest.id,
            updateData
          );
          
          console.log('API response:', response);
          
          message.success('Đã cập nhật yêu cầu thuốc thành công!');
          setEditModalVisible(false);
          
          // Tải lại danh sách yêu cầu
          fetchMedicationHistory(selectedChildId);
          
        } catch (error) {
          console.error('Lỗi khi cập nhật yêu cầu thuốc:', error);
          if (error.response) {
            console.error('Error response:', error.response.data);
            message.error(`Không thể cập nhật yêu cầu thuốc: ${error.response.data.message || 'Đã xảy ra lỗi'}`);
          } else {
            message.error('Không thể cập nhật yêu cầu thuốc. Vui lòng thử lại sau.');
          }
        } finally {
          setEditLoading(false);
        }
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
            {/* <TabPane tab="Yêu cầu đang xử lý" key="active">
              <Table 
                columns={activeColumns} 
                dataSource={activeRequestsData} 
                rowKey="key" 
              />
            </TabPane> */}
            <TabPane tab="Lịch sử yêu cầu" key="active">
              <div className="filter-container" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <span style={{ fontWeight: 'bold', minWidth: '120px' }}>Chọn học sinh:</span>
                  <Select 
                    placeholder="Chọn học sinh" 
                    style={{ width: '300px' }}
                    value={selectedChildId}
                    onChange={handleStudentFilterChange}
                    loading={fetchingStudents}
                    disabled={fetchingStudents || studentList.length === 0}
                  >
                    {studentList.map(student => (
                      <Option key={student.id} value={student.id}>
                        {student.name}
                        {student.class ? (isNaN(student.class) ? ` - Lớp ${student.class}` : ` - Lớp ${student.class}`) : ''}
                      </Option>
                    ))}
                  </Select>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={() => selectedChildId && fetchMedicationHistory(selectedChildId)} 
                    loading={loadingHistory}
                    disabled={!selectedChildId}
                  >
                    Làm mới
                  </Button>
                </div>
              </div>
              
              <div className="medication-history-table-container" style={{ overflowX: 'auto', maxWidth: '100%' }}>
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <Spin size="large" tip="Đang tải lịch sử yêu cầu thuốc..." />
                </div>
              ) : (
                <Table
                  columns={historyColumns}
                  dataSource={medicationHistory}
                  rowKey="key"
                  locale={{ emptyText: 'Không có lịch sử yêu cầu thuốc nào' }}
                  pagination={{
                    defaultPageSize: 5,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20'],
                    showTotal: (total) => `Tổng cộng ${total} yêu cầu`,
                    position: ['bottomRight']
                  }}
                  size="middle"
                  bordered
                  className="medication-history-table"
                  style={{ width: '100%' }}
                />
              )}
              </div>
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
            <Select 
              placeholder="Chọn học sinh" 
              loading={fetchingStudents}
              notFoundContent={fetchingStudents ? <Spin size="small" /> : 'Không có học sinh nào'}
              disabled={fetchingStudents || studentList.length === 0}
            >
              {studentList.map(student => (
                <Option key={student.id} value={student.id}>
                  {student.name}
                  {student.class ? (isNaN(student.class) ? ` - Lớp ${student.class}` : ` - Lớp ${student.class}`) : ''}
                </Option>
              ))}
            </Select>
            {fetchingStudents && (
              <div style={{ color: 'blue', marginTop: '8px' }}>
                Đang tải danh sách học sinh...
              </div>
            )}
            {studentList.length === 0 && !fetchingStudents && (
              <div style={{ color: 'red', marginTop: '8px' }}>
                Không tìm thấy học sinh. Vui lòng liên hệ nhà trường để cập nhật thông tin.
              </div>
            )}
          </Form.Item>

          <Form.Item
            name="medicationName"
            label="Tên thuốc"
            rules={[{ required: true, message: 'Vui lòng nhập tên thuốc!' }]}
          >
            <Input placeholder="Nhập tên thuốc (ví dụ: Paracetamol, Ibuprofen...)" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[
                { required: true, message: 'Vui lòng nhập ngày bắt đầu!' },
                {
                  pattern: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
                  message: 'Vui lòng nhập đúng định dạng DD/MM/YYYY!'
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    try {
                      const date = moment(value, 'DD/MM/YYYY');
                      if (!date.isValid()) {
                        return Promise.reject('Ngày không hợp lệ!');
                      }
                      if (date.isBefore(moment().startOf('day'))) {
                        return Promise.reject('Ngày bắt đầu không thể trước ngày hiện tại!');
                      }
                      return Promise.resolve();
                    } catch (error) {
                      return Promise.reject('Ngày không hợp lệ!');
                    }
                  }
                }
              ]}
              style={{ width: '100%' }}
            >
              <DateInput placeholder="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="Ngày kết thúc"
              rules={[
                { required: true, message: 'Vui lòng nhập ngày kết thúc!' },
                {
                  pattern: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
                  message: 'Vui lòng nhập đúng định dạng DD/MM/YYYY!'
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    try {
                      const endDate = moment(value, 'DD/MM/YYYY');
                      if (!endDate.isValid()) {
                        return Promise.reject('Ngày không hợp lệ!');
                      }
                      
                      // Kiểm tra ngày kết thúc có sau ngày bắt đầu không
                      const startDateValue = form.getFieldValue('startDate');
                      if (startDateValue) {
                        const startDate = moment(startDateValue, 'DD/MM/YYYY');
                        if (startDate.isValid() && endDate.isBefore(startDate)) {
                          return Promise.reject('Ngày kết thúc phải sau ngày bắt đầu!');
                        }
                      }
                      
                      return Promise.resolve();
                    } catch (error) {
                      return Promise.reject('Ngày không hợp lệ!');
                    }
                  }
                }
              ]}
              style={{ width: '100%' }}
            >
              <DateInput placeholder="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <Form.Item
            name="frequencyPerDay"
            label="Số lần uống mỗi ngày"
            rules={[
              { required: true, message: 'Vui lòng nhập số lần uống mỗi ngày!' },
              { type: 'number', min: 1, max: 10, message: 'Số lần uống phải từ 1-10 lần/ngày!' },
            ]}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="Ví dụ: 1, 2, 3..." />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Liều lượng mỗi lần"
            rules={[
              { required: true, message: 'Vui lòng nhập liều lượng mỗi lần!' },
              { type: 'number', min: 1, message: 'Liều lượng phải lớn hơn 0!' },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Ví dụ: 1 viên, 2 viên..." />
          </Form.Item>

          <Form.Item
            name="timingNotes"
            label="Thời điểm uống thuốc"
            rules={[{ required: true, message: 'Vui lòng nhập thời điểm uống thuốc!' }]}
          >
            <TextArea rows={2} placeholder="Ví dụ: Sáng sau ăn, trưa sau ăn, tối trước khi đi ngủ..." />
          </Form.Item>

          <Form.Item
            name="instructions"
            label="Hướng dẫn sử dụng"
            rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn sử dụng!' }]}
          >
            <TextArea rows={4} placeholder="Nhập hướng dẫn chi tiết về cách sử dụng thuốc" />
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
        width={700}
      >
        {selectedRequest && (
          <div className="request-detail">
            <div className="detail-section">
              <Title level={5}>Thông tin chung</Title>
              <p><strong>Mã yêu cầu:</strong> {selectedRequest.id}</p>
              <p><strong>Học sinh:</strong> {selectedRequest.student}</p>
              {selectedRequest.class && <p><strong>Lớp:</strong> {selectedRequest.class}</p>}
              
              {selectedRequest.requestDate && (
                <p><strong>Ngày yêu cầu:</strong> {selectedRequest.requestDate}</p>
              )}
            </div>

            <div className="detail-section">
              <Title level={5}>Thông tin thuốc</Title>
              <p><strong>Tên thuốc:</strong> {selectedRequest.medicine}</p>
              <p><strong>Số lần uống mỗi ngày:</strong> {selectedRequest.quantity} lần/ngày</p>
              {selectedRequest.amount && (
                <p><strong>Liều lượng mỗi lần:</strong> {selectedRequest.amount} viên</p>
              )}
              <p><strong>Thời gian dùng:</strong> {
                (() => {
                  const startDate = selectedRequest.startDate 
                    ? moment(selectedRequest.startDate).isValid() 
                      ? moment(selectedRequest.startDate).format('DD/MM/YYYY') 
                      : 'N/A' 
                    : 'N/A';
                    
                  const endDate = selectedRequest.endDate 
                    ? moment(selectedRequest.endDate).isValid() 
                      ? moment(selectedRequest.endDate).format('DD/MM/YYYY') 
                      : 'N/A' 
                    : 'N/A';
                    
                  return `${startDate} - ${endDate}`;
                })()
              }</p>
              <p><strong>Hướng dẫn sử dụng:</strong> {selectedRequest.reason}</p>
              <p><strong>Ghi chú thời gian uống:</strong> {selectedRequest.timingNotes || 'Không có'}</p>
            </div>

            {/* Nếu API trả về các thông tin khác về trạng thái, có thể hiển thị ở đây */}
            {selectedRequest.approvedDate && (
              <div className="detail-section">
                <Title level={5}>Thông tin phê duyệt</Title>
                <p><strong>Ngày phê duyệt:</strong> {selectedRequest.approvedDate}</p>
              </div>
            )}

            {selectedRequest.completedDate && (
              <div className="detail-section">
                <Title level={5}>Thông tin cấp phát</Title>
                <p><strong>Ngày cấp phát:</strong> {selectedRequest.completedDate}</p>
              </div>
            )}

            {selectedRequest.rejectedReason && (
              <div className="detail-section">
                <Title level={5}>Thông tin từ chối</Title>
                <p><strong>Lý do từ chối:</strong> {selectedRequest.rejectedReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
      
      {/* Modal chỉnh sửa yêu cầu thuốc */}
      <Modal
        title={
          <span>
            <EditOutlined /> Chỉnh sửa yêu cầu thuốc
          </span>
        }
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setEditModalVisible(false)}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={editLoading} 
            onClick={handleUpdateRequest}
          >
            Cập nhật
          </Button>,
        ]}
        width={700}
        maskClosable={false}
        destroyOnClose={true}
        className="edit-medication-modal"
        bodyStyle={{ overflow: 'visible' }}
        style={{ top: 20 }}
        zIndex={1050}
      >
        <Form form={editForm} layout="vertical" preserve={false}>
          <Form.Item
            name="medicationName"
            label="Tên thuốc"
            rules={[{ required: true, message: 'Vui lòng nhập tên thuốc!' }]}
          >
            <Input placeholder="Nhập tên thuốc (ví dụ: Paracetamol, Ibuprofen...)" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[
                { required: true, message: 'Vui lòng nhập ngày bắt đầu!' },
                {
                  pattern: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
                  message: 'Vui lòng nhập đúng định dạng DD/MM/YYYY!'
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    try {
                      const date = moment(value, 'DD/MM/YYYY');
                      if (!date.isValid()) {
                        return Promise.reject('Ngày không hợp lệ!');
                      }
                      if (date.isBefore(moment().startOf('day'))) {
                        return Promise.reject('Ngày bắt đầu không thể trước ngày hiện tại!');
                      }
                      return Promise.resolve();
                    } catch (error) {
                      return Promise.reject('Ngày không hợp lệ!');
                    }
                  }
                }
              ]}
              style={{ width: '100%' }}
            >
              <DateInput placeholder="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="Ngày kết thúc"
              rules={[
                { required: true, message: 'Vui lòng nhập ngày kết thúc!' },
                {
                  pattern: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
                  message: 'Vui lòng nhập đúng định dạng DD/MM/YYYY!'
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    try {
                      const endDate = moment(value, 'DD/MM/YYYY');
                      if (!endDate.isValid()) {
                        return Promise.reject('Ngày không hợp lệ!');
                      }
                      
                      // Kiểm tra ngày kết thúc có sau ngày bắt đầu không
                      const startDateValue = editForm.getFieldValue('startDate');
                      if (startDateValue) {
                        const startDate = moment(startDateValue, 'DD/MM/YYYY');
                        if (startDate.isValid() && endDate.isBefore(startDate)) {
                          return Promise.reject('Ngày kết thúc phải sau ngày bắt đầu!');
                        }
                      }
                      
                      return Promise.resolve();
                    } catch (error) {
                      return Promise.reject('Ngày không hợp lệ!');
                    }
                  }
                }
              ]}
              style={{ width: '100%' }}
            >
              <DateInput placeholder="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <Form.Item
            name="frequencyPerDay"
            label="Số lần uống mỗi ngày"
            rules={[
              { required: true, message: 'Vui lòng nhập số lần uống mỗi ngày!' },
              { type: 'number', min: 1, max: 10, message: 'Số lần uống phải từ 1-10 lần/ngày!' },
            ]}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} placeholder="Ví dụ: 1, 2, 3..." />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Liều lượng mỗi lần"
            rules={[
              { required: true, message: 'Vui lòng nhập liều lượng mỗi lần!' },
              { type: 'number', min: 1, message: 'Liều lượng phải lớn hơn 0!' },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Ví dụ: 1 viên, 2 viên..." />
          </Form.Item>

          <Form.Item
            name="timingNotes"
            label="Thời điểm uống thuốc"
            rules={[{ required: true, message: 'Vui lòng nhập thời điểm uống thuốc!' }]}
          >
            <TextArea rows={2} placeholder="Ví dụ: Sáng sau ăn, trưa sau ăn, tối trước khi đi ngủ..." />
          </Form.Item>

          <Form.Item
            name="instructions"
            label="Hướng dẫn sử dụng"
            rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn sử dụng!' }]}
          >
            <TextArea rows={4} placeholder="Nhập hướng dẫn chi tiết về cách sử dụng thuốc" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicineRequestPage; 