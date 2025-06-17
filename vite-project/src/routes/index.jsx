import { createBrowserRouter } from 'react-router-dom';
import GuestLayout from '../layouts/GuestLayout';
import AuthLayout from '../layouts/AuthLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ComingSoonPage from '../pages/ComingSoonPage';
import { ProtectedRoute, GuestRoute } from './ProtectedRoute';

// Import các component trang (sẽ được tạo sau)
// import AboutPage from '../pages/AboutPage';
// import NewsPage from '../pages/NewsPage';
// import DoctorsPage from '../pages/DoctorsPage';
// import CareerPage from '../pages/CareerPage';
// import ProfilePage from '../pages/ProfilePage';
// import SettingsPage from '../pages/SettingsPage';

const router = createBrowserRouter([
  // Routes cho người dùng chưa đăng nhập
  {
    path: '/',
    element: <GuestLayout />,
    children: [
      {
        path: '',
        element: <HomePage />
      },
      {
        path: 'login',
        element: <GuestRoute><LoginPage /></GuestRoute>
      },
      {
        path: 'about',
        element: <ComingSoonPage />
      },
      {
        path: 'news',
        element: <ComingSoonPage />
      },
      {
        path: 'doctors',
        element: <ComingSoonPage />
      },
      {
        path: 'career',
        element: <ComingSoonPage />
      },
      {
        path: '*',
        element: <ComingSoonPage />
      }
    ]
  },
  
  // Routes cho người dùng đã đăng nhập
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: 'profile',
        element: <ProtectedRoute><ComingSoonPage /></ProtectedRoute>
      },
      {
        path: 'settings',
        element: <ProtectedRoute><ComingSoonPage /></ProtectedRoute>
      },
      {
        path: '*',
        element: <ProtectedRoute><ComingSoonPage /></ProtectedRoute>
      }
    ]
  }
]);

export default router; 