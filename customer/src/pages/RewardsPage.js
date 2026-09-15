import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaGift, FaTrophy, FaCheck } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import PageHero from '../components/common/PageHero';
import GlassCard from '../components/common/GlassCard';
import PageTransition from '../components/common/PageTransition';

const TIERS = [
  { name: 'Silver', min: 0, perk: 'Earn 10 pts per booking' },
  { name: 'Gold', min: 500, perk: 'Earn 20 pts per booking + priority support' },
  { name: 'Platinum', min: 1500, perk: 'Earn 30 pts per booking + free monthly wash' },
];

const REWARDS = [
  { id: 'r1', title: '₹50 parking credit', cost: 200 },
  { id: 'r2', title: 'Free 2-hr weekend parking', cost: 400 },
  { id: 'r3', title: '₹150 parking credit', cost: 600 },
];

export default function RewardsPage() {
  const { user } = useContext(AuthContext);
  const [points, setPoints] = useState(650);
  const [redeemed, setRedeemed] = useState([]);

  const tier = [...TIERS].reverse().find((t) => points >= t.min) || TIERS[0];
  const next = TIERS.find((t) => t.min > points);

  const redeem = (reward) => {
    if (points < reward.cost || redeemed.includes(reward.id)) return;
    setPoints((p) => p - reward.cost);
    setRedeemed((r) => [...r, reward.id]);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0a0a0b]">
        <PageHero
          badge={<><FaTrophy className="text-[#e7c588]" /> {tier.name} member</>}
          title="My"
          highlight="Rewards"
          subtitle={user?.name ? `Keep earning, ${user.name}` : 'Earn points on every booking'}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <GlassCard className="p-6 sm:p-8" hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#f9f0d7]/50">Your points</p>
                <p className="mt-2 text-4xl sm:text-5xl font-extrabold text-[#e7c588]">{points}</p>
              </div>
              <div className="text-right">
                <p className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#e7c588]/15 border border-[#e7c588]/30 text-sm font-bold text-[#e7c588]">
                  <FaTrophy className="text-xs" /> {tier.name}
                </p>
                <p className="mt-2 text-xs text-[#f9f0d7]/60">{tier.perk}</p>
              </div>
            </div>
            {next && (
              <div className="mt-6">
                <div className="flex justify-between text-xs text-[#f9f0d7]/60 mb-2">
                  <span>{tier.name}</span>
                  <span>{points}/{next.min} → {next.name}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#bf8a2e] to-[#e7c588]"
                    style={{ width: `${Math.min(100, Math.round((points / next.min) * 100))}%` }}
                  />
                </div>
              </div>
            )}
          </GlassCard>

          <div>
            <h2 className="text-lg font-bold text-[#f9f0d7] mb-4">Redeem rewards</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {REWARDS.map((r) => {
                const done = redeemed.includes(r.id);
                const afford = points >= r.cost;
                return (
                  <GlassCard key={r.id} className="p-5 text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-[#e7c588]/15 border border-[#e7c588]/30 flex items-center justify-center mb-4">
                      {done ? <FaCheck className="text-[#e7c588]" /> : <FaGift className="text-[#e7c588]" />}
                    </div>
                    <p className="font-bold text-[#f9f0d7]">{r.title}</p>
                    <p className="mt-1 text-sm font-semibold text-[#e7c588] flex items-center justify-center gap-1">
                      <FaStar className="text-xs" /> {r.cost} pts
                    </p>
                    <button
                      onClick={() => redeem(r)}
                      disabled={!afford || done}
                      className={`mt-4 w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                        done
                          ? 'bg-white/5 text-[#f9f0d7]/50 cursor-default'
                          : afford
                            ? 'bg-[#e7c588] text-black hover:bg-[#f3e0ae]'
                            : 'bg-white/5 text-[#f9f0d7]/40 cursor-not-allowed'
                      }`}
                    >
                      {done ? 'Redeemed' : afford ? 'Redeem' : 'Not enough points'}
                    </button>
                  </GlassCard>
                );
              })}
            </div>
            <Link to="/find-parking" className="mt-6 block text-center text-sm text-[#e7c588] hover:text-[#f3e0ae] transition-colors">
              Book parking to earn more points →
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
