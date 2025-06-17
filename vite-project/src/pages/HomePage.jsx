import React from 'react';
import { Button, Typography, Row, Col, Card, Divider, Space, Image } from 'antd';
import { PhoneOutlined, MailOutlined, ClockCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import './HomePage.css';

const { Title, Text, Paragraph } = Typography;

const HomePage = () => {
  // Danh sách các phòng ban
  const departments = [
    {
      icon: <img src="/images/cardiology-icon.png" alt="Cardiology" className="department-icon" />,
      title: 'Cardiology',
      description: 'Heart care specialists'
    },
    {
      icon: <img src="/images/ophthalmology-icon.png" alt="Ophthalmology" className="department-icon" />,
      title: 'Ophthalmology',
      description: 'Eye care specialists'
    },
    {
      icon: <img src="/images/pediatrics-icon.png" alt="Pediatrics" className="department-icon" />,
      title: 'Pediatrics & Child Health',
      description: 'Child healthcare'
    },
    {
      icon: <img src="/images/testing-icon.png" alt="Medical Testing" className="department-icon" />,
      title: 'Medical Testing',
      description: 'Diagnostic services'
    }
  ];

  // Danh sách testimonials
  const testimonials = [
    {
      avatar: '/images/avatar-1.jpg',
      name: 'Sarah Johnson',
      role: 'Patient',
      content: 'The medical staff was incredibly professional and caring. They made me feel comfortable throughout my entire treatment process.',
      rating: 5
    },
    {
      avatar: '/images/avatar-2.jpg',
      name: 'Michael Peterson',
      role: 'Patient',
      content: 'Fast and efficient service. The online appointment system saved me a lot of time. Highly recommended!',
      rating: 5
    },
    {
      avatar: '/images/avatar-3.jpg',
      name: 'Emily Wilson',
      role: 'Parent',
      content: 'As a parent, I appreciate how well they handle children. My son was nervous but the staff made him feel at ease.',
      rating: 5
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <Text className="hero-subtitle">Medical Care System</Text>
          <Title level={1} className="hero-title">
            A Modern and <br />
            Efficient School <br />
            Health Management <br />
            Solution
          </Title>
          <Paragraph className="hero-description">
            Providing comprehensive healthcare solutions for schools
          </Paragraph>
          <Button type="primary" size="large" className="hero-button">
            Learn More
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <Paragraph className="about-text">
            The School Medical Management System is an all-in-one platform designed to help
            schools easily record, monitor, and report students' health conditions in real-time.
          </Paragraph>
        </div>
      </section>

      {/* Departments Section */}
      <section className="departments-section">
        <div className="container">
          <div className="section-header">
            <Title level={2} className="section-title">Our All Department</Title>
            <Divider className="section-divider" />
          </div>
          
          <Row gutter={[24, 24]} className="departments-row">
            {departments.map((dept, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card className="department-card">
                  <div className="department-icon-wrapper">
                    {dept.icon}
                  </div>
                  <Title level={4} className="department-title">{dept.title}</Title>
                  <Text className="department-description">{dept.description}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="container">
          <Row gutter={24} align="middle">
            <Col xs={24} md={12}>
              <div className="trust-content">
                <Title level={2} className="trust-title">
                  Trust us to be there to help all and make things well again.
                </Title>
                <Button type="primary" shape="circle" icon={<ArrowRightOutlined />} size="large" className="trust-button" />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="trust-image-container">
                <Image 
                  src="/images/doctor-with-patient.jpg" 
                  alt="Doctor with patient" 
                  className="trust-image"
                  preview={false}
                />
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Contact Banner */}
      <section className="contact-banner">
        <div className="container">
          <Row gutter={24} align="middle">
            <Col xs={24} md={12}>
              <div className="contact-info">
                <Title level={3} className="contact-title">
                  We always ready <br />
                  for a challenge.
                </Title>
                <Space direction="vertical" size="middle">
                  <Space>
                    <PhoneOutlined className="contact-icon" />
                    <Text className="contact-text">+880 1234 567 890</Text>
                  </Space>
                  <Space>
                    <MailOutlined className="contact-icon" />
                    <Text className="contact-text">schoolmed@gmail.com</Text>
                  </Space>
                </Space>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="contact-stats">
                <Row gutter={[24, 24]}>
                  <Col span={12}>
                    <div className="stat-item">
                      <Title level={2} className="stat-number">20+</Title>
                      <Text className="stat-label">Doctors</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="stat-item">
                      <Title level={2} className="stat-number">1500+</Title>
                      <Text className="stat-label">Patients</Text>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <Title level={2} className="section-title">Patient Testimonials</Title>
            <Divider className="section-divider" />
          </div>
          
          <Row gutter={[24, 24]} className="testimonials-row">
            {testimonials.map((testimonial, index) => (
              <Col xs={24} sm={24} md={8} key={index}>
                <Card className="testimonial-card">
                  <div className="testimonial-header">
                    <Image 
                      src={testimonial.avatar} 
                      alt={testimonial.name} 
                      className="testimonial-avatar"
                      width={60}
                      height={60}
                      preview={false}
                    />
                    <div className="testimonial-info">
                      <Title level={5} className="testimonial-name">{testimonial.name}</Title>
                      <Text className="testimonial-role">{testimonial.role}</Text>
                    </div>
                    <Button type="primary" shape="circle" icon={<ArrowRightOutlined />} size="small" className="testimonial-button" />
                  </div>
                  <Paragraph className="testimonial-content">
                    {testimonial.content}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Updates Section */}
      <section className="updates-section">
        <div className="container">
          <div className="updates-banner">
            <Title level={3} className="updates-title">Get Every Single Updates Here.</Title>
            <Button type="primary" className="updates-button">Subscribe</Button>
          </div>
          
          <Row gutter={[24, 24]} className="services-row">
            <Col xs={24} md={12}>
              <Card className="service-card">
                <Row gutter={16} align="middle">
                  <Col span={8}>
                    <Image 
                      src="/images/service-1.jpg" 
                      alt="Service" 
                      className="service-image"
                      preview={false}
                    />
                  </Col>
                  <Col span={16}>
                    <Title level={4} className="service-title">
                      If you need a doctor for checkup, contact us
                    </Title>
                    <Space>
                      <ClockCircleOutlined className="service-icon" />
                      <Text className="service-time">24/7 Service</Text>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className="service-card">
                <Row gutter={16} align="middle">
                  <Col span={8}>
                    <Image 
                      src="/images/service-2.jpg" 
                      alt="Service" 
                      className="service-image"
                      preview={false}
                    />
                  </Col>
                  <Col span={16}>
                    <Title level={4} className="service-title">
                      If you need a doctor for checkup, contact us
                    </Title>
                    <Space>
                      <ClockCircleOutlined className="service-icon" />
                      <Text className="service-time">24/7 Service</Text>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
