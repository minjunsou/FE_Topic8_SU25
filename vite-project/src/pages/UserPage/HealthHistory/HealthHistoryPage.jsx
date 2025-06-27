import React, { useState } from 'react';
import { Card, Typography, Tabs, Select, Row, Col, Statistic, Table, Tag, Button, Empty, List } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MedicineBoxOutlined, RiseOutlined, FallOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './HealthHistoryPage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const HealthHistoryPage = () => {
  const [selectedStudent, setSelectedStudent] = useState('1');
  const [activeTab, setActiveTab] = useState('growth');

  // Danh sách học sinh của phụ huynh
  const studentList = [
    { id: '1', name: 'Nguyễn Văn An', class: '10A1' },
    { id: '2', name: 'Nguyễn Thị Bình', class: '7B2' },
  ];

  // Dữ liệu tăng trưởng mẫu
  const growthData = {
    '1': [
      { age: 10, height: 140, weight: 35, bmi: 17.9, date: '15/09/2020' },
      { age: 11, height: 145, weight: 40, bmi: 19.0, date: '15/09/2021' },
      { age: 12, height: 152, weight: 45, bmi: 19.5, date: '15/09/2022' },
      { age: 13, height: 158, weight: 50, bmi: 20.0, date: '15/09/2023' },
      { age: 14, height: 165, weight: 55, bmi: 20.2, date: '15/09/2024' },
      { age: 15, height: 170, weight: 60, bmi: 20.8, date: '15/09/2025' },
    ],
    '2': [
      { age: 7, height: 120, weight: 25, bmi: 17.4, date: '15/09/2020' },
      { age: 8, height: 125, weight: 28, bmi: 17.9, date: '15/09/2021' },
      { age: 9, height: 130, weight: 32, bmi: 18.9, date: '15/09/2022' },
      { age: 10, height: 135, weight: 35, bmi: 19.2, date: '15/09/2023' },
      { age: 11, height: 140, weight: 38, bmi: 19.4, date: '15/09/2024' },
      { age: 12, height: 145, weight: 42, bmi: 19.8, date: '15/09/2025' },
    ],
  };

  // Dữ liệu thị lực mẫu
  const visionData = {
    '1': [
      { date: '15/09/2020', leftEye: '10/10', rightEye: '10/10', note: 'Bình thường' },
      { date: '15/09/2021', leftEye: '10/10', rightEye: '10/10', note: 'Bình thường' },
      { date: '15/09/2022', leftEye: '9/10', rightEye: '10/10', note: 'Giảm nhẹ thị lực mắt trái' },
      { date: '15/09/2023', leftEye: '8/10', rightEye: '9/10', note: 'Cần theo dõi' },
      { date: '15/09/2024', leftEye: '8/10', rightEye: '9/10', note: 'Đề nghị khám chuyên khoa' },
      { date: '15/09/2025', leftEye: '7/10', rightEye: '8/10', note: 'Đã kê kính' },
    ],
    '2': [
      { date: '15/09/2020', leftEye: '10/10', rightEye: '10/10', note: 'Bình thường' },
      { date: '15/09/2021', leftEye: '10/10', rightEye: '10/10', note: 'Bình thường' },
      { date: '15/09/2022', leftEye: '10/10', rightEye: '10/10', note: 'Bình thường' },
      { date: '15/09/2023', leftEye: '10/10', rightEye: '9/10', note: 'Giảm nhẹ thị lực mắt phải' },
      { date: '15/09/2024', leftEye: '9/10', rightEye: '9/10', note: 'Cần theo dõi' },
      { date: '15/09/2025', leftEye: '9/10', rightEye: '9/10', note: 'Ổn định' },
    ],
  };

  // Dữ liệu tiêm chủng mẫu
  const vaccinationData = {
    '1': [
      { date: '10/01/2020', name: 'Vaccine cúm mùa', dose: 'Liều 1', location: 'Trung tâm y tế quận', note: 'Hoàn thành' },
      { date: '15/03/2021', name: 'Vaccine viêm gan B', dose: 'Liều nhắc', location: 'Phòng y tế trường', note: 'Hoàn thành' },
      { date: '10/01/2022', name: 'Vaccine cúm mùa', dose: 'Liều 2', location: 'Trung tâm y tế quận', note: 'Hoàn thành' },
      { date: '10/01/2023', name: 'Vaccine cúm mùa', dose: 'Liều 3', location: 'Phòng y tế trường', note: 'Hoàn thành' },
      { date: '10/02/2024', name: 'Vaccine COVID-19', dose: 'Liều 1', location: 'Phòng y tế trường', note: 'Hoàn thành' },
      { date: '10/03/2024', name: 'Vaccine COVID-19', dose: 'Liều 2', location: 'Phòng y tế trường', note: 'Hoàn thành' },
    ],
    '2': [
      { date: '15/02/2020', name: 'Vaccine cúm mùa', dose: 'Liều 1', location: 'Trung tâm y tế quận', note: 'Hoàn thành' },
      { date: '20/04/2021', name: 'Vaccine viêm gan B', dose: 'Liều nhắc', location: 'Phòng y tế trường', note: 'Hoàn thành' },
      { date: '15/02/2022', name: 'Vaccine cúm mùa', dose: 'Liều 2', location: 'Trung tâm y tế quận', note: 'Hoàn thành' },
      { date: '15/02/2023', name: 'Vaccine cúm mùa', dose: 'Liều 3', location: 'Phòng y tế trường', note: 'Hoàn thành' },
      { date: '15/03/2024', name: 'Vaccine COVID-19', dose: 'Liều 1', location: 'Phòng y tế trường', note: 'Hoàn thành' },
      { date: '15/04/2024', name: 'Vaccine COVID-19', dose: 'Liều 2', location: 'Phòng y tế trường', note: 'Hoàn thành' },
    ],
  };

  // Dữ liệu sự kiện y tế mẫu
  const medicalEventsData = {
    '1': [
      { date: '05/10/2020', type: 'Bệnh', description: 'Cảm cúm', severity: 'low', treatment: 'Nghỉ học 3 ngày, uống thuốc theo chỉ định' },
      { date: '15/03/2021', type: 'Chấn thương', description: 'Trẹo chân khi chơi thể thao', severity: 'medium', treatment: 'Băng bó, nghỉ ngơi 1 tuần' },
      { date: '20/11/2022', type: 'Bệnh', description: 'Viêm họng', severity: 'low', treatment: 'Nghỉ học 2 ngày, uống kháng sinh' },
      { date: '10/05/2023', type: 'Dị ứng', description: 'Dị ứng phấn hoa', severity: 'low', treatment: 'Uống thuốc kháng histamine' },
      { date: '15/02/2024', type: 'Bệnh', description: 'Cảm cúm', severity: 'low', treatment: 'Nghỉ học 2 ngày, uống thuốc theo chỉ định' },
    ],
    '2': [
      { date: '10/11/2020', type: 'Bệnh', description: 'Viêm họng', severity: 'low', treatment: 'Nghỉ học 3 ngày, uống kháng sinh' },
      { date: '20/04/2021', type: 'Dị ứng', description: 'Dị ứng thức ăn', severity: 'medium', treatment: 'Uống thuốc kháng histamine, theo dõi' },
      { date: '15/12/2022', type: 'Bệnh', description: 'Cảm cúm', severity: 'low', treatment: 'Nghỉ học 2 ngày, uống thuốc theo chỉ định' },
      { date: '05/06/2023', type: 'Chấn thương', description: 'Trầy xước khi chơi thể thao', severity: 'low', treatment: 'Sơ cứu tại trường' },
      { date: '20/03/2024', type: 'Bệnh', description: 'Viêm họng', severity: 'low', treatment: 'Nghỉ học 2 ngày, uống kháng sinh' },
    ],
  };

  // Cột cho bảng thị lực
  const visionColumns = [
    {
      title: 'Ngày kiểm tra',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Mắt trái',
      dataIndex: 'leftEye',
      key: 'leftEye',
    },
    {
      title: 'Mắt phải',
      dataIndex: 'rightEye',
      key: 'rightEye',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
    },
  ];

  // Cột cho bảng tiêm chủng
  const vaccinationColumns = [
    {
      title: 'Ngày tiêm',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Tên vaccine',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Liều',
      dataIndex: 'dose',
      key: 'dose',
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'note',
      key: 'note',
      render: () => <Tag color="green" icon={<CheckCircleOutlined />}>Hoàn thành</Tag>,
    },
  ];

  // Cột cho bảng sự kiện y tế
  const medicalEventsColumns = [
    {
      title: 'Ngày xảy ra',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Loại sự kiện',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        let color = 'green';
        let text = 'Nhẹ';
        
        if (severity === 'medium') {
          color = 'orange';
          text = 'Trung bình';
        } else if (severity === 'high') {
          color = 'red';
          text = 'Nghiêm trọng';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Xử lý',
      dataIndex: 'treatment',
      key: 'treatment',
    },
  ];

  // Lấy dữ liệu tăng trưởng của học sinh được chọn
  const currentGrowthData = growthData[selectedStudent] || [];
  const currentVisionData = visionData[selectedStudent] || [];
  const currentVaccinationData = vaccinationData[selectedStudent] || [];
  const currentMedicalEventsData = medicalEventsData[selectedStudent] || [];

  // Lấy dữ liệu mới nhất
  const latestGrowthData = currentGrowthData.length > 0 ? currentGrowthData[currentGrowthData.length - 1] : null;
  
  // Tính toán sự thay đổi
  const calculateChange = (current, previous, isPositiveGood = true) => {
    if (!current || !previous) return { value: 0, isIncrease: true };
    const change = current - previous;
    const isIncrease = change > 0;
    return { 
      value: Math.abs(change), 
      isIncrease: isPositiveGood ? isIncrease : !isIncrease 
    };
  };

  // Tính toán sự thay đổi chiều cao, cân nặng và BMI
  const heightChange = currentGrowthData.length > 1 
    ? calculateChange(latestGrowthData.height, currentGrowthData[currentGrowthData.length - 2].height, true)
    : { value: 0, isIncrease: true };
  
  const weightChange = currentGrowthData.length > 1 
    ? calculateChange(latestGrowthData.weight, currentGrowthData[currentGrowthData.length - 2].weight, true)
    : { value: 0, isIncrease: true };
  
  const bmiChange = currentGrowthData.length > 1 
    ? calculateChange(latestGrowthData.bmi, currentGrowthData[currentGrowthData.length - 2].bmi, false)
    : { value: 0, isIncrease: true };

  // Xử lý khi thay đổi học sinh
  const handleStudentChange = (value) => {
    setSelectedStudent(value);
  };

  return (
    <div className="health-history-page">
      <div className="health-history-container">
        <Card className="health-history-card">
          <Title level={2} className="health-history-title">
            <MedicineBoxOutlined /> Lịch sử sức khỏe
          </Title>
          <Paragraph className="health-history-description">
            Xem lịch sử sức khỏe của học sinh, bao gồm thông tin tăng trưởng, thị lực, tiêm chủng và các sự kiện y tế.
          </Paragraph>

          <div className="student-selector">
            <Text strong>Chọn học sinh:</Text>
            <Select
              value={selectedStudent}
              onChange={handleStudentChange}
              style={{ width: 200, marginLeft: 16 }}
            >
              {studentList.map(student => (
                <Option key={student.id} value={student.id}>
                  {student.name} - Lớp {student.class}
                </Option>
              ))}
            </Select>
          </div>

          <Tabs activeKey={activeTab} onChange={setActiveTab} className="health-history-tabs">
            <TabPane tab="Tăng trưởng" key="growth">
              {latestGrowthData ? (
                <>
                  <Row gutter={[16, 16]} className="stats-row">
                    <Col xs={24} sm={8}>
                      <Card>
                        <Statistic
                          title="Chiều cao"
                          value={latestGrowthData.height}
                          precision={1}
                          valueStyle={{ color: '#3f8600' }}
                          suffix="cm"
                          prefix={heightChange.isIncrease ? <RiseOutlined /> : <FallOutlined />}
                        />
                        <Text type="secondary">
                          {heightChange.value > 0 
                            ? `Tăng ${heightChange.value} cm so với lần kiểm tra trước`
                            : 'Không thay đổi so với lần kiểm tra trước'}
                        </Text>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card>
                        <Statistic
                          title="Cân nặng"
                          value={latestGrowthData.weight}
                          precision={1}
                          valueStyle={{ color: '#3f8600' }}
                          suffix="kg"
                          prefix={weightChange.isIncrease ? <RiseOutlined /> : <FallOutlined />}
                        />
                        <Text type="secondary">
                          {weightChange.value > 0 
                            ? `Tăng ${weightChange.value} kg so với lần kiểm tra trước`
                            : 'Không thay đổi so với lần kiểm tra trước'}
                        </Text>
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card>
                        <Statistic
                          title="BMI"
                          value={latestGrowthData.bmi}
                          precision={1}
                          valueStyle={{ color: bmiChange.isIncrease ? '#3f8600' : '#cf1322' }}
                          prefix={bmiChange.isIncrease ? <RiseOutlined /> : <FallOutlined />}
                        />
                        <Text type="secondary">
                          {bmiChange.value > 0 
                            ? `${bmiChange.isIncrease ? 'Cải thiện' : 'Tăng'} ${bmiChange.value.toFixed(1)} so với lần kiểm tra trước`
                            : 'Không thay đổi so với lần kiểm tra trước'}
                        </Text>
                      </Card>
                    </Col>
                  </Row>

                  <Card title="Biểu đồ tăng trưởng" className="chart-card">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} lg={12}>
                        <Title level={5}>Chiều cao theo tuổi</Title>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart
                            data={currentGrowthData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="age" label={{ value: 'Tuổi', position: 'insideBottomRight', offset: -5 }} />
                            <YAxis label={{ value: 'Chiều cao (cm)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(value) => [`${value} cm`, 'Chiều cao']} />
                            <Legend />
                            <Line type="monotone" dataKey="height" stroke="#8884d8" activeDot={{ r: 8 }} name="Chiều cao" />
                          </LineChart>
                        </ResponsiveContainer>
                      </Col>
                      <Col xs={24} lg={12}>
                        <Title level={5}>Cân nặng theo tuổi</Title>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart
                            data={currentGrowthData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="age" label={{ value: 'Tuổi', position: 'insideBottomRight', offset: -5 }} />
                            <YAxis label={{ value: 'Cân nặng (kg)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(value) => [`${value} kg`, 'Cân nặng']} />
                            <Legend />
                            <Line type="monotone" dataKey="weight" stroke="#82ca9d" activeDot={{ r: 8 }} name="Cân nặng" />
                          </LineChart>
                        </ResponsiveContainer>
                      </Col>
                      <Col xs={24}>
                        <Title level={5}>BMI theo tuổi</Title>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart
                            data={currentGrowthData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="age" label={{ value: 'Tuổi', position: 'insideBottomRight', offset: -5 }} />
                            <YAxis label={{ value: 'BMI', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(value) => [`${value}`, 'BMI']} />
                            <Legend />
                            <Line type="monotone" dataKey="bmi" stroke="#ff7300" activeDot={{ r: 8 }} name="BMI" />
                          </LineChart>
                        </ResponsiveContainer>
                      </Col>
                    </Row>
                  </Card>

                  <Card title="Dữ liệu kiểm tra sức khỏe" className="data-card">
                    <Table 
                      dataSource={currentGrowthData.map((item, index) => ({ ...item, key: index }))}
                      columns={[
                        {
                          title: 'Ngày kiểm tra',
                          dataIndex: 'date',
                          key: 'date',
                        },
                        {
                          title: 'Tuổi',
                          dataIndex: 'age',
                          key: 'age',
                        },
                        {
                          title: 'Chiều cao (cm)',
                          dataIndex: 'height',
                          key: 'height',
                        },
                        {
                          title: 'Cân nặng (kg)',
                          dataIndex: 'weight',
                          key: 'weight',
                        },
                        {
                          title: 'BMI',
                          dataIndex: 'bmi',
                          key: 'bmi',
                        },
                      ]}
                      pagination={false}
                    />
                  </Card>
                </>
              ) : (
                <Empty description="Không có dữ liệu tăng trưởng" />
              )}
            </TabPane>
            
            <TabPane tab="Thị lực" key="vision">
              <Card title="Lịch sử kiểm tra thị lực">
                <Table 
                  dataSource={currentVisionData.map((item, index) => ({ ...item, key: index }))}
                  columns={visionColumns}
                  pagination={false}
                />
              </Card>
            </TabPane>
            
            <TabPane tab="Tiêm chủng" key="vaccination">
              <Card title="Lịch sử tiêm chủng">
                <Table 
                  dataSource={currentVaccinationData.map((item, index) => ({ ...item, key: index }))}
                  columns={vaccinationColumns}
                  pagination={false}
                />
              </Card>
            </TabPane>
            
            <TabPane tab="Sự kiện y tế" key="medical-events">
              <Card title="Lịch sử sự kiện y tế">
                <Table 
                  dataSource={currentMedicalEventsData.map((item, index) => ({ ...item, key: index }))}
                  columns={medicalEventsColumns}
                  pagination={false}
                />
              </Card>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default HealthHistoryPage; 