import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { USER_ROLES, ROLE_IDS } from "../constants/userRoles";

// Hàm lấy vai trò người dùng
const getUserRole = () => {
  const userInfoString = localStorage.getItem("userInfo");
  if (!userInfoString) return null;

  try {
    const userInfo = JSON.parse(userInfoString);
    return userInfo.roleId ? Number(userInfo.roleId) : null;
  } catch (error) {
    console.error("Lỗi khi phân tích thông tin người dùng:", error);
    return null;
  }
};

// Hàm chuyển đổi từ roleId sang role string
const getRoleNameFromId = (roleId) => {
  switch (Number(roleId)) {
    case ROLE_IDS.STUDENT:
      return USER_ROLES.STUDENT;
    case ROLE_IDS.PARENT:
      return USER_ROLES.PARENT;
    case ROLE_IDS.NURSE:
      return USER_ROLES.NURSE;
    case ROLE_IDS.ADMIN:
      return USER_ROLES.ADMIN;     
    default:
      return null;
  }
};

// Bảo vệ route yêu cầu xác thực
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const userRoleId = getUserRole();

  // Nếu không có thông tin người dùng, chuyển hướng đến trang đăng nhập
  if (!userRoleId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Chuyển đổi roleId sang role string
  const userRole = getRoleNameFromId(userRoleId);

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
  const from = location.state?.from?.pathname || "/";
  const userRoleId = getUserRole();

  // Nếu đã có thông tin người dùng, chuyển hướng đến trang chủ hoặc trang trước đó
  if (userRoleId) {
    return <Navigate to={from} replace />;
  }

  return children;
};
