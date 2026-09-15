import { Link } from 'react-router-dom';
import { FaParking, FaHome } from 'react-icons/fa';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800  p-4">
      <div className="text-center max-w-md animate-fadeIn">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br bg-primary-600 rounded-3xl shadow-2xl shadow-primary-400/30 mb-6">
          <span className="text-5xl font-bold text-white">404</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100  mb-3">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500  mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl shadow-lg shadow-primary-400/25 transition-all"
        >
          <FaHome /> Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
