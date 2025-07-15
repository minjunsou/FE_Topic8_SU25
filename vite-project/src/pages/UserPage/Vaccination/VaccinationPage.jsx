import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Modal, Form, Select, Radio, message } from 'antd';
import parentApi from '../../../api/parentApi';

const { Option } = Select;

const VaccinationPage = ({ parentId }) => {
  const [confirmations, setConfirmations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedConfirmation, setSelectedConfirmation] = useState(null);
  const [form] = Form.useForm();

  // Lấy danh sách xác nhận tiêm chủng cho các con
  useEffect(() => {
    fetchConfirmations();
  }, []);
  
  const fetchConfirmations = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const parentId = userInfo?.accountId;
      if (!parentId) {
        setConfirmations([]);
        setLoading(false);
        return;
      }
      const data = await parentApi.getVaccinationConfirmationsByStatusAndParent('PENDING', parentId);
      setConfirmations(data);
    } catch {
      setConfirmations([]);
    }
    setLoading(false);
  };

  // Xác nhận cho 1 học sinh
  const handleConfirm = async (values) => {
    setLoading(true);
    try {
      await parentApi.updateVaccinationConfirmation(selectedConfirmation.confirmationId, {
        vaccineNoticeId: selectedConfirmation.vaccineNoticeId,
        studentId: selectedConfirmation.studentId,
        parentId: selectedConfirmation.parentId,
        status: values.confirmStatus === 'yes' ? 'CONFIRMED' : 'DECLINED',
      });
      message.success('Đã xác nhận!');
      setModalVisible(false);
      await fetchConfirmations();
    } catch {
      message.error('Xác nhận thất bại!');
    }
    setLoading(false);
  };

  // Xác nhận tất cả
  const handleConfirmAll = async () => {
    setLoading(true);
    try {
      const ids = confirmations.filter(c => c.status === 'PENDING').map(c => c.confirmationId);
      if (ids.length === 0) {
        setLoading(false);
        return;
      }
      await parentApi.confirmAllVaccinationConfirmations(ids);
      message.success('Đã xác nhận tất cả!');
      await fetchConfirmations();
    } catch {
      message.error('Xác nhận tất cả thất bại!');
    }
    setLoading(false);
  };

  return (
    <Card
      title="Xác nhận tiêm chủng cho học sinh"
      extra={
        <Button type="primary" onClick={handleConfirmAll} disabled={confirmations.filter(c => c.status === 'PENDING').length === 0}>
          Xác nhận tất cả
        </Button>
      }
    >
      <Table
        columns={[
          { title: 'Học sinh', dataIndex: 'studentName' },
          { title: 'Tên đợt tiêm', dataIndex: 'vaccineName' },
          { title: 'Ngày tiêm', dataIndex: 'vaccinationDate' },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: status => (
              <Tag color={status === 'CONFIRMED' ? 'green' : status === 'DECLINED' ? 'red' : 'orange'}>
                {status === 'CONFIRMED' ? 'Đã xác nhận' : status === 'DECLINED' ? 'Đã từ chối' : 'Chưa xác nhận'}
              </Tag>
            ),
          },
          {
            title: 'Hành động',
            render: (_, record) => (
              <Button
                type="primary"
                disabled={record.status !== 'PENDING'}
                onClick={() => {
                  setSelectedConfirmation(record);
                  setModalVisible(true);
                  form.resetFields();
                }}
              >
                Xác nhận
              </Button>
            ),
          },
        ]}
        dataSource={confirmations}
        rowKey="confirmationId"
        loading={loading}
      />

      <Modal
        title="Xác nhận tham gia tiêm chủng"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleConfirm}>
          <Form.Item
            name="confirmStatus"
            label="Xác nhận tham gia"
            rules={[{ required: true, message: 'Vui lòng chọn xác nhận!' }]}
          >
            <Radio.Group>
              <Radio value="yes">Đồng ý cho con tham gia tiêm chủng</Radio>
              <Radio value="no">Không đồng ý cho con tham gia tiêm chủng</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>Xác nhận</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default VaccinationPage;