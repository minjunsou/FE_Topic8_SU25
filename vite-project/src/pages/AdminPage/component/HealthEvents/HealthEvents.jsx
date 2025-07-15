import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Spin, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { getAllHealthEvents, getAccounts, createHealthEvent, updateHealthEvent, deleteHealthEvent } from '../../../../api/adminApi';
import nurseApi from '../../../../api/nurseApi';
import { ROLE_IDS } from '../../../../constants/userRoles';
import { Modal, Form, Input, DatePicker, Select } from 'antd';
import dayjs from 'dayjs';

export default function HealthEvents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form] = Form.useForm();
  const [students, setStudents] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [currentEditRecord, setCurrentEditRecord] = useState(null);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await getAllHealthEvents();
      setIncidents(res.data?.data || res.data || []);
    } catch (err) {
      message.error('Lỗi tải danh sách sự cố sức khỏe');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndNurses = async () => {
    try {
      const studentsRes = await nurseApi.getAllStudents();
      setStudents(studentsRes);
      const nursesRes = await getAccounts({ page: 0, size: 100, roleId: ROLE_IDS.NURSE, sortBy: 'fullName', direction: 'asc' });
      setNurses(nursesRes.data?.accounts || nursesRes.accounts || []);
    } catch (err) {
      message.error('Lỗi tải danh sách học sinh hoặc y tá');
    }
  };

  useEffect(() => {
    fetchIncidents();
    // eslint-disable-next-line
  }, []);

  const handleAdd = () => {
    form.resetFields();
    fetchStudentsAndNurses();
    setIsEdit(false);
    setCurrentEditRecord(null);
    setOpenAdd(true);
  };

  const handleEdit = record => {
    fetchStudentsAndNurses();
    setIsEdit(true);
    setCurrentEditRecord(record);
    form.setFieldsValue({
      studentId: record.studentID,
      nurseId: record.nurseID,
      eventDate: record.eventDate ? dayjs(record.eventDate) : null,
      eventType: record.eventType,
      description: record.description,
      solution: record.solution,
      note: record.note,
      status: record.status
    });
    setOpenAdd(true);
  };

  const handleAddOk = async () => {
    try {
      const values = await form.validateFields();
      setAddLoading(true);
      const payload = {
        eventDate: values.eventDate.format('YYYY-MM-DD'),
        eventType: values.eventType,
        description: values.description,
        solution: values.solution,
        note: values.note,
        status: values.status
      };
      if (isEdit && currentEditRecord) {
        await updateHealthEvent(currentEditRecord.eventId, payload);
        message.success('Cập nhật sự cố thành công');
      } else {
        await createHealthEvent(values.studentId, values.nurseId, payload);
        message.success('Thêm sự cố thành công');
      }
      setOpenAdd(false);
      fetchIncidents();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err?.response?.data?.message || (isEdit ? 'Cập nhật sự cố thất bại' : 'Thêm sự cố thất bại'));
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      await deleteHealthEvent(record.eventId);
      message.success('Xóa sự cố thành công');
      fetchIncidents();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Xóa sự cố thất bại');
    }
  };

  const columns = [
    { title: 'Ngày sự cố', dataIndex: 'eventDate', key: 'eventDate' },
    { title: 'Loại sự cố', dataIndex: 'eventType', key: 'eventType' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Giải pháp', dataIndex: 'solution', key: 'solution' },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sự cố này?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button icon={<ReloadOutlined />} onClick={fetchIncidents}>
          Làm mới
        </Button>
        <div style={{ flex: 1 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm sự cố</Button>
      </div>
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columns}
          dataSource={incidents}
          rowKey={r => r.eventId}
          pagination={false}
        />
      </Spin>
      <Modal
        title={isEdit ? 'Cập nhật sự cố sức khỏe' : 'Thêm sự cố sức khỏe'}
        open={openAdd}
        onOk={handleAddOk}
        onCancel={() => setOpenAdd(false)}
        confirmLoading={addLoading}
        okText={isEdit ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="studentId" label="Học sinh" rules={[{ required: true, message: 'Bắt buộc' }]}> 
            <Select showSearch optionFilterProp="children" placeholder="Chọn học sinh" disabled={isEdit}>
              {students.map(s => (
                <Select.Option key={s.accountId} value={s.accountId}>{s.fullName}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="nurseId" label="Y tá" rules={[{ required: true, message: 'Bắt buộc' }]}> 
            <Select showSearch optionFilterProp="children" placeholder="Chọn y tá" disabled={isEdit}>
              {nurses.map(n => (
                <Select.Option key={n.accountId} value={n.accountId}>{n.fullName}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="eventDate" label="Ngày sự cố" rules={[{ required: true, message: 'Bắt buộc' }]}> 
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="eventType" label="Loại sự cố" rules={[{ required: true, message: 'Bắt buộc' }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Bắt buộc' }]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="solution" label="Giải pháp"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Bắt buộc' }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 