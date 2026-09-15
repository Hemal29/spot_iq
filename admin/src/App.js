import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthContext, { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import ThemeContext, { ThemeProvider } from './context/ThemeContext';

import ErrorBoundary from './components/common/ErrorBoundary';
import AdminLayout from './components/layout/AdminLayout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ParkingManagementPage from './pages/ParkingManagementPage';
import AddParkingPage from './pages/AddParkingPage';
import EditParkingPage from './pages/EditParkingPage';

import SlotManagementPage from './pages/SlotManagementPage';
import BookingManagementPage from './pages/BookingManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import PaymentManagementPage from './pages/PaymentManagementPage';
import ReviewManagementPage from './pages/ReviewManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AIInsightsPage from './pages/AIInsightsPage';
import SettingsPage from './pages/SettingsPage';
import OwnerManagementPage from './pages/OwnerManagementPage';
import RevenuePage from './pages/RevenuePage';
import CouponManagementPage from './pages/CouponManagementPage';
import NotificationManagementPage from './pages/NotificationManagementPage';
import SupportTicketsPage from './pages/SupportTicketsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-800 ">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500  text-sm">Loading SpotIQ Admin...</p>
      </div>
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SidebarProvider>
              <AdminLayout />
            </SidebarProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
        <Route path="parking" element={<ErrorBoundary><ParkingManagementPage /></ErrorBoundary>} />
        <Route path="parking/add" element={<ErrorBoundary><AddParkingPage /></ErrorBoundary>} />
        <Route path="parking/edit/:id" element={<ErrorBoundary><EditParkingPage /></ErrorBoundary>} />
        <Route path="slots" element={<ErrorBoundary><SlotManagementPage /></ErrorBoundary>} />
        <Route path="parking/slots/:parkingId" element={<ErrorBoundary><SlotManagementPage /></ErrorBoundary>} />
        <Route path="bookings" element={<ErrorBoundary><BookingManagementPage /></ErrorBoundary>} />
        <Route path="users" element={<ErrorBoundary><UserManagementPage /></ErrorBoundary>} />
        <Route path="payments" element={<ErrorBoundary><PaymentManagementPage /></ErrorBoundary>} />
        <Route path="reviews" element={<ErrorBoundary><ReviewManagementPage /></ErrorBoundary>} />
        <Route path="analytics" element={<ErrorBoundary><AnalyticsPage /></ErrorBoundary>} />
        <Route path="ai-insights" element={<ErrorBoundary><AIInsightsPage /></ErrorBoundary>} />
        <Route path="settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
        <Route path="owners" element={<ErrorBoundary><OwnerManagementPage /></ErrorBoundary>} />
        <Route path="revenue" element={<ErrorBoundary><RevenuePage /></ErrorBoundary>} />
        <Route path="coupons" element={<ErrorBoundary><CouponManagementPage /></ErrorBoundary>} />
        <Route path="notifications" element={<ErrorBoundary><NotificationManagementPage /></ErrorBoundary>} />
        <Route path="tickets" element={<ErrorBoundary><SupportTicketsPage /></ErrorBoundary>} />
        <Route path="reports" element={<ErrorBoundary><ReportsPage /></ErrorBoundary>} />
        <Route path="profile" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function ThemedToasts() {
  const { darkMode } = useContext(ThemeContext);
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={darkMode ? 'dark' : 'light'}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
        <ThemedToasts />
      </ThemeProvider>
    </AuthProvider>
  );
}
