import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaMapMarkerAlt, FaArrowRight, FaTrash } from 'react-icons/fa';
import PageHero from '../components/common/PageHero';
import GlassCard from '../components/common/GlassCard';
import EmptyState from '../components/common/EmptyState';
import PageTransition from '../components/common/PageTransition';

const STORAGE_KEY = 'spotiq:saved';

export function getSavedParkings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export default function SavedParkingPage() {
  const [saved, setSaved] = useState(getSavedParkings);

  const removeSaved = (id) => {
    const next = saved.filter((s) => (s._id || s.id) !== id);
    setSaved(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0a0a0b]">
        <PageHero
          badge={<><FaHeart className="text-[#e7c588]" /> Your shortlist</>}
          title="Saved"
          highlight="Parking"
          subtitle="Quick access to the spots you love"
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {saved.length === 0 ? (
            <EmptyState
              icon={FaHeart}
              title="No saved spots yet"
              description="Tap the heart on any parking location to pin it here for one-tap booking later."
              action={
                <Link
                  to="/find-parking"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e7c588] text-black font-bold hover:bg-[#f3e0ae] transition-all"
                >
                  Browse Parking <FaArrowRight className="text-sm" />
                </Link>
              }
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {saved.map((loc) => (
                <GlassCard key={loc._id || loc.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#f9f0d7]">{loc.name}</h3>
                      <p className="mt-1 text-sm text-[#f9f0d7]/60 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-xs text-[#e7c588]" />
                        {loc.area || loc.city || 'Ahmedabad'}
                      </p>
                      {loc.pricePerHour && (
                        <p className="mt-2 font-bold text-[#e7c588]">₹{loc.pricePerHour}/hr</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeSaved(loc._id || loc.id)}
                      className="p-2.5 rounded-xl text-[#f9f0d7]/60 hover:text-[#e7c588] hover:bg-white/5 transition-colors"
                      aria-label="Remove saved spot"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                  <Link
                    to={`/parking/${loc._id || loc.id}`}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#e7c588] text-black text-sm font-bold hover:bg-[#f3e0ae] transition-all"
                  >
                    Book Now <FaArrowRight className="text-xs" />
                  </Link>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
