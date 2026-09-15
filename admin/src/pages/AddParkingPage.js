import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaSave,
  FaTimes,
  FaMapMarkerAlt,
  FaUser,
  FaDollarSign,
  FaTh,
  FaClock,
  FaCompass,
  FaTag,
  FaCheckSquare,
  FaExclamationCircle,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import adminService from '../services/adminService';
import PageHeader from '../components/common/PageHeader';

const initialFormData = {
  parkingName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  area: '',
  description: '',
  ownerName: '',
  ownerEmail: '',
  ownerPhone: '',
  pricePerHour: '',
  dailyPrice: '',
  weeklyPrice: '',
  monthlyPrice: '',
  nightCharges: '',
  weekendCharges: '',
  peakHourCharges: '',
  totalSlots: '',
  carSlots: '',
  bikeSlots: '',
  evSlots: '',
  vipSlots: '',
  disabledSlots: '',
  openingTime: '06:00',
  closingTime: '23:00',
  is24x7: false,
  latitude: '',
  longitude: '',
  parkingType: 'commercial',
  status: 'active',
  amenities: [],
};

const parkingTypes = [
  { value: 'mall', label: 'Mall' },
  { value: 'street', label: 'Street' },
  { value: 'multi-level', label: 'Multi-Level' },
  { value: 'airport', label: 'Airport' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'maintenance', label: 'Maintenance' },
];

const amenityOptions = [
  { value: 'cctv', label: 'CCTV' },
  { value: 'security', label: 'Security' },
  { value: 'covered', label: 'Covered' },
  { value: 'open_air', label: 'Open Air' },
  { value: 'wheelchair_access', label: 'Wheelchair Access' },
  { value: 'ev_charging', label: 'EV Charging' },
  { value: 'car_wash', label: 'Car Wash' },
  { value: 'valet', label: 'Valet' },
];

