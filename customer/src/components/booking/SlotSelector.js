import React, { useState } from 'react';
import { FaSquare } from 'react-icons/fa';

const SlotSelector = ({ slots = [], onSelect, selectedSlot }) => {
  const [selected, setSelected] = useState(selectedSlot || null);

  const handleSelect = (slot) => {
    if (slot.status === 'booked') return;
    const newSelected = selected?._id === slot._id ? null : slot;
    setSelected(newSelected);
    if (onSelect) onSelect(newSelected);
  };

  const getSlotStyle = (slot) => {
    if (selected?._id === slot._id) return 'bg-primary-600 text-white border-primary-600';
    if (slot.status === 'booked') return 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed line-through';
    if (slot.status === 'reserved') return 'bg-red-100 text-red-500 border-red-200 cursor-not-allowed';
    return 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100 cursor-pointer';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Slot</h3>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
        {slots.length > 0 ? (
          slots.map((slot) => (
            <button
              key={slot._id}
              onClick={() => handleSelect(slot)}
              disabled={slot.status === 'booked' || slot.status === 'reserved'}
              className={`py-3 rounded-lg border-2 text-sm font-medium transition ${getSlotStyle(slot)}`}
            >
              {slot.label}
            </button>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-400 text-sm">
            No slots available for the selected date and time
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <FaSquare className="text-green-400" />
          <span className="text-xs text-gray-500">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FaSquare className="text-primary-600" />
          <span className="text-xs text-gray-500">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FaSquare className="text-red-300" />
          <span className="text-xs text-gray-500">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FaSquare className="text-gray-200" />
          <span className="text-xs text-gray-500">Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default SlotSelector;
