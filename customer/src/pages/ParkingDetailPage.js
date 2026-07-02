import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ParkingDetailHeader from '../components/parking/ParkingDetailHeader';
import ParkingAmenities from '../components/parking/ParkingAmenities';
import ParkingReviews from '../components/parking/ParkingReviews';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import parkingService from '../services/parkingService';
import AuthContext from '../context/AuthContext';

const TABS = [
  { key: 'details', label: 'Details' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'reviews', label: 'Reviews' },
];

export default function ParkingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [parking, setParking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    setLoading(true);
    setError(null);
    parkingService.getParkingById(id)
      .then((res) => setParking(res.data))
      .catch((err) => setError(err.message || 'Failed to load parking details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReserve = () => {
    if (!isAuthenticated) return navigate('/login');
    navigate(`/booking/${id}`);
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!parking) return null;

  const { name, address, pricePerHour, operatingHours, amenities, rating, reviewCount } = parking;

  return (
    <div className="min-h-screen bg-gray-50">
      <ParkingDetailHeader parking={parking} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:flex lg:gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                    <p className="text-gray-600">{address}</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500">Price</div>
                      <div className="text-xl font-bold text-gray-900">${pricePerHour}/hr</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500">Rating</div>
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-bold text-gray-900">{rating}</span>
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        <span className="text-sm text-gray-500">({reviewCount})</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500">Status</div>
                      <Badge variant={parking.isAvailable ? 'success' : 'danger'}>
                        {parking.isAvailable ? 'Available' : 'Full'}
                      </Badge>
                    </div>
                  </div>
                  {operatingHours && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Operating Hours</h3>
                      <div className="space-y-1 text-gray-600">
                        {Object.entries(operatingHours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between max-w-xs">
                            <span className="capitalize font-medium">{day}</span>
                            <span>{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'amenities' && (
                <ParkingAmenities amenities={amenities} />
              )}

              {activeTab === 'reviews' && (
                <ParkingReviews parkingId={id} />
              )}
            </div>
          </div>

          <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">${pricePerHour}</div>
              <div className="text-gray-500 text-sm mb-4">per hour</div>
              <Button onClick={handleReserve} className="w-full" size="lg">
                {isAuthenticated ? 'Reserve Now' : 'Sign In to Reserve'}
              </Button>
              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Free cancellation
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Secure payment
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-30">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-2xl font-bold text-gray-900">${pricePerHour}</span>
            <span className="text-gray-500 text-sm"> / hr</span>
          </div>
          <Badge variant={parking.isAvailable ? 'success' : 'danger'}>
            {parking.isAvailable ? 'Available' : 'Full'}
          </Badge>
        </div>
        <Button onClick={handleReserve} className="w-full" size="lg">
          {isAuthenticated ? 'Reserve Now' : 'Sign In to Reserve'}
        </Button>
      </div>
    </div>
  );
}
