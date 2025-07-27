import React from 'react';
import { Button, Typography, Row, Col, Card, Divider, Space, Image } from 'antd';
import { PhoneOutlined, MailOutlined, ClockCircleOutlined, ArrowRightOutlined, MedicineBoxOutlined, FileTextOutlined, ReadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
// import medicalTeamImage from '../assets/Screenshot 2025-06-18 114846.png';
import teamDoctorImage from '../assets/Screenshot 2025-06-18 120512.png'

const { Title, Text, Paragraph } = Typography;

const HomePage = () => {
  const navigate = useNavigate();

  // Danh sách các chức năng
  const functions = [
    {
      icon: <MedicineBoxOutlined className="function-icon" />,
      title: 'Health Declaration',
      description: 'Declare health status',
      path: '/health-declaration'
    },
    {
      icon: <FileTextOutlined className="function-icon" />,
      title: 'Medicine Request',
      description: 'Register and manage medicine',
      path: '/medicine-request'
    },
    {
      icon: <ReadOutlined className="function-icon" />,
      title: 'Blog',
      description: 'School health information',
      path: '/blog'
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

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
          <Button type="primary" size="large" className="hero-button" href="/login">
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

      {/* Functions Section */}
      <section className="functions-section">
        <div className="container">
          <div className="section-header">
            <Title level={2} className="section-title">Our Functions</Title>
            <Divider className="section-divider" />
          </div>
          
          <div className="functions-container">
            <Row justify="center" gutter={[24, 24]} className="functions-row">
              {functions.map((func, index) => (
                <Col xs={24} sm={8} md={8} lg={8} xl={8} key={index} className="function-col">
                  <Card className="function-card" onClick={() => handleCardClick(func.path)}>
                    <div className="function-icon-wrapper">
                      {func.icon}
                    </div>
                    <Title level={4} className="function-title">{func.title}</Title>
                    <Text className="function-description">{func.description}</Text>
                    <Button 
                      type="primary" 
                      shape="round" 
                      icon={<ArrowRightOutlined />} 
                      className="function-button"
                    >
                      Go to {func.title}
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="container">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={12}>
              <div className="trust-content">
                <Title level={2} className="trust-title">
                  Đội ngũ y tá chuyên nghiệp, tận tâm và đầy trách nhiệm
                </Title>
                <Paragraph className="trust-description">
                  Với đội ngũ y tá được đào tạo bài bản và giàu kinh nghiệm, chúng tôi cam kết mang đến dịch vụ chăm sóc sức khỏe chất lượng cao nhất cho học sinh. Mỗi y tá trong hệ thống đều làm việc với tinh thần trách nhiệm cao, luôn đặt sức khỏe và sự an toàn của học sinh lên hàng đầu.
                </Paragraph>
                <div className="trust-features">
                  <div className="trust-feature-item">
                    <CheckCircleOutlined className="trust-feature-icon" />
                    <Text className="trust-feature-text">Đội ngũ y tá có chứng chỉ hành nghề</Text>
                  </div>
                  <div className="trust-feature-item">
                    <CheckCircleOutlined className="trust-feature-icon" />
                    <Text className="trust-feature-text">Phản ứng nhanh trong các tình huống khẩn cấp</Text>
                  </div>
                  <div className="trust-feature-item">
                    <CheckCircleOutlined className="trust-feature-icon" />
                    <Text className="trust-feature-text">Theo dõi sức khỏe học sinh liên tục</Text>
                  </div>
                </div>
                <Button 
                  type="primary" 
                  shape="round" 
                  icon={<ArrowRightOutlined />} 
                  size="large" 
                  className="trust-button-new"
                  onClick={() => navigate('/about')} 
                >
                  Tìm hiểu thêm
                </Button>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="trust-image-container">
                <Image 
                  src={teamDoctorImage} 
                  alt="Y tá chăm sóc học sinh" 
                  className="trust-image"
                  preview={false}
                />
                <div className="trust-image-badge">
                  <div className="trust-badge-content">
                    <Title level={4} className="trust-badge-number">98%</Title>
                    <Text className="trust-badge-text">Phụ huynh hài lòng</Text>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Contact Banner */}
      <section className="contact-banner">
        <div className="container">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} md={12}>
              <div className="contact-info">
                <Title level={3} className="contact-title">
                  We always ready <br />
                  for a challenge.
                </Title>
                <Space direction="vertical" size="large">
                  <Space align="center">
                    <PhoneOutlined className="contact-icon" />
                    <Text className="contact-text">+880 1234 567 890</Text>
                  </Space>
                  <Space align="center">
                    <MailOutlined className="contact-icon" />
                    <Text className="contact-text">schoolmed@gmail.com</Text>
                  </Space>
                </Space>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="contact-stats">
                <Row gutter={[32, 32]}>
                  <Col xs={24} sm={12}>
                    <div className="stat-item">
                      <Title level={2} className="stat-number">20+</Title>
                      <Text className="stat-label">Doctors</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
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
          {/* <div className="updates-banner">
            <Title level={3} className="updates-title">Get Every Single Updates Here.</Title>
            <Button type="primary" className="updates-button">Subscribe</Button>
          </div> */}
          
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
