import React from 'react';
import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './LoginPage.css';

const { Title, Text } = Typography;

const LoginPage = () => {
  const onFinish = (values) => {
    console.log('Login values:', values);
    // Xử lý đăng nhập tại đây
    // Sau khi đăng nhập thành công, chuyển hướng đến trang home với layout đã đăng nhập
    // window.location.href = '/dashboard';
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <Title level={2} className="login-title">Sign In</Title>
            <Text className="login-subtitle">Welcome back! Please sign in to continue</Text>
          </div>

          <Divider />

          <Form
            name="login_form"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your Username!' }]}
            >
              <Input 
                prefix={<UserOutlined className="site-form-item-icon" />} 
                placeholder="Username" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your Password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            <Form.Item className="login-form-button">
              <Button type="primary" htmlType="submit" size="large" block>
                Sign In
              </Button>
            </Form.Item>

            <div className="login-links">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage; 