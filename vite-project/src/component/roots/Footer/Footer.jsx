import React from 'react';
import { Layout, Row, Col, Typography, List, Space } from 'antd';
import { HeartFilled, FacebookFilled, TwitterOutlined, InstagramOutlined } from '@ant-design/icons';
import './Footer.css';

const { Footer } = Layout;
const { Title, Text, Link } = Typography;

const AppFooter = () => {
  // Danh sách các phòng ban
  const departments = [
    'Emergency Department',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology'
  ];

  // Danh sách các liên kết nhanh
  const quickLinks = [
    'Our Doctors',
    'Appointment',
    'Services',
    'Testimonials',
    'Contact Us'
  ];

  // Danh sách các bài viết blog
  const blogPosts = [
    'Latest medical technology',
    'Healthcare innovations',
    'Medical research updates',
    'Health tips and advice'
  ];

  // Hàm xử lý khi click vào các liên kết
  const handleLinkClick = (item) => {
    console.log(`Clicked on: ${item}`);
    // Thêm xử lý điều hướng tại đây
  };

  return (
    <Footer className="footer-container">
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={8} lg={8}>
          <div className="footer-logo-section">
            <Space align="center">
              <HeartFilled className="footer-logo-icon" />
              <Title level={4} className="footer-logo-text">SchoolMed</Title>
            </Space>
            <Text className="footer-description">
              Committed to your health and wellness. Providing quality healthcare services for all your needs.
            </Text>
            <Space className="footer-social-icons">
              <FacebookFilled className="footer-social-icon" />
              <TwitterOutlined className="footer-social-icon" />
              <InstagramOutlined className="footer-social-icon" />
            </Space>
          </div>
        </Col>

        <Col xs={24} sm={12} md={5} lg={5}>
          <Title level={5} className="footer-section-title">Departments</Title>
          <List
            dataSource={departments}
            renderItem={(item) => (
              <List.Item className="footer-list-item">
                <Link onClick={() => handleLinkClick(item)}>{item}</Link>
              </List.Item>
            )}
          />
        </Col>

        <Col xs={24} sm={12} md={5} lg={5}>
          <Title level={5} className="footer-section-title">Quick Links</Title>
          <List
            dataSource={quickLinks}
            renderItem={(item) => (
              <List.Item className="footer-list-item">
                <Link onClick={() => handleLinkClick(item)}>{item}</Link>
              </List.Item>
            )}
          />
        </Col>

        <Col xs={24} sm={12} md={6} lg={6}>
          <Title level={5} className="footer-section-title">Blog Post</Title>
          <List
            dataSource={blogPosts}
            renderItem={(item) => (
              <List.Item className="footer-list-item">
                <Link onClick={() => handleLinkClick(item)}>{item}</Link>
              </List.Item>
            )}
          />
        </Col>
      </Row>

      <Row className="footer-copyright">
        <Col span={24}>
          <Text>Copyright 2023 - All Rights Reserved</Text>
        </Col>
      </Row>
    </Footer>
  );
};

export default AppFooter; 