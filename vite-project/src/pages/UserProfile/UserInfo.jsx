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

  // Lấy dữ liệu người dùng từ localStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Lấy thông tin người dùng từ localStorage
        const storedUserInfo = localStorage.getItem('userInfo');
        
        if (storedUserInfo) {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          console.log('User info loaded from localStorage:', parsedUserInfo);
        
          // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
          const formattedUserData = {
            id: parsedUserInfo.accountId || '',
            name: parsedUserInfo.fullName || parsedUserInfo.name || parsedUserInfo.username || '',
            email: parsedUserInfo.email || '',
            phone: parsedUserInfo.phone || '',
            address: parsedUserInfo.address || '',
            role: getRoleName(parsedUserInfo.roleId),
          avatar: null, // URL hình ảnh nếu có
            joinDate: new Date().toLocaleDateString('vi-VN'), // Giả sử không có thông tin ngày tham gia
            gender: parsedUserInfo.gender === null ? 'Chưa cập nhật' : parsedUserInfo.gender === true ? 'Nam' : 'Nữ',
            dob: parsedUserInfo.dob || 'Chưa cập nhật'
        };
        
          setUserData(formattedUserData);
          form.setFieldsValue(formattedUserData);
        } else {
          // Nếu không có dữ liệu trong localStorage, hiển thị thông báo
          message.warning('Không tìm thấy thông tin người dùng');
          
          // Đặt dữ liệu mặc định
          const defaultUserData = {
            name: 'Người dùng',
            email: '',
            phone: '',
            address: '',
            role: 'Người dùng',
            gender: 'Chưa cập nhật',
            dob: 'Chưa cập nhật',
            joinDate: new Date().toLocaleDateString('vi-VN')
          };
          
          setUserData(defaultUserData);
          form.setFieldsValue(defaultUserData);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        message.error('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [form]);

  // Hàm chuyển đổi roleId sang tên vai trò
  const getRoleName = (roleId) => {
    const roleIdNum = Number(roleId);
    switch (roleIdNum) {
      case 1: return 'Quản trị viên';
      case 2: return 'Y tá trường';
      case 3: return 'Phụ huynh';
      case 4: return 'Học sinh';
      default: return 'Người dùng';
    }
  };

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
          <Descriptions.Item label="Giới tính">{userData?.gender}</Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">{userData?.dob}</Descriptions.Item>
          <Descriptions.Item label="Vai trò">{userData?.role}</Descriptions.Item>
          <Descriptions.Item label="Ngày tham gia">{userData?.joinDate}</Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};

export default UserInfo; 