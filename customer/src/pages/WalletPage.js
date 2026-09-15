import React, { useState } from 'react';
import { FaWallet, FaPlus, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import PageHero from '../components/common/PageHero';
import GlassCard from '../components/common/GlassCard';
import PageTransition from '../components/common/PageTransition';

const SEED_TXNS = [
  { id: 'TXN-101', label: 'Wallet top-up', amount: 500, type: 'credit', date: 'Jul 12, 2026' },
  { id: 'TXN-102', label: 'SG Highway Hub booking', amount: -120, type: 'debit', date: 'Jul 14, 2026' },
  { id: 'TXN-103', label: 'Refund — cancelled booking', amount: 80, type: 'credit', date: 'Jul 16, 2026' },
];

const QUICK_AMOUNTS = [100, 200, 500, 1000];

export default function WalletPage() {
  const [balance, setBalance] = useState(460);
  const [txns, setTxns] = useState(SEED_TXNS);
  const [custom, setCustom] = useState('');

  const addMoney = (amount) => {
    const value = Number(amount);
    if (!value || value <= 0) return;
    setBalance((b) => b + value);
    setTxns((t) => [
      { id: `TXN-${Date.now().toString().slice(-6)}`, label: 'Wallet top-up', amount: value, type: 'credit', date: 'Just now' },
      ...t,
    ]);
    setCustom('');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0a0a0b]">
        <PageHero
          badge={<><FaWallet className="text-[#e7c588]" /> SpotIQ Pay</>}
          title="My"
          highlight="Wallet"
          subtitle="Top up once, pay for parking in one tap"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <GlassCard className="p-6 sm:p-8 overflow-hidden" hover={false}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#f9f0d7]/50">Available balance</p>
                <p className="mt-2 text-4xl sm:text-5xl font-extrabold text-[#e7c588]">₹{balance}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => addMoney(a)}
                    className="px-4 py-2.5 rounded-xl border border-[#e7c588]/40 text-sm font-bold text-[#e7c588] hover:bg-[#e7c588] hover:text-black transition-all"
                  >
                    +₹{a}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <input
                type="number"
                min="1"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Custom amount"
                className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-[#e7c588]/25 text-[#f9f0d7] placeholder-[#f9f0d7]/40 text-sm focus:outline-none focus:border-[#e7c588]"
              />
              <button
                onClick={() => addMoney(custom)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#e7c588] text-black font-bold hover:bg-[#f3e0ae] active:scale-[0.98] transition-all"
              >
                <FaPlus className="text-xs" /> Add
              </button>
            </div>
          </GlassCard>

          <div>
            <h2 className="text-lg font-bold text-[#f9f0d7] mb-4">Recent transactions</h2>
            <div className="space-y-3">
              {txns.map((t) => (
                <GlassCard key={t.id} className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.type === 'credit' ? 'bg-[#e7c588]/15' : 'bg-white/5'}`}>
                    {t.type === 'credit'
                      ? <FaArrowDown className="text-sm text-[#e7c588]" />
                      : <FaArrowUp className="text-sm text-[#f9f0d7]/70" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#f9f0d7] truncate">{t.label}</p>
                    <p className="text-xs text-[#f9f0d7]/50">{t.id} • {t.date}</p>
                  </div>
                  <p className={`font-bold ${t.type === 'credit' ? 'text-[#e7c588]' : 'text-[#f9f0d7]'}`}>
                    {t.type === 'credit' ? '+' : ''}₹{t.amount}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
