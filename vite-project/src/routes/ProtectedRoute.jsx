import React from 'react';
import { Navigate } from 'react-router-dom';

// Hàm kiểm tra đăng nhập
const isAuthenticated = () => {
  // Trong thực tế, bạn sẽ kiểm tra token hoặc session
  // Ví dụ: return localStorage.getItem('token') !== null;
  
  // Tạm thời trả về true để disable việc kiểm tra xác thực
  return true;
};

// Bảo vệ route yêu cầu xác thực
export const ProtectedRoute = ({ children }) => {
  // Tạm thời disable việc kiểm tra xác thực bằng cách luôn trả về children
  return children;
  
  // Khi cần kích hoạt lại, hãy uncomment đoạn code dưới đây và xóa dòng return children;
  /*
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
  */
};

// Bảo vệ route dành cho khách
export const GuestRoute = ({ children }) => {
  // Tạm thời disable việc kiểm tra xác thực bằng cách luôn trả về children
  return children;
  
  // Khi cần kích hoạt lại, hãy uncomment đoạn code dưới đây và xóa dòng return children;
  /*
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
  */
}; 