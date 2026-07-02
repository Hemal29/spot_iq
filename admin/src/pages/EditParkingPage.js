import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import FormField from '../components/common/FormField';
import ImageUpload from '../components/common/ImageUpload';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import adminService from '../services/adminService';

const amenitiesList = [
  { key: 'evCharging', label: 'EV Charging' },
  { key: 'covered', label: 'Covered' },
  { key: 'security', label: 'Security' },
  { key: 'cctv', label: 'CCTV' },
  { key: 'wheelchair', label: 'Wheelchair Access' },
  { key: 'carWash', label: 'Car Wash' },
  { key: 'valet', label: 'Valet Parking' },
];

export default function EditParkingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchParking();
  }, [id]);

  const fetchParking = async () => {
    try {
      const res = await adminService.getParking(id);
      const p = res.data;
      setForm({
        parkingName: p.parkingName || '',
        address: p.address || '',
        city: p.city || '',
        state: p.state || '',
        zipCode: p.zipCode || '',
        latitude: p.latitude || '',
        longitude: p.longitude || '',
        pricePerHour: p.pricePerHour || '',
        totalSlots: p.totalSlots || '',
        description: p.description || '',
        openTime: p.openTime || '08:00',
        closeTime: p.closeTime || '22:00',
        amenities: {
          evCharging: p.amenities?.evCharging || false,
          covered: p.amenities?.covered || false,
          security: p.amenities?.security || false,
          cctv: p.amenities?.cctv || false,
          wheelchair: p.amenities?.wheelchair || false,
          carWash: p.amenities?.carWash || false,
          valet: p.amenities?.valet || false,
        },
      });
      if (p.image) setExistingImage(p.image);
    } catch (err) {
      console.error('Failed to load parking:', err);
      navigate('/parking');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAmenity = (key) => {
    setForm((prev) => ({
      ...prev,
      amenities: { ...prev.amenities, [key]: !prev.amenities[key] },
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.parkingName.trim()) errs.parkingName = 'Parking name is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!form.zipCode.trim()) errs.zipCode = 'Zip code is required';
    if (!form.pricePerHour || Number(form.pricePerHour) <= 0) errs.pricePerHour = 'Valid price per hour is required';
    if (!form.totalSlots || Number(form.totalSlots) <= 0) errs.totalSlots = 'Valid slot count is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        latitude: Number(form.latitude) || undefined,
        longitude: Number(form.longitude) || undefined,
        pricePerHour: Number(form.pricePerHour),
        totalSlots: Number(form.totalSlots),
      };
      const formData = new FormData();
      Object.entries(payload).forEach(([key, val]) => {
        if (key === 'amenities') {
          formData.append(key, JSON.stringify(val));
        } else {
          formData.append(key, val);
        }
      });
      if (image) {
        formData.append('image', image);
      } else if (existingImage && !image) {
        formData.append('keepImage', 'true');
      }
      await adminService.updateParking(id, formData);
      navigate('/parking');
    } catch (err) {
      console.error('Failed to update parking:', err);
      setErrors({ submit: err.response?.data?.message || 'Failed to update parking' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Edit Parking Location"
        subtitle="Update parking facility details"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Parking Name" error={errors.parkingName} required>
              <input
                name="parkingName"
                value={form.parkingName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>
            <FormField label="City" error={errors.city} required>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>
            <FormField label="State" error={errors.state} required>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>
            <FormField label="Zip Code" error={errors.zipCode} required>
              <input
                name="zipCode"
                value={form.zipCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>
            <FormField label="Latitude">
              <input
                name="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>
            <FormField label="Longitude">
              <input
                name="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>
          </div>
          <FormField label="Address" error={errors.address} required>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </FormField>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Pricing & Capacity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Price Per Hour (₹)" error={errors.pricePerHour} required>
              <input
                name="pricePerHour"
                type="number"
                min="0"
                step="0.01"
                value={form.pricePerHour}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>
            <FormField label="Total Slots" error={errors.totalSlots} required>
              <input
                name="totalSlots"
                type="number"
                min="1"
                value={form.totalSlots}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Operating Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Open Time">
              <input
                name="openTime"
                type="time"
                value={form.openTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>
            <FormField label="Close Time">
              <input
                name="closeTime"
                type="time"
                value={form.closeTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </FormField>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Amenities</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {amenitiesList.map((a) => (
              <label
                key={a.key}
                className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${
                  form.amenities[a.key]
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.amenities[a.key]}
                  onChange={() => handleAmenity(a.key)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{a.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Description & Images</h3>
          <FormField label="Description">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </FormField>
          {existingImage && !image && (
            <div className="relative inline-block">
              <img
                src={existingImage}
                alt="Current"
                className="h-32 w-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => { setExistingImage(null); setImage(null); }}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <ImageUpload value={image} onChange={setImage} />
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.submit}
          </div>
        )}

        <div className="flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate('/parking')}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <Button type="submit" loading={saving}>
            {saving ? 'Saving...' : 'Update Parking'}
          </Button>
        </div>
      </form>
    </div>
  );
}
