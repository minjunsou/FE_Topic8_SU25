import React, { useState } from 'react';
import { Card, Typography, Form, Input, Button, message, Alert } from 'antd';
import { LockOutlined, KeyOutlined } from '@ant-design/icons';
import './UserProfile.css';

const { Title } = Typography;

const ChangePassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Kiểm tra mật khẩu cũ (giả lập)
      if (values.currentPassword !== 'password123') {
        throw new Error('Mật khẩu hiện tại không đúng');
      }
      
      // Nếu thành công
      setSuccess(true);
      message.success('Đổi mật khẩu thành công');
      form.resetFields();
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      setError(error.message || 'Đã xảy ra lỗi khi đổi mật khẩu');
      message.error(error.message || 'Đã xảy ra lỗi khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

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