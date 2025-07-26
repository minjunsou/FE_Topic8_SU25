import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Button, Tag, Modal, Form, Select, Input, DatePicker, Tabs, message, Spin, InputNumber, Radio, Space, Checkbox, Tooltip, Divider, Popconfirm, Row, Col } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, MedicineBoxOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
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

// Component nhập thông tin thuốc - removing this unused component

const MedicineRequestPage = () => {
  const [form] = Form.useForm();
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [studentList, setStudentList] = useState([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  
  // Thêm state cho dropdown chọn học sinh để lọc lịch sử
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // State mới cho buổi dùng thuốc
  const [selectedTimings, setSelectedTimings] = useState(['sang']);
  
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
        
        // Định dạng ngày yêu cầu
        let requestDate = 'N/A';
        if (item.requestDate) {
          try {
            const parsedDate = moment(item.requestDate);
            if (parsedDate.isValid()) {
              requestDate = parsedDate.format('DD/MM/YYYY');
            }
          } catch (error) {
            console.error('Lỗi khi parse ngày yêu cầu:', error);
          }
        }

        // Định dạng ngày gửi
        let sentDate = 'N/A';
        if (item.sentDate) {
          try {
            const parsedDate = moment(item.sentDate);
            if (parsedDate.isValid()) {
              sentDate = parsedDate.format('DD/MM/YYYY');
            }
          } catch (error) {
            console.error('Lỗi khi parse ngày gửi:', error);
          }
        }
        
        // Xử lý thông tin thuốc từ dosages
        let medicineInfo = 'Không có thông tin';
        let timingInfo = 'Không có thông tin';
        
        if (item.dosages && item.dosages.length > 0) {
          const medicationItems = [];
          const timings = [];
          
          item.dosages.forEach(dosage => {
            // Thêm thông tin buổi dùng thuốc
            if (dosage.timingNotes) {
              let timingLabel = '';
              
              switch (dosage.timingNotes) {
                case 'sang':
                  timingLabel = 'Sáng';
                  break;
                case 'trua':
                  timingLabel = 'Trưa';
                  break;
                case 'chieu':
                  timingLabel = 'Chiều';
                  break;
                default:
                  timingLabel = dosage.timingNotes;
              }
              
              timings.push(timingLabel);
            }
            
            // Thêm thông tin thuốc
            if (dosage.medicationItems && dosage.medicationItems.length > 0) {
              dosage.medicationItems.forEach(med => {
                if (med.medicationName) {
                  medicationItems.push(`${med.medicationName} (${med.amount || 1})`);
                }
              });
            }
          });
          
          if (medicationItems.length > 0) {
            medicineInfo = medicationItems.join(', ');
          }
          
          if (timings.length > 0) {
            timingInfo = timings.join(', ');
          }
        }
        
        // Lấy trạng thái từ API hoặc sử dụng trạng thái mặc định
        let status = item.status || 'PENDING';
        
        // Kiểm tra nếu yêu cầu đã được đánh dấu là đã hủy trong local state
        const existingItem = medicationHistory.find(
          hist => hist.id === item.id && hist.studentId === item.studentId && hist.status === 'CANCELLED'
        );
        
        if (existingItem) {
          status = 'CANCELLED';
        }
        
        return {
          key: index.toString(),
          id: item.id || `MR${index + 1}`,
          studentId: item.studentId,
          student: student ? student.name : 'Không xác định',
          class: student ? student.class : '',
          medicine: medicineInfo,
          timingNotes: timingInfo,
          requestDate: requestDate,
          sentDate: sentDate,
          status: status,
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

  // Xử lý khi thay đổi buổi dùng thuốc
  const handleTimingChange = (checkedValues) => {
    if (checkedValues.length === 0) {
      // Không cho phép bỏ chọn tất cả các buổi
      message.warning('Vui lòng chọn ít nhất một buổi dùng thuốc');
      setSelectedTimings(['sang']); // Mặc định chọn buổi sáng
      return;
    }
    
    setSelectedTimings(checkedValues);
    
    // Reset form fields for dosages in the create form
    const currentValues = form.getFieldsValue();
    const newValues = { ...currentValues };
    
    // Initialize dosages array with current timings
    newValues.dosages = checkedValues.map(timing => {
      // Giữ lại dữ liệu cũ nếu có
      const existingDosage = currentValues.dosages?.find(d => d.timingNotes === timing);
      if (existingDosage) {
        return existingDosage;
      }
      
      return {
        timingNotes: timing,
        medicationItems: [{ medicationName: '', amount: 1 }]
      };
    });
    
    form.setFieldsValue(newValues);
  };

  // Cột cho bảng lịch sử yêu cầu thuốc
  const historyColumns = [
    // {
    //   title: 'ID',
    //   dataIndex: 'id',
    //   key: 'id',
    //   width: 80,
    //   ellipsis: true,
    // },
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Thuốc',
      dataIndex: 'medicine',
      key: 'medicine',
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Buổi dùng thuốc',
      dataIndex: 'timingNotes',
      key: 'timingNotes',
      width: 120,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestDate',
      key: 'requestDate',
      width: 120,
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'sentDate',
      key: 'sentDate',
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        let color = '';
        let text = '';
        
        switch (status) {
          case 'APPROVED':
            color = 'green';
            text = 'Đã hoàn thành';
            break;
          case 'REJECTED':
            color = 'red';
            text = 'Từ chối';
            break;
          case 'CANCELLED':
            color = 'purple';
            text = 'Đã hủy';
            break;
          case 'PENDING':
          default:
            color = 'orange';
            text = 'Đang xử lý';
            break;
        }
        
        return (
          <Tag color={color}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            onClick={() => showDetailModal(record)}
          >
            Chi tiết
          </Button>
          
          {record.status === 'PENDING' && (
            <Popconfirm
              title="Hủy yêu cầu thuốc"
              description="Bạn có chắc chắn muốn hủy yêu cầu thuốc này không?"
              onConfirm={() => handleDeleteRequest(record)}
              okText="Có"
              cancelText="Không"
            >
              <Button 
                type="default" 
                danger
                size="small" 
                icon={<DeleteOutlined />}
              >
                Hủy
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // Hiển thị modal tạo yêu cầu thuốc
  const showRequestModal = () => {
    setRequestModalVisible(true);
    form.resetFields();
    setSelectedTimings(['sang']); // Mặc định chọn buổi sáng
  };

  // Hiển thị modal chi tiết yêu cầu thuốc
  const showDetailModal = (record) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
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
          
          // Chuẩn bị dữ liệu gửi đi theo format API mới
          const medicationData = {
            requestDate: moment().format('YYYY-MM-DD'),
            dosages: values.dosages.map(dosage => ({
              timingNotes: dosage.timingNotes,
              medicationItems: dosage.medicationItems.map(item => ({
                medicationName: item.medicationName,
                amount: parseInt(item.amount),
                unit: item.unit || "vien" // Thêm trường đơn vị
              }))
            }))
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
  
  // Xử lý khi xóa yêu cầu thuốc
  const handleDeleteRequest = async (record) => {
    try {
      if (!record || !record.id || !record.studentId) {
        message.error('Thiếu thông tin cần thiết để hủy yêu cầu thuốc');
        return;
      }

      console.log(`Đang hủy yêu cầu thuốc ID: ${record.id} của học sinh ID: ${record.studentId}`);
      
      // Thay đổi status trong local state thành CANCELLED
      const updatedHistory = medicationHistory.map(item => {
        if (item.id === record.id && item.studentId === record.studentId) {
          return { ...item, status: 'CANCELLED' };
        }
        return item;
      });
      
      setMedicationHistory(updatedHistory);
      
      // Gọi API xóa yêu cầu thuốc (có thể cần thay đổi API để hỗ trợ hủy thay vì xóa)
      await parentApi.deleteMedicationRequest(record.studentId, record.id);
      
      message.success('Đã hủy yêu cầu thuốc thành công!');
      
    } catch (error) {
      console.error('Lỗi khi hủy yêu cầu thuốc:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        message.error(`Không thể hủy yêu cầu thuốc: ${error.response.data.message || 'Đã xảy ra lỗi'}`);
      } else {
        message.error('Không thể hủy yêu cầu thuốc. Vui lòng thử lại sau.');
      }
      
      // Nếu có lỗi, tải lại danh sách để đảm bảo dữ liệu chính xác
      if (selectedChildId) {
        fetchMedicationHistory(selectedChildId);
      }
    }
  };

  // Render form tạo yêu cầu thuốc
  const renderRequestForm = () => {
    const timingLabels = {
      'sang': 'Buổi sáng',
      'trua': 'Buổi trưa',
      'chieu': 'Buổi chiều'
    };

    return (
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          dosages: selectedTimings.map(timing => ({
            timingNotes: timing,
            medicationItems: [{ medicationName: '', amount: 1 }]
          }))
        }}
      >
        <Form.Item
          name="studentId"
          label="Chọn học sinh"
          rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
        >
          <Select placeholder="Chọn học sinh" loading={fetchingStudents} disabled={fetchingStudents}>
            {studentList.map(student => (
              <Option key={student.id} value={student.id}>
                {student.name} {student.class ? `- Lớp ${student.class}` : ''}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Buổi dùng thuốc">
          <Checkbox.Group 
            options={[
              { label: 'Buổi sáng', value: 'sang' },
              { label: 'Buổi trưa', value: 'trua' },
              { label: 'Buổi chiều', value: 'chieu' }
            ]}
            value={selectedTimings}
            onChange={handleTimingChange}
          />
        </Form.Item>

        {selectedTimings.map((timing, dosageIndex) => (
          <div key={timing} className="timing-section">
            <div className="timing-header">
              <h4>{timingLabels[timing]}</h4>
            </div>
            <Form.Item
              name={['dosages', dosageIndex, 'timingNotes']}
              hidden
              initialValue={timing}
            >
              <Input />
            </Form.Item>
            
            <Form.List name={['dosages', dosageIndex, 'medicationItems']}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(field => (
                    <div key={field.key} className="medication-item-container">
                      <Form.Item
                        name={[field.name, 'medicationName']}
                        label="Tên thuốc"
                        rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}
                      >
                        <Input placeholder="Nhập tên thuốc" />
                      </Form.Item>
                      
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name={[field.name, 'amount']}
                            label="Liều lượng"
                            rules={[{ required: true, message: 'Vui lòng nhập liều lượng' }]}
                          >
                            <InputNumber min={0.5} step={0.5} placeholder="Số lượng" style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name={[field.name, 'unit']}
                            label="Đơn vị"
                            rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
                            initialValue="vien"
                          >
                            <Select placeholder="Chọn đơn vị">
                              <Option value="vien">Viên</Option>
                              <Option value="ml">ml</Option>
                              <Option value="mg">mg</Option>
                              <Option value="goi">Gói</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      
                      {fields.length > 1 && (
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={() => remove(field.name)}
                          className="delete-medication-btn"
                        />
                      )}
                    </div>
                  ))}
                  
                  <Form.Item className="add-medication-container">
                    <Button 
                      type="dashed" 
                      onClick={() => add({ medicationName: '', amount: 1, unit: 'vien' })} 
                      block
                      icon={<PlusOutlined />}
                    >
                      Thêm thuốc
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>
        ))}
      </Form>
    );
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
        onOk={handleCreateRequest}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        confirmLoading={loading}
        width={700}
      >
        {renderRequestForm()}
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
              {/* <p><strong>Mã yêu cầu:</strong> {selectedRequest.id}</p> */}
              <p><strong>Học sinh:</strong> {selectedRequest.student}</p>
              {selectedRequest.class && <p><strong>Lớp:</strong> {selectedRequest.class}</p>}
              
              <p><strong>Ngày yêu cầu:</strong> {selectedRequest.requestDate}</p>
              <p><strong>Ngày gửi:</strong> {selectedRequest.sentDate}</p>
              
              <p>
                <strong>Trạng thái:</strong>{' '}
                {selectedRequest.status === 'APPROVED' && <Tag color="green">Đã duyệt</Tag>}
                {selectedRequest.status === 'REJECTED' && <Tag color="red">Từ chối</Tag>}
                {selectedRequest.status === 'PENDING' && <Tag color="orange">Đang xử lý</Tag>}
                {selectedRequest.status === 'CANCELLED' && <Tag color="purple">Đã hủy</Tag>}
              </p>
            </div>

            <Divider className="detail-divider" />
            
            <div className="detail-section">
              <Title level={5}>Thông tin thuốc</Title>
              
              {selectedRequest.rawData && selectedRequest.rawData.dosages && selectedRequest.rawData.dosages.length > 0 ? (
                selectedRequest.rawData.dosages.map((dosage, index) => {
                  // Xác định label cho buổi dùng thuốc
                  let timingLabel = dosage.timingNotes;
                  switch (dosage.timingNotes) {
                    case 'sang':
                      timingLabel = 'Buổi sáng';
                      break;
                    case 'trua':
                      timingLabel = 'Buổi trưa';
                      break;
                    case 'chieu':
                      timingLabel = 'Buổi chiều';
                      break;
                  }
                  
                  return (
                    <div key={index} style={{ marginBottom: '16px' }}>
                      <h4>{timingLabel}</h4>
                      
                      {dosage.medicationItems && dosage.medicationItems.length > 0 ? (
                        <ul style={{ paddingLeft: '20px' }}>
                          {dosage.medicationItems.map((med, medIndex) => (
                            <li key={medIndex}>
                              <strong>{med.medicationName}</strong> - Liều lượng: {med.amount} {med.unit || 'viên'}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>Không có thông tin thuốc</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p>Không có thông tin thuốc</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicineRequestPage; 