import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFoundPage() {
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
      <div className="relative text-center max-w-md">
        <div className="text-8xl font-bold text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mb-4">404</div>
        <div className="w-24 h-24 mx-auto mb-6 text-[#e7c588]/80">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#f9f0d7] dark:text-[#f9f0d7] mb-2">Page Not Found</h2>
        <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/">
          <Button size="lg">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
