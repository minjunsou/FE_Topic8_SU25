import React from 'react';
import { Spin, Typography } from 'antd';

const { Text } = Typography;

const LoadingIndicator = () => {
  return (
    <div className="staff-loading">
      <Spin size="large" />
      <Text>Đang tải dữ liệu...</Text>
    </div>
  );
};

export default LoadingIndicator; 