import React, { useState, useEffect } from 'react';
import vehicleService from '../../services/vehicleService';
import { FaCar, FaPlus, FaEdit, FaTrash, FaStar, FaSpinner } from 'react-icons/fa';

const vehicleTypes = ['Sedan', 'SUV', 'Hatchback', 'Convertible', 'Coupe', 'Van', 'Truck', 'Motorcycle'];

const initialForm = { vehicleNumber: '', vehicleType: '', brand: '', model: '', color: '' };

const VehicleManager = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadVehicles(); }, []);

  const loadVehicles = async () => {
    try {
      const res = await vehicleService.getMyVehicles();
      setVehicles(res.data || []);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehicleNumber || !form.vehicleType || !form.brand || !form.model) {
      setError('Please fill in all required fields');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await vehicleService.updateVehicle(editingId, form);
      } else {
        await vehicleService.addVehicle(form);
      }
      setForm(initialForm);
      setShowForm(false);
      setEditingId(null);
      loadVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (v) => {
    setForm({ vehicleNumber: v.vehicleNumber, vehicleType: v.vehicleType, brand: v.brand, model: v.model, color: v.color });
    setEditingId(v._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await vehicleService.deleteVehicle(id);
      loadVehicles();
    } catch {
      setError('Failed to delete vehicle');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await vehicleService.setDefaultVehicle(id);
      loadVehicles();
    } catch {
      setError('Failed to set default vehicle');
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-primary-600 text-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#f9f0d7]">My Vehicles</h3>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="bg-primary-600 hover:bg-primary-700 text-[#f9f0d7] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition">
            <FaPlus /> Add Vehicle
          </button>
        )}
      </div>

      {error && (
        <div className="bg-[#e7c588] border border-[#e7c588]/40 text-[#e7c588] px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#0a0a0b] dark:bg-[#121214] rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mb-1">Vehicle Number *</label>
              <input type="text" name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} placeholder="ABC 1234" className="w-full px-3 py-2 border border-[#e7c588]/25 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mb-1">Vehicle Type *</label>
              <select name="vehicleType" value={form.vehicleType} onChange={handleChange} className="w-full px-3 py-2 border border-[#e7c588]/25 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-[#0a0a0b]">
                <option value="">Select type</option>
                {vehicleTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mb-1">Brand *</label>
              <input type="text" name="brand" value={form.brand} onChange={handleChange} placeholder="Toyota" className="w-full px-3 py-2 border border-[#e7c588]/25 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mb-1">Model *</label>
              <input type="text" name="model" value={form.model} onChange={handleChange} placeholder="Camry" className="w-full px-3 py-2 border border-[#e7c588]/25 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mb-1">Color</label>
              <input type="text" name="color" value={form.color} onChange={handleChange} placeholder="White" className="w-full px-3 py-2 border border-[#e7c588]/25 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="bg-primary-600 hover:bg-primary-700 text-[#f9f0d7] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 disabled:opacity-60 transition">
              {saving ? <FaSpinner className="animate-spin" /> : null}
              {editingId ? 'Update' : 'Add'} Vehicle
            </button>
            <button type="button" onClick={handleCancel} className="border border-[#e7c588]/25 text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0a0a0b] dark:hover:bg-[#121214] dark:bg-[#121214] transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {vehicles.length === 0 && !showForm ? (
        <div className="text-center py-8">
          <FaCar className="text-[#e7c588]/80 text-4xl mx-auto mb-3" />
          <p className="text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 text-sm">No vehicles added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map((v) => (
            <div key={v._id} className={`border rounded-xl p-4 transition ${v.isDefault ? 'border-primary-300 bg-primary-50' : 'border-[#e7c588]/25 dark:border-[#e7c588]/25 hover:border-[#e7c588]/25'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                    <FaCar className="text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#f9f0d7] text-sm">{v.vehicleNumber}</p>
                      {v.isDefault && (
                        <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full font-medium">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 mt-0.5">{v.brand} {v.model}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-[#121214] dark:bg-[#121214] text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 px-2 py-0.5 rounded">{v.vehicleType}</span>
                      {v.color && <span className="text-xs text-[#e7c588]/80">{v.color}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!v.isDefault && (
                    <button onClick={() => handleSetDefault(v._id)} className="p-2 text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-primary-400 transition" title="Set as default">
                      <FaStar />
                    </button>
                  )}
                  <button onClick={() => handleEdit(v)} className="p-2 text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-primary-600 transition" title="Edit">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(v._id)} className="p-2 text-[#e7c588]/80 dark:text-[#e7c588]/80 hover:text-[#e7c588] transition" title="Delete">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleManager;
