import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Button, Space, Tag, Spin, Alert, Badge, Tooltip } from 'antd';
import { 
  MedicineBoxOutlined, 
  FileTextOutlined, 
  BarChartOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  SafetyOutlined,
  ReloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { 
  getAllVaccinationNotices, 
  getAllVaccinationRecords, 
  getAllVaccines,
  getVaccinationRecordStatistics,
  getVaccinationNoticeStatistics,
  getVaccineStatistics
} from '../../../../api/adminApi';
import { DatePicker, Select } from 'antd';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Utility function để xử lý date một cách nhất quán
const formatDate = (dateInput) => {
  if (!dateInput) return '';
  
  console.log('formatDate input:', dateInput, typeof dateInput);
  
  try {
    let parsedDate;
    
    // Xử lý trường hợp input là array [year, month, day]
    if (Array.isArray(dateInput) && dateInput.length === 3) {
      const [year, month, day] = dateInput;
      // Month trong moment.js bắt đầu từ 0, nên cần trừ 1
      parsedDate = moment([year, month - 1, day]);
      console.log('Parsed as array [year, month-1, day]:', parsedDate.format());
    }
    // Xử lý trường hợp input là string
    else if (typeof dateInput === 'string') {
      // Test với một số format phổ biến
      const testFormats = [
        'YYYY-MM-DD',
        'YYYY-MM-DDTHH:mm:ss',
        'YYYY-MM-DDTHH:mm:ss.SSSZ',
        'DD/MM/YYYY',
        'MM/DD/YYYY'
      ];
      
      // Thử parse với các format khác nhau
      for (const format of testFormats) {
        const testDate = moment(dateInput, format, true);
        if (testDate.isValid()) {
          parsedDate = testDate;
          console.log(`Parsed with format ${format}:`, parsedDate.format());
          break;
        }
      }
      
      // Nếu không parse được với format cụ thể, thử moment tự động
      if (!parsedDate || !parsedDate.isValid()) {
        parsedDate = moment(dateInput);
        console.log('Parsed with moment auto:', parsedDate.format());
      }
    }
    // Xử lý trường hợp khác
    else {
      parsedDate = moment(dateInput);
      console.log('Parsed with moment auto:', parsedDate.format());
    }
    
    if (parsedDate && parsedDate.isValid()) {
      const formatted = parsedDate.format('DD/MM/YYYY');
      console.log('Final formatted date:', formatted);
      return formatted;
    } else {
      console.warn('Invalid date after parsing:', dateInput);
      return 'Invalid Date';
    }
  } catch (error) {
    console.error('Error parsing date:', dateInput, error);
    return 'Error';
  }
};

const VaccinationDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState([]);
  const [records, setRecords] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [statistics, setStatistics] = useState({
    totalNotices: 0,
    totalRecords: 0,
    totalVaccines: 0,
    pendingConfirmations: 0,
    confirmedCount: 0,
    declinedCount: 0,
    upcomingVaccinations: 0,
    overdueVaccinations: 0
  });
  const [dashboardStats, setDashboardStats] = useState(null);

  // Test moment.js functionality
  useEffect(() => {
    console.log('=== MOMENT.JS TEST ===');
    const testDate = '2025-07-28';
    console.log('Test date:', testDate);
    console.log('Moment parse:', moment(testDate).format('DD/MM/YYYY'));
    console.log('Moment parse with format:', moment(testDate, 'YYYY-MM-DD').format('DD/MM/YYYY'));
    console.log('Current timezone:', moment().format('Z'));
    console.log('=== END TEST ===');
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Sử dụng API mới cho statistics
      const [
        noticesData,
        recordsData,
        vaccinesData,
        recordStatsRes,
        noticeStatsRes,
        vaccineStatsRes
      ] = await Promise.all([
        getAllVaccinationNotices(),
        getAllVaccinationRecords(),
        getAllVaccines(),
        getVaccinationRecordStatistics(),
        getVaccinationNoticeStatistics(),
        getVaccineStatistics()
      ]);

      // Handle different response formats
      const noticesArray = Array.isArray(noticesData) ? noticesData : 
                          Array.isArray(noticesData.data) ? noticesData.data : 
                          Array.isArray(noticesData.data?.data) ? noticesData.data.data : [];
      
      const recordsArray = Array.isArray(recordsData) ? recordsData : 
                          Array.isArray(recordsData.data) ? recordsData.data : 
                          Array.isArray(recordsData.data?.data) ? recordsData.data.data : [];
      
      const vaccinesArray = Array.isArray(vaccinesData) ? vaccinesData : 
                           Array.isArray(vaccinesData.data) ? vaccinesData.data : 
                           Array.isArray(vaccinesData.data?.data) ? vaccinesData.data.data : [];

      // Xử lý statistics từ API mới
      const recordStats = recordStatsRes.data || recordStatsRes;
      const noticeStats = noticeStatsRes.data || noticeStatsRes;
      const vaccineStats = vaccineStatsRes.data || vaccineStatsRes;

      setDashboardStats({
        records: recordStats,
        notices: noticeStats,
        vaccines: vaccineStats
      });

      // Debug logging chi tiết để kiểm tra dữ liệu
      console.log('=== VACCINATION DASHBOARD DEBUG ===');
      console.log('Raw API Responses:', {
        noticesData: noticesData,
        recordsData: recordsData,
        vaccinesData: vaccinesData,
        recordStats: recordStats,
        noticeStats: noticeStats,
        vaccineStats: vaccineStats
      });
      
      console.log('Processed Arrays:', {
        notices: noticesArray,
        records: recordsArray,
        vaccines: vaccinesArray
      });
      
      // Log chi tiết từng notice để kiểm tra date
      if (noticesArray.length > 0) {
        console.log('Sample Notice Data:');
        noticesArray.slice(0, 3).forEach((notice, index) => {
          console.log(`Notice ${index + 1}:`, {
            id: notice.vaccineNoticeId,
            title: notice.title,
            vaccinationDate: notice.vaccinationDate,
            createdAt: notice.createdAt,
            vaccinationDateType: typeof notice.vaccinationDate,
            createdAtType: typeof notice.createdAt
          });
        });
      }
      
      console.log('=== END DEBUG ===');

      setNotices(noticesArray);
      setRecords(recordsArray);
      setVaccines(vaccinesArray);

      // Tính toán thống kê chi tiết hơn từ API mới
      const today = moment();
      const confirmedRecords = recordsArray.filter(r => r.status === 'CONFIRMED') || [];
      const declinedRecords = recordsArray.filter(r => r.status === 'DECLINED') || [];
      const pendingRecords = recordsArray.filter(r => r.status === 'PENDING') || [];
      
      // Tính upcoming và overdue vaccinations từ API hoặc fallback
      let upcomingCount = noticeStats?.upcomingNotices || 0;
      let overdueCount = noticeStats?.overdueNotices || 0;
      
      // Fallback calculation nếu API không cung cấp
      if (upcomingCount === 0 && overdueCount === 0) {
        noticesArray.forEach(notice => {
          if (notice.vaccinationDate) {
            let vaccinationDate;
            try {
              if (Array.isArray(notice.vaccinationDate) && notice.vaccinationDate.length === 3) {
                const [year, month, day] = notice.vaccinationDate;
                vaccinationDate = moment([year, month - 1, day]);
              } else {
                vaccinationDate = moment.utc(notice.vaccinationDate).local();
              }
              
              if (vaccinationDate.isValid()) {
                if (vaccinationDate.isAfter(today, 'day')) {
                  upcomingCount++;
                } else if (vaccinationDate.isBefore(today, 'day')) {
                  overdueCount++;
                }
              }
            } catch (error) {
              console.error('Error calculating vaccination dates:', error);
            }
          }
        });
      }

      setStatistics({
        totalNotices: noticeStats?.totalNotices || noticesArray.length || 0,
        totalRecords: recordStats?.totalRecords || recordsArray.length || 0,
        totalVaccines: vaccineStats?.totalVaccines || vaccinesArray.length || 0,
        pendingConfirmations: recordStats?.pendingRecords || pendingRecords.length,
        confirmedCount: recordStats?.confirmedRecords || confirmedRecords.length,
        declinedCount: recordStats?.declinedRecords || declinedRecords.length,
        upcomingVaccinations: upcomingCount,
        overdueVaccinations: overdueCount
      });
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
      // Set empty arrays on error
      setNotices([]);
      setRecords([]);
      setVaccines([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices = Array.isArray(notices) ? notices.filter(notice => {
    if (dateRange && dateRange.length === 2) {
      let noticeDate;
      try {
        // Xử lý trường hợp vaccinationDate là array [year, month, day]
        if (Array.isArray(notice.vaccinationDate) && notice.vaccinationDate.length === 3) {
          const [year, month, day] = notice.vaccinationDate;
          noticeDate = moment([year, month - 1, day]);
        } else {
          noticeDate = moment.utc(notice.vaccinationDate);
          if (!noticeDate.isValid()) {
            noticeDate = moment(notice.vaccinationDate);
          }
        }
      } catch (error) {
        console.error('Error parsing notice date for filter:', notice.vaccinationDate, error);
        return false;
      }
      return noticeDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
    }
    if (selectedVaccine) {
      return notice.vaccineName === selectedVaccine;
    }
    return true;
  }) : [];

  const filteredRecords = Array.isArray(records) ? records.filter(record => {
    if (dateRange && dateRange.length === 2) {
      let recordDate;
      try {
        // Xử lý trường hợp date là array [year, month, day]
        if (Array.isArray(record.date) && record.date.length === 3) {
          const [year, month, day] = record.date;
          recordDate = moment([year, month - 1, day]);
        } else {
          recordDate = moment.utc(record.date);
          if (!recordDate.isValid()) {
            recordDate = moment(record.date);
          }
        }
      } catch (error) {
        console.error('Error parsing record date for filter:', record.date, error);
        return false;
      }
      return recordDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
    }
    if (selectedVaccine) {
      return record.vaccineName === selectedVaccine;
    }
    return true;
  }) : [];

  const noticeColumns = [
    { 
      title: 'ID', 
      dataIndex: 'vaccineNoticeId', 
      key: 'vaccineNoticeId',
      width: 80,
      render: (id) => <Text code>{id}</Text>
    },
    { 
      title: 'Tiêu đề', 
      dataIndex: 'title', 
      key: 'title',
      render: (text) => <Text strong>{text}</Text>
    },
    { 
      title: 'Vaccine', 
      dataIndex: 'vaccineName', 
      key: 'vaccineName',
      render: (text) => (
        <Space>
          <MedicineBoxOutlined style={{ color: '#52c41a' }} />
          <Text>{text}</Text>
        </Space>
      )
    },
    { 
      title: 'Khối lớp', 
      dataIndex: 'grade', 
      key: 'grade',
      render: (grade) => <Tag color="blue">{grade}</Tag>
    },
    { 
      title: 'Ngày tiêm', 
      dataIndex: 'vaccinationDate', 
      key: 'vaccinationDate',
      render: (date) => {
        console.log('Vaccination Date Input:', date);
        return formatDate(date);
      }
    },
    { 
      title: 'Ngày tạo', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (date) => {
        console.log('Created Date Input:', date);
        return formatDate(date);
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        if (!record.vaccinationDate) {
          return <Tag color="default">Chưa có ngày</Tag>;
        }
        
        const today = moment();
        let vaccinationDate;
        
        try {
          // Xử lý trường hợp vaccinationDate là array [year, month, day]
          if (Array.isArray(record.vaccinationDate) && record.vaccinationDate.length === 3) {
            const [year, month, day] = record.vaccinationDate;
            vaccinationDate = moment([year, month - 1, day]);
          } else {
            // Thử parse với UTC trước
            vaccinationDate = moment.utc(record.vaccinationDate);
            if (!vaccinationDate.isValid()) {
              vaccinationDate = moment(record.vaccinationDate);
            }
          }
        } catch (error) {
          console.error('Error parsing vaccination date:', record.vaccinationDate, error);
          return <Tag color="default">Lỗi ngày</Tag>;
        }
        
        console.log('Status Check:', {
          today: today.format('YYYY-MM-DD'),
          vaccinationDate: vaccinationDate.format('YYYY-MM-DD'),
          original: record.vaccinationDate,
          originalType: typeof record.vaccinationDate,
          isBefore: vaccinationDate.isBefore(today, 'day'),
          isSame: vaccinationDate.isSame(today, 'day'),
          parsedMoment: vaccinationDate.format()
        });
        
        if (vaccinationDate.isBefore(today, 'day')) {
          return <Tag color="red">Đã qua</Tag>;
        } else if (vaccinationDate.isSame(today, 'day')) {
          return <Tag color="orange">Hôm nay</Tag>;
        } else {
          return <Tag color="green">Sắp tới</Tag>;
        }
      }
    }
  ];

  const recordColumns = [
    { 
      title: 'ID', 
      dataIndex: 'recordId', 
      key: 'recordId',
      width: 80,
      render: (id) => <Text code>{id}</Text>
    },
    { 
      title: 'Học sinh', 
      dataIndex: 'studentName', 
      key: 'studentName',
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <Text>{text}</Text>
        </Space>
      )
    },
    { 
      title: 'Vaccine', 
      dataIndex: 'vaccineName', 
      key: 'vaccineName',
      render: (text) => (
        <Space>
          <SafetyOutlined style={{ color: '#52c41a' }} />
          <Text>{text}</Text>
        </Space>
      )
    },
    { 
      title: 'Y tá', 
      dataIndex: 'nurseName', 
      key: 'nurseName',
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: '#722ed1' }} />
          <Text>{text}</Text>
        </Space>
      )
    },
    { 
      title: 'Ngày tiêm', 
      dataIndex: 'date', 
      key: 'date',
      render: (date) => {
        console.log('Record Date Input:', date);
        return formatDate(date);
      }
    },
    { 
      title: 'Kết quả', 
      dataIndex: 'results', 
      key: 'results',
      render: (results) => (
        <Text type={results === 'SUCCESS' ? 'success' : results === 'FAILED' ? 'danger' : 'secondary'}>
          {results === 'SUCCESS' ? 'Thành công' : results === 'FAILED' ? 'Thất bại' : results || 'N/A'}
        </Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'CONFIRMED' ? 'green' : status === 'DECLINED' ? 'red' : 'orange'}>
          {status === 'CONFIRMED' ? 'Đã xác nhận' : status === 'DECLINED' ? 'Đã từ chối' : 'Chờ xác nhận'}
        </Tag>
      )
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'orange';
      case 'CONFIRMED': return 'green';
      case 'DECLINED': return 'red';
      default: return 'default';
    }
  };

  return (
    <div className="vaccination-dashboard">
      <Title level={2}>
        <SafetyOutlined /> Dashboard Tiêm chủng
      </Title>

      {/* System Status Alert */}
      {(statistics.overdueVaccinations > 0 || statistics.upcomingVaccinations > 0) && (
        <Alert
          message={
            <Space>
              <CalendarOutlined />
              {statistics.overdueVaccinations > 0 ? 
                `${statistics.overdueVaccinations} lịch tiêm đã quá hạn` : 
                `${statistics.upcomingVaccinations} lịch tiêm sắp tới`}
            </Space>
          }
          type={statistics.overdueVaccinations > 0 ? 'error' : 'info'}
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Space>
              <FilterOutlined />
              <Text strong>Thời gian:</Text>
              <RangePicker 
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </Space>
          </Col>
          <Col span={8}>
            <Space>
              <MedicineBoxOutlined />
              <Text strong>Vaccine:</Text>
              <Select
                style={{ width: 200 }}
                placeholder="Chọn vaccine"
                allowClear
                value={selectedVaccine}
                onChange={setSelectedVaccine}
              >
                {vaccines.map(vaccine => (
                  <Option key={vaccine.vaccineId} value={vaccine.name}>
                    {vaccine.name}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col span={8}>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={fetchData}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>



      {/* Tables */}
      <Row gutter={16}>
        <Col span={12}>
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                Thông báo tiêm chủng
              </Space>
            } 
            extra={
              <Badge count={filteredNotices.length} showZero>
                <Text type="secondary">Kết quả</Text>
              </Badge>
            }
          >
            <Spin spinning={loading}>
              <Table
                columns={noticeColumns}
                dataSource={Array.isArray(filteredNotices) ? filteredNotices : []}
                rowKey="vaccineNoticeId"
                pagination={{ pageSize: 5 }}
                size="small"
                scroll={{ y: 400 }}
              />
            </Spin>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title={
              <Space>
                <BarChartOutlined />
                Record tiêm chủng
              </Space>
            }
            extra={
              <Badge count={filteredRecords.length} showZero>
                <Text type="secondary">Kết quả</Text>
              </Badge>
            }
          >
            <Spin spinning={loading}>
              <Table
                columns={recordColumns}
                dataSource={Array.isArray(filteredRecords) ? filteredRecords : []}
                rowKey="recordId"
                pagination={{ pageSize: 5 }}
                size="small"
                scroll={{ y: 400 }}
              />
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VaccinationDashboard; 