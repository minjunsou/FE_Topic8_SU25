import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, message, Form, Input, DatePicker, InputNumber, Select, Tag, Spin, Tabs } from 'antd';
import nurseApi from '../../../../api/nurseApi';
import moment from 'moment';


const { Option } = Select;

const Vaccine = () => {
  const [batches, setBatches] = useState([]);
  const [notices, setNotices] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [form] = Form.useForm();
  const [noticeForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [confirmedStudents, setConfirmedStudents] = useState([]);
  const [viewNoticeId, setViewNoticeId] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [selectedVaccineId, setSelectedVaccineId] = useState(null);
  // Thêm state cho filter notice theo vaccine
  const [selectedVaccineNoticeId, setSelectedVaccineNoticeId] = useState(null);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [recordForm] = Form.useForm();
  const [recordStudent, setRecordStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordFilterType, setRecordFilterType] = useState('all');
  const [recordFilterValue, setRecordFilterValue] = useState(null);
  const [students, setStudents] = useState([]); // danh sách học sinh đã xác nhận
  const [nurses, setNurses] = useState([]); // nếu cần filter theo nurse
  const [activeTab, setActiveTab] = useState('batch');
  // Thêm state cho học sinh theo notice
  const [studentsByNotice, setStudentsByNotice] = useState([]);
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  const [excludeDiseaseIds, setExcludeDiseaseIds] = useState([]);
  // State cho danh sách bệnh
  const [diseaseOptions, setDiseaseOptions] = useState([]);
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  
  // State cho external vaccines
  const [externalVaccines, setExternalVaccines] = useState([]);
  const [externalVaccineLoading, setExternalVaccineLoading] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [selectedExternalVaccine, setSelectedExternalVaccine] = useState(null);

  // Lấy danh sách vaccine khi load
  useEffect(() => {
    fetchVaccines();
  }, []);

  const fetchVaccines = async () => {
    try {
      const data = await nurseApi.getAllVaccines();
      setVaccines(data);
      if (data.length > 0) setSelectedVaccineId(data[0].vaccineId);
    } catch {
      setVaccines([]);
    }
  };

  // Lấy danh sách batch khi selectedVaccineId thay đổi
  useEffect(() => {
    if (selectedVaccineId) fetchBatches(selectedVaccineId);
  }, [selectedVaccineId]);

  const fetchBatches = async (vaccineId) => {
    try {
      const data = await nurseApi.getVaccineBatchesByVaccineId(vaccineId);
      setBatches(data);
    } catch {
      setBatches([]);
    }
  };

  // Lấy danh sách notice theo vaccine filter
  const fetchNotices = async (vaccineId) => {
    setNoticeLoading(true);
    try {
      let data = [];
      if (vaccineId) {
        data = await nurseApi.filterVaccinationNotices({ vaccineId });
      } else {
        data = await nurseApi.getAllVaccinationNotices();
      }
      setNotices(data);
    } catch (err) {
      message.error('Không thể tải danh sách thông báo tiêm chủng');
    } finally {
      setNoticeLoading(false);
    }
  };

  // Gọi khi chọn vaccine ở dropdown Thông báo tiêm chủng
  useEffect(() => {
    fetchNotices(selectedVaccineNoticeId);
  }, [selectedVaccineNoticeId]);

  // Khi mở modal tạo lô, set vaccineId mặc định là vaccine đang filter
  const handleOpenBatchModal = async () => {
    setShowBatchModal(true);
    try {
      const data = vaccines.length ? vaccines : await nurseApi.getAllVaccines();
      setVaccines(data);
      form.setFieldsValue({ vaccineId: selectedVaccineId });
    } catch {
      setVaccines([]);
    }
  };

  // Tạo batch mới
  const handleCreateBatch = async (values) => {
    setLoading(true);
    try {
      await nurseApi.createVaccineBatch(values.vaccineId, {
        stockInDate: values.stockInDate.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate.format('YYYY-MM-DD'),
        quantity: values.quantity,
      });
      message.success('Tạo lô vaccine thành công!');
      setShowBatchModal(false);
      form.resetFields();
      fetchBatches(values.vaccineId); // Fetch batches for the newly created batch's vaccine
    } catch {
      message.error('Tạo lô vaccine thất bại!');
    }
    setLoading(false);
  };

  // Tạo notice mới
  const handleCreateNotice = async (values) => {
    setLoading(true);
    try {
      await nurseApi.createVaccinationNotice({
        title: values.title,
        description: values.description,
        vaccinationDate: values.vaccinationDate.format('YYYY-MM-DD'),
        grade: values.grade,
        vaccineBatchId: values.vaccineBatchId,
        excludeDiseaseIds: values.excludeDiseaseIds || [],
      });
      message.success('Tạo thông báo tiêm chủng thành công!');
      setShowNoticeModal(false);
      noticeForm.resetFields();
      fetchNotices();
    } catch {
      message.error('Tạo thông báo thất bại!');
    }
    setLoading(false);
  };

  // Xem danh sách học sinh đã xác nhận cho 1 notice
  const handleViewConfirmed = async (noticeId) => {
    setViewNoticeId(noticeId);
    try {
      // Lấy danh sách xác nhận tiêm chủng theo noticeId (bao gồm trạng thái)
      const confirmations = await nurseApi.getVaccinationConfirmationsByNotice(noticeId);
      // Lấy ngày tiêm của notice
      const notice = notices.find(n => n.vaccineNoticeId === noticeId);
      const vaccinationDate = notice ? moment(notice.vaccinationDate) : null;
      // Auto chuyển CONFIRMED -> ONGOING nếu đã đến ngày tiêm
      const today = moment().startOf('day');
      for (const conf of confirmations) {
        if (conf.status === 'CONFIRMED' && vaccinationDate && today.isSameOrAfter(vaccinationDate, 'day')) {
          await nurseApi.updateVaccinationConfirmationStatusOnly({
            vaccinationConfirmationId: conf.confirmationId,
            status: 'ONGOING',
          });
          conf.status = 'ONGOING';
        }
      }
      setConfirmedStudents(confirmations);
      Modal.info({
        title: 'Danh sách học sinh đã xác nhận',
        width: 700,
        content: (
          <Table
            columns={[
              { title: 'Họ tên', dataIndex: 'studentName' },
              { title: 'Trạng thái', dataIndex: 'status', render: (status) => {
                let color = 'orange', text = 'Chưa xác nhận';
                if (status === 'CONFIRMED') { color = 'green'; text = 'Đã xác nhận'; }
                else if (status === 'ONGOING') { color = 'blue'; text = 'Đang tiêm'; }
                else if (status === 'COMPLETED') { color = 'purple'; text = 'Hoàn thành'; }
                else if (status === 'DECLINED') { color = 'red'; text = 'Từ chối'; }
                return <Tag color={color}>{text}</Tag>;
              } },
              {
                title: 'Hành động',
                render: (_, record) => record.status === 'ONGOING' || record.status === 'CONFIRMED' ? (
                  <Button type="primary" onClick={async () => {
                    await nurseApi.updateVaccinationConfirmationStatusOnly({
                      vaccinationConfirmationId: record.confirmationId,
                      status: 'COMPLETED',
                    });
                    message.success('Cập nhật trạng thái hoàn thành!');
                    handleViewConfirmed(noticeId); // refresh
                  }}>Đánh dấu hoàn thành</Button>
                ) : null
              }
            ]}
            dataSource={confirmations}
            rowKey="confirmationId"
            pagination={false}
          />
        ),
        onOk: () => setConfirmedStudents([]),
      });
    } catch {
      message.error('Không lấy được danh sách xác nhận!');
    }
  };

  // Lọc notice theo vaccine
  const filteredNotices = selectedVaccineNoticeId
    ? notices.filter((n) => n.vaccineId === selectedVaccineNoticeId)
    : notices;

  // Hàm fetch danh sách bệnh (có thể truyền name để search)
  const fetchDiseases = async (name = "") => {
    setDiseaseLoading(true);
    try {
      const data = await nurseApi.searchDiseases(name);
      setDiseaseOptions(data);
    } catch {
      setDiseaseOptions([]);
    }
    setDiseaseLoading(false);
  };

  // Khi mở modal tạo notice, fetch danh sách bệnh
  const handleOpenNoticeModal = () => {
    setShowNoticeModal(true);
    if (selectedVaccineNoticeId) {
      noticeForm.setFieldsValue({ vaccineId: selectedVaccineNoticeId });
    }
    fetchDiseases();
  };

  // Xử lý search bệnh trong Select
  const handleDiseaseSearch = (value) => {
    fetchDiseases(value);
  };

  // Hàm tạo record tiêm chủng
  const handleCreateRecord = (student) => {
    setRecordStudent(student);
    setRecordModalVisible(true);
    recordForm.resetFields();
  };

  // Định nghĩa hàm handleNoticeChange
  const handleNoticeChange = async (noticeId) => {
    setSelectedNoticeId(noticeId);
    try {
      const confirmed = await nurseApi.getConfirmedStudentsByNotice(noticeId);
      const records = await nurseApi.getVaccinationRecordsByNotice(noticeId);
      const recordedStudentIds = records.map(r => r.studentId);
      const availableStudents = confirmed.filter(s => !recordedStudentIds.includes(s.accountId));
      setStudentsByNotice(availableStudents);
      recordForm.setFieldsValue({ studentId: undefined });
    } catch {
      setStudentsByNotice([]);
    }
  };

  const submitCreateRecord = async (values) => {
    setRecordLoading(true);
    try {
      // Lấy nurseId từ localStorage hoặc context
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const nurseId = userInfo?.accountId;
      if (!nurseId) throw new Error('Không tìm thấy nurseId');
      await nurseApi.createVaccinationRecord({
        studentId: values.studentId,
        vaccineNoticeId: values.vaccineNoticeId,
        results: values.results,
        date: values.date.format('YYYY-MM-DD'),
      }, nurseId);
      message.success('Tạo record thành công!');
      setRecordModalVisible(false);
      fetchRecords();
    } catch (err) {
      message.error('Tạo record thất bại!');
    }
    setRecordLoading(false);
  };

  // Lấy danh sách record
  const fetchRecords = async (type = 'all', value = null) => {
    setRecordLoading(true);
    try {
      let data = [];
      if (type === 'student' && value) {
        data = await nurseApi.getVaccinationRecordsByStudent(value);
      } else if (type === 'nurse' && value) {
        data = await nurseApi.getVaccinationRecordsByNurse(value);
      } else {
        data = await nurseApi.getAllVaccinationRecords();
      }
      setRecords(data);
    } catch {
      setRecords([]);
    }
    setRecordLoading(false);
  };

  // Khi filter record thay đổi
  useEffect(() => {
    fetchRecords(recordFilterType, recordFilterValue);
  }, [recordFilterType, recordFilterValue]);

  // Cột tạo record trong bảng học sinh đã xác nhận
  const confirmedStudentColumns = [
    { title: 'Họ tên', dataIndex: 'fullName' },
    { title: 'Lớp', dataIndex: 'className' },
    { title: 'Trạng thái', dataIndex: 'status', render: () => <Tag color="green">Đã xác nhận</Tag> },
    {
      title: 'Record',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleCreateRecord(record)}>
          Tạo record
        </Button>
      ),
    },
  ];

  // Tab content cho lịch sử record
  const recordTabContent = (
    <Card title="Lịch sử Record" extra={
      <Button type="primary" onClick={() => setRecordModalVisible(true)}>
        Tạo record mới
      </Button>
    }>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span>Lọc theo:</span>
        <Select
          style={{ minWidth: 200 }}
          value={recordFilterType}
          onChange={setRecordFilterType}
          placeholder="Tất cả"
        >
          <Select.Option value="all">Tất cả</Select.Option>
          <Select.Option value="student">Học sinh</Select.Option>
          <Select.Option value="nurse">Nurse</Select.Option>
        </Select>
        {recordFilterType === 'student' && (
          <Select
            style={{ minWidth: 200 }}
            value={recordFilterValue || undefined}
            onChange={setRecordFilterValue}
            placeholder="Chọn học sinh"
          >
            {students.map(student => (
              <Select.Option key={student.accountId} value={student.accountId}>
                {student.fullName} - {student.className}
              </Select.Option>
            ))}
          </Select>
        )}
        {recordFilterType === 'nurse' && (
          <Select
            style={{ minWidth: 200 }}
            value={recordFilterValue || undefined}
            onChange={setRecordFilterValue}
            placeholder="Chọn nurse"
          >
            {nurses.map(nurse => (
              <Select.Option key={nurse.accountId} value={nurse.accountId}>
                {nurse.fullName}
              </Select.Option>
            ))}
          </Select>
        )}
      </div>
      <Spin spinning={recordLoading} tip="Đang tải...">
        <Table
          columns={[
            { title: 'Học sinh', dataIndex: 'studentId', render: (id) => {
              const student = students.find(s => s.accountId === id) || studentsByNotice.find(s => s.accountId === id);
              return student ? `${student.fullName} - ${student.className}` : id;
            } },
            { title: 'Thông báo tiêm', dataIndex: 'vaccineNoticeId', render: (id) => {
              const notice = notices.find(n => n.vaccineNoticeId === id);
              return notice ? `${notice.title} - ${notice.vaccinationDate}` : id;
            } },
            { title: 'Kết quả', dataIndex: 'results' },
            { title: 'Ngày tiêm', dataIndex: 'date' },
          ]}
          dataSource={records}
          rowKey="vaccinationRecordId"
        />
      </Spin>
      {/* Modal tạo record mới */}
      <Modal
        title="Tạo record tiêm chủng"
        open={recordModalVisible}
        onCancel={() => setRecordModalVisible(false)}
        footer={null}
      >
        <Form form={recordForm} layout="vertical" onFinish={submitCreateRecord}>
          <Form.Item name="vaccineNoticeId" label="Chọn thông báo tiêm" rules={[{ required: true, message: 'Vui lòng chọn thông báo tiêm!' }]}>
            <Select placeholder="Chọn notice" onChange={handleNoticeChange} allowClear>
              {notices.map(notice => (
                <Select.Option key={notice.vaccineNoticeId} value={notice.vaccineNoticeId}>
                  {notice.title} - {notice.vaccinationDate}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="studentId" label="Chọn học sinh" rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}>
            <Select placeholder="Chọn học sinh" disabled={!selectedNoticeId} allowClear>
              {studentsByNotice.map(student => (
                <Select.Option key={student.accountId} value={student.accountId}>
                  {student.fullName} - {student.className}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="results" label="Kết quả tiêm chủng" rules={[{ required: true, message: 'Vui lòng nhập kết quả tiêm chủng!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="date" label="Ngày tiêm" rules={[{ required: true, message: 'Vui lòng chọn ngày tiêm!' }]}>
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={recordLoading}>Tạo record</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );

  // Fetch external vaccines
  const fetchExternalVaccines = async () => {
    setExternalVaccineLoading(true);
    try {
      const [externalVaccinesData, vaccinesList, studentsList] = await Promise.all([
        nurseApi.getUnverifiedExternalVaccines(),
        nurseApi.getAllVaccines(),
        nurseApi.getAllStudents()
      ]);
      
      // Map thêm thông tin tên học sinh và vaccine
      const mappedVaccines = externalVaccinesData.map(vaccine => {
        const vaccineInfo = vaccinesList.find(v => v.vaccineId === vaccine.vaccineId);
        const studentInfo = studentsList.find(s => s.accountId === vaccine.studentId);
        const submittedByInfo = studentsList.find(s => s.accountId === vaccine.submittedBy);
        
        return {
          ...vaccine,
          studentName: studentInfo?.fullName || 'Unknown',
          vaccineName: vaccineInfo?.name || 'Unknown',
          submittedByName: submittedByInfo?.fullName || 'Unknown'
        };
      });
      
      setExternalVaccines(mappedVaccines);
    } catch (error) {
      console.error('Lỗi khi lấy external vaccines:', error);
      setExternalVaccines([]);
    }
    setExternalVaccineLoading(false);
  };

  // Verify external vaccine
  const handleVerifyExternalVaccine = async (externalVaccineId) => {
    try {
      await nurseApi.verifyExternalVaccine(externalVaccineId);
      message.success('Đã xác minh tiêm chủng bên ngoài!');
      await fetchExternalVaccines();
    } catch (error) {
      message.error('Xác minh thất bại!');
    }
  };

  // Thêm useEffect để fetch external vaccines
  useEffect(() => {
    if (activeTab === 'external') {
      fetchExternalVaccines();
    }
  }, [activeTab]);

  // External vaccine columns
  const externalVaccineColumns = [
    { title: 'Học sinh', dataIndex: 'studentName', key: 'studentName' },
    { title: 'Tên vaccine', dataIndex: 'vaccineName', key: 'vaccineName' },
    { title: 'Ngày tiêm', dataIndex: 'injectionDate', key: 'injectionDate',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '' },
    { title: 'Địa điểm', dataIndex: 'location', key: 'location' },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
    { title: 'Người khai báo', dataIndex: 'submittedByName', key: 'submittedByName' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => handleVerifyExternalVaccine(record.externalVaccineId)}
        >
          Xác minh
        </Button>
      ),
    },
  ];

  // Tab content cho external vaccine
  const externalVaccineTabContent = (
    <Card title="Quản lý tiêm chủng bên ngoài">
      <Spin spinning={externalVaccineLoading} tip="Đang tải...">
        <Table
          columns={externalVaccineColumns}
          dataSource={externalVaccines}
          rowKey="externalVaccineId"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </Card>
  );

  return (
    <Tabs activeKey={activeTab} onChange={setActiveTab}>
      <Tabs.TabPane tab="Quản lý lô/Thông báo" key="batch">
        <Card
          title="Quản lý lô vaccine"
          extra={
            <div style={{ display: 'flex', gap: 8 }}>
              <Select
                style={{ minWidth: 200 }}
                value={selectedVaccineId}
                onChange={setSelectedVaccineId}
                placeholder="Chọn vaccine để xem lô"
              >
                {vaccines.map(v => (
                  <Option key={v.vaccineId} value={v.vaccineId}>{v.name} ({v.type})</Option>
                ))}
              </Select>
              <Button type="primary" onClick={handleOpenBatchModal}>Tạo lô vaccine</Button>
            </div>
          }
          style={{ marginBottom: 24 }}
        >
          <Table
            columns={[
              { title: 'ID lô', dataIndex: 'vaccineBatchId' },
              { title: 'Vaccine', dataIndex: 'vaccineId', render: (id) => {
                const v = vaccines.find(v => v.vaccineId === id);
                return v ? v.name : id;
              } },
              { title: 'Ngày nhập', dataIndex: 'stockInDate' },
              { title: 'Hạn dùng', dataIndex: 'expiryDate' },
              { title: 'Số lượng', dataIndex: 'quantity' },
            ]}
            dataSource={batches}
            rowKey="vaccineBatchId"
          />
        </Card>

        {/* Dropdown chọn vaccine cho Thông báo tiêm chủng */}
        <Card title="Thông báo tiêm chủng" style={{ marginTop: 32 }}>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>Chọn vaccine:</span>
            <Select
              style={{ minWidth: 200 }}
              value={selectedVaccineNoticeId || undefined}
              onChange={setSelectedVaccineNoticeId}
              allowClear
              placeholder="Tất cả vaccine"
            >
              {vaccines.map((v) => (
                <Select.Option key={v.vaccineId} value={v.vaccineId}>{v.name}</Select.Option>
              ))}
            </Select>
            <Button type="primary" onClick={handleOpenNoticeModal}>
              Tạo thông báo tiêm chủng
            </Button>
          </div>
          <Spin spinning={noticeLoading} tip="Đang tải...">
            <Table
              columns={[
                { title: 'ID', dataIndex: 'vaccineNoticeId' },
                { title: 'Tiêu đề', dataIndex: 'title' },
                { title: 'Mô tả', dataIndex: 'description' },
                { title: 'Khối lớp', dataIndex: 'grade' },
                { title: 'Vaccine', dataIndex: 'vaccineName' },
                { title: 'Ngày tiêm', dataIndex: 'vaccinationDate', render: (date) => date ? new Date(date).toLocaleDateString() : '' },
                { title: 'Lô vaccine', dataIndex: 'vaccineBatchId' },
                { title: 'Bệnh loại trừ', dataIndex: 'excludedDiseaseIds', render: (ids) =>
                  ids && ids.length > 0
                    ? ids.map(id => {
                        const disease = diseaseOptions.find(d => d.diseaseId === id);
                        return disease ? disease.name : id;
                      }).join(', ')
                    : 'Không'
                },
                { title: 'Số học sinh nhận phiếu', dataIndex: 'totalStudentsSentForm' },
                { title: 'Ngày tạo', dataIndex: 'createdAt', render: (date) => date ? new Date(date).toLocaleDateString() : '' },
                {
                  title: 'Hành động',
                  render: (_, record) => (
                    <Button onClick={() => handleViewConfirmed(record.vaccineNoticeId)}>
                      Xem học sinh đã xác nhận
                    </Button>
                  ),
                },
              ]}
              dataSource={notices}
              rowKey="vaccineNoticeId"
            />
          </Spin>
        </Card>

        {/* Modal tạo batch */}
        <Modal
          title="Tạo lô vaccine mới"
          open={showBatchModal}
          onCancel={() => setShowBatchModal(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleCreateBatch}>
            <Form.Item name="vaccineId" label="Chọn vaccine" rules={[{ required: true }]}>
              <Select placeholder="Chọn vaccine">
                {vaccines.map(v => (
                  <Option key={v.vaccineId} value={v.vaccineId}>{v.name} ({v.type})</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="stockInDate" label="Ngày nhập kho" rules={[{ required: true }]}>
              <DatePicker />
            </Form.Item>
            <Form.Item name="expiryDate" label="Hạn dùng" rules={[{ required: true }]}>
              <DatePicker />
            </Form.Item>
            <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}>
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>Tạo lô</Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal tạo notice */}
        <Modal
          title="Tạo thông báo tiêm chủng"
          open={showNoticeModal}
          onCancel={() => setShowNoticeModal(false)}
          footer={null}
        >
          <Form form={noticeForm} layout="vertical" onFinish={handleCreateNotice}>
            <Form.Item name="vaccineBatchId" label="Chọn lô vaccine" rules={[{ required: true }]}>
              <Select placeholder="Chọn lô vaccine">
                {batches.map(batch => (
                  <Option key={batch.vaccineBatchId} value={batch.vaccineBatchId}>
                    {batch.vaccineBatchId} - Hạn dùng: {batch.expiryDate}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}>
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="vaccinationDate" label="Ngày tiêm" rules={[{ required: true }]}>
              <DatePicker
                disabledDate={current => current && current <= moment().endOf('day')}
              />
            </Form.Item>
            <Form.Item name="grade" label="Khối lớp" rules={[{ required: true }]}>
              <InputNumber min={1} max={12} />
            </Form.Item>
            <Form.Item name="excludeDiseaseIds" label="Chọn bệnh">
              <Select
                placeholder="Chọn bệnh"
                mode="multiple"
                allowClear
                showSearch
                filterOption={false}
                onSearch={handleDiseaseSearch}
                loading={diseaseLoading}
              >
                {diseaseOptions.map(disease => (
                  <Option key={disease.diseaseId} value={disease.diseaseId}>{disease.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>Tạo thông báo</Button>
            </Form.Item>
          </Form>
        </Modal>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Lịch sử Record" key="record">
        {recordTabContent}
      </Tabs.TabPane>
      <Tabs.TabPane tab="Tiêm chủng bên ngoài" key="external">
        {externalVaccineTabContent}
      </Tabs.TabPane>
    </Tabs>
  );
};

export default Vaccine;