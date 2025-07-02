import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminHeader.css";

const AdminHeader = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleProfileClick = () => setOpen((o) => !o);
  const handleDashboard = () => {
    setOpen(false);
    navigate("/admin");
  };

  return (
    <header className="admin-header">
      <h1 style={{ cursor: "pointer" }} onClick={handleDashboard}>Admin Panel</h1>
      <div className="admin-user-info" style={{ position: "relative" }}>
        <span onClick={handleProfileClick} style={{ cursor: "pointer" }}>
          Profile &#9662;
        </span>
        {open && (
          <div className="admin-profile-dropdown">
            <div className="admin-profile-item" onClick={handleDashboard}>
              Dashboard
            </div>
            {/* Có thể thêm các mục khác như Đăng xuất, Thông tin cá nhân ở đây */}
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader; 