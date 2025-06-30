import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { ROLE_IDS } from '../constants/userRoles';
import './LoginPage.css';

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      console.log('Login values:', values);

      // Chuẩn bị dữ liệu đăng nhập
      const loginData = {
        email: values.username,
        password: values.password
      };
      
      // Gọi API đăng nhập
      const response = await authApi.login(loginData);
      console.log('Login response:', response);
      
      if (response && response.user) {
        // Lấy roleId từ thông tin người dùng
        const userRoleId = response.user.roleId ? Number(response.user.roleId) : 0;
        message.success('Đăng nhập thành công!');
        
        // Tạo event để thông báo thay đổi trong localStorage
        window.dispatchEvent(new Event('storage'));
        
        // Chuyển hướng dựa trên vai trò người dùng
        setTimeout(() => {
          // Kiểm tra roleId và chuyển hướng đến trang tương ứng
          switch (userRoleId) {
            case ROLE_IDS.ADMIN: // Admin
              navigate('/dashboard');
              break;
            case ROLE_IDS.NURSE: // Nurse
              navigate('/staff');
              break;
            case ROLE_IDS.PARENT: // Parent
              navigate('/');
              break;
            case ROLE_IDS.STUDENT: // Student
              navigate('/');
              break;
            default:
              navigate('/');
              break;
          }
        }, 500);
      } else {
        message.error('Đăng nhập thất bại: Không nhận được dữ liệu từ máy chủ');
      }
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
      
      // Hiển thị thông báo lỗi
      if (error.status === 401) {
        message.error('Email hoặc mật khẩu không chính xác');
      } else if (error.status === 403) {
        message.error('Tài khoản của bạn đã bị khóa');
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('Đăng nhập thất bại. Vui lòng thử lại sau!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <Title level={2} className="login-title">Đăng nhập</Title>
            <Text className="login-subtitle">Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục</Text>
          </div>

          <Divider />

          <Form
            form={form}
            name="login_form"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
            >
              <Input 
                prefix={<UserOutlined className="site-form-item-icon" />} 
                placeholder="Email" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Mật khẩu"
                size="large"
              />
            </Form.Item>

            <Form.Item className="login-form-button">
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                block
                loading={loading}
              >
                Đăng nhập
              </Button>
            </Form.Item>

            <div className="login-links">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage; 