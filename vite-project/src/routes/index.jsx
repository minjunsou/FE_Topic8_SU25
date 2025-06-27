import { createBrowserRouter } from 'react-router-dom';
import Layout from '../layouts/Layout';
import GuestLayout from '../layouts/GuestLayout';
import AuthLayout from '../layouts/AuthLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ComingSoonPage from '../pages/ComingSoonPage';
import HealthDeclarationPage from '../pages/HealthDeclarationPage';
import UserProfile from '../pages/UserProfile';
import StaffPage from '../pages/StaffPage/StaffPage';
import { ProtectedRoute, GuestRoute } from './ProtectedRoute';
import { USER_ROLES } from '../constants/userRoles';

// Import các trang từ thư mục UserPage
import VaccinationPage from '../pages/UserPage/Vaccination/VaccinationPage';
import HealthCheckPage from '../pages/UserPage/HealthCheck/HealthCheckPage';
import MedicalIncidentsPage from '../pages/UserPage/MedicalIncidents/MedicalIncidentsPage';
import HealthHistoryPage from '../pages/UserPage/HealthHistory/HealthHistoryPage';
import MedicineRequestPage from '../pages/UserPage/MedicineRequest/MedicineRequestPage';

// Import các component trang (sẽ được tạo sau)
// import AboutPage from '../pages/AboutPage';
// import NewsPage from '../pages/NewsPage';
// import DoctorsPage from '../pages/DoctorsPage';
// import CareerPage from '../pages/CareerPage';
// import ProfilePage from '../pages/ProfilePage';
// import SettingsPage from '../pages/SettingsPage';

const router = createBrowserRouter([
  // Route cho trang đăng nhập với GuestLayout
  {
    path: '/login',
    element: <GuestLayout />,
    children: [
      {
        path: '',
        element: <GuestRoute><LoginPage /></GuestRoute>
      }
    ]
  },
  
  // Route riêng cho StaffPage, không dùng Layout chung
  {
    path: '/staff',
    element: <StaffPage />
  },
  
  // Sử dụng Layout chung cho các trang khác
  {
    path: '/',
    element: <Layout />,
    children: [
      // Trang chủ - hiển thị cho tất cả người dùng
      {
        path: '',
        element: <HomePage />
      },
      
      // Các trang công khai
      {
        path: 'about',
        element: <ComingSoonPage />
      },
      {
        path: 'health-info',
        element: <ComingSoonPage />
      },
      
      // Trang khai báo thông tin y tế - không cần phân quyền
      {
        path: 'health-declaration',
        element: <HealthDeclarationPage />
      },
      
      // Trang gửi thuốc - không cần phân quyền (cho mục đích test UI)
      {
        path: 'medicine-request',
        element: <MedicineRequestPage />
      },
      
      // Trang hồ sơ người dùng - không cần phân quyền
      {
        path: 'profile',
        element: <UserProfile />
      },
      
      // Routes chung cho tất cả người dùng đã đăng nhập
      {
        path: 'settings',
        element: <ProtectedRoute><ComingSoonPage /></ProtectedRoute>
      },
      
      // Routes cho phụ huynh, y tá, quản lý và admin
      {
        path: 'vaccination',
        element: <VaccinationPage />
      },
      {
        path: 'health-check',
        element: <HealthCheckPage />
      },
      {
        path: 'medicine',
        element: <MedicineRequestPage />
      },
      {
        path: 'medical-incidents',
        element: <MedicalIncidentsPage />
      },
      {
        path: 'health-history',
        element: <HealthHistoryPage />
      },
      
      // Routes chỉ dành cho quản lý và admin
      {
        path: 'dashboard',
        element: <ProtectedRoute allowedRoles={[USER_ROLES.MANAGER, USER_ROLES.ADMIN]}>
          <ComingSoonPage />
        </ProtectedRoute>
      },
      
      // Trang không có quyền truy cập
      {
        path: 'unauthorized',
        element: <ProtectedRoute>
          <div className="unauthorized-page">
            <h1>Không có quyền truy cập</h1>
            <p>Bạn không có quyền truy cập vào trang này.</p>
          </div>
        </ProtectedRoute>
      },
      
      // Route mặc định
      {
        path: '*',
        element: <ComingSoonPage />
      }
    ]
  }
]);

export default router; 