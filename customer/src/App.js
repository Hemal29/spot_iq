import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthContext, { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ParkingProvider } from './context/ParkingContext';

import Layout from './components/layout/Layout';
import Walkthrough from './components/walkthrough/Walkthrough';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FindParkingPage from './pages/FindParkingPage';
import ParkingDetailPage from './pages/ParkingDetailPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-[#e7c588]/40 border-t-transparent rounded-full animate-spin" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="find-parking" element={<FindParkingPage />} />
        <Route path="parking/:id" element={<ParkingDetailPage />} />
        <Route
          path="booking/:parkingId"
          element={<ProtectedRoute><BookingPage /></ProtectedRoute>}
        />
        <Route
          path="payment/:bookingId"
          element={<ProtectedRoute><PaymentPage /></ProtectedRoute>}
        />
        <Route
          path="payment/success/:bookingId"
          element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>}
        />
        <Route
          path="my-bookings"
          element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>}
        />
        <Route
          path="my-bookings/:id"
          element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>}
        />
        <Route
          path="profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />
        <Route
          path="notifications"
          element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ParkingProvider>
          <AppRoutes />
          <Walkthrough />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </ParkingProvider>
      </AppProvider>
    </AuthProvider>
  );
}
