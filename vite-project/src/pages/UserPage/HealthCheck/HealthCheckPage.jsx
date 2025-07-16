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
    }
  }, [parentId, selectedChild]);

  // Fetch data khi component được mount
  useEffect(() => {
    if (parentId) {
      // Kiểm tra xem có thông báo đã chọn từ HeaderAfter không
      const selectedNoticeStr = localStorage.getItem('selectedHealthCheckNotice');
      if (selectedNoticeStr) {
        try {
          const selectedNotice = JSON.parse(selectedNoticeStr);
          console.log('Selected health check notice:', selectedNotice);
          
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
                deadline: 'Sớm nhất có thể'
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
      
      fetchUserChildren();
    }
  }, [parentId]);

  // Lấy danh sách thông báo kiểm tra sức khỏe
  const fetchHealthCheckNotices = async () => {
    if (!selectedChild) return;
    
    setLoading(true);
    setConfirmationsLoading(true);
    try {
      // Lấy tất cả thông báo kiểm tra sức khỏe
      const allHealthCheckNotices = await parentApi.getAllHealthCheckNotices();
      console.log('All health check notices:', allHealthCheckNotices);
      
      // Lấy danh sách xác nhận kiểm tra sức khỏe của học sinh đã chọn
      const studentConfirmations = await parentApi.getHealthCheckConfirmationsByStudent(selectedChild.id);
      console.log('Student health check confirmations:', studentConfirmations);
      
      // Tạo map các xác nhận theo checkNoticeId để dễ dàng kiểm tra trạng thái
      const confirmationsMap = {};
      studentConfirmations.forEach(confirmation => {
        confirmationsMap[confirmation.checkNoticeId] = confirmation;
      });
      
      // Chuyển đổi dữ liệu cho bảng upcomingHealthChecks
      const upcoming = allHealthCheckNotices.map(notice => {
        // Format ngày từ mảng [năm, tháng, ngày] thành chuỗi ngày/tháng/năm
        const formatDate = (dateArray) => {
          if (Array.isArray(dateArray) && dateArray.length >= 3) {
            return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`;
          }
          return 'Chưa xác định';
        };
        
        // Kiểm tra xem học sinh đã xác nhận thông báo này chưa
        const confirmation = confirmationsMap[notice.checkNoticeId];
        let status = 'pending';
        
        if (confirmation) {
          status = confirmation.status.toLowerCase();
        }
        
        return {
          key: notice.checkNoticeId.toString(),
          id: notice.checkNoticeId,
          checkNoticeId: notice.checkNoticeId,
          name: notice.title,
          date: formatDate(notice.date),
          location: 'Phòng y tế trường',
          status: status,
          description: notice.description,
          deadline: formatDate(notice.createdAt),
          // Thông tin học sinh
          studentId: selectedChild.id,
          studentName: selectedChild.name,
          className: selectedChild.class
        };
      });
      
      setUpcomingHealthChecks(upcoming);
      
      // Hiển thị thông báo nếu không có xác nhận nào
      if (studentConfirmations.length === 0) {
        message.info(`Không tìm thấy thông báo kiểm tra sức khỏe nào cho học sinh ${selectedChild.name}`);
      }
      
      // Lấy lịch sử kiểm tra sức khỏe cho học sinh đã chọn
      fetchHealthCheckHistory();
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

  // Lấy danh sách con của phụ huynh
  const fetchUserChildren = async () => {
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
        
        // Set the first child as selected by default
        if (formattedChildren.length > 0 && !selectedChild) {
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

  // Xử lý khi chọn học sinh
  const handleChildSelect = (child) => {
    setSelectedChild(child);
    // fetchHealthCheckNotices() is now triggered by useEffect
  };

  // Lấy lịch sử kiểm tra sức khỏe cho học sinh đã chọn
  const fetchHealthCheckHistory = async () => {
    if (!selectedChild) return;
    
    setLoading(true);
    try {
      // Giả lập API call - trong thực tế, bạn sẽ gọi API với ID của học sinh đã chọn
      // const history = await parentApi.getChildHealthCheckHistory(parentId, selectedChild.id);
      
      // Mock data cho lịch sử kiểm tra sức khỏe
      const mockHistory = [
        {
          id: 'HC001',
          checkNotice: {
            title: 'Kiểm tra sức khỏe định kỳ học kỳ 2'
          },
          date: '15/02/2025',
          details: {
            height: 165,
            weight: 55,
            leftEye: '10/10',
            rightEye: '10/10',
            bloodPressure: '110/70',
            dentalStatus: 'Tốt',
            generalHealth: 'Tốt',
            recommendations: 'Không có khuyến nghị đặc biệt'
          }
        },
        {
          id: 'HC002',
          checkNotice: {
            title: 'Kiểm tra sức khỏe răng miệng'
          },
          date: '20/03/2025',
          details: {
            dentalStatus: 'Cần điều trị sâu răng nhẹ',
            recommendations: 'Nên đến nha sĩ để điều trị sâu răng ở răng hàm dưới bên phải'
          }
        },
      ];
      
      // Format dữ liệu lịch sử cho bảng
      const formattedHistory = mockHistory.map(record => ({
        key: record.id.toString(),
        id: record.id,
        name: record.checkNotice?.title || 'Kiểm tra sức khỏe',
        date: record.date,
        location: 'Phòng y tế trường',
        status: 'completed',
        student: selectedChild.name,
        result: {
          height: record.details?.height || 0,
          weight: record.details?.weight || 0,
          bmi: record.details?.height && record.details?.weight ? 
            (record.details.weight / ((record.details.height / 100) ** 2)).toFixed(1) : 0,
          bmiStatus: getBmiStatus(record.details?.height, record.details?.weight),
          leftEye: record.details?.leftEye || 'N/A',
          rightEye: record.details?.rightEye || 'N/A',
          bloodPressure: record.details?.bloodPressure || 'N/A',
          dentalStatus: record.details?.dentalStatus || 'N/A',
          generalHealth: record.details?.generalHealth || 'N/A',
          recommendations: record.details?.recommendations || 'Không có khuyến nghị đặc biệt'
        }
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
          name: 'Kiểm tra sức khỏe định kỳ học kỳ 2',
          date: '15/02/2025',
          location: 'Phòng y tế trường',
          status: 'completed',
          student: selectedChild?.name || 'Nguyễn Văn An',
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
  
  // Tính toán trạng thái BMI
  const getBmiStatus = (height, weight) => {
    if (!height || !weight) return 'N/A';
    
    const bmi = weight / ((height / 100) ** 2);
    
    if (bmi < 18.5) return 'Thiếu cân';
    if (bmi < 25) return 'Bình thường';
    if (bmi < 30) return 'Thừa cân';
    return 'Béo phì';
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
        <div className="action-buttons">
          <Button 
            type="primary" 
            onClick={() => showDetailModal(record)}
            style={{ marginRight: 8 }}
          >
            Chi tiết
          </Button>
          {record.status === 'pending' && (
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
    const status = formValues.confirmStatus;
    
    parentApi.confirmHealthCheck(
      selectedHealthCheck.checkNoticeId,
      selectedChild.id,
      parentId,
      status
    )
      .then(() => {
        message.success(`Đã ${status === 'CONFIRMED' ? 'xác nhận' : 'từ chối'} tham gia kiểm tra sức khỏe cho học sinh ${selectedChild.name}`);
        setConfirmModalVisible(false);
        
        // Cập nhật trạng thái trong danh sách
        const updatedHealthChecks = upcomingHealthChecks.map(item => {
          if (item.id === selectedHealthCheck.id) {
            return {
              ...item,
              status: status.toLowerCase()
            };
          }
          return item;
        });
        
        setUpcomingHealthChecks(updatedHealthChecks);
      })
      .catch(error => {
        console.error('Error confirming health check:', error);
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
          
          <Divider />

          <Form.Item
            name="confirmStatus"
            label="Xác nhận tham gia"
            rules={[{ required: true, message: 'Vui lòng chọn xác nhận hoặc từ chối!' }]}
          >
            <Radio.Group>
              <Radio value="CONFIRMED">Xác nhận tham gia</Radio>
              <Radio value="DECLINED">Từ chối tham gia</Radio>
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
          selectedHealthCheck?.status === 'pending' && (
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
                    selectedHealthCheck.status === 'confirmed' ? 'Đã xác nhận' : 
                    selectedHealthCheck.status === 'declined' ? 'Đã từ chối' : 'Chưa xác nhận'
                  }</p>
                </Card>
              </Col>
              <Col span={24}>
                <Card title="Mô tả" bordered={false}>
                  <p>{selectedHealthCheck.description}</p>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HealthCheckPage; 