import { useParams } from 'react-router-dom';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  const { token } = useParams();

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#f9f0d7]">Reset Password</h2>
            <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-1">Enter your new password below</p>
          </div>
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
