import React, { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button, message, Alert } from 'antd';
import { LockOutlined, KeyOutlined } from '@ant-design/icons';
import { authApi } from '../../api';
import './UserProfile.css';

const { Title } = Typography;

const ChangePassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  // Lấy thông tin người dùng từ localStorage khi component được render
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
      } catch (error) {
        console.error('Lỗi khi phân tích thông tin người dùng:', error);
        message.error('Không thể lấy thông tin người dùng');
      }
    } else {
      message.warning('Vui lòng đăng nhập để sử dụng tính năng này');
    }
  }, []);

  const onFinish = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Gọi API thay đổi mật khẩu
      const passwordData = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      };
      
      // Gọi API thay đổi mật khẩu từ authApi
      const response = await authApi.changePassword(passwordData);
      
      console.log('Change password response:', response);
      
      // Hiển thị thông báo thành công
      setSuccess(true);
      message.success(response.message || 'Đổi mật khẩu thành công');
      form.resetFields();
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      
      // Hiển thị thông báo lỗi
      const errorMessage = error.message || 'Đã xảy ra lỗi khi đổi mật khẩu';
      setError(errorMessage);
      message.error(errorMessage);
      
      // Xử lý các lỗi cụ thể
      if (error.status === 401) {
        setError('Mật khẩu hiện tại không đúng');
      } else if (error.status === 400) {
        setError('Vui lòng kiểm tra lại thông tin mật khẩu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị thông báo nếu không có thông tin người dùng
  if (!userInfo?.accountId) {
    return (
      <Card 
        className="user-profile-card"
        title={
          <div className="user-profile-header">
            <KeyOutlined className="user-profile-icon" />
            <Title level={4} className="user-profile-title">Đổi mật khẩu</Title>
          </div>
        }
      >
        <Alert
          message="Không thể thay đổi mật khẩu"
          description="Vui lòng đăng nhập để sử dụng tính năng này hoặc tài khoản của bạn không có accountId."
          type="warning"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card 
      className="user-profile-card"
      title={
        <div className="user-profile-header">
          <KeyOutlined className="user-profile-icon" />
          <Title level={4} className="user-profile-title">Đổi mật khẩu</Title>
        </div>
      }
    >
      {success && (
        <Alert
          message="Đổi mật khẩu thành công"
          description="Mật khẩu của bạn đã được cập nhật."
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
      
      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
      
      <Form
        form={form}
        name="change_password"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="currentPassword"
          label="Mật khẩu hiện tại"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="Nhập mật khẩu hiện tại" 
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 8, message: 'Mật khẩu mới phải có ít nhất 8 ký tự' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              message: 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
            }
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="Nhập mật khẩu mới" 
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu mới"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp với mật khẩu mới'));
              },
            }),
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="Xác nhận mật khẩu mới" 
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            className="change-password-button"
            block
          >
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>
      
      <div className="password-requirements">
        <Title level={5}>Yêu cầu mật khẩu:</Title>
        <ul>
          <li>Ít nhất 8 ký tự</li>
          <li>Ít nhất 1 chữ hoa</li>
          <li>Ít nhất 1 chữ thường</li>
          <li>Ít nhất 1 số</li>
          <li>Ít nhất 1 ký tự đặc biệt (@$!%*?&)</li>
        </ul>
      </div>
    </Card>
  );
};

export default ChangePassword; 