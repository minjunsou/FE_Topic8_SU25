import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  FileAddOutlined,
  MedicineBoxOutlined,
  SolutionOutlined,
  ExperimentOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import "./AdminSidebar.css";

const menuItems = [
  { key: "/admin", label: "Dashboard", icon: <DashboardOutlined /> },
  { key: "/admin/accounts", label: "Quản lý tài khoản", icon: <UserOutlined /> },
  { key: "/admin/medicine", label: "Quản lý thuốc", icon: <MedicineBoxOutlined /> },
  { key: "/admin/vaccination", label: "Tiêm chủng", icon: <ExperimentOutlined /> },
  { key: "/admin/health-events", label: "Sự kiện y tế", icon: <SolutionOutlined /> },
  { key: "/admin/history", label: "Lịch sử", icon: <HistoryOutlined /> },
  { key: "/admin/settings", label: "Cài đặt", icon: <SettingOutlined /> },
];

const AdminSidebar = () => {
  const location = useLocation();
  return (
    <aside className="admin-sidebar-new">
      <div className="admin-sidebar-title">Admin Menu</div>
      <ul className="admin-sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.key}
            className={
              "admin-sidebar-menu-item" +
              (location.pathname === item.key ? " active" : "")
            }
          >
            <Link to={item.key} className="admin-sidebar-link">
              <span className="admin-sidebar-icon">{item.icon}</span>
              <span className="admin-sidebar-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default AdminSidebar; 