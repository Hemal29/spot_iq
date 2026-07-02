import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthContext, { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import ThemeContext, { ThemeProvider } from './context/ThemeContext';

import AdminLayout from './components/layout/AdminLayout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ParkingManagementPage from './pages/ParkingManagementPage';
import AddParkingPage from './pages/AddParkingPage';
import EditParkingPage from './pages/EditParkingPage';
import ParkingSlotsPage from './pages/ParkingSlotsPage';
import SlotManagementPage from './pages/SlotManagementPage';
import BookingManagementPage from './pages/BookingManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import PaymentManagementPage from './pages/PaymentManagementPage';
import ReviewManagementPage from './pages/ReviewManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0F172A]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading SpotIQ Admin...</p>
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
        <Route index element={<DashboardPage />} />
        <Route path="parking" element={<ParkingManagementPage />} />
        <Route path="parking/add" element={<AddParkingPage />} />
        <Route path="parking/edit/:id" element={<EditParkingPage />} />
        <Route path="parking/slots/:parkingId" element={<ParkingSlotsPage />} />
        <Route path="slots" element={<SlotManagementPage />} />
        <Route path="bookings" element={<BookingManagementPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="payments" element={<PaymentManagementPage />} />
        <Route path="reviews" element={<ReviewManagementPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="owners" element={<OwnerManagementPage />} />
        <Route path="revenue" element={<RevenuePage />} />
        <Route path="coupons" element={<CouponManagementPage />} />
        <Route path="notifications" element={<NotificationManagementPage />} />
        <Route path="tickets" element={<SupportTicketsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
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
