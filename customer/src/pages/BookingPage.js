import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookingForm from '../components/booking/BookingForm';
import SlotSelector from '../components/booking/SlotSelector';
import BookingSummary from '../components/booking/BookingSummary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import bookingService from '../services/bookingService';
import parkingService from '../services/parkingService';

const STEPS = [
  { key: 'slot', label: 'Select Slot' },
  { key: 'vehicle', label: 'Vehicle Info' },
  { key: 'confirm', label: 'Confirm' },
];

export default function BookingPage() {
  const { parkingId } = useParams();
  const navigate = useNavigate();
  const [parking, setParking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    startTime: null,
    endTime: null,
    vehicleId: null,
    vehicleNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    parkingService.getParkingById(parkingId)
      .then((res) => setParking(res.data))
      .catch((err) => setError(err.message || 'Failed to load parking'))
      .finally(() => setLoading(false));
  }, [parkingId]);

  const handleSlotSelect = (data) => {
    setBookingData((prev) => ({ ...prev, ...data }));
    setCurrentStep(1);
  };

  const handleVehicleSubmit = (data) => {
    setBookingData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const payload = {
        parking: parkingId,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        vehicle: bookingData.vehicleId,
        vehicleNumber: bookingData.vehicleNumber,
      };
      const res = await bookingService.createBooking(payload);
      navigate(`/payment/${res.data._id || res.data.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
  if (error && !parking) return <ErrorMessage message={error} />;
  if (!parking) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {STEPS.map((step, idx) => (
              <div key={step.key} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      idx <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`hidden sm:block text-sm font-medium ${
                      idx <= currentStep ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-2 ${
                      idx < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:flex lg:gap-8">
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

              {currentStep === 0 && (
                <SlotSelector parking={parking} onSelect={handleSlotSelect} />
              )}
              {currentStep === 1 && (
                <BookingForm
                  parking={parking}
                  bookingData={bookingData}
                  onSubmit={handleVehicleSubmit}
                  onBack={() => setCurrentStep(0)}
                />
              )}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Review & Confirm</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Parking</span>
                      <span className="font-medium text-gray-900">{parking.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Start</span>
                      <span className="font-medium text-gray-900">
                        {bookingData.startTime ? new Date(bookingData.startTime).toLocaleString() : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">End</span>
                      <span className="font-medium text-gray-900">
                        {bookingData.endTime ? new Date(bookingData.endTime).toLocaleString() : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Vehicle</span>
                      <span className="font-medium text-gray-900">{bookingData.vehicleNumber || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleConfirm} disabled={submitting} className="flex-1">
                      {submitting ? 'Creating Booking...' : 'Confirm & Proceed to Payment'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="hidden lg:block lg:w-80 flex-shrink-0 mt-6 lg:mt-0">
            <div className="sticky top-6">
              <BookingSummary parking={parking} bookingData={bookingData} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
