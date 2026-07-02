import { useParams } from 'react-router-dom';
import PaymentSuccess from '../components/payment/PaymentSuccess';

export default function PaymentSuccessPage() {
  const { bookingId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PaymentSuccess bookingId={bookingId} />
      </div>
    </div>
  );
}
