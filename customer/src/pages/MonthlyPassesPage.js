import React from 'react';
import { FaCalendarCheck } from 'react-icons/fa';
import PageHero from '../components/common/PageHero';
import PricingSection from '../components/home/PricingSection';
import PageTransition from '../components/common/PageTransition';

export default function MonthlyPassesPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0a0a0b]">
        <PageHero
          badge={<><FaCalendarCheck className="text-[#e7c588]" /> Save up to 40%</>}
          title="Monthly"
          highlight="Passes"
          subtitle="One pass for daily commuters — unlimited entries, reserved spot"
        />
        <PricingSection />
      </div>
    </PageTransition>
  );
}
