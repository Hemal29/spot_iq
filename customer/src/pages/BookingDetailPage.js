import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import bookingService from '../services/bookingService';

const STATUS_COLORS = {
  upcoming: 'info',
  active: 'success',
  completed: 'secondary',
  cancelled: 'danger',
  pending: 'warning',
};

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    setLoading(true);
    bookingService.getBookingById(id)
      .then((res) => setBooking(res.data))
      .catch((err) => setError(err.message || 'Failed to load booking'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await bookingService.cancelBooking(id);
      const res = await bookingService.getBookingById(id);
      setBooking(res.data);
      setCancelModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!booking) return null;

  const isCancellable = ['upcoming', 'pending'].includes(booking.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate('/my-bookings')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Bookings
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Booking #{booking._id?.slice(-8) || booking.id?.slice(-8)}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : ''}
              </p>
            </div>
            <Badge variant={STATUS_COLORS[booking.status] || 'info'}>
              {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
            </Badge>
          </div>

          <div className="p-6 space-y-6">
            {booking.parking && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Parking Location</h3>
                <p className="text-lg font-semibold text-gray-900">{booking.parking.name}</p>
                <p className="text-gray-600">{booking.parking.address}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">Start Time</div>
                <div className="font-semibold text-gray-900 mt-1">
                  {booking.startTime ? new Date(booking.startTime).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500">End Time</div>
                <div className="font-semibold text-gray-900 mt-1">
                  {booking.endTime ? new Date(booking.endTime).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Amount Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">${(booking.totalAmount || 0).toFixed(2)}</span>
                </div>
                {booking.payment && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {booking.payment.method || 'N/A'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-semibold text-gray-900">${(booking.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {booking.payment && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Payment Info</h3>
                <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-green-800">Payment {booking.payment.status}</div>
                    <div className="text-sm text-green-600">
                      {booking.payment.method} - ${(booking.payment.amount || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">QR Code</h3>
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="text-sm text-gray-500 mt-2">Scan at entry</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Status Timeline</h3>
              <div className="space-y-3">
                {['created', 'confirmed', 'active', 'completed'].map((step, idx) => {
                  const statusOrder = ['pending', 'upcoming', 'active', 'completed', 'cancelled'];
                  const currentIdx = statusOrder.indexOf(booking.status);
                  const stepIdx = statusOrder.indexOf(step);
                  const isDone = stepIdx <= currentIdx && booking.status !== 'cancelled';
                  const isCurrent = step === booking.status;

                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isDone
                            ? 'bg-green-500'
                            : isCurrent
                            ? 'bg-blue-600'
                            : 'bg-gray-200'
                        }`}
                      >
                        {isDone ? (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-white' : 'bg-gray-400'}`} />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium capitalize ${
                          isDone || isCurrent ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
            <Button variant="outline" onClick={() => navigate('/my-bookings')}>
              Back to Bookings
            </Button>
            {isCancellable && (
              <Button variant="danger" onClick={() => setCancelModalOpen(true)}>
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Booking?</h3>
          <p className="text-gray-600">Are you sure you want to cancel this booking? This action cannot be undone.</p>
          <div className="flex gap-3 mt-6 justify-end">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Keep Booking
            </Button>
            <Button variant="danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
