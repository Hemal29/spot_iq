import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import { FaMoneyBillWave, FaCreditCard, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const PaymentCard = ({ booking, parking, amount, onSuccess }) => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('razorpay');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleRazorpayPayment = async () => {
    setProcessing(true);
    setError('');
    try {
      const orderRes = await paymentService.createOrder({ amount: Math.round(amount * 100), bookingId: booking?._id });
      const order = orderRes.data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'SpotIQ',
        description: `Parking booking - ${parking?.name || ''}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking?._id,
            });
            if (onSuccess) onSuccess(response);
          } catch {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: { contact: '', email: '' },
        theme: { color: '#2563EB' },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (resp) => {
        setError(resp.error?.description || 'Payment failed. Please try again.');
        setProcessing(false);
      });
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize payment. Please try again.');
      setProcessing(false);
    }
  };

  const handleCashPayment = async () => {
    setProcessing(true);
    setError('');
    try {
      if (onSuccess) onSuccess({ method: 'cash' });
    } catch {
      setError('Failed to process cash payment.');
      setProcessing(false);
    }
  };

  const handlePay = () => {
    if (method === 'razorpay') {
      handleRazorpayPayment();
    } else {
      handleCashPayment();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
          <FaTimesCircle /> {error}
        </div>
      )}

      <div className="space-y-3 mb-6">
        <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${method === 'razorpay' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <input type="radio" name="payment" value="razorpay" checked={method === 'razorpay'} onChange={() => setMethod('razorpay')} className="h-4 w-4 text-primary-600 focus:ring-primary-500" />
          <FaCreditCard className={`text-xl ${method === 'razorpay' ? 'text-primary-600' : 'text-gray-400'}`} />
          <div>
            <p className="font-medium text-gray-800 text-sm">Razorpay</p>
            <p className="text-xs text-gray-500">Pay via Card, UPI, Net Banking, Wallet</p>
          </div>
        </label>

        <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${method === 'cash' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
          <input type="radio" name="payment" value="cash" checked={method === 'cash'} onChange={() => setMethod('cash')} className="h-4 w-4 text-primary-600 focus:ring-primary-500" />
          <FaMoneyBillWave className={`text-xl ${method === 'cash' ? 'text-primary-600' : 'text-gray-400'}`} />
          <div>
            <p className="font-medium text-gray-800 text-sm">Cash</p>
            <p className="text-xs text-gray-500">Pay at the parking location</p>
          </div>
        </label>
      </div>

      {parking && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
          <p className="font-medium text-gray-800">{parking.name}</p>
          <p className="text-gray-500 text-xs">{parking.address}</p>
          {booking && (
            <>
              <p className="text-gray-500">{booking.startDate} | {booking.startTime} - {booking.endTime}</p>
              <p className="text-gray-500">Duration: {booking.duration} hour{booking.duration !== 1 ? 's' : ''}</p>
            </>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-700 font-medium">Total Amount</span>
        <span className="text-2xl font-bold text-primary-600">${(amount || 0).toFixed(2)}</span>
      </div>

      <button
        onClick={handlePay}
        disabled={processing}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {processing ? (
          <><FaSpinner className="animate-spin" /> Processing...</>
        ) : (
          <>{method === 'razorpay' ? 'Proceed to Pay' : 'Confirm Cash Payment'}</>
        )}
      </button>
    </div>
  );
};

export default PaymentCard;
