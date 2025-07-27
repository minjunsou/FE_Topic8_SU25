import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Table, Tag, message, Typography, Spin, Button, Modal, Descriptions, Divider, List, Badge } from 'antd';
import parentApi from '../../../api/parentApi';
import dayjs from 'dayjs';

const { Title } = Typography;

const ConsultationSchedule = ({ nurseId }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [recordModal, setRecordModal] = useState({ visible: false, loading: false, data: null });
  const [studentName, setStudentName] = useState('');
  const [medicalProfile, setMedicalProfile] = useState(null);

  useEffect(() => {
    // Lấy danh sách học sinh, phụ huynh, y tá khi mount
    fetchStudents();
    fetchParents();
    fetchNurses();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/accounts?page=0&size=80&roleId=1&sortBy=fullName&direction=asc');
      const data = await res.json();
      setStudents(data.accounts || []);
    } catch (error) {
      setStudents([]);
    }
  };

  const fetchParents = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/accounts?page=0&size=80&roleId=2&sortBy=fullName&direction=asc');
      const data = await res.json();
      setParents(data.accounts || []);
    } catch (error) {
      setParents([]);
    }
  };

  const fetchNurses = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/accounts?page=0&size=80&roleId=3&sortBy=fullName&direction=asc');
      const data = await res.json();
      setNurses(data.accounts || []);
    } catch (error) {
      setNurses([]);
    }
  };

  useEffect(() => {
    if (nurseId && selectedDate) {
      fetchConsultations();
    }
    // eslint-disable-next-line
  }, [nurseId, selectedDate]);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const data = await parentApi.getConsultationAppointmentsByDate(dateStr);
      setConsultations(data);
    } catch (error) {
      message.error('Không thể lấy lịch khám cho ngày này!');
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = async (healthCheckRecordId) => {
    setRecordModal({ visible: true, loading: true, data: null });
    setStudentName('');
    setMedicalProfile(null);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/health-check-records/getByID/${healthCheckRecordId}`);
      const json = await res.json();
      const record = json.data;
      let name = '';
      if (record && record.studentId) {
        // Ưu tiên lấy từ students nếu đã fetch
        const found = students.find(s => s.accountId === record.studentId);
        if (found) {
          name = found.fullName;
        } else {
          // Nếu chưa có, gọi API lấy thông tin học sinh
          try {
            const resStudent = await fetch(`http://localhost:8080/api/v1/accounts/${record.studentId}`);
            const dataStudent = await resStudent.json();
            name = dataStudent.fullName || record.studentId;
          } catch {
            name = record.studentId;
          }
        }
        // Gọi API lấy medical profile
        try {
          const resProfile = await fetch(`http://localhost:8080/api/medicalProfiles/${record.studentId}/get-medical-profile`);
          const profile = await resProfile.json();
          setMedicalProfile(profile);
        } catch {
          setMedicalProfile(null);
        }
      }
      setStudentName(name);
      setRecordModal({ visible: true, loading: false, data: record });
    } catch (error) {
      setRecordModal({ visible: true, loading: false, data: null });
      setMedicalProfile(null);
      message.error('Không thể lấy thông tin sức khỏe!');
    }
  };

  const columns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentId',
      key: 'studentId',
      render: (studentId) => {
        const found = students.find(s => s.accountId === studentId);
        return found ? found.fullName : studentId;
      },
    },
    {
      title: 'Phụ huynh',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId) => {
        const found = parents.find(p => p.accountId === parentId);
        return found ? found.fullName : parentId;
      },
    },
    {
      title: 'Y tá',
      dataIndex: 'nurseId',
      key: 'nurseId',
      render: (nurseId) => {
        const found = nurses.find(n => n.accountId === nurseId);
        return found ? found.fullName : nurseId;
      },
    },
    {
      title: 'Khung giờ',
      dataIndex: 'slot',
      key: 'slot',
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'SCHEDULED' ? 'blue' : status === 'CANCELLED' ? 'default' : 'green'}>{status}</Tag>
      ),
    },
    {
      title: 'Thông tin sức khỏe',
      key: 'record',
      render: (_, record) => (
        <Button size="small" onClick={() => handleViewRecord(record.healthCheckRecordId)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Card style={{ margin: 24 }}>
      <Title level={4}>Lịch khám theo ngày</Title>
      <DatePicker
        value={selectedDate}
        onChange={setSelectedDate}
        format="DD/MM/YYYY"
        style={{ marginBottom: 16 }}
      />
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          columns={columns}
          dataSource={consultations}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}
      <Modal
        open={recordModal.visible}
        onCancel={() => { setRecordModal({ visible: false, loading: false, data: null }); setMedicalProfile(null); }}
        footer={null}
        title="Thông tin sức khỏe học sinh"
        centered
        width={700}
      >
        {recordModal.loading ? (
          <Spin size="large" />
        ) : recordModal.data ? (
          <div>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label={<b>Học sinh</b>}>
                <span style={{ fontWeight: 600, fontSize: 18 }}>{studentName || recordModal.data.studentId}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<b>Kết quả kiểm tra</b>}>
                <Tag color={recordModal.data.results === 'NEEDS_TREATMENT' ? 'red' : recordModal.data.results === 'NEEDS_ATTENTION' ? 'orange' : 'green'} style={{ fontWeight: 600, fontSize: 16 }}>{recordModal.data.results}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<b>Ngày kiểm tra</b>}>
                {Array.isArray(recordModal.data.date) ? `${recordModal.data.date[2]}/${recordModal.data.date[1]}/${recordModal.data.date[0]}` : ''}
              </Descriptions.Item>
            </Descriptions>
            {medicalProfile && (
              <div style={{ marginTop: 24 }}>
                <Divider orientation="left">Hồ sơ y tế tổng hợp</Divider>
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label={<b>Thông tin cơ bản</b>}>
                    {medicalProfile.basicHealthData ? (
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        <li>Chiều cao: {medicalProfile.basicHealthData.heightCm} cm</li>
                        <li>Cân nặng: {medicalProfile.basicHealthData.weightKg} kg</li>
                        <li>Thị lực trái: {medicalProfile.basicHealthData.visionLeft}</li>
                        <li>Thị lực phải: {medicalProfile.basicHealthData.visionRight}</li>
                        <li>Thính giác: {medicalProfile.basicHealthData.hearingStatus}</li>
                        <li>Nhóm máu: {medicalProfile.basicHealthData.bloodType}</li>
                        <li>Giới tính: {medicalProfile.basicHealthData.gender}</li>
                      </ul>
                    ) : 'Không có'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<b>Dị ứng</b>}>
                    {medicalProfile.allergies && medicalProfile.allergies.length > 0 ? (
                      <List
                        size="small"
                        dataSource={medicalProfile.allergies}
                        renderItem={a => (
                          <List.Item>
                            <Badge status={a.lifeThreatening ? 'error' : 'processing'} />
                            <b>{a.allergenName}</b> - {a.reaction} (Mức độ: {a.severity}/10){a.lifeThreatening ? <Tag color="red" style={{ marginLeft: 8 }}>Nguy hiểm</Tag> : null}
                          </List.Item>
                        )}
                      />
                    ) : 'Không có'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<b>Bệnh lý</b>}>
                    {medicalProfile.diseases && medicalProfile.diseases.length > 0 ? (
                      <List
                        size="small"
                        dataSource={medicalProfile.diseases}
                        renderItem={d => (
                          <List.Item>
                            <b>{d.diseaseName}</b> - {d.sinceDate} (Mức độ: {d.severity}/10)
                          </List.Item>
                        )}
                      />
                    ) : 'Không có'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<b>Tình trạng</b>}>
                    {medicalProfile.conditions && medicalProfile.conditions.length > 0 ? (
                      <List
                        size="small"
                        dataSource={medicalProfile.conditions}
                        renderItem={c => (
                          <List.Item>
                            <b>{c.conditionName}</b> {c.note ? `- ${c.note}` : ''}
                          </List.Item>
                        )}
                      />
                    ) : 'Không có'}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </div>
        ) : (
          <p>Không có dữ liệu</p>
        )}
      </Modal>
    </Card>
  );
};

export default ConsultationSchedule; 