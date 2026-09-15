import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import vehicleService from '../../services/vehicleService';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaClock, FaCar, FaPlus, FaSpinner } from 'react-icons/fa';

const BookingForm = ({ parking, onCalculate }) => {
  const { isAuthenticated } = useAuth();
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadVehicles();
    }
  }, [isAuthenticated]);

  const loadVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const res = await vehicleService.getMyVehicles();
      setVehicles(res.data || []);
      const defaultV = (res.data || []).find((v) => v.isDefault);
      if (defaultV) setSelectedVehicle(defaultV._id);
    } catch {
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const calculateDuration = () => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const diffMinutes = endMinutes - startMinutes;
    if (diffMinutes <= 0) return 0;
    return Math.ceil(diffMinutes / 60);
  };

  const duration = calculateDuration();
  const totalPrice = duration * (parking?.pricePerHour || 0);

  const validate = () => {
    const errs = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) errs.startDate = 'Date cannot be in the past';
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    if (endH * 60 + endM <= startH * 60 + startM) errs.endTime = 'End time must be after start time';
    if (!selectedVehicle) errs.vehicle = 'Please select a vehicle';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (onCalculate) {
      onCalculate({
        startDate: startDate.toISOString().split('T')[0],
        startTime,
        endTime,
        duration,
        totalPrice,
        vehicleId: selectedVehicle,
      });
    }
  };

  return (
    <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-[#f9f0d7] mb-4">Book a Slot</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80 mb-1">
            <FaCalendarAlt className="inline mr-1" /> Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => { setStartDate(date); if (errors.startDate) setErrors({ ...errors, startDate: '' }); }}
            minDate={new Date()}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm ${errors.startDate ? 'border-[#e7c588]/40' : 'border-[#e7c588]/25'}`}
          />
          {errors.startDate && <p className="text-[#e7c588] text-xs mt-1">{errors.startDate}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80 mb-1">
              <FaClock className="inline mr-1" /> Start Time
            </label>
            <input
              type="time" value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-[#e7c588]/25 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80 mb-1">
              <FaClock className="inline mr-1" /> End Time
            </label>
            <input
              type="time" value={endTime}
              onChange={(e) => { setEndTime(e.target.value); if (errors.endTime) setErrors({ ...errors, endTime: '' }); }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm ${errors.endTime ? 'border-[#e7c588]/40' : 'border-[#e7c588]/25'}`}
            />
            {errors.endTime && <p className="text-[#e7c588] text-xs mt-1">{errors.endTime}</p>}
          </div>
        </div>

        <div className="bg-[#0a0a0b] dark:bg-[#121214] rounded-lg p-3 flex items-center justify-between text-sm">
          <span className="text-[#e7c588]/80 dark:text-[#e7c588]/80">Duration:</span>
          <span className="font-semibold text-[#f9f0d7]">{duration} hour{duration !== 1 ? 's' : ''}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#f3e0ae] dark:text-[#e7c588]/80 mb-1">
            <FaCar className="inline mr-1" /> Vehicle
          </label>
          {loadingVehicles ? (
            <div className="flex items-center gap-2 text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 py-2">
              <FaSpinner className="animate-spin" /> Loading vehicles...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-sm text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 py-2">
              <p>No vehicles added yet.</p>
              <button type="button" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mt-1">
                <FaPlus /> Add Vehicle
              </button>
            </div>
          ) : (
            <select
              value={selectedVehicle}
              onChange={(e) => { setSelectedVehicle(e.target.value); if (errors.vehicle) setErrors({ ...errors, vehicle: '' }); }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm bg-[#0a0a0b] dark:bg-[#0a0a0b] ${errors.vehicle ? 'border-[#e7c588]/40' : 'border-[#e7c588]/25'}`}
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.vehicleNumber} - {v.brand} {v.model} {v.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
          )}
          {errors.vehicle && <p className="text-[#e7c588] text-xs mt-1">{errors.vehicle}</p>}
        </div>

        <div className="bg-primary-50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-[#f3e0ae]">Total:</span>
          <span className="text-xl font-bold text-primary-600">${totalPrice.toFixed(2)}</span>
        </div>

        <button
          type="submit"
          className="w-full bg-primary-600 hover:bg-primary-700 text-[#f9f0d7] font-semibold py-2.5 rounded-lg transition"
        >
          Reserve Now
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
