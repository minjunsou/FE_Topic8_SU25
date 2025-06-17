import React, { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Descriptions, Button, message, Skeleton, Form, Input, Modal } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import './UserProfile.css';

const { Title } = Typography;

const UserInfo = () => {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [userData, setUserData] = useState(null);

  // Giả lập lấy dữ liệu người dùng
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Giả lập API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dữ liệu mẫu
        const mockData = {
          id: 1,
          name: 'Nguyễn Việt Thành',
          email: 'nguyenviethanh12a112022@gmail.com',
          phone: '0987654321',
          address: 'Số 123, Đường Lê Lợi, Quận 1, TP.HCM',
          role: 'Phụ huynh',
          avatar: null, // URL hình ảnh nếu có
          joinDate: '15/06/2023',
        };
        
        setUserData(mockData);
        form.setFieldsValue(mockData);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        message.error('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [form]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    form.setFieldsValue(userData);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // Giả lập lưu dữ liệu
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserData({...userData, ...values});
      message.success('Cập nhật thông tin thành công');
      setEditing(false);
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu:', error);
      message.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) {
    return (
      <Card className="user-profile-card">
        <Skeleton active avatar paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  return (
    <Card 
      className="user-profile-card"
      title={
        <div className="user-profile-header">
          <Avatar 
            size={64} 
            icon={<UserOutlined />} 
            src={userData?.avatar} 
            className="user-profile-avatar"
          />
          <Title level={4} className="user-profile-title">Thông tin cá nhân</Title>
        </div>
      }
      extra={
        editing ? (
          <div className="user-profile-actions">
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSave}
              loading={loading}
            >
              Lưu
            </Button>
            <Button 
              icon={<CloseOutlined />} 
              onClick={handleCancel}
              className="cancel-button"
            >
              Hủy
            </Button>
          </div>
        ) : (
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={handleEdit}
          >
            Chỉnh sửa
          </Button>
        )
      }
    >
      {editing ? (
        <Form
          form={form}
          layout="vertical"
          initialValues={userData}
        >
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input disabled />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      ) : (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Họ và tên">{userData?.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{userData?.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{userData?.phone}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{userData?.address}</Descriptions.Item>
          <Descriptions.Item label="Vai trò">{userData?.role}</Descriptions.Item>
          <Descriptions.Item label="Ngày tham gia">{userData?.joinDate}</Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};

export default UserInfo; 