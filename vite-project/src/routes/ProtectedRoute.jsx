import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { USER_ROLES } from '../constants/userRoles';

// Hàm lấy vai trò người dùng
const getUserRole = () => {
  const userInfoString = localStorage.getItem('userInfo');
  if (!userInfoString) return null;
  
  try {
    const userInfo = JSON.parse(userInfoString);
    return userInfo.role || null;
  } catch (error) {
    console.error('Lỗi khi phân tích thông tin người dùng:', error);
    return null;
  }
};

// Bảo vệ route yêu cầu xác thực
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const userRole = getUserRole();
  
  // Nếu không có thông tin người dùng, chuyển hướng đến trang đăng nhập
  if (!userRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Nếu có yêu cầu về vai trò và vai trò không được phép
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Chuyển hướng đến trang không có quyền truy cập
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  return children;
};

// Bảo vệ route dành cho khách (chưa đăng nhập)
export const GuestRoute = ({ children }) => {
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const userRole = getUserRole();

  // Nếu đã có thông tin người dùng, chuyển hướng đến trang chủ hoặc trang trước đó
  if (userRole) {
    return <Navigate to={from} replace />;
  }
  
  return children;
}; 