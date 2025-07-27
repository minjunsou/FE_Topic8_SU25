import React, { useState, Suspense, lazy } from 'react';
import './AdminPage.css';

const menuItems = [
  // Dashboard tổng quan
  { key: 'overview', label: 'Tổng quan', icon: '📊' },
  
  // Quản lý hệ thống
  { key: 'accounts', label: 'Quản lý tài khoản', icon: '👥' },
  { key: 'classes', label: 'Lớp học', icon: '🏫' },
  
  // Quản lý thuốc
  { key: 'medications', label: 'Thuốc', icon: '💊' },
  
  // Tiêm chủng (Consolidated)
  { key: 'vaccination', label: 'Tiêm chủng', icon: '💉' },
  
  // Sự cố sức khỏe (Consolidated)
  { key: 'health', label: 'Sự cố sức khỏe', icon: '🏥' },
  
  // Tư vấn
  { key: 'consultations', label: 'Lịch tư vấn', icon: '📅' },
  
  // Tham chiếu
  { key: 'medicalReference', label: 'Tham chiếu y tế', icon: '📚' },
];

// Lazy load các component chức năng
const Overview = lazy(() => import('./component/Overview/Overview'));
const Accounts = lazy(() => import('./component/Accounts/Accounts'));
const Classes = lazy(() => import('./component/Classes/Classes'));
const Medications = lazy(() => import('./component/Medications/Medications'));
const Vaccination = lazy(() => import('./component/Vaccination/Vaccination'));
const Health = lazy(() => import('./component/Health/Health'));
const Consultations = lazy(() => import('./component/Consultations/Consultations'));
const MedicalReference = lazy(() => import('./component/MedicalReference/MedicalReference'));

const componentMap = {
  overview: Overview,
  accounts: Accounts,
  classes: Classes,
  medications: Medications,
  vaccination: Vaccination,
  health: Health,
  consultations: Consultations,
  medicalReference: MedicalReference,
};

export default function AdminPage() {
  const [selected, setSelected] = useState(() => {
    // Đọc active tab từ localStorage nếu có
    const savedTab = localStorage.getItem('adminActiveTab');
    if (savedTab && componentMap[savedTab]) {
      localStorage.removeItem('adminActiveTab'); // Xóa sau khi đọc
      return savedTab;
    }
    return 'overview';
  });

  const SelectedComponent = componentMap[selected];

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-title">
          <span style={{ fontSize: '24px', marginRight: '8px' }}>🏥</span>
          Admin Dashboard
        </div>
        <ul className="sidebar-menu">
          {menuItems.map(item => (
            <li
              key={item.key}
              className={selected === item.key ? 'active' : ''}
              onClick={() => setSelected(item.key)}
            >
              <span style={{ marginRight: '8px' }}>{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>
              {menuItems.find(i => i.key === selected)?.icon}
            </span>
            <h2>{menuItems.find(i => i.key === selected)?.label}</h2>
          </div>
          <div className="header-actions">
            <span className="user-info">Admin</span>
          </div>
        </header>
        <section className="admin-content">
          <Suspense fallback={
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>Đang tải...</p>
            </div>
          }>
            <SelectedComponent />
          </Suspense>
        </section>
      </main>
    </div>
  );
} 