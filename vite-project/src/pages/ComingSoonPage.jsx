import React from 'react';
import { Typography, Result, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const ComingSoonPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.substring(1); // Loại bỏ dấu / ở đầu
  const pageName = path.charAt(0).toUpperCase() + path.slice(1); // Viết hoa chữ cái đầu

  return (
    <div className="container section-padding">
      <Result
        icon={<ClockCircleOutlined style={{ color: '#0078FF' }} />}
        title={<Title level={2}>Tính năng "{pageName}" sắp ra mắt!</Title>}
        subTitle={
          <Paragraph style={{ fontSize: '16px' }}>
            Chúng tôi đang nỗ lực phát triển tính năng này. 
            Vui lòng quay lại sau để trải nghiệm đầy đủ dịch vụ của SchoolMed.
          </Paragraph>
        }
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Quay về Trang chủ
          </Button>
        }
      />
    </div>
  );
};

export default ComingSoonPage; 