const FormSection = ({ title, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card rounded-xl p-6 "
  >
    <h3 className="text-lg font-semibold text-gray-800  mb-4 flex items-center gap-2">
      {icon}
      {title}
    </h3>
    {children}
  </motion.div>
);

const AddParkingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.parkingName.trim())
      newErrors.parkingName = 'Parking name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.ownerName.trim())
      newErrors.ownerName = 'Owner name is required';
    if (!formData.ownerEmail.trim()) {
      newErrors.ownerEmail = 'Owner email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
      newErrors.ownerEmail = 'Invalid email format';
    }
    if (!formData.totalSlots) {
      newErrors.totalSlots = 'Total slots is required';
    } else if (Number(formData.totalSlots) <= 0) {
      newErrors.totalSlots = 'Must be greater than 0';
    }
    if (!formData.pricePerHour) {
      newErrors.pricePerHour = 'Price per hour is required';
    } else if (Number(formData.pricePerHour) < 0) {
      newErrors.pricePerHour = 'Must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        pricePerHour: Number(formData.pricePerHour) || 0,
        dailyPrice: Number(formData.dailyPrice) || 0,
        weeklyPrice: Number(formData.weeklyPrice) || 0,
        monthlyPrice: Number(formData.monthlyPrice) || 0,
        nightCharges: Number(formData.nightCharges) || 0,
        weekendCharges: Number(formData.weekendCharges) || 0,
        peakHourCharges: Number(formData.peakHourCharges) || 0,
        totalSlots: Number(formData.totalSlots) || 0,
        carSlots: Number(formData.carSlots) || 0,
        bikeSlots: Number(formData.bikeSlots) || 0,
        evSlots: Number(formData.evSlots) || 0,
        vipSlots: Number(formData.vipSlots) || 0,
        disabledSlots: Number(formData.disabledSlots) || 0,
        latitude: Number(formData.latitude) || 0,
        longitude: Number(formData.longitude) || 0,
      };

      await adminService.createParking(payload);
      toast.success('Parking location created successfully!');
      navigate('/parking');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create parking location');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const InputField = ({ label, name, type = 'text', required, placeholder, half, icon }) => (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder || label}
          className={`input-field w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-lg ${
            errors[name] ? 'border-red-500 focus:ring-red-500' : ''
          }`}
        />
      </div>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
          <FaExclamationCircle size={12} /> {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Parking Location"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Parking Management', path: '/parking' },
          { label: 'Add Parking' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <FormSection
          title="Basic Information"
          icon={<FaMapMarkerAlt className="text-gray-500 dark:text-gray-400" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Parking Name"
              name="parkingName"
              required
              placeholder="e.g., Central City Parking"
            />
            <InputField
              label="Address"
              name="address"
              required
              placeholder="123 Main Street"
            />
            <InputField
              label="City"
              name="city"
              required
              placeholder="New York"
            />
            <InputField label="State" name="state" placeholder="NY" />
            <InputField label="Zip Code" name="zipCode" placeholder="10001" />
            <InputField
              label="Country"
              name="country"
              placeholder="United States"
            />
            <InputField label="Area" name="area" placeholder="Downtown" />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300  mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe the parking location..."
                className="input-field w-full px-4 py-2.5 rounded-lg resize-none"
              />
            </div>
          </div>
        </FormSection>

        {/* Owner Info */}
        <FormSection
          title="Owner Information"
          icon={<FaUser className="text-primary-400" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Owner Name"
              name="ownerName"
              required
              placeholder="John Doe"
            />
            <InputField
              label="Owner Email"
              name="ownerEmail"
              type="email"
              required
              placeholder="john@example.com"
            />
            <InputField
              label="Owner Phone"
              name="ownerPhone"
              type="tel"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </FormSection>

        {/* Pricing */}
        <FormSection
          title="Pricing"
          icon={<FaDollarSign className="text-primary-400" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField
              label="Price per Hour ($)"
              name="pricePerHour"
              type="number"
              required
              placeholder="0.00"
            />
            <InputField
              label="Daily Price ($)"
              name="dailyPrice"
              type="number"
              placeholder="0.00"
            />
            <InputField
              label="Weekly Price ($)"
              name="weeklyPrice"
              type="number"
              placeholder="0.00"
            />
            <InputField
              label="Monthly Price ($)"
              name="monthlyPrice"
              type="number"
              placeholder="0.00"
            />
            <InputField
              label="Night Charges ($)"
              name="nightCharges"
              type="number"
              placeholder="0.00"
            />
            <InputField
              label="Weekend Charges ($)"
              name="weekendCharges"
              type="number"
              placeholder="0.00"
            />
            <InputField
              label="Peak Hour Charges ($)"
              name="peakHourCharges"
              type="number"
              placeholder="0.00"
            />
          </div>
        </FormSection>

        {/* Capacity & Types */}
        <FormSection
          title="Capacity & Vehicle Types"
          icon={<FaTh className="text-gray-500 dark:text-gray-400" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField
              label="Total Slots"
              name="totalSlots"
              type="number"
              required
              placeholder="0"
            />
            <InputField
              label="Car Slots"
              name="carSlots"
              type="number"
              placeholder="0"
            />
            <InputField
              label="Bike Slots"
              name="bikeSlots"
              type="number"
              placeholder="0"
            />
            <InputField
              label="EV Slots"
              name="evSlots"
              type="number"
              placeholder="0"
            />
            <InputField
              label="VIP Slots"
              name="vipSlots"
              type="number"
              placeholder="0"
            />
            <InputField
              label="Disabled Slots"
              name="disabledSlots"
              type="number"
              placeholder="0"
            />
          </div>
        </FormSection>

        {/* Operating Hours */}
        <FormSection
          title="Operating Hours"
          icon={<FaClock className="text-gray-500 dark:text-gray-400" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex items-center gap-3 col-span-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is24x7"
                  checked={formData.is24x7}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-gray-900 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-400"></div>
              </label>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ">
                24x7
              </span>
            </div>
            {!formData.is24x7 && (
              <>
                <InputField
                  label="Opening Time"
                  name="openingTime"
                  type="time"
                />
                <InputField
                  label="Closing Time"
                  name="closingTime"
                  type="time"
                />
              </>
            )}
          </div>
        </FormSection>

        {/* Location */}
        <FormSection
          title="Location"
          icon={<FaCompass className="text-red-500" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Latitude"
              name="latitude"
              type="number"
              placeholder="40.7128"
            />
            <InputField
              label="Longitude"
              name="longitude"
              type="number"
              placeholder="-74.0060"
            />
          </div>
        </FormSection>

        {/* Parking Type & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSection
            title="Parking Type"
            icon={<FaTag className="text-primary-400" />}
          >
            <select
              name="parkingType"
              value={formData.parkingType}
              onChange={handleChange}
              className="select-field w-full px-4 py-2.5 rounded-lg"
            >
              {parkingTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </FormSection>

          <FormSection
            title="Status"
            icon={<FaExclamationCircle className="text-primary-400" />}
          >
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="select-field w-full px-4 py-2.5 rounded-lg"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </FormSection>
        </div>

        {/* Amenities */}
        <FormSection
          title="Amenities"
          icon={<FaCheckSquare className="text-gray-500 dark:text-gray-400" />}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {amenityOptions.map((amenity) => (
              <label
                key={amenity.value}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.amenities.includes(amenity.value)
                    ? 'border-primary-400 bg-gray-50/20'
                    : 'border-gray-200 dark:border-gray-700  hover:border-gray-300:border-white/20'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity.value)}
                  onChange={() => handleAmenityToggle(amenity.value)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border ${
                    formData.amenities.includes(amenity.value)
                      ? 'bg-gray-500 border-primary-400 text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {formData.amenities.includes(amenity.value) && (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 ">
                  {amenity.label}
                </span>
              </label>
            ))}
          </div>
        </FormSection>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-end gap-3 pb-8"
        >
          <button
            type="button"
            onClick={() => navigate('/parking')}
            className="btn-ghost inline-flex items-center gap-2 px-6 py-2.5 rounded-lg"
          >
            <FaTimes /> Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <FaSave /> Create Parking
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
};

export default AddParkingPage;
