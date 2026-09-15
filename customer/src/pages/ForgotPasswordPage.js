import { Link } from 'react-router-dom';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden p-6">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/hero_video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="absolute inset-0 bg-black/75" />
      <div className="absolute inset-0 bg-[#e7c588]/[0.06] mix-blend-overlay" />
      <div className="relative w-full max-w-md">
        <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#121214] dark:bg-[#121214] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#e7c588]/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#f9f0d7]">Forgot Password?</h2>
            <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-1">Enter your email and we&apos;ll send you a reset link</p>
          </div>
          <ForgotPasswordForm />
          <p className="text-center text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#f3e0ae] dark:text-[#e7c588]/80 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
