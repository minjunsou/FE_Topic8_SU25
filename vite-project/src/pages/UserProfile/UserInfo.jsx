import React, { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Descriptions, Button, message, Skeleton, Form, Input, Modal, Select } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { userApi } from '../../api';
import './UserProfile.css';

const { Title } = Typography;
const { Option } = Select;

const UserInfo = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [userData, setUserData] = useState(null);
  const [accountId, setAccountId] = useState(null);

  // Lấy dữ liệu người dùng từ localStorage và API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Lấy thông tin người dùng từ localStorage
        const storedUserInfo = localStorage.getItem('userInfo');
        
        if (storedUserInfo) {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          console.log('User info loaded from localStorage:', parsedUserInfo);
          
          // Lưu accountId để sử dụng sau này
          const userAccountId = parsedUserInfo.accountId;
          setAccountId(userAccountId);
          
          try {
            // Gọi API để lấy thông tin người dùng mới nhất
            const apiResponse = await userApi.getUserProfile(userAccountId);
            console.log('User profile from API:', apiResponse);
            
            // Sử dụng dữ liệu từ API nếu có
            if (apiResponse) {
              // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
              const formattedUserData = formatUserData(apiResponse);
              setUserData(formattedUserData);
              form.setFieldsValue(formattedUserData);
            } else {
              // Nếu API không trả về dữ liệu, sử dụng dữ liệu từ localStorage
              const formattedUserData = formatUserData(parsedUserInfo);
              setUserData(formattedUserData);
              form.setFieldsValue(formattedUserData);
            }
          } catch (apiError) {
            console.error('Lỗi khi gọi API lấy thông tin người dùng:', apiError);
            // Nếu API lỗi, sử dụng dữ liệu từ localStorage
            const formattedUserData = formatUserData(parsedUserInfo);
            setUserData(formattedUserData);
            form.setFieldsValue(formattedUserData);
          }
        } else {
          // Nếu không có dữ liệu trong localStorage, hiển thị thông báo
          message.warning('Không tìm thấy thông tin người dùng');
          
          // Đặt dữ liệu mặc định
          const defaultUserData = {
            name: 'Người dùng',
            email: '',
            phone: '',
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

  // Hàm định dạng dữ liệu người dùng
  const formatUserData = (userInfo) => {
    return {
      id: userInfo.accountId || '',
      name: userInfo.fullName || userInfo.name || userInfo.username || '',
      email: userInfo.email || '',
      phone: userInfo.phone || '',
      // role: getRoleName(userInfo.roleId),
      avatar: null, // URL hình ảnh nếu có
      joinDate: new Date().toLocaleDateString('vi-VN'), // Giả sử không có thông tin ngày tham gia
      gender: userInfo.gender || '',
      dob: userInfo.dob || ''
    };
  };

  // Hàm chuyển đổi roleId sang tên vai trò
  // const getRoleName = (roleId) => {
  //   const roleIdNum = Number(roleId);
  //   switch (roleIdNum) {
  //     case 1: return 'Quản trị viên';
  //     case 2: return 'Y tá trường';
  //     case 3: return 'Phụ huynh';
  //     case 4: return 'Học sinh';
  //     default: return 'Người dùng';
  //   }
  // };

  // Hàm chuyển đổi mã giới tính sang hiển thị
  const getGenderDisplay = (gender) => {
    if (gender === null || gender === undefined) return 'Chưa cập nhật';
    if (gender === 'M') return 'Nam';
    if (gender === 'F') return 'Nữ';
    return 'Chưa cập nhật';
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
      setSaving(true);
      
      if (!accountId) {
        message.error('Không tìm thấy ID người dùng');
        return;
      }
      
      // Chuẩn bị dữ liệu để gửi lên API
      const updateData = {
        fullName: values.name,
        phone: values.phone,
        gender: values.gender,
        dob: values.dob
      };
      
      console.log('Dữ liệu cập nhật:', updateData);
      
      try {
        // Gọi API cập nhật thông tin người dùng
        const response = await userApi.updateUserProfile(accountId, updateData);
        console.log('API response:', response);
        
        // Cập nhật dữ liệu người dùng trong state và localStorage
        const updatedUserData = {
          ...userData,
          ...values,
          gender: values.gender // Giữ nguyên giá trị gender để hiển thị
        };
        
        setUserData(updatedUserData);
        
        // Cập nhật thông tin trong localStorage
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          const updatedUserInfo = {
            ...parsedUserInfo,
            fullName: values.name,
            phone: values.phone,
            gender: values.gender,
            dob: values.dob
          };
          
          localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        }
        
        message.success('Cập nhật thông tin thành công');
        setEditing(false);
      } catch (error) {
        console.error('Lỗi khi cập nhật thông tin người dùng:', error);
        if (error.response) {
          message.error(`Không thể cập nhật thông tin: ${error.response.data.message || 'Đã xảy ra lỗi'}`);
        } else {
          message.error('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
        }
      }
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu:', error);
      message.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSaving(false);
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
              loading={saving}
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
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
          >
            <Select placeholder="Chọn giới tính">
              <Option value="M">Nam</Option>
              <Option value="F">Nữ</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="dob"
            label="Ngày sinh (YYYY-MM-DD)"
            rules={[
              { required: true, message: 'Vui lòng nhập ngày sinh' },
              { pattern: /^\d{4}-\d{2}-\d{2}$/, message: 'Định dạng ngày sinh không hợp lệ (YYYY-MM-DD)' }
            ]}
          >
            <Input placeholder="Ví dụ: 1990-01-01" />
          </Form.Item>
        </Form>
      ) : (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Họ và tên">{userData?.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{userData?.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{userData?.phone}</Descriptions.Item>
          <Descriptions.Item label="Giới tính">{getGenderDisplay(userData?.gender)}</Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">{userData?.dob || 'Chưa cập nhật'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tham gia">{userData?.joinDate}</Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};

export default UserInfo; 