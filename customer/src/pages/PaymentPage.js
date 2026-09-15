import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PaymentCard from '../components/payment/PaymentCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import bookingService from '../services/bookingService';
import PageHero from '../components/common/PageHero';

export default function PaymentPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    bookingService.getBookingById(bookingId)
      .then((res) => setBooking(res.data))
      .catch((err) => setError(err.message || 'Failed to load booking'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!booking) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <PageHero title="Complete" highlight="Payment" subtitle="Secure your parking spot" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-xl shadow-sm border border-[#e7c588]/25 dark:border-[#e7c588]/25 overflow-hidden">
          <div className="p-6 border-b border-[#e7c588]/25">
            <h2 className="font-semibold text-[#f9f0d7]">Booking Summary</h2>
            {booking.parking && (
              <div className="mt-3 space-y-2 text-sm text-[#e7c588]/80">
                <div className="flex justify-between">
                  <span>Parking</span>
                  <span className="font-medium text-[#f9f0d7]">{booking.parking.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Start</span>
                  <span className="font-medium text-[#f9f0d7]">
                    {booking.startTime ? new Date(booking.startTime).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>End</span>
                  <span className="font-medium text-[#f9f0d7]">
                    {booking.endTime ? new Date(booking.endTime).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#e7c588]/25 dark:border-[#e7c588]/25 pt-2">
                  <span className="font-semibold text-[#f9f0d7]">Total</span>
                  <span className="font-semibold text-[#f9f0d7]">${booking.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            )}
          </div>
          <div className="p-6">
            <PaymentCard booking={booking} />
          </div>
        </div>
      </div>
    </div>
  );
}
