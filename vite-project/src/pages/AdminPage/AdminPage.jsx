import React, { useState, Suspense, lazy } from 'react';
import './AdminPage.css';

const menuItems = [
  { key: 'accounts', label: 'Quản lý tài khoản' },
  { key: 'classes', label: 'Lớp học' },
  { key: 'medications', label: 'Thuốc' },
  { key: 'vaccine', label: 'Vaccine' },
  { key: 'healthEvents', label: 'Sự cố sức khỏe' },
  { key: 'healthChecks', label: 'Phiếu khám sức khỏe' },
  { key: 'vaccinationRecords', label: 'Phiếu tiêm chủng' },
  { key: 'healthCheckNotices', label: 'Thông báo khám' },
  { key: 'vaccinationNotices', label: 'Thông báo tiêm' },
  { key: 'consultations', label: 'Lịch tư vấn' },
];

// Lazy load các component chức năng (placeholder, sẽ tạo sau)
const Accounts = lazy(() => import('./component/Accounts/Accounts'));
const Classes = lazy(() => import('./component/Classes/Classes'));
const Medications = lazy(() => import('./component/Medications/Medications'));
const HealthEvents = lazy(() => import('./component/HealthEvents/HealthEvents'));
const HealthChecks = lazy(() => import('./component/HealthChecks/HealthChecks'));
const VaccinationRecords = lazy(() => import('./component/VaccinationRecords/VaccinationRecords'));
const HealthCheckNotices = lazy(() => import('./component/HealthCheckNotices/HealthCheckNotices'));
const VaccinationNotices = lazy(() => import('./component/VaccinationNotices/VaccinationNotices'));
const Consultations = lazy(() => import('./component/Consultations/Consultations'));
const Vaccine = lazy(() => import('./component/Vaccine/Vaccine'));

const componentMap = {
  accounts: Accounts,
  classes: Classes,
  medications: Medications,
  vaccine: Vaccine,
  healthEvents: HealthEvents,
  healthChecks: HealthChecks,
  vaccinationRecords: VaccinationRecords,
  healthCheckNotices: HealthCheckNotices,
  vaccinationNotices: VaccinationNotices,
  consultations: Consultations,
};

export default function AdminPage() {
  const [selected, setSelected] = useState('accounts');

  const SelectedComponent = componentMap[selected];

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-title">Admin Dashboard</div>
        <ul className="sidebar-menu">
          {menuItems.map(item => (
            <li
              key={item.key}
              className={selected === item.key ? 'active' : ''}
              onClick={() => setSelected(item.key)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h2>{menuItems.find(i => i.key === selected)?.label}</h2>
        </header>
        <section className="admin-content">
          <Suspense fallback={<div className="loading-overlay">Đang tải...</div>}>
            <SelectedComponent />
          </Suspense>
        </section>
      </main>
    </div>
  );
} 