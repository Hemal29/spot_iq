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
    if (selected?._id === slot._id) return 'bg-primary-600 text-[#f9f0d7] border-primary-600';
    if (slot.status === 'booked') return 'bg-[#1c1c1f] dark:bg-[#1c1c1f] text-[#e7c588]/80 dark:text-[#e7c588]/80 border-[#e7c588]/25 dark:border-[#e7c588]/25 cursor-not-allowed line-through';
    if (slot.status === 'reserved') return 'bg-[#e7c588] text-[#e7c588] border-[#e7c588]/40 cursor-not-allowed';
    return 'bg-[#0a0a0b] dark:bg-[#121214] text-[#e7c588]/80 dark:text-[#e7c588]/80 dark:text-[#e7c588]/80 border-[#e7c588]/25 hover:bg-[#121214] dark:hover:bg-[#1c1c1f]/50 dark:bg-[#121214] cursor-pointer';
  };

  return (
    <div className="bg-[#0a0a0b] dark:bg-[#0a0a0b] rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-[#f9f0d7] mb-4">Select Slot</h3>

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
          <div className="col-span-full text-center py-8 text-[#e7c588]/80 dark:text-[#e7c588]/80 text-sm">
            No slots available for the selected date and time
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-[#e7c588]/25">
        <div className="flex items-center gap-1.5">
          <FaSquare className="text-primary-400" />
          <span className="text-xs text-[#e7c588]/80">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FaSquare className="text-primary-600" />
          <span className="text-xs text-[#e7c588]/80">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FaSquare className="text-[#e7c588]" />
          <span className="text-xs text-[#e7c588]/80">Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FaSquare className="text-[#f3e0ae]" />
          <span className="text-xs text-[#e7c588]/80">Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default SlotSelector;
